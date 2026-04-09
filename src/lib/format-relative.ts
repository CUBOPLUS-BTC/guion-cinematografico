/** Tiempo relativo en español (pasado) sin dependencias externas. */
export function formatRelativePast(date: Date): string {
  const ms = Date.now() - date.getTime()
  if (ms < 0) return date.toLocaleDateString("es")
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return "hace un momento"
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`
  return date.toLocaleDateString("es")
}
