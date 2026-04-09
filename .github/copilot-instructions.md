# Guion Cinematográfico AI

Este archivo es el contrato operativo del repositorio para cualquier LLM o agente. Debe servir para entender la arquitectura real del proyecto, su nomenclatura y los estándares de implementación sin depender de conocimiento previo del código.

## 1. Qué es este proyecto

- Producto: editor SaaS de guiones cinematográficos con formato Fountain, asistencia de IA y modificadores técnicos de producción.
- Arquitectura base: monolito fullstack en Next.js App Router.
- Stack real actual: Next.js 16.2.3, React 19.2.4, TypeScript strict, Tailwind CSS v4, shadcn/ui, Prisma 6.19.0, NextAuth v5 beta, Zustand, TipTap 3, OpenRouter con AI SDK.
- Idioma del producto: español en la UI, mensajes de error y prompts. Los identificadores de código se mantienen mayoritariamente en inglés.

## 2. Orden de verdad del repositorio

Cuando haya conflicto entre documentos, sigue este orden:

1. Código existente en `src/` y `prisma/`.
2. `prisma/schema.prisma`.
3. `package.json`, `tsconfig.json`, `eslint.config.mjs`.
4. `specs/`.
5. `README.md`.

Regla importante: `specs/` contiene visión y diseño, pero varias partes están desactualizadas respecto al código real. No inventes carpetas o módulos solo porque aparezcan en la especificación. Si un módulo no existe, asume que aún no fue implementado.

## 3. Mapa real del repositorio

```text
.
├── prisma/
│   ├── schema.prisma
│   └── generated/client/
├── public/
├── specs/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── (auth)/
│   │   │   ├── actions.ts
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── settings/
│   │   │       ├── actions.ts
│   │   │       └── page.tsx
│   │   ├── editor/[id]/
│   │   │   ├── page.tsx
│   │   │   └── editor-client.tsx
│   │   └── api/
│   │       ├── ai/{generate,refine}/route.ts
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── projects/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── chat/route.ts
│   │       │       ├── content/route.ts
│   │       │       ├── export/route.ts
│   │       │       ├── versions/route.ts
│   │       │       └── video-prompts/route.ts
│   │       └── webhooks/stripe/route.ts
│   ├── components/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   └── ui/
│   ├── editor-engine/
│   │   ├── components/
│   │   ├── core/
│   │   ├── plugins/
│   │   ├── store/
│   │   └── utils/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── core/
│   │   │   ├── ai/
│   │   │   ├── export/
│   │   │   └── fountain/
│   │   ├── prisma.ts
│   │   ├── format-relative.ts
│   │   ├── project-labels.ts
│   │   └── utils.ts
│   └── types/
├── AGENTS.md
├── README.md
└── package.json
```

## 4. Responsabilidad por carpetas

### `src/app/`

Es la capa de rutas, layouts, páginas y endpoints de Next.js. Aquí viven los límites entre renderizado servidor, cliente y red.

- `layout.tsx`: root layout, define fuentes globales y monta `Providers`.
- `providers.tsx`: wrapper cliente para `SessionProvider`, `ThemeProvider` y `TooltipProvider`.
- `globals.css`: fuente de verdad del sistema visual y tokens Tailwind v4.
- `(auth)`: login, signup y server actions de autenticación.
- `(dashboard)`: shell del SaaS y páginas protegidas del producto.
- `editor/[id]`: entrada SSR al editor; carga proyecto y chat, luego delega a un cliente pesado.
- `api/`: route handlers para CRUD, streaming IA, exportación, chat y webhooks.

### `src/components/`

Contiene UI React reusable fuera del núcleo del editor.

- `ui/`: primitivas base de shadcn/ui. Deben permanecer genéricas, sin lógica de negocio.
- `dashboard/`: componentes del dashboard SaaS.
- `landing/`: componentes de la landing pública.

### `src/editor-engine/`

Es el núcleo interactivo del editor cinematográfico. Todo lo que es altamente acoplado a la experiencia de edición debe vivir aquí.

- `components/`: paneles, cabeceras, bloques, preview, chat y layout interno del editor.
- `core/`: integración TipTap/ProseMirror y schema del editor.
- `plugins/`: sistema de modificadores cinematográficos.
- `store/`: estado cliente con Zustand.
- `utils/`: helpers locales del engine si no pertenecen al dominio puro.

### `src/lib/`

Contiene lógica reutilizable, principalmente server-side o agnóstica de UI.

- `core/fountain/`: parser, serialización, normalización y conversiones del documento Fountain.
- `core/ai/`: orquestación de prompts y fusión documental del chat/editor.
- `core/export/`: exportación PDF y FDX.
- `auth/`: configuración de NextAuth y variante Edge para middleware.
- `api/`: helpers del backend, por ejemplo control de acceso por proyecto.
- `prisma.ts`: singleton obligatorio del cliente Prisma.

