import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import {
  convertToModelMessages,
  safeValidateUIMessages,
  streamText,
  type UIMessage,
} from "ai"
import { auth } from "@/lib/auth/auth"
import { getOwnedProjectOrNull } from "@/lib/api/project-access"
import { prisma } from "@/lib/prisma"
import { AIOrchestrator } from "@/lib/core/ai/orchestrator"
import { projectContentToFountainElements } from "@/lib/core/fountain/project-content"
import type { ChatDocumentAction } from "@/lib/core/ai/chat-document"

export const runtime = "nodejs"
type RouteContext = { params: Promise<{ id: string }> }

function getTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

/**
 * System prompt para modo CHAT (conversacional, no modifica el guion).
 */
function buildChatSystemPrompt(title: string, fountain: string, synopsis: string, logline: string): string {
  return `Eres un asistente experto en escritura cinematográfica y formato Fountain.
Estás ayudando a desarrollar el guion: "${title}".
${logline ? `Logline: ${logline}` : ""}
${synopsis ? `Sinopsis: ${synopsis}` : ""}

Responde en español. Sé conciso, útil y específico sobre cine y guiones.
NO modifiques el guion en este modo — solo da retroalimentación, sugerencias o responde preguntas.

DOCUMENTO ACTUAL:
${fountain.trim() || "(vacío)"}`
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id)
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 })

  const { id } = await context.params
  const project = await getOwnedProjectOrNull(id, session.user.id)
  if (!project)
    return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), { status: 404 })

  const rows = await prisma.chatMessage.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  })

  const messages: UIMessage[] = rows.map((m) => ({
    id: m.id,
    role: m.role === "USER" ? "user" : m.role === "ASSISTANT" ? "assistant" : "system",
    parts: [{ type: "text", text: m.content }],
  }))

  return Response.json({ messages })
}

// ─── POST ───────────────────────────────────────────────────────────────────

type ChatBody = {
  messages?: unknown
  documentFountain?: string
  modifiers?: unknown
  model?: string
  action?: ChatDocumentAction
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id)
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 })

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey?.trim())
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY no configurada" }), { status: 500 })

    const { id: projectId } = await context.params
    const project = await getOwnedProjectOrNull(projectId, session.user.id)
    if (!project)
      return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), { status: 404 })

    const body = (await req.json()) as ChatBody
    const documentFountain = body.documentFountain ?? ""
    const modifiers = (body.modifiers ?? {}) as Record<string, unknown>
    const modelId = body.model?.trim() || "openai/gpt-oss-20b:free"
    const action = body.action ?? "chat"

    const validated = await safeValidateUIMessages({ messages: body.messages })
    if (!validated.success)
      return new Response(JSON.stringify({ error: "Mensajes inválidos" }), { status: 400 })

    const uiMessages = validated.data as UIMessage[]
    if (uiMessages.length === 0)
      return new Response(JSON.stringify({ error: "Sin mensajes" }), { status: 400 })

    // Guardar mensaje del usuario
    const last = uiMessages[uiMessages.length - 1]
    const userText = last.role === "user" ? getTextFromUIMessage(last) : ""
    if (userText) {
      await prisma.chatMessage.create({
        data: { projectId, role: "USER", content: userText },
      })
    }

    const openrouter = createOpenRouter({ apiKey })
    const modelMessages = await convertToModelMessages(
      uiMessages.map(({ id: _id, ...rest }) => rest)
    )

    // ── Construir system prompt según acción ─────────────────────────────────
    const logline = project.logline ?? ""
    const synopsis = (project as { synopsis?: string }).synopsis ?? ""
    let system: string

    if (action === "chat") {
      // Modo conversacional — no modifica el documento
      system = buildChatSystemPrompt(project.title, documentFountain, synopsis, logline)
    } else {
      // Acciones de generación — usar el orquestador con contexto completo
      const elements = projectContentToFountainElements(project.content)
      system = AIOrchestrator.buildPrompt({
        action,
        context: {
          title: project.title,
          logline,
          synopsis,
          previousScenes: elements,
          currentScene: null,
          characters: [],
        },
        modifiers,
        userInstruction: userText,
        model: modelId,
      })
    }

    // Modelos sin system prompt (Gemma) → inyectar como primer mensaje usuario
    const noSystemModels = ["gemma", "google/gemma"]
    const useSystemAsUser = noSystemModels.some((m) => modelId.includes(m))

    const finalMessages = useSystemAsUser
      ? [
          { role: "user" as const, content: `[SISTEMA]\n${system}\n[/SISTEMA]` },
          { role: "assistant" as const, content: "Entendido. Responderé solo con Fountain." },
          ...modelMessages,
        ]
      : modelMessages

    const result = await streamText({
      model: openrouter(modelId),
      system: useSystemAsUser ? undefined : system,
      messages: finalMessages,
      temperature: action === "chat" ? 0.6 : 0.8,
      onFinish: async ({ text, totalUsage }) => {
        const out = text.trim()
        if (!out) return

        // Validar output si es acción de generación
        if (action !== "chat") {
          const { warnings } = AIOrchestrator.validateOutput(out)
          if (warnings.length > 0) {
            console.warn(`[Orchestrator] Warnings for ${action}:`, warnings)
          }
        }

        await prisma.chatMessage.create({
          data: {
            projectId,
            role: "ASSISTANT",
            content: out,
            model: modelId,
            inputTokens: totalUsage?.inputTokens ?? undefined,
            outputTokens: totalUsage?.outputTokens ?? undefined,
          },
        })
      },
    })

    return result.toUIMessageStreamResponse({ originalMessages: uiMessages })

  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({ error: "No se pudo completar el chat" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
