# 11 — Plan de Desarrollo

> **Documento:** Roadmap y Plan de Fases  
> **Última actualización:** 2026-04-08

---

## 11.1 Resumen de Fases

| Fase | Nombre | Duración | Semanas |
|:-----|:-------|:---------|:--------|
| 1 | Arquitectura Base y UI Foundation | 2 semanas | 1-2 |
| 2 | Core Engine del Editor | 2 semanas | 3-4 |
| 3 | Integración de IA y Pipeline | 2 semanas | 5-6 |
| 4 | Desarrollo de Plugins y UI Reactiva | 3 semanas | 7-9 |
| 5 | Exportación, Billing y Polish | 3 semanas | 10-12 |

**Total estimado: 12 semanas (3 meses)**

---

## 11.2 Fase 1: Arquitectura Base y UI Foundation (Semanas 1-2)

### Objetivos
- Proyecto Next.js funcional con build exitoso
- Design system implementado en `src/app/globals.css`
- Componentes base de shadcn/ui disponibles
- Esqueleto del dashboard y editor corriendo

### Tareas

| # | Tarea | Estimación | Dependencia |
|:--|:------|:-----------|:------------|
| 1.1 | Inicializar proyecto Next.js 15 con App Router (`npx create-next-app@latest`) | 1h | — |
| 1.2 | Configurar Tailwind CSS v4 con tema en `globals.css` | 2h | 1.1 |
| 1.3 | Crear directorio `src/types/` con tipos base (Fountain, Project, AI, Plugins) | 3h | 1.1 |
| 1.4 | Inicializar shadcn/ui (`npx shadcn@latest init`) | 1h | 1.2 |
| 1.5 | Instalar componentes shadcn base (Button, Input, Dialog, Sheet, etc.) | 2h | 1.4 |
| 1.6 | Configurar ESLint y tooling de código | 2h | 1.1 |
| 1.7 | Setup Prisma + PostgreSQL (`prisma/schema.prisma`) | 3h | 1.1 |
| 1.8 | Auth (NextAuth.js v5) en `src/lib/auth/` | 6h | 1.7 |
| 1.9 | Crear esqueleto Dashboard — layouts y páginas (Server Components) | 4h | 1.5, 1.8 |
| 1.10 | Crear layout del Editor — 3 paneles resizables (Client Components) | 4h | 1.5 |
| 1.11 | Crear estructura `src/lib/core/` (fountain, ai, export — stubs) | 2h | 1.3 |
| 1.12 | Crear estructura `src/editor-engine/` (core, plugins, store — stubs) | 2h | 1.3 |

### Criterios de Aceptación
- [ ] `npm run dev` levanta la app Next.js completa
- [ ] Componentes de `src/components/ui/` se importan con `@/components/ui/`
- [ ] Theme de Tailwind v4 aplica consistentemente
- [ ] Auth funciona (login/logout con Google)
- [ ] Layout del editor muestra 3 paneles resizables
- [ ] DB conectada y migraciones aplicadas

---

## 11.3 Fase 2: Core Engine del Editor (Semanas 3-4)

### Objetivos
- Editor TipTap funcional con esquema Fountain
- Parser Fountain en tiempo real
- Canvas con tipografía de industria
- Histórico undo/redo

### Tareas

| # | Tarea | Estimación | Dependencia |
|:--|:------|:-----------|:------------|
| 2.1 | Instalar y configurar TipTap en `src/editor-engine/core/` | 3h | 1.10 |
| 2.2 | Definir esquema ProseMirror con nodos Fountain (`schema.ts`) | 8h | 2.1 |
| 2.3 | Implementar parser/tokenizer Fountain en `src/lib/core/fountain/` | 12h | 1.3 |
| 2.4 | Crear FountainExtension para TipTap (input rules) | 10h | 2.2, 2.3 |
| 2.5 | Implementar NodeViews para renderizado visual Fountain | 8h | 2.4 |
| 2.6 | Cargar Courier Prime, aplicar tipografía de canvas | 3h | 2.5 |
| 2.7 | Implementar keyboard shortcuts del editor | 4h | 2.4 |
| 2.8 | Implementar outline/navigator (panel izquierdo) | 4h | 2.4 |
| 2.9 | Implementar search & replace | 4h | 2.1 |
| 2.10 | Implementar auto-save (IndexedDB + API) | 5h | 2.1, 1.9 |
| 2.11 | Implementar status bar | 3h | 2.4 |
| 2.12 | Tests unitarios del parser Fountain | 6h | 2.3 |

