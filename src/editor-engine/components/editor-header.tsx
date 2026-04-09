"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  FileText,
  Loader2,
  MessageSquare,
  PencilLine,
  Share2,
  SlidersHorizontal,
} from "lucide-react"
import { useUIStore } from "@/editor-engine/store/ui-store"

export type EditorHeaderProps = {
  title: string
  savedTitle: string
  chatDirty: boolean
  titleSaving: boolean
  titleError: string | null
  wordCount: number
  sceneCount: number
  onTitleChange: (title: string) => void
  onTitleCommit: () => void
  onExportPdf: () => void | Promise<void>
  onExportFdx: () => void | Promise<void>
  toolbarExtra?: ReactNode
}

export function EditorHeader({
  title,
  savedTitle,
  chatDirty,
  titleSaving,
  titleError,
  wordCount,
  sceneCount,
  onTitleChange,
  onTitleCommit,
  onExportPdf,
  onExportFdx,
  toolbarExtra,
}: EditorHeaderProps) {
  const toggleChat = useUIStore((s) => s.toggleChat)
  const toggleModifiers = useUIStore((s) => s.toggleModifiers)

  const normalizedTitle = title.trim()
  const normalizedSavedTitle = savedTitle.trim()
  const titleDirty = normalizedTitle !== "" && normalizedTitle !== normalizedSavedTitle
  const isSaving = chatDirty || titleSaving || titleDirty
  const statusLabel = titleError
    ? "Error al guardar"
    : isSaving
      ? "Guardando..."
      : "Sincronizado"
  const statusClass = titleError
    ? "bg-red-500"
    : isSaving
      ? "bg-amber-500 animate-pulse"
      : "bg-green-500"

  return (
    <header className="flex h-auto min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-accent-muted bg-bg-secondary px-4 py-2 md:h-12 md:py-0">
      <div className="flex w-full min-w-0 items-center gap-2 text-xs md:w-auto md:gap-4 md:text-sm">
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

        <Link href="/dashboard" className="shrink-0 font-bold text-accent hover:underline">
          ← <span className="hidden md:inline">DASHBOARD</span>
        </Link>

        <div className="hidden h-4 w-px shrink-0 bg-accent-muted md:block" />

        <div className="group flex min-w-0 flex-1 items-center gap-2 rounded-md border border-transparent px-2 py-1 transition-colors hover:border-accent-muted/60 focus-within:border-accent-muted/80 focus-within:bg-bg-primary/60 md:flex-none md:max-w-[42vw]">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onTitleCommit}
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }

              if (e.key === "Escape") {
                e.preventDefault()
                onTitleChange(savedTitle)
                e.currentTarget.blur()
              }
            }}
            aria-label="Título del guion"
            placeholder="Sin título"
            maxLength={200}
            className="h-7 border-0 bg-transparent px-0 py-0 text-sm font-medium text-text-primary shadow-none focus-visible:border-transparent focus-visible:ring-0"
          />
          {titleSaving ? (
            <Loader2 className="hidden h-3.5 w-3.5 shrink-0 animate-spin text-accent sm:block" />
          ) : (
            <PencilLine className="hidden h-3.5 w-3.5 shrink-0 text-text-muted transition-colors group-focus-within:text-accent sm:block" />
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase text-text-muted md:ml-2">
          <div className={`size-1.5 rounded-full ${statusClass}`} />
          <span className="hidden sm:inline">{statusLabel}</span>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
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

        <div className="mr-0 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-text-muted md:mr-2 md:gap-4 md:text-[10px]">
          <span>{wordCount} Pal</span>
          <span>{sceneCount} Esc</span>
        </div>

        {toolbarExtra}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-accent-muted text-[10px] md:h-8 md:text-xs"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-accent-muted bg-bg-secondary">
            <DropdownMenuItem
              onClick={() => void onExportPdf()}
              className="flex items-center gap-2 text-xs"
            >
              <FileText className="h-3 w-3" />
              PDF Profesional (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void onExportFdx()}
              className="flex items-center gap-2 text-xs"
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