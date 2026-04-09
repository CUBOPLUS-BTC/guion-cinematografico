import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"
import { auth } from "@/lib/auth/auth"
import { getOwnedProjectOrNull } from "@/lib/api/project-access"
import { projectContentToFountainString } from "@/lib/core/fountain/project-content"
import { parseFountainToBlocks } from "@/lib/core/fountain/semantic-parser"

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

type VideoPrompt = z.infer<typeof videoPromptsSchema>["prompts"][number]

type SceneAccumulator = {
  sceneNumber: number
  sceneHeading: string
  duration?: string
  actions: string[]
  dialogue: string[]
  scenography: string[]
  camera: string[]
  sound: string[]
  music: string[]
}

function truncateText(value: string, maxLength: number): string {
  const trimmed = value.replace(/\s+/g, " ").trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

function createScene(sceneNumber: number, sceneHeading: string): SceneAccumulator {
  return {
    sceneNumber,
    sceneHeading: sceneHeading.trim() || `ESCENA ${sceneNumber}`,
    actions: [],
    dialogue: [],
    scenography: [],
    camera: [],
    sound: [],
    music: [],
  }
}

function getLightingDirection(sceneHeading: string): string {
  const heading = sceneHeading.toUpperCase()
  if (heading.includes("NOCHE") || heading.includes("MADRUGADA")) {
    return "clave baja, contraste controlado y atmósfera nocturna cinematográfica"
  }
  if (heading.includes("ATARDECER") || heading.includes("OCASO")) {
    return "luz cálida rasante, volumen suave y sensación de hora dorada"
  }
  if (heading.includes("AMANECER") || heading.includes("MAÑANA") || heading.includes("DÍA")) {
    return "luz natural modelada, contraste limpio y tono realista"
  }
  return "luz cinematográfica naturalista, separación de planos y textura sutil"
}

function buildPromptFromScene(
  scene: SceneAccumulator,
  previousSceneHeading?: string
): VideoPrompt {
  const visualContext =
    scene.scenography.length > 0
      ? truncateText(scene.scenography.join(". "), 260)
      : "Espacio coherente con el guion, dirección de arte sobria y detalle cinematográfico realista"

  const dramaticAction =
    scene.actions.length > 0 || scene.dialogue.length > 0
      ? truncateText([...scene.actions, ...scene.dialogue].join(". "), 360)
      : "Acción visual contenida con foco en composición, presencia actoral y ritmo narrativo"

  const cameraDirection =
    scene.camera.length > 0
      ? truncateText(scene.camera.join(". "), 220)
      : "plano cinematográfico estable con movimiento de cámara sutil y profundidad de campo natural"

  const continuity = previousSceneHeading
    ? `Continuidad visual con la escena anterior (${previousSceneHeading}). `
    : ""

  const prompt = [
    `${scene.sceneHeading}.`,
    continuity,
    `Acción principal: ${dramaticAction}.`,
    `Entorno y arte: ${visualContext}.`,
    `Cámara: ${cameraDirection}.`,
    `Iluminación: ${getLightingDirection(scene.sceneHeading)}.`,
    "Estética de largometraje, composición profesional, textura orgánica y movimiento físico verosímil.",
  ]
    .filter(Boolean)
    .join(" ")

  const notesParts: string[] = []
  if (scene.sound.length > 0) {
    notesParts.push(`Sonido: ${truncateText(scene.sound.join(". "), 180)}`)
  }
  if (scene.music.length > 0) {
    notesParts.push(`Música: ${truncateText(scene.music.join(". "), 140)}`)
  }
  if (previousSceneHeading) {
    notesParts.push(`Continuidad con ${previousSceneHeading}`)
  }

  return {
    sceneNumber: scene.sceneNumber,
    sceneHeading: scene.sceneHeading,
    prompt,
    duration: scene.duration,
    notes: notesParts.length > 0 ? notesParts.join(" · ") : undefined,
  }
}

function buildFallbackVideoPrompts(fountain: string): VideoPrompt[] {
  const blocks = parseFountainToBlocks(fountain)
  const scenes: SceneAccumulator[] = []
  let currentScene: SceneAccumulator | null = null
  let pendingCharacter: string | null = null

  const ensureScene = (): SceneAccumulator => {
    if (!currentScene) {
      currentScene = createScene(scenes.length + 1, `SECUENCIA ${scenes.length + 1}`)
    }
    return currentScene
  }

  const flushScene = () => {
    if (!currentScene) return
    const hasContent =
      currentScene.actions.length > 0 ||
      currentScene.dialogue.length > 0 ||
      currentScene.scenography.length > 0 ||
      currentScene.camera.length > 0 ||
      currentScene.sound.length > 0 ||
      currentScene.music.length > 0

    if (hasContent || currentScene.sceneHeading.trim() !== "") {
      scenes.push(currentScene)
    }
    currentScene = null
    pendingCharacter = null
  }

  for (const block of blocks) {
    if (block.type === "scene_heading") {
      flushScene()
      currentScene = createScene(scenes.length + 1, block.text.toUpperCase())
      continue
    }

    const scene = ensureScene()

    if (block.type === "note" && block.semanticTag === "time") {
      scene.duration = block.text
      continue
    }

    if (block.type === "character") {
      pendingCharacter = block.text.toUpperCase()
      continue
    }

    if (block.type === "dialogue") {
      scene.dialogue.push(
        pendingCharacter ? `${pendingCharacter}: ${block.text}` : block.text
      )
      continue
    }

    if (block.type === "parenthetical") {
      scene.dialogue.push(block.text)
      continue
    }

    pendingCharacter = null

    if (block.type !== "action") continue

    if (block.semanticTag === "scenography") {
      scene.scenography.push(block.text)
      continue
    }
    if (block.semanticTag === "camera") {
      scene.camera.push(block.text)
      continue
    }
    if (block.semanticTag === "sound") {
      scene.sound.push(block.text)
      continue
    }
    if (block.semanticTag === "music") {
      scene.music.push(block.text)
      continue
    }

    scene.actions.push(block.text)
  }

  flushScene()

  return scenes.map((scene, index) =>
    buildPromptFromScene(scene, index > 0 ? scenes[index - 1]?.sceneHeading : undefined)
  )
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
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

    const fallbackPrompts = buildFallbackVideoPrompts(fountain)
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey?.trim()) {
      return Response.json({ prompts: fallbackPrompts, model: "fallback/local" })
    }

    const openrouter = createOpenRouter({ apiKey })
    const modelId =
      process.env.VIDEO_PROMPTS_MODEL?.trim() || "anthropic/claude-3-haiku"

    try {
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
    } catch (generationError) {
      console.error("Video prompts structured generation error:", generationError)

      if (fallbackPrompts.length > 0) {
        return Response.json({ prompts: fallbackPrompts, model: "fallback/local" })
      }

      return Response.json(
        { error: "No se pudieron generar los prompts de video" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Video prompts API Error:", error)
    return Response.json(
      { error: "No se pudieron generar los prompts de video" },
      { status: 500 }
    )
  }
}
