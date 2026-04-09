/** Etiquetas en español para enums de Project (serializados como string en cliente). */

export const GENRE_LABELS: Record<string, string> = {
  DRAMA: "Drama",
  COMEDY: "Comedia",
  THRILLER: "Thriller",
  HORROR: "Terror",
  SCIFI: "Ciencia ficción",
  ROMANCE: "Romance",
  ACTION: "Acción",
  DOCUMENTARY: "Documental",
  OTHER: "Otro",
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  IN_PROGRESS: "En curso",
  REVIEW: "Revisión",
  FINAL: "Final",
}

export const FORMAT_LABELS: Record<string, string> = {
  FEATURE: "Largometraje",
  SHORT: "Corto",
  SERIES: "Serie",
  PILOT: "Piloto",
  DOCUMENTARY: "Documental",
}

export function labelGenre(g: string) {
  return GENRE_LABELS[g] ?? g
}

export function labelStatus(s: string) {
  return STATUS_LABELS[s] ?? s
}

export function labelFormat(f: string) {
  return FORMAT_LABELS[f] ?? f
}

/** Clases Tailwind para badge de estado (tokens del proyecto). */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case "FINAL":
      return "border-success/40 bg-success/15 text-success"
    case "REVIEW":
      return "border-info/40 bg-info/15 text-info"
    case "IN_PROGRESS":
      return "border-accent/50 bg-accent/15 text-accent"
    case "DRAFT":
    default:
      return "border-accent-muted bg-bg-tertiary text-text-secondary"
  }
}
