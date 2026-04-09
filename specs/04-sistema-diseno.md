# 04 — Sistema de Diseño

> **Documento:** Especificación de Design System  
> **Última actualización:** 2026-04-08

---

## 4.1 Filosofía de Diseño

### Principios

| Principio | Descripción |
|:----------|:------------|
| **Cinematográfico** | La estética debe evocar la industria del cine: oscura, elegante, profesional |
| **Enfocado** | El contenido del guión siempre es protagonista; la UI es contextual y no invasiva |
| **Profesional** | Tipografía de industria, espaciado preciso, densidad de información adecuada |
| **Accesible** | WCAG 2.1 AA como mínimo; componentes Radix UI garantizan accesibilidad de base |
| **Adaptable** | Light mode para lectura prolongada, dark mode para la experiencia "screening room" |

### Inspiración Visual
- Interfaces de software de edición de video (DaVinci Resolve, Premiere Pro)
- Terminales de color scheme modernas (Warp, Ghostty)
- Editores de código (VS Code, Zed)
- Plataformas de escritura premium (iA Writer, Notion)

---

## 4.2 Configuración de Tailwind CSS v4

### Archivo Central: `src/app/globals.css`

```css
@import "tailwindcss";

@theme {
  /* ===========================
     COLOR SYSTEM
     =========================== */
  
  /* --- Neutrales (Zinc-based para estética cinematográfica) --- */
  --color-bg-primary: oklch(0.13 0.005 260);    /* Fondo principal dark */
  --color-bg-secondary: oklch(0.17 0.005 260);   /* Fondo secundario */
  --color-bg-tertiary: oklch(0.21 0.008 260);    /* Superficies elevadas */
  --color-bg-canvas: oklch(0.98 0.002 260);      /* Canvas del guión (light) */
  
  --color-text-primary: oklch(0.95 0.005 260);   /* Texto principal dark */
  --color-text-secondary: oklch(0.65 0.01 260);  /* Texto secundario */
  --color-text-muted: oklch(0.45 0.01 260);      /* Texto desactivado */
  
  /* --- Accent (Ámbar/Gold — evoca la era dorada del cine) --- */
  --color-accent: oklch(0.75 0.15 75);           /* Accent principal */
  --color-accent-hover: oklch(0.80 0.16 75);     /* Accent hover */
  --color-accent-muted: oklch(0.35 0.06 75);     /* Accent sutil */
  
  /* --- Semánticos --- */
  --color-success: oklch(0.72 0.17 155);
  --color-warning: oklch(0.80 0.15 75);
  --color-error: oklch(0.65 0.20 25);
  --color-info: oklch(0.70 0.12 240);
  
  /* --- Elementos Fountain (colores para syntax highlighting) --- */
  --color-fountain-scene: oklch(0.70 0.15 155);      /* Scene headings */
  --color-fountain-character: oklch(0.75 0.12 240);   /* Character names */
  --color-fountain-dialogue: oklch(0.85 0.02 260);    /* Dialogue text */
  --color-fountain-action: oklch(0.80 0.01 260);      /* Action lines */
  --color-fountain-parenthetical: oklch(0.60 0.08 300); /* Parentheticals */
  --color-fountain-transition: oklch(0.65 0.10 25);   /* Transitions */
  --color-fountain-note: oklch(0.60 0.12 75);         /* Notes */
  
  /* ===========================
     TYPOGRAPHY
     =========================== */
  
  /* --- Font Families --- */
  --font-sans: "Inter", "SF Pro Display", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --font-screenplay: "Courier Prime", "Courier New", monospace;
  
  /* --- Font Sizes (escala modular 1.25) --- */
  --font-size-xs: 0.64rem;      /* 10.24px */
  --font-size-sm: 0.8rem;       /* 12.8px */
  --font-size-base: 1rem;       /* 16px - UI base */
  --font-size-lg: 1.25rem;      /* 20px */
  --font-size-xl: 1.563rem;     /* 25px */
  --font-size-2xl: 1.953rem;    /* 31.25px */
  --font-size-3xl: 2.441rem;    /* 39px */
  
  /* --- Screenplay-specific (12pt Courier Prime fixed) --- */
  --font-size-screenplay: 12pt;
  --line-height-screenplay: 1;  /* Single-spaced standard */
  
  /* ===========================
     SPACING
     =========================== */
  --spacing-px: 1px;
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  
  /* ===========================
     BORDER RADIUS
     =========================== */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* ===========================
     SHADOWS
     =========================== */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.15);
  --shadow-glow: 0 0 20px oklch(0.75 0.15 75 / 0.15);
  
  /* ===========================
     TRANSITIONS
     =========================== */
  --transition-fast: 100ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* ===========================
     Z-INDEX SCALE
     =========================== */
  --z-base: 0;
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-tooltip: 500;
  --z-toast: 600;
  
  /* ===========================
     BREAKPOINTS
     =========================== */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

---

## 4.3 Tipografía

### Fuentes Requeridas

| Fuente | Uso | Carga |
|:-------|:----|:------|
| **Courier Prime** | Canvas del guión (texto del screenplay) | Google Fonts / self-hosted |
| **Inter** | UI del dashboard, paneles, controles | Google Fonts (variable) |
| **JetBrains Mono** | Código, metadatos técnicos, notas de IA | Google Fonts |

### Reglas Tipográficas del Guión (Fountain Standard)

```
┌─────────────────────────────────────────┐
│  Courier Prime 12pt                      │
│  Márgenes de página: estándar industria  │
│                                          │
│  SCENE HEADING        → Mayúsculas       │
│                          Margen izq: 1.5"│
│                                          │
│  Action               → Normal           │
│                          Margen izq: 1.5"│
│                                          │
│       CHARACTER NAME  → Mayúsculas       │
│                          Margen izq: 3.7"│
│                                          │
│    (parenthetical)    → En paréntesis    │
│                          Margen izq: 3.1"│
│                                          │
│    Dialogue text      → Normal           │
│                          Margen izq: 2.5"│
│                                          │
│                  TRANSITION → Mayúsculas │
│                     Alineado a la derecha│
└─────────────────────────────────────────┘
```

---

## 4.4 Sistema de Temas (Light / Dark)

### Estrategia

Se utilizan **CSS custom properties** con Tailwind v4 para intercambiar temas. El tema se aplica a nivel del `<html>` con un atributo `data-theme`.

### Variables de Tema

| Token | Light Mode | Dark Mode (Default) |
|:------|:-----------|:-------------------|
| `--bg-app` | `oklch(0.97 0.002 260)` | `oklch(0.13 0.005 260)` |
| `--bg-surface` | `oklch(1.00 0 0)` | `oklch(0.17 0.005 260)` |
| `--bg-elevated` | `oklch(0.97 0.003 260)` | `oklch(0.21 0.008 260)` |
| `--text-primary` | `oklch(0.15 0.005 260)` | `oklch(0.95 0.005 260)` |
| `--text-secondary` | `oklch(0.40 0.01 260)` | `oklch(0.65 0.01 260)` |
| `--border` | `oklch(0.85 0.005 260)` | `oklch(0.25 0.008 260)` |

> **Nota:** El canvas del guión **siempre** usa fondo blanco/crema (#FAFAFA) y texto negro para simular una página impresa, independientemente del tema de la UI.

---

## 4.5 Iconografía

| Librería | Uso |
|:---------|:----|
| **Lucide React** | Iconos de la interfaz general (ya incluido por shadcn/ui) |
| **Custom SVGs** | Iconos específicos de cine: cámara, claqueta, rollo de película, luces |

### Reglas de Iconos
- Tamaño estándar: 16px (sm), 20px (md), 24px (lg)
- Stroke width: 1.5px (consistente con Lucide)
- Color: hereda del texto parent por defecto

---

## 4.6 Componentes (Catálogo shadcn/ui)

### Componentes Base (Fase 1)

| Componente | Variantes necesarias | Personalización |
|:-----------|:--------------------|:----------------|
| `Button` | `default`, `secondary`, `ghost`, `destructive`, `accent` | Agregar variante `accent` con color gold |
| `Input` | `default`, `search` | Estilo con borde sutil, focus ring en accent |
| `Dialog` | Estándar | Overlay oscurecido con blur |
| `Sheet` | `left`, `right` | Paneles de plugins con resize handle |

### Componentes del Editor (Fase 2)

| Componente | Variantes necesarias | Personalización |
|:-----------|:--------------------|:----------------|
| `ResizablePanel` | Horizontal split, vertical split | Panel central (editor) + paneles laterales (plugins) |
| `Command` | Con categorías | Paleta de comandos para insertar elementos Fountain y planos |
| `Select` | Con grupos | Para cámaras (agrupadas por marca), lentes (por focal) |
| `Tabs` | `default`, `underline` | Navegación entre plugins en el panel lateral |

### Componentes de Plugins (Fase 4)

| Componente | Modificador | Personalización |
|:-----------|:-----------|:----------------|
| `Command` (Combobox) | Planos Cinematográficos | Buscador con preview de cada plano |
| `ToggleGroup` + `HoverCard` | Luces | Cards con imágenes de ejemplo de cada tipo de luz |
| `Select` (nested) | Cámara / Lente | Agrupación jerárquica con specs técnicas |
| `Switch` + `Badge` | VFX / SFX | Toggles con badges indicando cantidad activa |
| `Slider` | Descripción Compresiva | Rango 1-10 con etiquetas ("Conciso" ↔ "Detallado") |

---

## 4.7 Layout del Editor

### Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  TOOLBAR                                                     │
│  [≡] [File ▾] [Edit ▾] [Insert ▾] [AI ▾]  ⟨search⟩  [⚙️]  │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│  PANEL   │        EDITOR CANVAS             │    PANEL      │
│  IZQUIERDO│                                  │   DERECHO     │
│          │   EXT. DOWNTOWN - NIGHT          │               │
│  Outline │                                  │  [Plugins]    │
│  · Act 1 │   A dark alley stretches         │  ┌─────────┐ │
│    · Sc 1│   before us...                   │  │ Planos  │ │
│    · Sc 2│                                  │  │ Luces   │ │
│  · Act 2 │        DETECTIVE NOIR            │  │ Cámara  │ │
│    · ...  │   (looking around)               │  │ VFX/SFX │ │
│          │   Something doesn't feel          │  │ Desc.   │ │
│          │   right about this place.         │  └─────────┘ │
│          │                                  │               │
│  Resizable│        Resizable                 │   Resizable   │
├──────────┴──────────────────────────────────┴───────────────┤
│  STATUS BAR                                                  │
│  Pg 12 │ Ln 45, Col 23 │ Fountain │ Words: 1,234 │ AI: Ready│
└─────────────────────────────────────────────────────────────┘
```