### `src/hooks/`

Hooks genéricos reutilizables fuera del editor. Si un hook es específico del editor, evalúa primero si debe ir dentro de `editor-engine/`.

### `src/types/`

Tipos compartidos de dominio entre capas. Hoy contiene sobre todo el modelo Fountain y extensiones de tipos de auth.

### `prisma/`

Fuente de verdad del modelo relacional.

- `schema.prisma`: modelos, enums y relaciones.
- `generated/client/`: cliente generado. Este proyecto usa output custom, no asumas la ruta por defecto de Prisma.

## 5. Arquitectura funcional

### Dashboard

- Se renderiza principalmente con Server Components y componentes de presentación en `components/dashboard/`.
- El CRUD de proyectos se hace por `src/app/api/projects/**`.
- Settings usa server actions (`src/app/(dashboard)/settings/actions.ts`) para mutaciones de formulario simples.

### Editor

- `src/app/editor/[id]/page.tsx` es un Server Component protegido: autentica, carga proyecto y mensajes de chat, y entrega props serializables a `editor-client.tsx`.
- `src/app/editor/[id]/editor-client.tsx` es el contenedor cliente pesado.
- El editor usa varios stores de Zustand, chat en streaming y autosave desacoplado por tipo de dato.
- El documento en cliente se manipula como texto Fountain, no como HTML.

### IA

- Hay dos vías principales:
	- `src/app/api/ai/generate/route.ts` y `src/app/api/ai/refine/route.ts` para generación directa basada en contexto estructurado.
	- `src/app/api/projects/[id]/chat/route.ts` para chat contextual multi-turn asociado a un proyecto.
- La IA se consume vía OpenRouter con el AI SDK.
- Los endpoints de IA deben permanecer server-only y con `runtime = "nodejs"` cuando dependan de SDKs o flujos de streaming equivalentes.

### Persistencia

- La autenticación se resuelve con NextAuth v5 y Prisma.
- Los proyectos, versiones, generaciones y mensajes de chat se persisten en PostgreSQL vía Prisma.
- El acceso a proyectos debe validarse por `userId`; el helper existente es `src/lib/api/project-access.ts`.

## 6. Rutas y límites de acceso

### Rutas públicas

- `/`
- `/login`
- `/signup`
- `/api/auth/*`
- `/api/webhooks/*`

### Rutas protegidas por middleware o chequeos explícitos

- Todo el dashboard.
- `/editor/[id]`.
- La mayoría de `/api/*`.

### Patrón actual de protección

- `src/middleware.ts` redirige a login cuando una ruta no pública no tiene sesión.
- Los route handlers vuelven a validar la sesión con `auth()` y devuelven `401` JSON si falta autenticación.
- Las rutas por proyecto además validan ownership con `getOwnedProjectOrNull` o equivalente.

## 7. Nomenclatura y convenciones de nombres

### Nombres de archivo y carpeta

- Usa `kebab-case` para casi todos los archivos y carpetas del proyecto.
- Excepciones normales:
	- carpetas dinámicas de Next: `[id]`, `[...nextauth]`
	- route groups: `(auth)`, `(dashboard)`
	- archivos especiales de framework: `layout.tsx`, `page.tsx`, `route.ts`, `middleware.ts`

### Componentes React

- El archivo suele ir en `kebab-case`: `project-card.tsx`, `editor-header.tsx`, `landing-view.tsx`.
- El símbolo exportado debe ir en `PascalCase`: `ProjectCard`, `EditorHeader`, `LandingView`.
- Los componentes genéricos viven en `components/ui/`; los de dominio viven en la carpeta de feature correspondiente.

### Hooks y stores

- Hooks: `useXxx`.
- Stores Zustand: `useXxxStore`.
- Archivo del store: `xxx-store.ts`.

Ejemplos reales:

- `useEditorStore` en `src/editor-engine/store/editor-store.ts`
- `useChatStore` en `src/editor-engine/store/chat-store.ts`
- `usePluginStore` en `src/editor-engine/store/plugin-store.ts`
- `useUIStore` en `src/editor-engine/store/ui-store.ts`

### Identificadores de dominio

- Código y tipos: preferentemente en inglés (`Project`, `ChatMessage`, `ScreenplayFormat`, `FountainElement`).
- Copy, mensajes de usuario y prompts: en español.
- Enums de Prisma: `UPPER_SNAKE_CASE` en valores y `PascalCase` en el nombre del enum.

### Imports

- Prefiere aliases de `tsconfig.json` dentro de `src/`:
	- `@/*`
	- `@/components/*`
	- `@/lib/*`
	- `@/types/*`
	- `@/editor-engine/*`
