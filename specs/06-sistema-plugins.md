# 06 — Sistema de Plugins / Modificadores

> **Documento:** Especificación del Sistema de Plugins  
> **Última actualización:** 2026-04-08

---

## 6.1 Concepto

Los **plugins** (también llamados **modificadores**) son módulos independientes que permiten al usuario inyectar **metadatos cinematográficos** en el flujo de escritura. Estos metadatos se recopilan automáticamente y se envían al motor de IA como contexto técnico para generar o refinar escenas.

### Flujo de Datos

```
┌──────────────────────────────────────────────────────┐
│                PANEL DE PLUGINS (UI)                  │
│                                                       │
│  ┌──────────┐ ┌──────┐ ┌────────┐ ┌───────┐ ┌─────┐│
│  │ Planos   │ │Luces │ │Cámara/ │ │VFX/   │ │Desc.││
│  │Cinemat.  │ │      │ │Lente   │ │SFX    │ │Comp.││
│  └────┬─────┘ └──┬───┘ └───┬────┘ └───┬───┘ └──┬──┘│
│       │          │         │          │         │    │
│       └──────────┴─────────┴──────────┴─────────┘    │
│                          │                            │
│                    PluginStore                         │
│                    (Zustand)                           │
│                          │                            │
│              ┌───────────┴──────────┐                 │
│              │  PromptOrchestrator  │                 │
│              │  (JSON estructurado) │                 │
│              └───────────┬──────────┘                 │
│                          │                            │
│                     API de IA                         │
│                    (Streaming)                        │
└──────────────────────────────────────────────────────┘
```

---

## 6.2 Arquitectura de Plugins

### 6.2.1 Interfaz Base

Cada plugin implementa la siguiente interfaz TypeScript:

```typescript
interface PluginDefinition {
  /** Identificador único del plugin */
  id: string;
  
  /** Nombre visible en la UI */
  name: string;
  
  /** Descripción corta */
  description: string;
  
  /** Icono (nombre de Lucide icon) */
  icon: string;
  
  /** Categoría para agrupación */
  category: 'cinematography' | 'audio' | 'visual' | 'narrative';
  
  /** Versión del plugin */
  version: string;
  
  /** Estado por defecto de los valores */
  defaultState: PluginState;
  
  /** Esquema de validación de los valores */
  schema: PluginSchema;
  
  /** Componente React del panel de configuración */
  PanelComponent: React.ComponentType<PluginPanelProps>;
  
  /** Función que genera el fragmento de prompt para la IA */
  toPromptFragment(state: PluginState): string;
  
  /** Función que genera metadata para inyectar en el documento */
  toDocumentMetadata(state: PluginState): DocumentMetadata;
}
```

### 6.2.2 Registro de Plugins

```typescript
// plugins/registry.ts
class PluginRegistry {
  private plugins: Map<string, PluginDefinition> = new Map();
  
  /** Registrar un plugin */
  register(plugin: PluginDefinition): void;
  
  /** Obtener plugin por ID */
  get(id: string): PluginDefinition | undefined;
  
  /** Obtener todos los plugins registrados */
  getAll(): PluginDefinition[];
  
  /** Obtener plugins por categoría */
  getByCategory(category: string): PluginDefinition[];
  
  /** Generar prompt combinado de todos los plugins activos */
  buildCombinedPrompt(states: Record<string, PluginState>): string;
}
```

### 6.2.3 Estado de Plugins (Zustand Store)

```typescript
interface PluginStoreState {
  /** Estados actuales de cada plugin */
  states: Record<string, PluginState>;
  
  /** Qué plugins están activos/habilitados */
  activePlugins: Set<string>;
  
  /** Actualizar estado de un plugin */
  updatePluginState: (pluginId: string, partial: Partial<PluginState>) => void;
  
  /** Activar/desactivar plugin */
  togglePlugin: (pluginId: string) => void;
  
  /** Resetear plugin a valores por defecto */
  resetPlugin: (pluginId: string) => void;
  
  /** Obtener JSON combinado para la IA */
  getAIContext: () => AIPluginContext;
}
```

---

## 6.3 Plugin: Planos Cinematográficos

### Información General

| Campo | Valor |
|:------|:------|
| **ID** | `shots` |
| **Nombre** | Planos Cinematográficos |
| **Icono** | `Video` (Lucide) |
| **Componente UI** | `Command` (Combobox) con categorías |
| **Categoría** | `cinematography` |

