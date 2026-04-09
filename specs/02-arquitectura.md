# 02 — Arquitectura de la Aplicación

> **Documento:** Especificación de Arquitectura  
> **Última actualización:** 2026-04-08

---

## 2.1 Justificación de Arquitectura Monolítica

Se adopta una **arquitectura monolítica unificada en una sola aplicación Next.js** por las siguientes razones:

- **Fullstack unificado:** Next.js maneja tanto el frontend (Dashboard, Editor SPA) como el backend (API Routes, Server Actions) en una sola app, eliminando complejidad de cors y despliegues separados.
- **Simplicidad:** Un solo repositorio, sin paquetes divididos, sin herramientas adicionales de gestión, permitiendo una experiencia de desarrollo limpia y directa.
- **Organización por carpetas:** La lógica de negocio (parser Fountain, orquestación de IA, exportación) se organiza limpiamente en carpetas internas (`src/lib/core/`, `src/lib/ai/`, etc.) dentro del mismo proyecto Next.js.
- **DX superior:** Un solo `package.json`, un solo `tsconfig.json`, un solo punto de entrada con `npm run dev`. Simplicidad máxima.

---

## 2.2 Estructura de Directorios

```
guion-cinematografico/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Rutas de autenticación
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/                  # Dashboard SaaS (layout group)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx        # Home del dashboard
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx              # Lista de proyectos
│   │   │   │   ├── new/page.tsx          # Crear proyecto
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detalle del proyecto
│   │   │   │       └── settings/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx              # Config general
│   │   │   │   └── billing/page.tsx      # Billing
│   │   │   ├── ai-history/page.tsx       # Historial IA
│   │   │   └── templates/page.tsx        # Templates
│   │   ├── editor/                       # Editor (Client Components)
│   │   │   ├── [id]/page.tsx             # Editor principal
│   │   │   └── layout.tsx               # Layout del editor
│   │   ├── api/                          # Route Handlers (Backend)
│   │   │   ├── ai/
│   │   │   │   ├── generate/route.ts     # POST - Generar IA (SSE)
│   │   │   │   └── refine/route.ts       # POST - Refinar IA (SSE)
│   │   │   ├── projects/
│   │   │   │   ├── route.ts              # GET, POST proyectos
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts          # GET, PATCH, DELETE
│   │   │   │       ├── content/route.ts  # GET, PUT contenido
│   │   │   │       ├── export/route.ts   # POST exportar PDF/FDX
│   │   │   │       └── versions/route.ts # GET, POST versiones
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── webhooks/stripe/route.ts
│   │   ├── layout.tsx                     # Root layout
│   │   ├── page.tsx                       # Landing page
│   │   └── globals.css                    # Tailwind v4 imports + theme
│   │
│   ├── components/                        # Componentes React reutilizables
│   │   ├── ui/                            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── select.tsx
│   │   │   ├── command.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── resizable.tsx
│   │   ├── dashboard/                     # Componentes del dashboard
│   │   │   ├── project-card.tsx
│   │   │   ├── stats-panel.tsx
│   │   │   └── nav-sidebar.tsx
│   │   ├── editor/                        # Componentes UI del editor
│   │   │   ├── toolbar.tsx
│   │   │   ├── status-bar.tsx
│   │   │   ├── outline-panel.tsx
│   │   │   └── ai-controls.tsx
│   │   └── shared/                        # Header, footer, theme toggle
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       └── theme-toggle.tsx
│   │
│   ├── editor-engine/                     # Motor del Editor (Client-side)
│   │   ├── core/                          # TipTap extensions y schema
│   │   │   ├── schema.ts                  # ProseMirror schema (nodos Fountain)
│   │   │   ├── fountain-extension.ts      # Extension TipTap Fountain
│   │   │   ├── ai-inline-extension.ts     # Extension para IA inline
│   │   │   ├── metadata-extension.ts      # Extension para metadatos
│   │   │   └── editor-instance.ts         # Factory del editor TipTap
│   │   ├── plugins/                       # Modificadores cinematográficos
│   │   │   ├── registry.ts               # Registro de plugins
│   │   │   ├── types.ts                  # Interfaces de plugins
│   │   │   ├── shots/                    # Plugin: Planos Cinematográficos
│   │   │   │   ├── index.ts
│   │   │   │   ├── data.ts              # Catálogo de planos
│   │   │   │   └── panel.tsx            # Componente UI
│   │   │   ├── lighting/                 # Plugin: Luces
│   │   │   │   ├── index.ts
│   │   │   │   ├── data.ts
│   │   │   │   └── panel.tsx
│   │   │   ├── camera/                   # Plugin: Cámara/Lente
│   │   │   │   ├── index.ts
│   │   │   │   ├── data.ts
│   │   │   │   └── panel.tsx
│   │   │   ├── effects/                  # Plugin: VFX/SFX
│   │   │   │   ├── index.ts
│   │   │   │   ├── data.ts
│   │   │   │   └── panel.tsx
│   │   │   └── description/              # Plugin: Descripción Compresiva
│   │   │       ├── index.ts
│   │   │       ├── data.ts
│   │   │       └── panel.tsx
│   │   ├── store/                         # Zustand stores del editor
│   │   │   ├── editor-store.ts
│   │   │   ├── plugin-store.ts
│   │   │   ├── ai-store.ts
│   │   │   ├── project-store.ts
│   │   │   └── ui-store.ts
│   │   └── components/                    # Componentes pesados del editor
│   │       ├── editor-canvas.tsx          # Canvas principal TipTap
│   │       └── plugin-panel.tsx           # Panel lateral de plugins
│   │
│   ├── lib/                               # Utilidades y lógica de negocio
│   │   ├── core/                          # Lógica pura (shared server/client)
│   │   │   ├── fountain/                  # Parser y AST Fountain
│   │   │   │   ├── tokenizer.ts
│   │   │   │   ├── parser.ts
│   │   │   │   └── ast.ts
│   │   │   ├── export/                    # Generadores PDF y FDX
│   │   │   │   ├── pdf-generator.ts
│   │   │   │   └── fdx-generator.ts
│   │   │   └── ai/                        # Prompt orchestration
│   │   │       ├── orchestrator.ts
│   │   │       └── prompts.ts
│   │   ├── db/                            # Base de datos
│   │   │   ├── prisma.ts                  # Client Prisma singleton
│   │   │   └── queries/                   # Queries reutilizables
│   │   │       ├── projects.ts
│   │   │       ├── users.ts
│   │   │       └── generations.ts
│   │   ├── auth/                          # Configuración de Auth
│   │   │   └── auth.ts                    # NextAuth.js v5 config
│   │   ├── stripe/                        # Billing
│   │   │   ├── stripe.ts                  # Stripe client
│   │   │   └── webhooks.ts               # Procesamiento de webhooks
│   │   ├── validations/                   # Esquemas Zod
│   │   │   ├── ai.ts
│   │   │   ├── projects.ts
│   │   │   └── auth.ts
│   │   └── utils.ts                       # cn(), formatters, helpers
│   │
│   ├── types/                             # Tipos TypeScript compartidos
│   │   ├── fountain.ts                    # Tipos del AST Fountain
│   │   ├── project.ts                     # Tipos de proyecto
│   │   ├── ai.ts                          # Tipos de IA
│   │   ├── plugins.ts                     # Tipos de plugins
│   │   └── index.ts                       # Re-exports
│   │
│   └── styles/                            # Estilos adicionales
│       └── editor.css                     # Estilos específicos del canvas
│
├── prisma/
│   ├── schema.prisma                      # Esquema Prisma
│   └── migrations/                        # Migraciones
│
├── public/
│   ├── fonts/                             # Courier Prime (self-hosted)
│   └── images/                            # Assets estáticos
│
├── .env.example                           # Variables de entorno template
├── .env.local                             # Variables locales (gitignored)
├── next.config.ts                         # Configuración Next.js
├── tailwind.css                           # Archivo CSS principal si es necesario
├── tsconfig.json                          # TypeScript config
├── package.json                           # Dependencies
├── postcss.config.mjs                     # PostCSS (para Tailwind v4)
└── README.md
```

