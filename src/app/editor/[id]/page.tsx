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
import { useEffect } from "react"
import { initializePlugins } from "@/editor-engine/plugins/all-plugins"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Download, FileText, Share2 } from "lucide-react"

export default function EditorPage({ params }: { params: { id: string } }) {
  const { outlineOpen, pluginsOpen } = useUIStore()
  const { stats, isDirty } = useEditorStore()

  useEffect(() => {
    initializePlugins()
  }, [])

  const handleExport = (format: 'pdf' | 'fdx') => {
    window.open(`/api/projects/${params.id}/export?format=${format}`, '_blank')
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary overflow-hidden">
      <AICommandMenu />
      {/* Top Toolbar */}
      <header className="h-12 border-b border-accent-muted bg-bg-secondary flex items-center px-4 justify-between">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-accent font-bold hover:underline">← DASHBOARD</Link>
          <div className="h-4 w-px bg-accent-muted" />
          <h2 className="font-medium text-text-primary">Proyecto: {params.id === 'new' ? 'Nuevo Guion' : params.id}</h2>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-text-muted ml-4">
            <div className={`size-1.5 rounded-full ${isDirty ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            <span>{isDirty ? 'Guardando...' : 'Sincronizado'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 mr-4 text-[10px] text-text-muted uppercase font-bold tracking-widest">
            <span>{stats.wordCount} Palabras</span>
            <span>{stats.sceneCount} Escenas</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-accent-muted text-xs gap-2">
                <Download className="h-3 w-3" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-bg-secondary border-accent-muted">
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-xs flex items-center gap-2">
                <FileText className="h-3 w-3" />
                PDF Profesional (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('fdx')} className="text-xs flex items-center gap-2">
                <Share2 className="h-3 w-3" />
                Final Draft (.fdx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="h-8 bg-accent text-white text-xs px-4">
            Compartir
          </Button>
        </div>
      </header>

      {/* Main Resizable Area */}
      <div className="flex-1">
        <ResizablePanelGroup direction={"horizontal" as any}>
          {/* Left Panel: Outline */}
          {outlineOpen && (
            <>
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25} className="bg-bg-secondary">
                <div className="p-4 h-full">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Estructura / Outline</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-text-secondary hover:text-accent cursor-pointer">ACTO I: El Encuentro</div>
                    {/* Dynamic outline will go here */}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-accent-muted" />
            </>
          )}

          {/* Center Panel: Editor Canvas */}
          <ResizablePanel defaultSize={pluginsOpen ? 60 : 85} className="bg-bg-primary relative overflow-hidden flex flex-col">
            <EditorCanvas />
          </ResizablePanel>

          {/* Right Panel: Plugins */}
          {pluginsOpen && (
            <>
              <ResizableHandle withHandle className="bg-accent-muted" />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <PluginsPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-7 border-t border-accent-muted bg-bg-tertiary flex items-center px-4 justify-between text-[10px] text-text-muted">
        <div className="flex gap-4">
          <span>{stats.pageCount} Pág</span>
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