### Criterios de Aceptación
- [ ] Se puede escribir un guión completo en formato Fountain
- [ ] El parser detecta correctamente todos los elementos Fountain
- [ ] El formateo visual coincide con los estándares de la industria
- [ ] Ctrl+Z/Ctrl+Y funcionan correctamente
- [ ] El outline refleja la estructura del documento en tiempo real
- [ ] Auto-save funciona local y cloud
- [ ] Performance: < 16ms por keystroke en doc de 120 páginas

---

## 11.4 Fase 3: Integración de IA y Pipeline (Semanas 5-6)

### Objetivos
- Pipeline de IA end-to-end funcional
- Streaming de texto en el editor
- Al menos 2 modos (generate, refine)

### Tareas

| # | Tarea | Estimación | Dependencia |
|:--|:------|:-----------|:------------|
| 3.1 | Implementar PromptOrchestrator en `src/lib/core/ai/` | 6h | 2.3 |
| 3.2 | Crear API route para IA apuntando a OpenRouter (`app/api/ai/`) | 6h | 1.1 |
| 3.3 | Implementar streaming SSE en el endpoint | 4h | 3.2 |
| 3.4 | Crear StreamHandler en el editor (client) | 6h | 3.3, 2.1 |
| 3.5 | Implementar modo "Generate" (nueva escena) | 5h | 3.4 |
| 3.6 | Implementar modo "Refine" (texto seleccionado) | 4h | 3.4 |
| 3.7 | Implementar modo "Continue" | 3h | 3.4 |
| 3.8 | Implementar modo "Rewrite" | 3h | 3.4 |
| 3.9 | UI de controles de IA (panel/toolbar) | 4h | 3.5 |
| 3.10 | Indicadores visuales de streaming (typewriter) | 3h | 3.4 |
| 3.11 | Accept/Reject/Regenerate UI | 3h | 3.5 |
| 3.12 | Setup rate limiting (Upstash Redis) | 3h | 3.2 |
| 3.13 | Guardar historial de generaciones en DB | 3h | 3.2, 1.9 |
| 3.14 | Tests de integración del pipeline | 4h | 3.5 |

### Criterios de Aceptación
- [ ] El usuario puede generar una escena con IA y verla aparecer en streaming
- [ ] Los 4 modos (generate, refine, continue, rewrite) funcionan
- [ ] El texto generado es Fountain válido
- [ ] Rate limiting funciona según el plan del usuario
- [ ] El historial de generaciones se persiste

---

## 11.5 Fase 4: Desarrollo de Plugins y UI Reactiva (Semanas 7-9)

### Objetivos
- Los 5 plugins core implementados y funcionales
- Los modificadores se integran con el prompt de IA
- UI pulida y responsiva

### Tareas

| # | Tarea | Estimación | Dependencia |
|:--|:------|:-----------|:------------|
| 4.1 | Implementar PluginRegistry y PluginStore (Zustand) en `src/editor-engine/` | 4h | 2.1 |
| 4.2 | Instalar componentes shadcn adicionales: Select, Command, Slider, Switch, ToggleGroup, HoverCard, Badge | 3h | 1.5 |
| 4.3 | Plugin: Planos Cinematográficos en `src/editor-engine/plugins/shots/` | 8h | 4.1, 4.2 |
| 4.4 | Plugin: Luces en `src/editor-engine/plugins/lighting/` | 6h | 4.1, 4.2 |
| 4.5 | Plugin: Cámara/Lente en `src/editor-engine/plugins/camera/` | 8h | 4.1, 4.2 |
| 4.6 | Plugin: VFX/SFX en `src/editor-engine/plugins/effects/` | 6h | 4.1, 4.2 |
| 4.7 | Plugin: Descripción Compresiva en `src/editor-engine/plugins/description/` | 4h | 4.1, 4.2 |
| 4.8 | Panel derecho: tabs de plugins con Sheet | 5h | 4.3-4.7 |
| 4.9 | Integrar toPromptFragment() en PromptOrchestrator | 4h | 4.3-4.7, 3.1 |
| 4.10 | Auto-detección de personajes | 4h | 2.3 |
| 4.11 | UI de gestión de personajes | 4h | 4.10 |
| 4.12 | Responsive: Sheet overlay para plugins en tablet | 3h | 4.8 |
| 4.13 | Tests de plugins | 4h | 4.3-4.7 |

