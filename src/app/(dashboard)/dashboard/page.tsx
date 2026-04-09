import { prisma } from "@/lib/prisma"
import { ProjectCard } from "@/components/dashboard/project-card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  // En una app real, filtraríamos por userId (auth)
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Mis Proyectos</h1>
          <p className="text-text-muted">Gestiona y escribe tus guiones cinematográficos.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-white gap-2">
          <Link href="/editor/new">
            <Plus className="h-4 w-4" />
            Nuevo Guion
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-accent-muted rounded-xl flex flex-col items-center justify-center text-text-muted animate-in fade-in zoom-in duration-500">
          <p>No tienes proyectos aún.</p>
          <Button variant="link" className="text-accent">Empieza a escribir ahora</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              updatedAt={project.updatedAt}
              sceneCount={5} // Placeholder
            />
          ))}
        </div>
      )}
    </div>
  )
}
