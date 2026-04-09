import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"

export const dynamic = "force-dynamic"

export type ModelInfo = {
  id: string
  name: string
  provider: string
  tier: "free" | "pro"
  contextLength: number
  note: string
}

/**
 * GET /api/models
 * Consulta OpenRouter y devuelve modelos disponibles para chat completions,
 * separados en gratuitos y de paga.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 })
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 }, // cache 5 min
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Error al consultar OpenRouter" }, { status: 502 })
    }

    const data = (await res.json()) as {
      data: Array<{
        id: string
        name: string
        pricing: { prompt: string; completion: string }
        context_length: number
        architecture?: { modality?: string }
      }>
    }

    // Filtrar solo modelos text->text (chat completions), excluir audio/imagen/embedding
    const textModels = data.data.filter((m) => {
      const modality = m.architecture?.modality ?? ""
      const id = m.id.toLowerCase()
      // Excluir modelos de audio, imagen, embedding, TTS
      if (id.includes("lyria") || id.includes("whisper") || id.includes("tts") || id.includes("embed")) return false
      return modality === "text->text" || modality === "" || modality.includes("text->text")
    })

    const models: ModelInfo[] = textModels.map((m) => {
      const isFree =
        m.pricing.prompt === "0" && m.pricing.completion === "0"

      // Extraer provider del ID (parte antes del /)
      const providerSlug = m.id.split("/")[0] ?? ""
      const providerMap: Record<string, string> = {
        "meta-llama": "Meta",
        "anthropic": "Anthropic",
        "openai": "OpenAI",
        "google": "Google",
        "mistralai": "Mistral",
        "qwen": "Alibaba",
        "deepseek": "DeepSeek",
        "microsoft": "Microsoft",
        "cohere": "Cohere",
        "nousresearch": "Nous",
        "cognitivecomputations": "CogComp",
        "nvidia": "NVIDIA",
        "x-ai": "xAI",
        "openrouter": "OpenRouter",
      }
      const provider = providerMap[providerSlug] ?? providerSlug

      const ctx = m.context_length
      const ctxLabel =
        ctx >= 1_000_000
          ? `${Math.round(ctx / 1_000_000)}M ctx`
          : ctx >= 1000
            ? `${Math.round(ctx / 1000)}k ctx`
            : `${ctx} ctx`

      return {
        id: m.id,
        name: m.name.replace(/\s*\(free\)\s*/i, "").trim(),
        provider,
        tier: isFree ? "free" : "pro",
        contextLength: ctx,
        note: ctxLabel,
      }
    })

    // Separar y ordenar: free primero por contexto desc, pro por contexto desc
    const free = models
      .filter((m) => m.tier === "free")
      .sort((a, b) => b.contextLength - a.contextLength)

    const pro = models
      .filter((m) => m.tier === "pro")
      .sort((a, b) => b.contextLength - a.contextLength)

    return NextResponse.json({ free, pro })
  } catch (err) {
    console.error("Models API error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