### Catálogo de Planos

| Categoría | Planos | Código |
|:----------|:-------|:-------|
| **Planos por tamaño** | Extreme Long Shot (ELS) | `ELS` |
| | Long Shot / Wide Shot (LS/WS) | `LS` |
| | Full Shot (FS) | `FS` |
| | Medium Long Shot / Cowboy Shot (MLS) | `MLS` |
| | Medium Shot (MS) | `MS` |
| | Medium Close-Up (MCU) | `MCU` |
| | Close-Up (CU) | `CU` |
| | Extreme Close-Up (ECU) | `ECU` |
| | Insert Shot | `INSERT` |
| **Planos por ángulo** | Eye Level | `EYE` |
| | Low Angle | `LOW` |
| | High Angle | `HIGH` |
| | Bird's Eye / Top Down | `BIRD` |
| | Worm's Eye | `WORM` |
| | Dutch Angle / Canted | `DUTCH` |
| | Over-the-Shoulder (OTS) | `OTS` |
| | Point of View (POV) | `POV` |
| **Planos por movimiento** | Static (Tripod) | `STATIC` |
| | Pan (Left/Right) | `PAN` |
| | Tilt (Up/Down) | `TILT` |
| | Dolly / Tracking | `DOLLY` |
| | Crane / Jib | `CRANE` |
| | Steadicam / Gimbal | `STEADICAM` |
| | Handheld | `HANDHELD` |
| | Zoom (In/Out) | `ZOOM` |
| | Whip Pan | `WHIP` |
| | Rack Focus | `RACK` |
| | Pull Focus | `PULL_FOCUS` |

### Interacción UI

1. El usuario abre el combobox con `Cmd+K` o haciendo clic en el panel
2. Teclea para filtrar planos (fuzzy search)
3. Los planos se muestran agrupados por categoría
4. Al seleccionar, se muestra una **HoverCard** con:
   - Nombre completo del plano
   - Descripción técnica breve
   - Ejemplo visual (imagen/referencia de película)
   - Efecto emocional/narrativo típico
5. El plano seleccionado se agrega al **estado del plugin** y se marca visualmente en el panel
6. Se pueden seleccionar **múltiples planos** para una misma escena

### Salida para IA (Prompt Fragment)

```
[CINEMATOGRAPHY]
Shot Sizes: Medium Close-Up (MCU), transitioning to Close-Up (CU)
Camera Angle: Low angle, creating a sense of power
Camera Movement: Slow dolly-in, building tension
```

---

## 6.4 Plugin: Luces

### Información General

| Campo | Valor |
|:------|:------|
| **ID** | `lighting` |
| **Nombre** | Iluminación |
| **Icono** | `Sun` (Lucide) |
| **Componente UI** | `ToggleGroup` + `HoverCard` |
| **Categoría** | `visual` |

### Opciones de Iluminación

| Categoría | Opciones |
|:----------|:---------|
| **Clave de luz** | High-Key, Low-Key, Natural, Mixed |
| **Dirección** | Frontal, Lateral, Contraluz (Backlight), Cenital (Top), Práctica (Motivated) |
| **Calidad** | Dura (Hard), Suave (Soft), Difusa |
| **Color/Temperatura** | Cálida (Tungsten ≈3200K), Neutra (≈4500K), Fría (Daylight ≈5600K), Estilizada (neón, específica) |
| **Esquema** | Three-Point Lighting, Rembrandt, Butterfly/Paramount, Split, Silhouette, Chiaroscuro |
| **Intensidad** | Slider 1-10 (Oscuro → Brillante) |

### Interacción UI

1. **ToggleGroup** para seleccionar la clave de luz (High-Key / Low-Key / etc.)
2. **HoverCard** en cada opción mostrando ejemplo visual de referencia cinematográfica
3. Selectores adicionales para dirección, calidad y temperatura
4. Slider para la intensidad general
5. Preview textual del setup de luz seleccionado

### Salida para IA

```
[LIGHTING]
Key: Low-key lighting
Direction: Strong side-lighting from the left
Quality: Hard light with sharp shadows
Temperature: Cool daylight (5600K) with warm practicals in bg
Scheme: Chiaroscuro — dramatic contrast between light and shadow
Intensity: 3/10 — predominantly dark with selective illumination
```

