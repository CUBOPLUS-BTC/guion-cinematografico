export const AMBIENT_OPTIONS = [
  { id: "silence", label: "Silencio / mínimo" },
  { id: "urban", label: "Urbano / tráfico" },
  { id: "nature", label: "Naturaleza" },
  { id: "industrial", label: "Industrial / fábrica" },
  { id: "crowd", label: "Multitud / voces" },
  { id: "interior", label: "Interior doméstico" },
] as const

export const MUSIC_GENRE_OPTIONS = [
  { id: "none", label: "Sin preferencia" },
  { id: "orchestral", label: "Orquestal / cinematográfico" },
  { id: "electronic", label: "Electrónica / sintética" },
  { id: "jazz", label: "Jazz / noir" },
  { id: "ambient", label: "Ambient / drones" },
  { id: "rock", label: "Rock / banda sonora moderna" },
] as const

export const INTENSITY_OPTIONS = [
  { id: "subtle", label: "Sutil" },
  { id: "moderate", label: "Moderada" },
  { id: "intense", label: "Intensa" },
] as const

export const SFX_FOCUS_OPTIONS = [
  { id: "none", label: "Sin foco extra" },
  { id: "foley", label: "Foley / pasos / objetos" },
  { id: "whoosh", label: "Whooshes / transiciones" },
  { id: "hits", label: "Stingers / impactos" },
] as const