### Dimensiones por Defecto

| Área | Ancho por defecto | Mínimo | Máximo |
|:-----|:-------------------|:-------|:-------|
| Panel Izquierdo (Outline) | 240px | 180px | 360px |
| Editor Canvas | Flexible (fill) | 600px | — |
| Panel Derecho (Plugins) | 320px | 260px | 480px |
| Toolbar (alto) | 48px | — | — |
| Status Bar (alto) | 28px | — | — |

---

## 4.8 Animaciones y Micro-interacciones

| Elemento | Animación | Duración | Easing |
|:---------|:----------|:---------|:-------|
| Paneles (abrir/cerrar) | Slide + fade | 300ms | `ease-out` |
| Tooltips | Fade in + scale | 150ms | `ease` |
| Botones (hover) | Background color | 100ms | `ease` |
| Botones (click) | Scale down (0.98) | 100ms | `ease` |
| Tema (toggle) | Color transition | 200ms | `ease` |
| IA streaming (texto) | Typewriter fade-in | Per token | `linear` |
| Badge de plugin activo | Pulse glow | 2s loop | `ease-in-out` |
| Panel resize | Smooth drag | Real-time | — |

---

## 4.9 Responsive Breakpoints

| Breakpoint | Comportamiento |
|:-----------|:---------------|
| `≥ 1536px` (2xl) | Layout completo: 3 paneles visibles |
| `≥ 1280px` (xl) | Layout completo: paneles colapsables |
| `≥ 1024px` (lg) | Panel izquierdo oculto por defecto, panel derecho colapsable |
| `≥ 768px` (md) | Solo editor canvas + toolbar, plugins en Sheet (overlay) |
| `< 768px` (sm) | Modo lectura/review. Edición básica. Plugins no disponibles |