- Evita rutas relativas profundas cuando un alias sea viable.
- Excepción importante: algunos tipos de Prisma pueden venir de `prisma/generated/client` debido al output custom del generador.

## 8. Estándares de separación de responsabilidades

### Server Components vs Client Components

- Por defecto, una página o layout debe ser Server Component.
- Usa `"use client"` solo cuando realmente necesites estado local, efectos, eventos del navegador, refs DOM o librerías que dependan del cliente.
- Patrón preferido: página servidor que hace auth y data fetching, luego delega la interacción pesada a un componente cliente.

### Server Actions vs Route Handlers

- Usa server actions para formularios simples y mutaciones acopladas a una vista concreta.
- Usa route handlers para:
	- CRUD consumido vía `fetch`
	- streaming
	- exportación binaria
	- endpoints reutilizables entre clientes
	- integraciones externas o webhooks

### Lógica pura vs UI

- Parser, serialización, exportación y composición de prompts deben vivir en `src/lib/core/`.
- No metas lógica de dominio compleja dentro de componentes React si puede extraerse a `lib/core`.
- `editor-engine/` es para interacción del editor, no para reglas globales del dominio si esas reglas pueden ser puras y reutilizables.

### Acceso a base de datos

- Usa siempre el singleton de `src/lib/prisma.ts`.
- No instancies `new PrismaClient()` fuera de ese archivo.
- Antes de leer o mutar un proyecto protegido, valida ownership.

## 9. Modelo de datos y persistencia

### Entidades principales en Prisma

- `User`
- `Project`
- `Version`
- `ChatMessage`
- `AIGeneration`
- `Subscription`
- `Account`
- `Session`
- `VerificationToken`

### Forma actual del documento

La forma canónica moderna de `Project.content` es:

```ts
type ProjectContentV2 = {
	v: 2
	fountain: string
}
```

Reglas importantes:

- Usa `projectContentToFountainString()` para leer contenido de forma segura.
- Usa `fountainStringToProjectContent()` para persistir texto Fountain.
- Existe compatibilidad legacy con documentos TipTap JSON; no la rompas sin migración explícita.

### Settings del proyecto

- `Project.settings` es JSON flexible.
- El snapshot de modificadores del editor se guarda bajo `settings.modifiers`.
- `plugin-store.ts` es la referencia actual de la forma persistida de modificadores.

## 10. Estado cliente del editor

Los stores del editor tienen responsabilidades separadas. No mezcles estas fronteras sin necesidad clara.

- `useChatStore`: documento Fountain activo, acción pendiente del chat, dirty state del documento y payload de guardado.
- `usePluginStore`: plugins activos, estado de cada plugin, dirty state de modificadores y prompt combinado para IA.
- `useEditorStore`: estadísticas derivadas del Fountain y estado de guardado del editor.
- `useProjectStore`: metadata del proyecto cargado en cliente.
- `useUIStore`: estado de paneles y visibilidad en mobile.

Patrón actual:

- El editor hace autosave del documento a `/api/projects/[id]/content`.
- Los modificadores se guardan por separado mediante `PATCH /api/projects/[id]`.
- Ambos flujos están debounceados en cliente; no conviertas esto en guardado síncrono por keystroke.

## 11. Sistema de plugins cinematográficos

La arquitectura de plugins vive en `src/editor-engine/plugins/`.

### Plugins actuales

- `shots`
- `lighting`
- `camera`
- `effects`
- `description`
- `sound`
- `scenography`
- `events`

### Patrón esperado por plugin

Cada plugin debe seguir este esquema cuando aplique:

```text
src/editor-engine/plugins/<plugin>/
├── index.ts
├── data.ts
└── panel.tsx
```

### Contrato del plugin

Todo plugin implementa `PluginDefinition` y debe aportar:

- `id` estable
- `name`
- `description`
- `icon`
- `category`
- `version`
- `defaultState`
- `PanelComponent`
- `toPromptFragment()`
- opcionalmente `toDocumentMetadata()`

### Reglas de extensión

- Registra nuevos plugins en `src/editor-engine/plugins/all-plugins.ts`.
- Usa IDs cortos, estables y en minúsculas.
- La UI del plugin vive en su `panel.tsx`.
- Los catálogos y presets viven en `data.ts`.
- La traducción del estado del plugin a contexto de IA vive en `toPromptFragment()`.

## 12. Arquitectura de IA

### Principios

- Los secretos de IA son server-only.
- La salida de generación debe respetar Fountain cuando el endpoint esté diseñado para producir guion.
- El contexto técnico del proyecto y de los modificadores debe entrar al prompt desde el backend o desde una capa de orquestación dedicada, nunca armado caóticamente en múltiples componentes.

