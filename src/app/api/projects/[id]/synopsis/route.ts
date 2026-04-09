import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { auth } from "@/lib/auth/auth"
import { getOwnedProjectOrNull } from "@/lib/api/project-access"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey?.trim()) {
    return Response.json({ error: "API key no configurada" }, { status: 500 })
  }

  const { id } = await context.params
  const project = await getOwnedProjectOrNull(id, session.user.id)
  if (!project) return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })

  const body = (await req.json()) as { fountain?: string; model?: string }
  const fountain = body.fountain?.trim() || ""
  const modelId = body.model?.trim() || "openai/gpt-oss-20b:free"

  if (!fountain) {
    return Response.json({ error: "El guion está vacío" }, { status: 400 })
  }

  const openrouter = createOpenRouter({ apiKey })

  const prompt = `Eres un analista de guiones cinematográficos experto. A partir del siguiente guion en formato Fountain, genera en español:

1. **LOGLINE** (1-2 oraciones máximo): La premisa central del corto. Quién es el protagonista, qué quiere, qué obstáculo enfrenta y qué está en juego. Directo, impactante.

2. **SINOPSIS** (3-5 oraciones): Resumen narrativo completo del corto. Incluye inicio, conflicto, clímax y resolución. Tono cinematográfico, no descriptivo.

Responde ÚNICAMENTE con este formato JSON (sin markdown, sin explicaciones):
{
  "logline": "...",
  "synopsis": "..."
}

GUION:
${fountain.slice(0, 4000)}`

  try {
    const { text } = await generateText({
      model: openrouter(modelId),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Parsear JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: "La IA no devolvió formato esperado" }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0]) as { logline?: string; synopsis?: string }
    const logline = parsed.logline?.trim() ?? ""
    const synopsis = parsed.synopsis?.trim() ?? ""

    // Guardar en DB
    await prisma.project.update({
      where: { id },
      data: { logline, synopsis },
    })

    return Response.json({ logline, synopsis })
  } catch (err) {
    console.error("Synopsis generation error:", err)
    return Response.json({ error: "Error al generar sinopsis" }, { status: 500 })
  }
}
