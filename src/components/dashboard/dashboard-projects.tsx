"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/dashboard/project-card"

export type DashboardProjectRow = {
  id: string
  title: string
  logline: string
  genre: string
  format: string
  status: string
  updatedAt: string
}

export function DashboardProjects({ projects }: { projects: DashboardProjectRow[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.logline.toLowerCase().includes(q) ||
        p.genre.toLowerCase().includes(q)
    )
  }, [projects, query])

  const featured = filtered[0]
  const rest = filtered.slice(1)

  if (projects.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar por título, logline o género…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 border-accent-muted bg-bg-secondary pl-10 text-text-primary placeholder:text-text-muted"
          aria-label="Buscar guiones"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-accent-muted bg-bg-secondary/50 py-16 text-center text-text-muted">
          No hay resultados para &quot;{query}&quot;.
        </div>
      ) : (
        <>
          {featured ? (
            <section aria-label="Último guion editado" className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
                Continuar escribiendo
              </h2>
              <ProjectCard
                {...featured}
                featured
                staggerIndex={0}
              />
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
                Todos los guiones
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((p, i) => (
                  <ProjectCard key={p.id} {...p} staggerIndex={i + 1} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
