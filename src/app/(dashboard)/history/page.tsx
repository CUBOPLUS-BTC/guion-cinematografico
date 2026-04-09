import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatRelativePast } from "@/lib/format-relative"
import { BrainCircuit, CheckCircle2, XCircle } from "lucide-react"

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const generations = await prisma.aIGeneration.findMany({
    where: {
      project: {
        userId: session.user.id
      }
    },
    include: {
      project: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Historial de IA</h1>
        <p className="text-sm md:text-base text-text-muted">Rastreo de generaciones y uso de tokens.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="p-4 md:p-6 rounded-xl border border-accent-muted bg-bg-secondary space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Generaciones</p>
          <p className="text-2xl md:text-3xl font-bold text-text-primary">{generations.length}</p>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-accent-muted bg-bg-secondary space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Tokens Consumidos</p>
          <p className="text-2xl md:text-3xl font-bold text-text-primary">
            {generations.reduce((acc, g) => acc + g.inputTokens + g.outputTokens, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-accent-muted bg-bg-secondary space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Aceptación</p>
          <p className="text-2xl md:text-3xl font-bold text-accent">
            {generations.length > 0
              ? Math.round((generations.filter(g => g.accepted).length / generations.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-accent-muted bg-bg-secondary overflow-hidden">
        {/* Vista Móvil (Cards) */}
        <div className="md:hidden flex flex-col divide-y divide-accent-muted">
          {generations.length === 0 ? (
            <div className="p-8 text-center text-text-muted italic">
              No hay registros de generaciones aún.
            </div>
          ) : (
            generations.map((gen) => (
              <div key={gen.id} className="p-4 space-y-3 hover:bg-bg-tertiary transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">{formatRelativePast(gen.createdAt)}</span>
                  {gen.accepted ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <XCircle className="size-4 text-text-muted/30" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">{gen.project.title}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-accent/5 text-accent text-[10px] font-bold uppercase">
                    <BrainCircuit className="size-3" />
                    {gen.action}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted font-mono">
                  <span>Mod: {gen.model}</span>
                  <span>Tkns: {(gen.inputTokens + gen.outputTokens).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vista Escritorio (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-bg-tertiary text-text-muted font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Modelo</th>
                <th className="px-6 py-4 text-center">Tokens</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-muted">
              {generations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted italic">
                    No hay registros de generaciones aún.
                  </td>
                </tr>
              ) : (
                generations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-bg-tertiary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      {formatRelativePast(gen.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {gen.project.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/5 text-accent text-[10px] font-bold uppercase">
                        <BrainCircuit className="size-3" />
                        {gen.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono text-xs">
                      {gen.model}
                    </td>
                    <td className="px-6 py-4 text-center text-text-secondary font-mono">
                      {(gen.inputTokens + gen.outputTokens).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {gen.accepted ? (
                          <CheckCircle2 className="size-4 text-green-500" title="Aceptado" />
                        ) : (
                          <XCircle className="size-4 text-text-muted/30" title="Descartado" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
