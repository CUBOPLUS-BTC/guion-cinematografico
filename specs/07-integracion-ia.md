# 07 — Integración de IA

> **Documento:** Especificación del Pipeline de Inteligencia Artificial  
> **Última actualización:** 2026-04-08

---

## 7.1 Resumen

El pipeline de IA alimenta el flujo de escritura inyectando metadatos (plugins técnicos) y texto del guión mediante un orquestador para ensamblar peticiones hacia LLMs potentes usando **OpenRouter**. La comunicación fluye vía **Server-Sent Events (SSE)** hacia el editor desarrollado en Next.js.

---

## 7.2 Arquitectura del Pipeline con OpenRouter

```
Next.js Client Components (Frontend)    Next.js Route Handlers             OpenRouter (Unified API)
┌──────────────┐                       ┌──────────────────┐               ┌────────────┐
│PluginStates  │──┐                    │/api/ai/generate  │               │ Models pool│
│EditorContent │──┼─► HTTP POST───────►│1.Validate (zod)  │──stream──────►│ - Claude 3 │
│UserInstruct  │──┘                    │2.Auth+RateLimit  │◄─SSE (tokens)─│ - GPT-4o   │
│              │◄───── SSE Stream ─────│3.BuildPrompt     │               │ - Gemini   │
│ StreamHandler│                       │4.StreamResponse  │               └────────────┘
└──────────────┘                       └──────────────────┘
```

---

## 7.3 Prompt Orchestrator

Construye el prompt en el backend (en `src/lib/core/ai/orchestrator.ts`) enviando la configuración a OpenRouter.

### Request Interface

```typescript
interface AIRequest {
  action: 'generate' | 'refine' | 'continue' | 'rewrite';
  context: {
    title: string;
    previousScenes: FountainElement[];
    currentScene: FountainElement[] | null;
    characters: CharacterProfile[];
  };
  modifiers: Record<string, any>;
  userInstruction: string;
  // OpenRouter consume IDs uniformes: e.g. "anthropic/claude-3-5-sonnet", "openai/gpt-4o"
  model: string; 
  config: { temperature: number; maxTokens: number; topP: number; };
}
```

### System Prompt Base

```
You are an expert screenwriter and cinematographer. Write strictly in Fountain markup.
Rules:
1. Scene headings start with INT. or EXT.
2. Character names are UPPERCASE.
3. Natural cinematic flow blending provided direction metadata.
```

---

## 7.4 Modos de IA

| Modo | Atajo (Shortcut) | Output |
|:-----|:-----------------|:-------|
| **Generate** | `Cmd+Shift+G` | Escena escrita integral basada en modifiers + User prompt |
| **Refine** | Select + `Cmd+Shift+R` | Selección reformulada sin perder formato |
| **Continue** | Cursor End + `Cmd+Shift+C`| Autofill predictivo del acto actual |
| **Rewrite** | Select + Action | Redireccionamiento de estilo y cinematografía |

---

## 7.5 Integración de OpenRouter

Se emplea la librería estándar o `Vercel AI SDK` apuntando a las credenciales de OpenRouter.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// usage in Route Handler:
const result = await streamText({
  model: openrouter(req.modelId),
  system: systemPrompt,
  messages: userMessages...
});
return result.toDataStreamResponse();
```

---

## 7.6 Modelos y Rate Limiting

Gracias a OpenRouter, el SaaS puede ofrecer tiers claros sin programar parsers para cada ecosistema:

| Plan | Limitación | Modelos Habilitados (Ejemplo OpenRouter ID) |
|:-----|:-----------|:--------------------------------------------|
| Free | 20 req/día, ~2k tokens | `meta-llama/llama-3-8b-instruct`, `google/gemini-flash-1.5` |
| Pro | 200 req/día, ~4k tokens| `anthropic/claude-3-haiku`, `openai/gpt-4o-mini` |
| Enterprise | Ilimitado | `anthropic/claude-3.5-sonnet`, `openai/gpt-4o` |

El backend evalúa en Redis/Upstash la tarifa aplicable antes de despachar hacia OpenRouter.

---

## 7.7 Gestión del Contexto Acumulativo

Para lidiar con ventanas (context windows), se comprime inteligentemente: System Prompt + Modifiers locales de los plugins + 3 últimas escenas de contexto máximo.

## 7.8 Seguridad

La Key de OpenRouter (`OPENROUTER_API_KEY`) y la URL predefinida (`SITE_URL`, `SITE_NAME`) se definen a nivel entorno en el Server Next.js. El cliente nunca debe acceder directamente a OpenRouter, de este modo se controlan abusos sobre las cuentas de facturación del producto final.