---

## 6.5 Plugin: Tipo de Cámara / Lente

### Información General

| Campo | Valor |
|:------|:------|
| **ID** | `camera` |
| **Nombre** | Cámara y Lente |
| **Icono** | `Camera` (Lucide) |
| **Componente UI** | `Select` con categorías anidadas |
| **Categoría** | `cinematography` |

### Catálogo de Cámaras

| Marca | Modelos |
|:------|:--------|
| **ARRI** | ALEXA 35, ALEXA Mini LF, ALEXA Mini, AMIRA |
| **RED** | V-RAPTOR [X], DSMC3, KOMODO-X, KOMODO |
| **Sony** | VENICE 2, FX9, FX6, FX3 |
| **Canon** | EOS C500 Mark II, EOS C300 Mark III, EOS C70 |
| **Blackmagic** | URSA Mini Pro 12K, URSA Mini Pro G2, Pocket 6K Pro |
| **Panavision** | Millennium DXL2, Genesis |

### Catálogo de Lentes

| Categoría | Opciones |
|:----------|:---------|
| **Gran Angular** | 14mm, 18mm, 21mm, 24mm, 28mm |
| **Normal** | 35mm, 40mm, 50mm |
| **Telefoto** | 85mm, 100mm, 135mm, 200mm |
| **Zoom** | 24-70mm, 70-200mm, 28-300mm |
| **Especial** | Anamórfico (2x squeeze), Macro, Tilt-Shift, Probe/Snorkel |

### Características adicionales

| Parámetro | Opciones |
|:----------|:---------|
| **Apertura (f-stop)** | f/1.4, f/2, f/2.8, f/4, f/5.6, f/8, f/11, f/16 |
| **Profundidad de campo** | Shallow (bokeh), Medium, Deep (todo en foco) |
| **Formato de sensor** | Super 35, Full Frame, Large Format, IMAX |
| **Frame rate** | 24fps (cine), 30fps, 48fps, 60fps, 120fps (slow-mo), 240fps+ |
| **Aspect ratio** | 1.85:1 (Flat), 2.39:1 (Scope/Anamorphic), 1.33:1 (Academy), 16:9 |

### Interacción UI

1. Dos `Select` agrupados: uno para cámara, otro para lente
2. Cada `Select` tiene categorías anidadas (marca → modelos)
3. Al seleccionar lente, automáticamente sugiere apertura y DoF típicos
4. Sliders o selects adicionales para frame rate y aspect ratio
5. Badge informativo con el "look" resultante

### Salida para IA

```
[CAMERA & LENS]
Camera: ARRI ALEXA Mini LF
Lens: 50mm Cooke S7/i Full Frame — f/2 aperture
Depth of Field: Shallow — subject sharply focused, background melts into creamy bokeh
Sensor: Large Format
Frame Rate: 24fps — standard cinematic motion
Aspect Ratio: 2.39:1 (Anamorphic widescreen)
Look: Intimate, cinematic, organic skin tones
```

---

## 6.6 Plugin: VFX / SFX

### Información General

| Campo | Valor |
|:------|:------|
| **ID** | `effects` |
| **Nombre** | Efectos Visuales y Sonoros |
| **Icono** | `Sparkles` (Lucide) |
| **Componente UI** | `Switch` + `Badge` |
| **Categoría** | `visual` / `audio` |

### Categorías VFX

| Subcategoría | Efectos |
|:-------------|:--------|
| **Ambientales** | Lluvia, nieve, niebla, polvo, humo, fuego, rayos |
| **Digitales** | CGI elements, pantalla verde, compositing, matte painting |
| **Cámara (en post)** | Slow-motion (ramping), speed ramp, time-lapse, freeze frame |
| **Color** | Color grading específico, LUT reference, desaturación, bleach bypass |
| **Transiciones VFX** | Morphing, wipe, match cut, invisible cut |

### Categorías SFX (Sonido)

| Subcategoría | Efectos |
|:-------------|:--------|
| **Ambientación** | Room tone, naturaleza, ciudad, industrial, underwater |
| **Foley** | Pasos, ropa, objetos, acciones físicas |
| **Diseño sonoro** | Stingers, risers, drones, whooshes, impacts |
| **Musical** | Score reference (tono/género), temp track style, silencio dramático |
| **Diálogo** | Eco, reverb, internal monologue, radio filter, phone filter |

