import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatRelativePast } from "@/lib/format-relative"
import { BrainCircuit, CheckCircle2, MessageSquare, XCircle } from "lucide-react"

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const [chatMessages, generations] = await Promise.all([
    prisma.chatMessage.findMany({
      where: {
        project: { userId: session.user.id },
      },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 400,
    }),
    prisma.aIGeneration.findMany({
      where: {
        project: { userId: session.user.id },
      },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 400,
    }),
  ])

  const chatAssistantTokens = chatMessages
    .filter((m) => m.role === "ASSISTANT")
    .reduce(
      (acc, m) =>
        acc + (m.inputTokens ?? 0) + (m.outputTokens ?? 0),
      0
    )

  const legacyTokens = generations.reduce(
    (acc, g) => acc + g.inputTokens + g.outputTokens,
    0
  )

  const totalTokens = chatAssistantTokens + legacyTokens

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
          Historial de IA
        </h1>
        <p className="text-sm md:text-base text-text-muted">
          Mensajes de chat por proyecto y registro de generaciones (incluye histórico previo).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="p-4 md:p-6 rounded-xl border border-accent-muted bg-bg-secondary space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Mensajes de chat
          </p>
          <p className="text-2xl md:text-3xl font-bold text-text-primary">
            {chatMessages.length}
          </p>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-accent-muted bg-bg-secondary space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Tokens (chat + legacy)
          </p>
          <p className="text-2xl md:text-3xl font-bold text-text-primary">
            {totalTokens.toLocaleString()}
          </p>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-accent-muted bg-bg-secondary space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Generaciones legacy
          </p>
          <p className="text-2xl md:text-3xl font-bold text-accent">
            {generations.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-accent-muted bg-bg-secondary overflow-hidden">
        <div className="px-4 py-3 border-b border-accent-muted bg-bg-tertiary flex items-center gap-2">
          <MessageSquare className="size-4 text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Chat por proyecto
          </h2>
        </div>
        <div className="md:hidden flex flex-col divide-y divide-accent-muted">
          {chatMessages.length === 0 ? (
            <div className="p-8 text-center text-text-muted italic">
              Aún no hay mensajes de chat guardados.
            </div>
          ) : (
            chatMessages.map((m) => (
              <div
                key={m.id}
                className="p-4 space-y-2 hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    {formatRelativePast(m.createdAt)}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-accent">
                    {m.role}
                  </span>
                </div>
                <h3 className="font-medium text-text-primary">{m.project.title}</h3>
                <p className="text-xs text-text-muted line-clamp-3">{m.content}</p>
                {m.role === "ASSISTANT" && m.model && (
                  <p className="text-[10px] text-text-muted font-mono">{m.model}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-bg-tertiary text-text-muted font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Vista previa</th>
                <th className="px-6 py-4">Modelo</th>
                <th className="px-6 py-4 text-center">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-muted">
              {chatMessages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-text-muted italic"
                  >
                    Aún no hay mensajes de chat guardados.
                  </td>
                </tr>
              ) : (
                chatMessages.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-tertiary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                      {formatRelativePast(m.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {m.project.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/5 text-accent text-[10px] font-bold uppercase">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary max-w-md truncate">
                      {m.content}
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono text-xs">
                      {m.model ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-center text-text-secondary font-mono text-xs">
                      {m.role === "ASSISTANT"
                        ? (
                            (m.inputTokens ?? 0) + (m.outputTokens ?? 0)
                          ).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-accent-muted bg-bg-secondary overflow-hidden">
        <div className="px-4 py-3 border-b border-accent-muted bg-bg-tertiary flex items-center gap-2">
          <BrainCircuit className="size-4 text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            Generaciones (histórico)
          </h2>
        </div>
        <div className="md:hidden flex flex-col divide-y divide-accent-muted">
          {generations.length === 0 ? (
            <div className="p-8 text-center text-text-muted italic">
              No hay registros de generaciones legacy.
            </div>
          ) : (
            generations.map((gen) => (
              <div
                key={gen.id}
                className="p-4 space-y-3 hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    {formatRelativePast(gen.createdAt)}
                  </span>
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
                  <span>
                    Tkns: {(gen.inputTokens + gen.outputTokens).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

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
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-text-muted italic"
                  >
                    No hay registros de generaciones legacy.
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
                          <CheckCircle2 className="size-4 text-green-500" aria-label="Aceptado" />
                        ) : (
                          <XCircle className="size-4 text-text-muted/30" aria-label="Descartado" />
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
