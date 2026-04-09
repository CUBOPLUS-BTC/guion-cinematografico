import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"
import { auth } from "@/lib/auth/auth"
import { getOwnedProjectOrNull } from "@/lib/api/project-access"
import { projectContentToFountainString } from "@/lib/core/fountain/project-content"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

const videoPromptsSchema = z.object({
  prompts: z.array(
    z.object({
      sceneNumber: z.number().int().positive(),
      sceneHeading: z.string(),
      prompt: z.string(),
      duration: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
})

type VideoPromptsBody = {
  fountain?: string
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey?.trim()) {
      return Response.json(
        { error: "OPENROUTER_API_KEY no configurada en el servidor" },
        { status: 500 }
      )
    }

    const { id: projectId } = await context.params
    const project = await getOwnedProjectOrNull(projectId, session.user.id)
    if (!project) {
      return Response.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const body = (await req.json().catch(() => ({}))) as VideoPromptsBody
    const fountain =
      typeof body.fountain === "string" && body.fountain.trim() !== ""
        ? body.fountain
        : projectContentToFountainString(project.content)

    if (!fountain.trim()) {
      return Response.json(
        { error: "No hay guion para convertir en prompts de video" },
        { status: 400 }
      )
    }

    const openrouter = createOpenRouter({ apiKey })
    const modelId =
      process.env.VIDEO_PROMPTS_MODEL?.trim() || "anthropic/claude-3-haiku"

    const { object } = await generateObject({
      model: openrouter(modelId),
      schema: videoPromptsSchema,
      schemaName: "VideoPrompts",
      schemaDescription:
        "Prompts secuenciales en inglés o español para generación de video con IA a partir de un guion Fountain",
      system: `Eres un director de fotografía y supervisor de VFX. Recibes un guion en formato Fountain (puede incluir líneas [ESCENOGRAFIA], [SONIDO], [MUSICA], [CAMARA] y notas [[Duración: ...]]).

Tu tarea: dividir el guion en escenas (por cada encabezado INT./EXT. o slugline principal) y, para cada escena, producir UN prompt de video autocontenido y detallado pensado para modelos de generación de video (Sora, Kling, Runway, etc.).

Cada prompt debe incluir de forma explícita cuando aplique:
- Descripción visual y acción principal
- Encuadre / movimiento de cámara sugerido
- Iluminación y ambiente
- Coherencia con la escena anterior (mencionar continuidad si es relevante)

Los prompts deben ser secuenciales (sceneNumber 1, 2, 3…) según el orden del guion. sceneHeading debe resumir el encabezado de escena o inventar un título corto si falta.

Responde SOLO mediante el objeto JSON que cumple el schema; no añadas texto fuera del JSON.`,
      prompt: `Título del proyecto: ${project.title || "Sin título"}

Guion Fountain completo:
---
${fountain}
---

Genera el array "prompts" con un elemento por escena relevante del guion.`,
      temperature: 0.6,
    })

    return Response.json({ prompts: object.prompts, model: modelId })
  } catch (error) {
    console.error("Video prompts API Error:", error)
    return Response.json(
      { error: "No se pudieron generar los prompts de video" },
      { status: 500 }
    )
  }
}
