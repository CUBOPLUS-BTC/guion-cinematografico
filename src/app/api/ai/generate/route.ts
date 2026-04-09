import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { AIOrchestrator, AIRequest } from '@/lib/core/ai/orchestrator';

// Configuración de OpenRouter
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body: AIRequest = await req.json();
    
    // Validar autenticación aquí si fuera necesario (NextAuth)
    
    const prompt = AIOrchestrator.buildPrompt(body);
    
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
