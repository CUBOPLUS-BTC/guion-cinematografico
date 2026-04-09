"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useState } from "react"

export default function EditorPage({ params }: { params: { id: string } }) {
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [pluginsOpen, setPluginsOpen] = useState(true)

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-12 border-b border-accent-muted bg-bg-secondary flex items-center px-4 justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-bold text-accent">Proyecto #{params.id}</span>
          <div className="h-4 w-px bg-accent-muted"></div>
          <span className="text-text-secondary">Sin cambios sin guardar</span>
        </div>
        <div className="flex items-center gap-2">
          {/* AI and Export buttons */}
          <div className="px-3 py-1 rounded bg-accent text-bg-primary text-xs font-bold cursor-pointer hover:bg-accent-hover transition-colors">
            Generar IA
          </div>
          <div className="px-3 py-1 rounded border border-accent-muted text-accent text-xs font-bold cursor-pointer hover:bg-bg-tertiary transition-colors">
            Exportar
          </div>
        </div>
      </header>

      {/* Main Resizable Area */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Outline */}
          {outlineOpen && (
            <>
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25} className="bg-bg-secondary">
                <div className="p-4 h-full">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Estructura / Outline</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-text-secondary hover:text-accent cursor-pointer">ACTO I: El Encuentro</div>
                    <div className="text-sm pl-4 text-text-muted hover:text-accent cursor-pointer italic">INT. CAFETERIA - DIA</div>
                    <div className="text-sm pl-4 text-text-muted hover:text-accent cursor-pointer italic">EXT. CALLE - ATARDECER</div>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-accent-muted" />
            </>
          )}

          {/* Center Panel: Editor Canvas */}
          <ResizablePanel defaultSize={60} className="bg-bg-primary relative overflow-y-auto">
            <div className="max-w-[816px] mx-auto my-12 min-h-[1056px] bg-white text-black p-[1.5in] shadow-2xl relative">
              {/* Simulation of a script page */}
              <div className="font-screenplay text-[12pt] leading-none space-y-4">
                <div className="uppercase">INT. CAFETERIA - DIA</div>
                <div>A small, dimly lit coffee shop. SARAH (20s) sits alone.</div>
                <div className="flex flex-col items-center">
                  <div className="w-[30%]">
                    <div className="uppercase text-center">SARAH</div>
                    <div className="text-left italic">(to herself)</div>
                    <div className="text-left">I've been waiting for too long.</div>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          {/* Right Panel: Plugins */}
          {pluginsOpen && (
            <>
              <ResizableHandle withHandle className="bg-accent-muted" />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-bg-secondary">
                <div className="p-0 flex flex-col h-full">
                  <div className="p-4 border-b border-accent-muted">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Plugins de Direccion</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Placeholder for plugins */}
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-text-secondary">Planos Cinematográficos</label>
                       <div className="h-10 border border-accent-muted rounded bg-bg-tertiary flex items-center px-3 text-sm text-text-muted italic">Seleccionar plano...</div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-text-secondary">Iluminación</label>
                       <div className="flex gap-2">
                         <div className="h-8 flex-1 bg-accent-muted border border-accent rounded text-[10px] flex items-center justify-center font-bold">LOW-KEY</div>
                         <div className="h-8 flex-1 bg-bg-tertiary border border-accent-muted rounded text-[10px] flex items-center justify-center">NATURAL</div>
                       </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-7 border-t border-accent-muted bg-bg-tertiary flex items-center px-4 justify-between text-[10px] text-text-muted">
        <div className="flex gap-4">
          <span>Página 1 de 1</span>
          <span>Fountain Standard</span>
        </div>
        <div className="flex gap-4">
          <span>IA: Conectada (Claude 3.5)</span>
          <span className="text-success font-bold">SINCRONIZADO</span>
        </div>
      </footer>
    </div>
  )
}
