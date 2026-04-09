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
import type { ChatDocumentAction } from "@/lib/core/ai/chat-document"
export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

function getTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function buildSystemPrompt(params: {
  title: string
  documentFountain: string
  modifiers: unknown
  action: ChatDocumentAction | undefined
}): string {
  const { title, documentFountain, modifiers, action } = params
  const doc =
    documentFountain.trim() === "" ? "(documento vacío)" : documentFountain

  return `Eres un guionista y director de cine experto. Escribes exclusivamente en lenguaje Fountain (sin explicaciones meta, sin preámbulos ni markdown fuera del guion; solo el texto del guion cuando corresponda).

OBJETIVO: Guion cinematográfico detallado y profesionalmente estructurado, con actos, escenas, tiempos, diálogos, escenografía, sonido y cámara claramente diferenciados y semánticamente consistentes.

REGLAS Fountain (base):
1. Encabezados de escena: INT. o EXT. LOCACIÓN - MOMENTO DEL DÍA (o línea que empiece con . para slugline).
2. Personajes: nombre en MAYÚSCULAS en su propia línea.
3. Diálogo: debajo del personaje; acotaciones de interpretación entre paréntesis en su propia línea bajo el personaje.
4. Acción: párrafos de acción en tiempo presente, tercera persona.
5. Transiciones: > TRANSICIÓN (por ejemplo > CORTE A: o > FUNDIDO A NEGRO).
6. Secciones: usa # ACTO I, # ACTO II, # ACTO III (o más actos si el usuario lo pide) para delimitar actos.

ESTRUCTURA Y METADATOS (obligatorio usar estos prefijos y notas tal cual para que el editor los interprete):
- Duración estimada por escena: en una línea aparte, ANTES del encabezado de escena o justo después, usa notas de doble corchete, por ejemplo: [[Duración: ~3 min]] o [[Tiempo estimado: 2m30s]].
- Escenografía detallada: líneas de acción que empiecen exactamente con [ESCENOGRAFIA] seguido de un espacio y la descripción (mobiliario, época, atmósfera del espacio, objetos clave).
- Sonido ambiente y efectos: líneas que empiecen con [SONIDO] seguido de espacio y la descripción (ambiente, FX, silencios, off-screen).
- Música: líneas que empiecen con [MUSICA] seguido de espacio (estilo, intensidad, momento emocional; sin letra salvo que sea diegético).
- Cámara y encuadre (no reemplazan el guion literario; son indicaciones de producción): líneas que empiecen con [CAMARA] seguido de espacio (plano, movimiento, lente sugerido, ritmo).
- Orden sugerido dentro de cada escena: encabezado → [[Duración: …]] si aplica → bloques [ESCENOGRAFIA] / [CAMARA] según necesidad → acción → diálogos → [SONIDO] / [MUSICA] cuando aporten → transición si procede.

TONO: Responde en español. Diálogos y acotaciones naturales según el tono del proyecto. Sé específico en escenografía y sonido sin relleno genérico.

CONTEXTO DEL PROYECTO:
Título: ${title || "Sin título"}

DOCUMENTO ACTUAL (Fountain):
${doc}

MODIFICADORES TÉCNICOS (JSON; contexto de producción para esta generación):
${JSON.stringify(modifiers ?? {})}

ACCIÓN SOLICITADA POR LA UI: ${action ?? "chat"}
- "continue": continúa el guion desde el final del documento actual sin repetir lo ya escrito; mantén el mismo formato Fountain y prefijos semánticos.
- "generate", "rewrite" o "refine": devuelve el guion resultante completo en Fountain (o solo la sección pedida si el usuario acota explícitamente).
- "chat": sigue la instrucción del usuario; si pide cambiar el guion, devuelve el texto Fountain actualizado o nuevo según corresponda.

Salida: únicamente texto Fountain cuando generes o modifiques guion (sin bloques de código markdown).`
}

/**
 * GET — historial de mensajes del chat para el proyecto (orden cronológico).
 */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { id } = await context.params
  const project = await getOwnedProjectOrNull(id, session.user.id)
  if (!project) {
    return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  const rows = await prisma.chatMessage.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  })

  const messages: UIMessage[] = rows.map((m) => ({
    id: m.id,
    role:
      m.role === "USER"
        ? "user"
        : m.role === "ASSISTANT"
          ? "assistant"
          : "system",
    parts: [{ type: "text", text: m.content }],
  }))

  return Response.json({ messages })
}

type ChatBody = {
  messages?: unknown
  documentFountain?: string
  modifiers?: unknown
  model?: string
  action?: ChatDocumentAction
}

/**
 * POST — streaming multi-turn compatible con useChat (DefaultChatTransport).
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey?.trim()) {
      return new Response(
        JSON.stringify({
          error: "OPENROUTER_API_KEY no configurada en el servidor",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }



    const { id: projectId } = await context.params
    const project = await getOwnedProjectOrNull(projectId, session.user.id)
    if (!project) {
      return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = (await req.json()) as ChatBody
    const messagesUnknown = body.messages
    const documentFountain = body.documentFountain ?? ""
    const modifiers = body.modifiers
    const modelId = body.model?.trim() || "anthropic/claude-3-haiku"
    const action = body.action

    const validated = await safeValidateUIMessages({
      messages: messagesUnknown,
    })
    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: validated.error.message || "Mensajes inválidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const uiMessages = validated.data as UIMessage[]
    if (uiMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Sin mensajes" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const last = uiMessages[uiMessages.length - 1]
    if (last.role === "user") {
      const userText = getTextFromUIMessage(last)
      await prisma.chatMessage.create({
        data: {
          projectId,
          role: "USER",
          content: userText,
        },
      })
    }

    const modelMessages = await convertToModelMessages(
      uiMessages.map((m) => {
        const { id, ...rest } = m
        void id
        return rest
      })
    )

    const openrouter = createOpenRouter({ apiKey })

    const system = buildSystemPrompt({
      title: project.title,
      documentFountain,
      modifiers,
      action,
    })

    // Algunos modelos gratuitos (Gemma, etc.) no soportan system prompt.
    // Para esos, inyectamos el system como primer mensaje de usuario.
    const noSystemModels = ["gemma", "google/gemma"]
    const useSystemAsUser = noSystemModels.some((m) => modelId.includes(m))

    const finalMessages = useSystemAsUser
      ? [
          { role: "user" as const, content: `[INSTRUCCIONES DEL SISTEMA]\n${system}\n\n[FIN INSTRUCCIONES]` },
          { role: "assistant" as const, content: "Entendido. Seguiré las instrucciones al pie de la letra y responderé solo con texto Fountain." },
          ...modelMessages,
        ]
      : modelMessages

    const result = await streamText({
      model: openrouter(modelId),
      system: useSystemAsUser ? undefined : system,
      messages: finalMessages,
      temperature: 0.8,
      onFinish: async ({ text, totalUsage }) => {
        const out = text.trim()
        if (!out) return

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

    return result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({ error: "No se pudo completar el chat" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