---

## 2.3 Configuración de TypeScript Path Aliases

Se aplican convenciones de alias directos para mejorar la experiencia con los imports:

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/editor-engine/*": ["./src/editor-engine/*"]
    }
  }
}
```

### Uso en imports

```typescript
import { Button } from '@/components/ui/button';
import { FountainParser } from '@/lib/core/fountain/parser';
import type { Project } from '@/types/project';
```

---

## 2.4 Integración Frontend/Backend en Next.js

La arquitectura utiliza las ventajas propias de **Next.js App Router**:

| Capa | Implementación en app | Uso |
|:-----|:-----------------------|:----|
| **Frontend de consumo** | `app/(dashboard)/*` (Server Components) | SSR de proyectos, renderizado seguro rápido para el SaaS. |
| **Frontend de edición** | `app/editor/*` (Client Components) + Zustand | SPA montada dinámicamente en el cliente para latencia cero con TipTap. |
| **Backend API** | `app/api/*` (Route Handlers) | Recibe conexiones REST o streams desde el Editor. |
| **Backend Server Actions** | Funciones `use server` | Mutaciones directas de BD (crear proyecto, actualizar settings). |

**Ventajas del enfoque unificado:**
- Compartimos la sesión (NextAuth) de forma nativa en todo el entorno.
- Una sola variable de entorno `.env` rige el proyecto completo.
- OpenRouter API keys y secretos se mantienen aislados solo en archivos del servidor.
- Un solo comando de build (`next build`), un solo deploy en plataforma.

---

## 2.5 Scripts npm

### `package.json` (parcial)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```
