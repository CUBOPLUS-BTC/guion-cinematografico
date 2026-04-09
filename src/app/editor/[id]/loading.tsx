"use client"

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton de carga del editor — mantiene el layout de columnas exacto
 * mientras se hidrata el EditorClient para evitar el "colapso" visual.
 */
export default function EditorLoading() {
  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-accent-muted bg-bg-secondary h-[52px] gap-3">
        {/* Botón back + título */}
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          <Skeleton className="h-5 w-48 rounded" />
        </div>
        {/* Stats + acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      {/* ── BODY: 3 columnas ───────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Columna izquierda — Chat panel */}
        <div className="flex flex-col w-[340px] shrink-0 border-r border-accent-muted bg-bg-secondary">
          {/* Historial */}
          <div className="flex-1 min-h-0 p-4 space-y-3 overflow-hidden">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>

          {/* Panel de input */}
          <div className="shrink-0 border-t border-accent-muted p-4 space-y-3">
            {/* Selector de modelo */}
            <Skeleton className="h-8 w-full rounded-md" />
            {/* Botones de acción rápida */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            {/* Textarea */}
            <Skeleton className="h-20 w-full rounded-lg" />
            {/* Botón enviar */}
            <div className="flex justify-end">
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>

        {/* Columna central — Preview / editor de bloques */}
        <div className="flex-1 min-w-0 flex flex-col bg-bg-primary">
          <div className="flex-1 min-h-0 overflow-hidden p-6 md:p-8 space-y-4 max-w-4xl mx-auto w-full">
            {/* Encabezado de escena */}
            <Skeleton className="h-5 w-2/3 rounded" />
            <div className="h-px bg-accent-muted/30 w-full" />
            {/* Bloques de acción */}
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            {/* Personaje */}
            <div className="flex justify-center mt-4">
              <Skeleton className="h-5 w-32 rounded" />
            </div>
            {/* Diálogo */}
            <div className="px-16 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            {/* Más bloques */}
            <Skeleton className="h-4 w-full rounded mt-4" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            {/* Segundo encabezado */}
            <Skeleton className="h-5 w-1/2 rounded mt-6" />
            <div className="h-px bg-accent-muted/30 w-full" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        </div>

        {/* Columna derecha — Modificadores */}
        <div className="flex flex-col w-[280px] shrink-0 border-l border-accent-muted bg-bg-secondary">
          <div className="p-4 border-b border-accent-muted">
            <Skeleton className="h-5 w-28 rounded" />
          </div>
          <div className="flex-1 min-h-0 p-4 space-y-4 overflow-hidden">
            {/* Plugin cards */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-1.5 border-t border-accent-muted bg-bg-secondary h-[32px]">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  )
}
