import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { auth } from "@/lib/auth/auth"
import { AIOrchestrator, AIRequest } from "@/lib/core/ai/orchestrator"

/** Node runtime: OpenRouter + AI SDK; compatible con auth() del servidor */
export const runtime = "nodejs"

export async function POST(req: Request) {
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
        JSON.stringify({ error: "OPENROUTER_API_KEY no configurada en el servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const openrouter = createOpenRouter({ apiKey })

    const body: AIRequest = await req.json()

    const prompt = AIOrchestrator.buildPrompt(body)
    
    const result = await streamText({
      model: openrouter(body.model || 'anthropic/claude-3-haiku'),
      system: "Eres un experto guionista cinematográfico y director de cámara. Escribes exclusivamente en lenguaje Fountain. No incluyes explicaciones, solo el guion.",
      prompt: prompt,
      temperature: 0.8,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response(JSON.stringify({ error: "No se pudo generar el contenido" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
