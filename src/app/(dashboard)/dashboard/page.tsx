export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-accent">Bienvenido de nuevo</h1>
        <p className="text-text-secondary">Aquí tienes un resumen de tus guiones recientes y actividad.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        {[
          { label: "Proyectos Totales", value: "12" },
          { label: "Páginas Escritas", value: "342" },
          { label: "Generaciones IA", value: "156" },
          { label: "Tiempo de escritura", value: "48h" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl bg-bg-secondary border border-accent-muted shadow-glow">
            <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">Proyectos Recientes</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            { id: 1, title: "Sombras del Pasado", genre: "Thriller", date: "Hace 2 horas" },
            { id: 2, title: "Luz de Neon", genre: "Sci-Fi", date: "Ayer" },
            { id: 3, title: "El Silencio", genre: "Drama", date: "Hace 3 días" },
          ].map((project) => (
            <div key={project.id} className="group p-5 rounded-xl bg-bg-tertiary border border-accent-muted hover:border-accent transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-16 bg-bg-secondary border border-accent-muted rounded shadow-sm group-hover:shadow-glow transition-all"></div>
                <span className="text-xs px-2 py-1 rounded bg-accent-muted text-accent font-medium">{project.genre}</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-all">{project.title}</h3>
              <p className="text-sm text-text-muted mt-1">Editado {project.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