### Interacción UI

1. **Switches** (toggles) para activar/desactivar categorías de efectos
2. Al activar, aparecen opciones específicas dentro de la categoría
3. **Badges** junto a los switches indicando cuántos efectos están activos
4. Campo de texto libre para notas de VFX/SFX personalizadas
5. Toggle global "Incluir notas de efectos en prompt de IA"

### Salida para IA

```
[VISUAL EFFECTS]
- Atmospheric: Heavy rain with volumetric fog rolling through the scene
- Camera FX: Subtle speed ramp (0.7x) on the character's reaction
- Color: Desaturated palette, teal & orange color grading

[SOUND DESIGN]
- Ambience: Distant thunder, rain on tin roofs, muffled city traffic
- Foley: Heavy boots on wet concrete, leather jacket rustling
- Score: Low, pulsing synthesizer drone building tension — Vangelis/Blade Runner reference
- Dialogue: Slight room reverb, suggesting large empty space
```

---

## 6.7 Plugin: Descripción Compresiva

### Información General

| Campo | Valor |
|:------|:------|
| **ID** | `description` |
| **Nombre** | Profundidad Narrativa |
| **Icono** | `Type` (Lucide) |
| **Componente UI** | `Slider` (1-10) |
| **Categoría** | `narrative` |

### Escala de Profundidad

| Nivel | Etiqueta | Comportamiento de IA |
|:------|:---------|:--------------------|
| 1-2 | **Conciso** | Solo acciones esenciales. Sin adjetivos. Estilo Hemingway. ~2-3 líneas por escena. |
| 3-4 | **Funcional** | Acciones claras con contexto mínimo. Economía de palabras. ~4-5 líneas. |
| 5-6 | **Balanceado** | Descripción completa con detalles de ambiente. Estilo estándar de guión. ~6-8 líneas. |
| 7-8 | **Descriptivo** | Ambiente detallado, estados emocionales del personaje, subtexto visual. ~10-12 líneas. |
| 9-10 | **Inmersivo** | Prosa cinematográfica completa. Psicología de personaje, simbolismo visual, atmósfera sensorial. ~15+ líneas. |

### Parámetros Adicionales

| Parámetro | Tipo | Opciones |
|:----------|:-----|:---------|
| **Tono** | Select | Neutro, Tenso, Melancólico, Esperanzador, Irónico, Onírico, Visceral |
| **Perspectiva** | Select | Objetiva (cámara), Subjetiva (personaje), Omnisciente |
| **Estilo** | Select | Clásico, Noir, Poético, Documental, Tarantino-esque, Terrence Malick |

### Interacción UI

1. **Slider** grande y prominente con labels en los extremos ("Conciso" — "Inmersivo")
2. Al arrastrar, se muestra un **preview** en texto del estilo resultante
3. Selectores de tono, perspectiva y estilo como dropdowns secundarios
4. Botón "Generar ejemplo" que produce una micro-escena de demostración con los settings actuales

### Salida para IA

```
[NARRATIVE STYLE]
Depth: 8/10 — rich, detailed descriptions with emotional subtext
Tone: Melancholic — underlying sadness permeates the visual language
Perspective: Objective camera — we observe without entering character thoughts directly
Style: Poetic — lyrical action lines that read like literature
```

---

## 6.8 Extensibilidad del Sistema de Plugins

### Agregar un Nuevo Plugin

Para crear un nuevo plugin, el desarrollador debe:

1. Crear un directorio en `src/editor-engine/plugins/<plugin-name>/`
2. Implementar la interfaz `PluginDefinition`
3. Crear el componente React del panel
4. Registrar el plugin en `registry.ts`
5. Definir la función `toPromptFragment()` para generar el texto de contexto para IA

### Plugins Futuros Planificados

| Plugin | Descripción | Prioridad |
|:-------|:------------|:----------|
| **Color Palette** | Paleta de colores de la escena para dirección de arte | Media |
| **Music/Score** | Referencia musical detallada (BPM, instrumentación, referencia) | Media |
| **Acting Notes** | Notas de dirección de actores (emociones, intensidad, subtexto) | Alta |
| **Time Period** | Época/era temporal con detalles de vestuario y producción | Media |
| **Weather** | Condiciones climáticas detalladas | Baja |
| **Location Ref** | Referencias de locaciones reales para scouting | Baja |
