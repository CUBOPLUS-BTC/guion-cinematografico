import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Guion Cinematográfico AI",
  description: "Gestiona tus guiones y proyectos de cine con IA.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar Placeholder */}
      <aside className="w-64 border-r border-accent-muted bg-bg-secondary hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-accent">Guion AI</h2>
        </div>
        <nav className="mt-6 px-4">
          {/* Nav Links will go here */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-md cursor-pointer transition-colors">
              Proyectos
            </div>
            <div className="px-3 py-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-md cursor-pointer transition-colors">
              Historial IA
            </div>
            <div className="px-3 py-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-md cursor-pointer transition-colors">
              Configuracion
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header Placeholder */}
        <header className="h-16 border-bottom border-accent-muted bg-bg-secondary flex items-center justify-between px-8">
          <div className="md:hidden text-accent font-bold">Guion AI</div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-accent-muted border border-accent"></div>
          </div>
        </header>

        <main className="flex-1 p-8 text-text-primary">
          {children}
        </main>
      </div>
    </div>
  )
}
