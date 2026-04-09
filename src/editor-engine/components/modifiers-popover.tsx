"use client"

import React, { type ComponentType } from "react"
import * as LucideIcons from "lucide-react"
import { pluginRegistry } from "@/editor-engine/plugins/registry"
import { usePluginStore } from "@/editor-engine/store/plugin-store"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/** Modificadores técnicos en un popover compacto (reemplaza el panel lateral). */
export function ModifiersPopover() {
  const plugins = pluginRegistry.getAll()
  const { states, activePlugins, updatePluginState, togglePlugin } =
    usePluginStore()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs border-accent-muted gap-2 shrink-0"
        >
          <LucideIcons.SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Modificadores</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] max-h-[min(70vh,32rem)] p-0 bg-bg-secondary border-accent-muted flex flex-col"
      >
        <div className="px-3 py-2 border-b border-accent-muted bg-bg-tertiary shrink-0">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            Modificadores de escena
          </p>
          <p className="text-[10px] text-text-muted mt-0.5 leading-snug">
            Se envían como contexto técnico al generar con la IA.
          </p>
        </div>
        <ScrollArea className="max-h-[min(60vh,28rem)]">
          <Accordion type="multiple" className="w-full px-2 py-2">
            {plugins.map((plugin) => {
              const Icon =
                (LucideIcons as unknown as Record<
                  string,
                  ComponentType<{ className?: string }>
                >)[plugin.icon] ?? LucideIcons.HelpCircle
              const isActive = activePlugins.includes(plugin.id)
              const pluginState = states[plugin.id] || plugin.defaultState

              return (
                <AccordionItem
                  key={plugin.id}
                  value={plugin.id}
                  className="border-accent-muted"
                >
                  <div className="flex items-center gap-2 py-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => togglePlugin(plugin.id)}
                      className="data-[state=checked]:bg-accent"
                    />
                    <AccordionTrigger className="flex-1 hover:no-underline py-0">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-4 w-4 ${isActive ? "text-accent" : "text-text-muted"}`}
                        />
                        <span
                          className={`text-sm ${isActive ? "text-text-primary" : "text-text-muted"}`}
                        >
                          {plugin.name}
                        </span>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pb-3">
                    <div
                      className={`pl-1 pr-2 space-y-3 ${!isActive && "opacity-50 pointer-events-none"}`}
                    >
                      <p className="text-[10px] text-text-muted">
                        {plugin.description}
                      </p>
                      <plugin.PanelComponent
                        state={pluginState}
                        updateState={(partial) =>
                          updatePluginState(plugin.id, partial)
                        }
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
