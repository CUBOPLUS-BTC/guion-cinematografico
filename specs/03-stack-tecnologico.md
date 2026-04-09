# 03 — Stack Tecnológico

> **Documento:** Especificación de Tecnologías  
> **Última actualización:** 2026-04-08

---

## 3.1 Resumen del Stack

```
┌────────────────────────────────────────────────────┐
│                    FRAMEWORK                       │
│  Next.js 15 (App Router - Monolito Fullstack)      │
├────────────────────────────────────────────────────┤
│                  FRONTEND (UI)                     │
│  React 19 │ Tailwind CSS v4 │ shadcn/ui            │
│  TipTap / ProseMirror       │ Zustand              │
├────────────────────────────────────────────────────┤
│                  BACKEND (API)                     │
│  Next.js Route Handlers (Edge & Node Runtime)      │
│  Server Actions │ Server-Sent Events (SSE)         │
├────────────────────────────────────────────────────┤
│                 SERVICIOS                          │
│  OpenRouter (IA unificada)                         │
│  Auth (NextAuth.js v5)   │ Stripe (Billing)        │
├────────────────────────────────────────────────────┤
│               BASE DE DATOS                        │
│  PostgreSQL (Neon / Supabase)                      │
│  Prisma ORM (v6)                                   │
└────────────────────────────────────────────────────┘
```

---

## 3.2 Framework Principal

### 3.2.1 Next.js 15 (Monolito Unificado)

| Aspecto | Detalle |
|:--------|:--------|
| **Versión** | 15.x (App Router) |
| **Paradigma** | Arquitectura monolítica con frontend y backend en una sola app |
| **Razón** | Elimina complejidad cross-origin, centraliza dependencias, maneja tanto páginas estáticas como la SPA pesada del editor, SSR nativo para dashboard, API nativa. |

**Componentes y roles dentro de Next.js:**
- **Server Components:** Dashboard, Settings, Data fetching (SaaS general).
- **Client Components:** El `Editor Engine` que requiere manipulación del DOM (TipTap), Zustand state, plugins laterales.
- **Route Handlers / Actions:** Autenticación, interacciones con DB, streaming con OpenRouter.

### 3.2.2 React 19

| Aspecto | Detalle |
|:--------|:--------|
| **Versión** | 19.x |
| **Características clave** | Use cases como `use()` hook, Server Actions integrados profundamente. |

### 3.2.3 TypeScript 5.x

| Aspecto | Detalle |
|:--------|:--------|
| **Versión** | 5.4+ (Strict mode activado) |

---

## 3.3 Sistema de UI

### 3.3.1 Tailwind CSS v4

| Aspecto | Detalle |
|:--------|:--------|
| **Versión** | 4.x |
| **Paradigma** | Configuración puramente en CSS con `@theme` (sin `tailwind.config.js`). |
| **Ubicación** | `src/app/globals.css` define el tema completo. |

### 3.3.2 shadcn/ui

- Primitivas accesibles basadas en Radix UI.
- Componentes en `src/components/ui/` generados por `npx shadcn@latest add`.
- Utilidades en `src/lib/utils.ts` (función `cn()` para class merging).

---

## 3.4 Editor de Texto

### 3.4.1 TipTap / ProseMirror

- **TipTap 2.x:** La capa de alto nivel que provee la API sobre React. 
- Extensiones propias en `src/editor-engine/core/` (`FountainExtension`, `AIInlineExtension`, `MetadataExtension`).

---

## 3.5 Gestión de Estado (Cliente)

### 3.5.1 Zustand

- Exclusivo para secciones Client Component (el canvas del Editor y el manejo del prompt orchestration en UI).
- Stores en `src/editor-engine/store/`.
- Integración limpia, sin propagación de Contextos masivos.

---

## 3.6 Backend, APIs e Inteligencia Artificial

### 3.6.1 Next.js API Routes (Server)

- Los endpoints asíncronos y SSE corren en Runtime Edge/Node dentro de la propia app.
- Route Handlers en `src/app/api/`.
- Server Actions en componentes con `"use server"`.
- Generación de PDF/FDX manejada de forma server-side en `src/lib/core/export/`.

### 3.6.2 OpenRouter API

| Aspecto | Detalle |
|:--------|:--------|
| **Plataforma** | OpenRouter (IA Unificada) |
| **SDK** | Vercel AI SDK o acceso Fetch/HTTP directo a OpenRouter |
| **Ventaja** | Un solo API endpoint y esquema de pago para rutear peticiones a *todos* los modelos (GPT-4, Claude 3.5, Gemini Pro) de acuerdo a las necesidades del proyecto o selección del usuario. Evita lidiar con credenciales y rate limits variados. |

### 3.6.3 Base de Datos

- **Motor:** PostgreSQL (hosted en Neon o Supabase)
- **ORM:** Prisma 6.x
- **Schema:** `prisma/schema.prisma` en la raíz del proyecto.

### 3.6.4 Auth y Billing

- **NextAuth.js v5:** Manejo de sesiones y JWT. Config en `src/lib/auth/auth.ts`.
- **Stripe:** Billing, metadatos y webhook hooks recibidos en `app/api/webhooks/stripe/route.ts`.

---

## 3.7 Infraestructura

- **Build:** `next build` (un solo comando, sin pipeline multi-paquete).
- **Package Manager:** npm (sin necesidad de pnpm/workspaces).
- **Deploy:** Vercel (la plataforma natural para aplicaciones Next.js).

---

## 3.8 Dependencias Principales

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/pm": "^2.x",
    "zustand": "^5.x",
    "@prisma/client": "^6.x",
    "next-auth": "^5.x",
    "@openrouter/ai-sdk-provider": "latest",
    "ai": "^4.x",
    "stripe": "^17.x",
    "zod": "^3.x",
    "lucide-react": "latest",
    "@radix-ui/react-slot": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "prisma": "^6.x",
    "@tailwindcss/postcss": "^4.x",
    "tailwindcss": "^4.x",
    "vitest": "latest",
    "@playwright/test": "latest",
    "eslint": "^9.x",
    "eslint-config-next": "^15.x"
  }
}
```
