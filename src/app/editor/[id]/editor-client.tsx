"use client"

import { ChatPanel } from "@/editor-engine/components/chat-panel"
import { ModifiersPopover } from "@/editor-engine/components/modifiers-popover"
import { useEditorStore } from "@/editor-engine/store/editor-store"
import { useProjectStore } from "@/editor-engine/store/project-store"
import { useChatStore } from "@/editor-engine/store/chat-store"
import { useEffect, useMemo } from "react"
import { initializePlugins } from "@/editor-engine/plugins/all-plugins"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, Share2 } from "lucide-react"
import { projectContentToFountainString } from "@/lib/core/fountain/project-content"
import type { UIMessage } from "ai"

export type EditorClientProps = {
  projectId: string
  initialTitle: string
  initialContent: unknown
  initialChatMessages: UIMessage[]
}

export function EditorClient({
  projectId,
  initialTitle,
  initialContent,
  initialChatMessages,
}: EditorClientProps) {
  const { stats } = useEditorStore()
  const setProject = useProjectStore((s) => s.setProject)
  const setDocumentFountain = useChatStore((s) => s.setDocumentFountain)
  const markClean = useChatStore((s) => s.markClean)
  const getProjectContentPayload = useChatStore((s) => s.getProjectContentPayload)
  const chatDirty = useChatStore((s) => s.isDirty)

  const initialFountain = useMemo(
    () => projectContentToFountainString(initialContent),
    [initialContent]
  )

  useEffect(() => {
    initializePlugins()
  }, [])

  useEffect(() => {
    setProject({
      id: projectId,
      title: initialTitle,
      logline: "",
      genre: "DRAMA",
      content: initialContent,
    })
  }, [projectId, initialTitle, initialContent, setProject])

  useEffect(() => {
    setDocumentFountain(initialFountain, { markDirty: false })
  }, [initialFountain, setDocumentFountain])

  useEffect(() => {
    if (!chatDirty) return
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}/content`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getProjectContentPayload()),
          })
          if (res.ok) {
            markClean()
          }
        } catch {
          /* reintento en siguiente ciclo */
        }
      })()
    }, 2000)
    return () => clearTimeout(t)
  }, [chatDirty, getProjectContentPayload, markClean, projectId])

  const handleExport = async (format: "pdf" | "fdx") => {
    const res = await fetch(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format,
        options: {
          includeTitlePage: true,
          revision: "Borrador",
        },
      }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const dispo = res.headers.get("Content-Disposition")
    const match = dispo?.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? `guion.${format === "pdf" ? "pdf" : "fdx"}`
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary overflow-hidden">
      <header className="h-auto min-h-12 py-2 md:py-0 md:h-12 border-b border-accent-muted bg-bg-secondary flex flex-wrap items-center px-4 justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm w-full md:w-auto min-w-0">
          <Link href="/dashboard" className="text-accent font-bold hover:underline shrink-0">
            ← <span className="hidden md:inline">DASHBOARD</span>
          </Link>
          <div className="h-4 w-px bg-accent-muted hidden md:block shrink-0" />
          <h2 className="font-medium text-text-primary truncate min-w-0 max-w-[min(50vw,20rem)] md:max-w-[40vw]">
            {initialTitle}
          </h2>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-text-muted ml-auto md:ml-4 shrink-0">
            <div
              className={`size-1.5 rounded-full ${chatDirty ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
            />
            <span className="hidden sm:inline">
              {chatDirty ? "Guardando..." : "Sincronizado"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <ModifiersPopover />

          <div className="flex items-center gap-2 md:gap-4 mr-0 md:mr-2 text-[9px] md:text-[10px] text-text-muted uppercase font-bold tracking-widest">
            <span>{stats.wordCount} Pal</span>
            <span>{stats.sceneCount} Esc</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] md:h-8 md:text-xs border-accent-muted gap-2"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-bg-secondary border-accent-muted">
              <DropdownMenuItem
                onClick={() => void handleExport("pdf")}
                className="text-xs flex items-center gap-2"
              >
                <FileText className="h-3 w-3" />
                PDF Profesional (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void handleExport("fdx")}
                className="text-xs flex items-center gap-2"
              >
                <Share2 className="h-3 w-3" />
                Final Draft (.fdx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <ChatPanel
          key={projectId}
          projectId={projectId}
          initialMessages={initialChatMessages}
        />
      </div>

      <footer className="h-8 border-t border-accent-muted bg-bg-tertiary flex items-center px-4 justify-between text-[10px] text-text-muted shrink-0">
        <div className="flex gap-4 flex-wrap">
          <span>{stats.pageCount} Pág</span>
          <span>{stats.estimatedDuration}</span>
          <span className="hidden sm:inline">Markdown · Streamdown</span>
        </div>
        <div className="flex gap-4">
          <span>IA: Conectada</span>
          <span className="text-success font-bold uppercase">Listo</span>
        </div>
      </footer>
    </div>
  )
}