### Piezas actuales

- `src/lib/core/ai/orchestrator.ts`: prompt orchestration para generación estructurada.
- `src/lib/core/ai/chat-document.ts`: fusión entre salida del asistente y documento activo.
- `src/app/api/ai/generate/route.ts`: streaming textual de generación.
- `src/app/api/projects/[id]/chat/route.ts`: chat multi-turn persistido por proyecto.

### Convenciones semánticas relevantes

El chat del proyecto ya instruye al modelo a producir anotaciones Fountain enriquecidas con prefijos semánticos como:

- `[ESCENOGRAFIA]`
- `[SONIDO]`
- `[MUSICA]`
- `[CAMARA]`
- `[[Duración: ...]]`

Si tocas la capa de IA, preserva la coherencia entre estos prefijos, el parser Fountain y la UI del editor.

## 13. Sistema visual y diseño

### Fuente de verdad visual

- Todo el sistema visual parte de `src/app/globals.css`.
- Tailwind v4 está configurado mediante `@theme` y custom properties, no mediante un `tailwind.config.js` tradicional.

### Reglas visuales

- Usa tokens semánticos existentes antes que colores hardcodeados.
- La paleta actual es cinematográfica: neutros zinc/graphite + acento ámbar/dorado + tokens Fountain específicos.
- El canvas del guion usa `Courier Prime` (`--font-screenplay`) y mantiene apariencia de página impresa.
- UI general usa `Inter` como sans y `JetBrains Mono` para contextos técnicos.
- Respeta light/dark mode vía `next-themes` y variables CSS.

### Distribución visual

- `components/ui/`: primitivas base.
- `components/dashboard/`: widgets del SaaS.
- `components/landing/`: secciones de marketing.
- `editor-engine/components/`: experiencia de edición, paneles, preview, chat, header/footer del editor.

## 14. Estándares de implementación para cambios futuros

### Dónde crear cada cosa

- Nueva ruta o endpoint: `src/app/`.
- Nueva primitive reusable de UI: `src/components/ui/`.
- Nuevo componente del dashboard: `src/components/dashboard/`.
- Nueva sección de landing: `src/components/landing/`.
- Nueva pieza interactiva del editor: `src/editor-engine/components/`.
- Nueva lógica pura de Fountain, exportación o IA: `src/lib/core/`.
- Nuevo helper de auth: `src/lib/auth/`.
- Nuevo helper API server-side: `src/lib/api/`.
- Nuevo tipo compartido: `src/types/`.

### Cómo escribir cambios sin romper el proyecto

- Mantén el monolito; no introduzcas paquetes o workspaces sin una razón fuerte.
- Prefiere extender patrones existentes antes que abrir una arquitectura paralela.
- No dupliques acceso a proyecto; reutiliza el helper de ownership.
- Valida inputs con `zod` en acciones de formulario o entradas estructuradas.
- Mantén respuestas API consistentes: JSON para CRUD, streaming para IA, binario para export.
- No muevas lógica de persistencia al cliente.
- No importes Prisma en componentes cliente.
- No hardcodees rutas cuando ya existe una convención REST en `app/api/projects/[id]/**`.

### Calidad mínima esperada

- TypeScript strict respetado.
- ESLint del proyecto respetado.
- Después de cambios relevantes, ejecutar como mínimo:
	- `npm run lint`
	- `npm run type-check`

## 15. Realidades y vacíos actuales que deben asumirse

- El código real usa Next.js 16.2.3, aunque algunos documentos aún hablan de Next 15.
- El proyecto ya tiene chat persistido por proyecto (`ChatMessage`), aunque varios documentos antiguos no lo reflejan.
- El sistema de plugins real incluye `sound`, `scenography` y `events`; no asumas solo cinco plugins.
- Existe UI y rutas relacionadas con billing, pero la capa `src/lib/stripe/` descrita en specs no está implementada en el árbol actual.
- No existe hoy una carpeta `src/lib/db/queries/`; muchas queries viven inline en route handlers.
- No hay suite de tests implementada aún; `npm test` y `npm run test:e2e` son placeholders.

## 16. Regla final para cualquier LLM

Antes de proponer o escribir cambios, responde internamente estas preguntas:

1. ¿La pieza pertenece a `app`, `components`, `editor-engine`, `lib`, `hooks`, `types` o `prisma`?
2. ¿Es server, client, action, route handler o lógica pura?
3. ¿Existe ya un patrón equivalente en el repo que deba replicarse?
4. ¿Estoy siguiendo el código real o una spec desactualizada?
5. ¿Estoy preservando Fountain, auth, ownership de proyectos y los tokens del sistema visual?

Si la respuesta a cualquiera de estas preguntas es incierta, inspecciona primero el código existente y solo después implementa.
