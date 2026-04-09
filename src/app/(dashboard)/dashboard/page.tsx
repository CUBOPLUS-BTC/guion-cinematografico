import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CreateProjectButton } from "@/components/dashboard/create-project-button"
import {
  DashboardProjects,
  type DashboardProjectRow,
} from "@/components/dashboard/dashboard-projects"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      logline: true,
      genre: true,
      format: true,
      status: true,
      updatedAt: true,
    },
  })

  const rows: DashboardProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    logline: p.logline,
    genre: String(p.genre),
    format: String(p.format),
    status: String(p.status),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            Mis guiones
          </h1>
          <p className="text-sm md:text-base text-text-muted">
            Gestiona, renombra y abre tus proyectos cinematográficos.
          </p>
        </div>
        <CreateProjectButton className="bg-accent w-full sm:w-auto hover:bg-accent/90 text-white gap-2" />
      </div>

      {projects.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-accent-muted rounded-xl flex flex-col items-center justify-center text-text-muted animate-in fade-in zoom-in duration-500">
          <p>No tienes guiones aún.</p>
          <CreateProjectButton variant="link" className="text-accent">
            Empieza a escribir ahora
          </CreateProjectButton>
        </div>
      ) : (
        <DashboardProjects projects={rows} />
      )}
    </div>
  )
}
