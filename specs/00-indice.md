# 📋 Índice Maestro de Especificaciones

> **Proyecto:** Editor de Guiones Cinematográficos con IA  
> **Versión:** 2.0.0  
> **Fecha:** 2026-04-08  
> **Estado:** Especificación Técnica (Pre-desarrollo)

---

## Documentos de Especificación

| #  | Documento | Descripción | Estado |
|:---|:----------|:------------|:-------|
| 01 | [Visión General](./01-vision-general.md) | Objetivos del producto, público objetivo, propuesta de valor y alcance funcional | 📄 Definido |
| 02 | [Arquitectura de la Aplicación](./02-arquitectura.md) | Estructura Next.js monolítica (single app), organización interna y convenciones | 📄 Definido |
| 03 | [Stack Tecnológico](./03-stack-tecnologico.md) | Tecnologías seleccionadas (Next.js fullstack, OpenRouter), versiones y compatibilidad | 📄 Definido |
| 04 | [Sistema de Diseño](./04-sistema-diseno.md) | Design system unificado con Tailwind CSS v4, shadcn/ui, tipografía y tokens | 📄 Definido |
| 05 | [Editor Engine (Core)](./05-editor-engine.md) | Motor del editor (React Client Components): TipTap, parser Fountain, canvas | 📄 Definido |
| 06 | [Sistema de Plugins](./06-sistema-plugins.md) | Arquitectura de modificadores/plugins, interfaz de cada uno y extensibilidad | 📄 Definido |
| 07 | [Integración de IA](./07-integracion-ia.md) | Pipeline de IA vía OpenRouter, orquestación de prompts y streaming SSE | 📄 Definido |
| 08 | [Dashboard SaaS](./08-dashboard-saas.md) | App Next.js: autenticación, gestión de proyectos, colaboración y billing | 📄 Definido |
| 09 | [Exportación](./09-exportacion.md) | Generación de PDF y FDX, tipografía estándar de la industria, formatos | 📄 Definido |
| 10 | [Estado y Modelo de Datos](./10-estado-datos.md) | Gestión de estado (Zustand), esquema de base de datos, API contracts | 📄 Definido |
| 11 | [Plan de Desarrollo](./11-plan-desarrollo.md) | Roadmap por fases, sprints, hitos y criterios de aceptación | 📄 Definido |

---

## Convenciones de Lectura

- **`src/app/`** → App Router de Next.js (páginas, layouts, API routes)
- **`src/components/`** → Componentes React reutilizables (shadcn/ui + custom)
- **`src/lib/`** → Lógica de negocio, utilidades server/client, configuración
- **`src/editor-engine/`** → Motor del editor: TipTap, plugins, stores del editor
- **`src/types/`** → Tipos TypeScript compartidos

## Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────┐
│              NEXT.JS 15 (Monolito Unificado)         │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  src/                                        │   │
│  │                                              │   │
│  │  [Frontend]                  [Backend]       │   │
│  │  ├─ app/(dashboard)          ├─ app/api/     │   │
│  │  ├─ app/editor/              ├─ lib/db/      │   │
│  │  ├─ components/ (shadcn)     ├─ lib/auth/    │   │
│  │  └─ editor-engine/           └─ lib/ai/      │   │
│  │                                              │   │
│  │  [Shared]                                    │   │
│  │  ├─ lib/core/ (Fountain parser, export)      │   │
│  │  ├─ types/ (TypeScript interfaces)           │   │
│  │  └─ styles/ (Tailwind v4 theme)              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  package.json  next.config.ts  tailwind theme.css   │
└─────────────────────────────────────────────────────┘
```
