/** specs/06-sistema-plugins.md — §6.4 Luces */

export const LIGHTING_KEY = [
  { id: "high-key", label: "High-Key" },
  { id: "low-key", label: "Low-Key" },
  { id: "natural", label: "Natural" },
  { id: "mixed", label: "Mixed" },
  { id: "none", label: "Predeterminado" },
] as const

export const LIGHTING_DIRECTION = [
  { id: "none", label: "—" },
  { id: "frontal", label: "Frontal" },
  { id: "lateral", label: "Lateral" },
  { id: "backlight", label: "Contraluz" },
  { id: "top", label: "Cenital" },
  { id: "motivated", label: "Práctica (motivada)" },
] as const

export const LIGHTING_QUALITY = [
  { id: "none", label: "—" },
  { id: "hard", label: "Dura (hard)" },
  { id: "soft", label: "Suave (soft)" },
  { id: "diffuse", label: "Difusa" },
] as const

export const LIGHTING_TEMP = [
  { id: "none", label: "—" },
  { id: "warm", label: "Cálida (~3200K)" },
  { id: "neutral", label: "Neutra (~4500K)" },
  { id: "daylight", label: "Fría daylight (~5600K)" },
  { id: "stylized", label: "Estilizada (neón, etc.)" },
] as const

export const LIGHTING_SCHEME = [
  { id: "none", label: "—" },
  { id: "three-point", label: "Three-Point" },
  { id: "rembrandt", label: "Rembrandt" },
  { id: "butterfly", label: "Butterfly / Paramount" },
  { id: "split", label: "Split" },
  { id: "silhouette", label: "Silhouette" },
  { id: "chiaroscuro", label: "Chiaroscuro" },
] as const
