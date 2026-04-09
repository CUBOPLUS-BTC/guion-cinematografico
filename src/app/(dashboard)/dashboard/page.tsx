import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProjectCard } from "@/components/dashboard/project-card"
import { CreateProjectButton } from "@/components/dashboard/create-project-button"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Mis Proyectos</h1>
          <p className="text-sm md:text-base text-text-muted">Gestiona y escribe tus guiones cinematográficos.</p>
        </div>
        <CreateProjectButton className="bg-accent w-full sm:w-auto hover:bg-accent/90 text-white gap-2" />
      </div>

      {projects.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-accent-muted rounded-xl flex flex-col items-center justify-center text-text-muted animate-in fade-in zoom-in duration-500">
          <p>No tienes proyectos aún.</p>
          <CreateProjectButton variant="link" className="text-accent">
            Empieza a escribir ahora
          </CreateProjectButton>
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
