"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { EditorCanvas } from "@/editor-engine/components/editor-canvas"
import { AICommandMenu } from "@/editor-engine/components/ai-command-menu"
import { PluginsPanel } from "@/editor-engine/components/plugins-panel"
import { useUIStore } from "@/editor-engine/store/ui-store"
import { useEditorStore } from "@/editor-engine/store/editor-store"
import { useProjectStore } from "@/editor-engine/store/project-store"
import { useEffect } from "react"
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
import type { JSONContent } from "@tiptap/core"

export type EditorClientProps = {
  projectId: string
  initialTitle: string
  initialContent: JSONContent | object | null
}

export function EditorClient({
  projectId,
  initialTitle,
  initialContent,
}: EditorClientProps) {
  const { outlineOpen, pluginsOpen } = useUIStore()
  const { stats, isDirty } = useEditorStore()
  const setProject = useProjectStore((s) => s.setProject)

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
      <AICommandMenu />
      <header className="h-auto min-h-12 py-2 md:py-0 md:h-12 border-b border-accent-muted bg-bg-secondary flex flex-wrap items-center px-4 justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm w-full md:w-auto">
          <Link href="/dashboard" className="text-accent font-bold hover:underline shrink-0">
            ← <span className="hidden md:inline">DASHBOARD</span>
          </Link>
          <div className="h-4 w-px bg-accent-muted hidden md:block" />
          <h2 className="font-medium text-text-primary truncate max-w-[50vw]">
            Proyecto: {initialTitle}
          </h2>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-text-muted ml-auto md:ml-4 shrink-0">
            <div
              className={`size-1.5 rounded-full ${isDirty ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
            />
            <span className="hidden sm:inline">{isDirty ? "Guardando..." : "Sincronizado"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 md:gap-4 mr-2 md:mr-4 text-[9px] md:text-[10px] text-text-muted uppercase font-bold tracking-widest">
            <span>{stats.wordCount} Pal</span>
            <span>{stats.sceneCount} Esc</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] md:h-8 md:text-xs border-accent-muted gap-2"
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

          <Button size="sm" className="h-7 text-[10px] md:h-8 bg-accent text-white md:text-xs px-3 md:px-4">
            Compartir
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {outlineOpen && (
            <>
              <ResizablePanel
                defaultSize={15}
                minSize={10}
                maxSize={25}
                className="bg-bg-secondary hidden md:block" // Hidden on mobile
              >
                <div className="p-4 h-full">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                    Estructura / Outline
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-text-secondary hover:text-accent cursor-pointer">
                      ACTO I: El Encuentro
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-accent-muted hidden md:flex" />
            </>
          )}

          <ResizablePanel
            defaultSize={pluginsOpen ? 60 : 85}
            className="bg-bg-primary relative overflow-hidden flex flex-col min-w-0"
          >
            <EditorCanvas projectId={projectId} initialContent={initialContent} />
          </ResizablePanel>

          {pluginsOpen && (
            <>
              <ResizableHandle withHandle className="bg-accent-muted hidden md:flex" />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="hidden md:block">
                <PluginsPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <footer className="h-7 border-t border-accent-muted bg-bg-tertiary flex items-center px-4 justify-between text-[10px] text-text-muted">
        <div className="flex gap-4">
          <span>{stats.pageCount} Pág</span>
          <span>{stats.estimatedDuration}</span>
          <span>Fountain Standard</span>
        </div>
        <div className="flex gap-4">
          <span>IA: Conectada</span>
          <span className="text-success font-bold uppercase">Sincronizado</span>
        </div>
      </footer>
    </div>
  )
}