### Criterios de Aceptación
- [ ] Los 5 plugins funcionan visualmente y su estado se refleja en Zustand
- [ ] Al generar con IA, los modificadores activos se reflejan en el output
- [ ] La paleta de planos (Cmd+K) funciona con búsqueda fuzzy
- [ ] Los plugins se pueden activar/desactivar individualmente
- [ ] El layout es funcional en viewport ≥ 1024px

---

## 11.6 Fase 5: Exportación, Billing y Polish (Semanas 10-12)

### Objetivos
- Exportación PDF y FDX funcional
- Billing con Stripe integrado
- Pulido general de UX
- Deploy a producción

### Tareas

| # | Tarea | Estimación | Dependencia |
|:--|:------|:-----------|:------------|
| 5.1 | Implementar generador PDF en `src/lib/core/export/pdf-generator.ts` | 10h | 2.3 |
| 5.2 | Implementar reglas de paginación del PDF | 6h | 5.1 |
| 5.3 | Implementar página de título en PDF | 3h | 5.1 |
| 5.4 | API route: POST `/api/projects/[id]/export` (PDF) | 3h | 5.1 |
| 5.5 | Implementar generador FDX en `src/lib/core/export/fdx-generator.ts` | 6h | 2.3 |
| 5.6 | API route: POST `/api/projects/[id]/export` (FDX) | 2h | 5.5 |
| 5.7 | Implementar importación de .fountain | 3h | 2.3 |
| 5.8 | Implementar importación de .fdx | 4h | 5.5 |
| 5.9 | Setup Stripe: productos, precios, checkout | 4h | 1.1 |
| 5.10 | Implementar webhooks de Stripe (`app/api/webhooks/stripe/`) | 4h | 5.9 |
| 5.11 | UI de billing: plan actual, upgrade, portal | 4h | 5.9 |
| 5.12 | Dashboard home: stats, recientes, accesos rápidos | 4h | 1.9 |
| 5.13 | Historial de IA page | 3h | 3.13 |
| 5.14 | Templates de guión (3 iniciales) | 3h | 2.3 |
| 5.15 | Landing page completa | 6h | 1.4 |
| 5.16 | Polish: animaciones, transiciones, micro-interactions | 6h | Todo |
| 5.17 | Testing E2E con Playwright | 8h | Todo |
| 5.18 | Setup Vercel deploy | 3h | Todo |
| 5.19 | Monitoreo: Sentry + Vercel Analytics | 2h | 5.18 |

### Criterios de Aceptación
- [ ] PDF exportado cumple 100% con estándares de formato
- [ ] FDX se abre correctamente en Final Draft
- [ ] Se pueden importar archivos .fountain y .fdx
- [ ] Billing funciona end-to-end (free → pro upgrade)
- [ ] La landing page comunica la propuesta de valor
- [ ] Deploy exitoso en Vercel con custom domain
- [ ] Tests E2E pasan (flujos críticos: auth, crear proyecto, editar, generar, exportar)

---

## 11.7 Hitos (Milestones)

| Hito | Semana | Entregable |
|:-----|:-------|:-----------|
| **M1: Foundation** | 2 | Next.js app + auth + design system + layout base |
| **M2: Editor MVP** | 4 | Editor Fountain funcional con auto-save |
| **M3: AI MVP** | 6 | Generación de escenas con IA en streaming |
| **M4: Full Feature** | 9 | 5 plugins + IA con modificadores integrados |
| **M5: Launch Ready** | 12 | Exportación + billing + deploy producción |

---

## 11.8 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|:-------|:-------------|:--------|:-----------|
| Complejidad del parser Fountain | Alta | Alto | Usar librería open-source como base, adaptar |
| Performance del editor con docs grandes | Media | Alto | Parsing incremental, virtualización de nodos |
| Costos de API de IA | Alta | Medio | Rate limiting estricto, caching de respuestas similares |
| Compatibilidad Tailwind v4 | Media | Medio | Tener fallback a v3 si v4 tiene bugs bloqueantes |
| Complejidad del formato FDX | Media | Bajo | Priorizar PDF, FDX como best-effort |
| Scope creep en plugins | Alta | Medio | Strict MVP: solo 5 plugins en v1 |

---

## 11.9 Definición de "Done" (DoD)

Cada tarea se considera completada cuando:

1. ✅ El código pasa lint + type-check
2. ✅ Tests unitarios escritos y pasando (cobertura > 70% para core)
3. ✅ Funciona en Chrome y Firefox
4. ✅ Responsive (mínimo 1024px para editor)
5. ✅ Accesibilidad: navegable con teclado, labels ARIA
6. ✅ Code review aprobado (si hay equipo)
7. ✅ Documentación actualizada si cambia API/schema
