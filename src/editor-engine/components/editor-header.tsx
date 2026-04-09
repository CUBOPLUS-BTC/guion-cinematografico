"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, MessageSquare, Share2, SlidersHorizontal } from "lucide-react"
import { useUIStore } from "@/editor-engine/store/ui-store"

export type EditorHeaderProps = {
  title: string
  chatDirty: boolean
  wordCount: number
  sceneCount: number
  onExportPdf: () => void | Promise<void>
  onExportFdx: () => void | Promise<void>
}

export function EditorHeader({
  title,
  chatDirty,
  wordCount,
  sceneCount,
  onExportPdf,
  onExportFdx,
}: EditorHeaderProps) {
  const toggleChat = useUIStore((s) => s.toggleChat)
  const toggleModifiers = useUIStore((s) => s.toggleModifiers)

  return (
    <header className="h-auto min-h-12 py-2 md:py-0 md:h-12 border-b border-accent-muted bg-bg-secondary flex flex-wrap items-center px-4 justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm w-full md:w-auto min-w-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-accent-muted md:hidden"
          onClick={toggleChat}
          aria-label="Abrir chat"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Link href="/dashboard" className="text-accent font-bold hover:underline shrink-0">
          ← <span className="hidden md:inline">DASHBOARD</span>
        </Link>
        <div className="h-4 w-px bg-accent-muted hidden md:block shrink-0" />
        <h2 className="font-medium text-text-primary truncate min-w-0 max-w-[min(40vw,14rem)] sm:max-w-[min(50vw,20rem)] md:max-w-[40vw]">
          {title}
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-accent-muted md:hidden"
          onClick={toggleModifiers}
          aria-label="Abrir modificadores"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 md:gap-4 mr-0 md:mr-2 text-[9px] md:text-[10px] text-text-muted uppercase font-bold tracking-widest">
          <span>{wordCount} Pal</span>
          <span>{sceneCount} Esc</span>
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
              onClick={() => void onExportPdf()}
              className="text-xs flex items-center gap-2"
            >
              <FileText className="h-3 w-3" />
              PDF Profesional (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void onExportFdx()}
              className="text-xs flex items-center gap-2"
            >
              <Share2 className="h-3 w-3" />
              Final Draft (.fdx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
