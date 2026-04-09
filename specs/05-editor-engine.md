# 05 — Editor Engine (Core)

> **Documento:** Especificación del Motor del Editor  
> **Última actualización:** 2026-04-08

---

## 5.1 Resumen

El **Editor Engine** es el corazón de la aplicación. Es un conjunto de **Client Components en Next.js** (React 19) ubicados en `src/editor-engine/` que aloja el editor de texto interactivo basado en **TipTap/ProseMirror**, integra el parser Fountain en tiempo real, gestiona los plugins de dirección cinematográfica, y recibe flujos de IA vía streaming.

---

## 5.2 Arquitectura del Editor

```
┌──────────────────────────────────────────────────────┐
│       Next.js (app/editor) - Client UI Layer           │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │                  TipTap Instance                 │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │            ProseMirror Core                │  │  │
│  │  │  ┌─────────┐ ┌──────────┐ ┌────────────┐ │  │  │
│  │  │  │ Schema  │ │  State   │ │   View     │ │  │  │
│  │  │  │ (nodes) │ │ (doc +   │ │ (DOM ↔     │ │  │  │
│  │  │  │         │ │ selection│ │  state)    │ │  │  │
│  │  │  └─────────┘ │ + trx)   │ └────────────┘ │  │  │
│  │  │              └──────────┘                  │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  │                       │                          │  │
│  │  ┌────────────────────┼────────────────────────┐│  │
│  │  │            Extensions Layer                  ││  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ││  │
│  │  │  │ Fountain │ │ AI       │ │ Metadata    │ ││  │
│  │  │  │ Extension│ │ Inline   │ │ Extension   │ ││  │
│  │  │  └──────────┘ └──────────┘ └─────────────┘ ││  │
│  │  └─────────────────────────────────────────────┘│  │
│  └─────────────────────────────────────────────────┘  │
│                         │                              │
│  ┌──────────────────────┼───────────────────────────┐ │
│  │              Zustand Stores                       │ │
│  │  EditorStore  PluginStore  AIStore  ProjectStore  │ │
│  └───────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## 5.3 Esquema ProseMirror (Schema)

El esquema de tipos (en `src/editor-engine/core/schema.ts`) es el estándar usado para escribir formato fílmico, mapeando entidades como `sceneHeading`, `action`, `character`, `dialogue`, y `parenthetical`. Se añade el uso de marcas (`metadata` y estilos de fuente) que no alteran el formato impreso.

---

## 5.4 Parser Fountain Incremental

Para integrarse de manera limpia y sin cuello de botella al thread renderizador de Next.js/React, el tokenizer y parser (en `src/lib/core/fountain/`) aplican actualizaciones puntuales (diffing) por bloque:

```
Input Text ──► Tokenizer ──► AST Builder ──► ProseMirror Trx ──► View
                  (Incremental Update 16ms max)
```

### Reglas de Tokenización

1. **Scene Heading**: Comienza con `INT.`, `EXT.`, etc.
2. **Character / Dialogue**: MAYÚSCULAS para Character seguido estrictamente por texto `Dialogue` o parenthetical.
3. El módulo en `src/lib/core/fountain/` funciona de manera independiente para que tanto el Front como el Back (generador PDF) utilicen exactamente el mismo árbol AST generado.

---

## 5.5 Extensión TipTap: Fountain

Se montan atajos (`Cmd/Ctrl+D` para Character, `Cmd/Ctrl+G` para trigger IA), input rules regex automáticos para agilizar escritura, y el pintado visual en pantalla (Node Views) asegurando el look "Courier" con los márgenes oficiales fijados por The Academy.

---

## 5.6 Canvas y Auto-Guardado

- **Scroll & Zoom:** Centrado inmersivo de la escritura con medidas de `8.5"x11"`.
- **Auto-Guardado:** IndexedDB gestiona commits offline a los 2 segundos, y una vez cada 30 segundos se sincroniza globalmente mediante Server Actions o un request silencioso a `/api/projects/[id]/content`.
