"use client"

import React from "react";
import { pluginRegistry } from "../plugins/registry";
import { usePluginStore } from "../store/plugin-store";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as LucideIcons from "lucide-react";

export function PluginsPanel() {
  const plugins = pluginRegistry.getAll();
  const { states, activePlugins, updatePluginState, togglePlugin } = usePluginStore();

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-l border-accent-muted">
      <div className="p-4 border-b border-accent-muted flex items-center justify-between bg-bg-tertiary">
        <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Modificadores de Escena</h3>
      </div>

      <ScrollArea className="flex-1">
        <Accordion type="multiple" className="w-full px-4 py-2">
          {plugins.map((plugin) => {
            const Icon = (LucideIcons as any)[plugin.icon] || LucideIcons.HelpCircle;
            const isActive = activePlugins.includes(plugin.id);
            const pluginState = states[plugin.id] || plugin.defaultState;

            return (
              <AccordionItem key={plugin.id} value={plugin.id} className="border-accent-muted">
                <div className="flex items-center gap-2 py-2">
                  <Switch 
                    checked={isActive} 
                    onCheckedChange={() => togglePlugin(plugin.id)} 
                    className="data-[state=checked]:bg-accent"
                  />
                  <AccordionTrigger className="flex-1 hover:no-underline py-0">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                      <span className={`text-sm ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                        {plugin.name}
                      </span>
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="pb-4">
                  <div className={`pl-8 pr-2 space-y-4 ${!isActive && 'opacity-50 pointer-events-none'}`}>
                    <p className="text-[10px] text-text-muted">{plugin.description}</p>
                    <plugin.PanelComponent 
                      state={pluginState} 
                      updateState={(partial) => updatePluginState(plugin.id, partial)} 
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>

      <div className="p-4 bg-bg-tertiary border-t border-accent-muted">
        <p className="text-[9px] text-text-muted leading-tight">
          Los modificadores activos se inyectarán como sugerencias técnicas en el próximo comando de IA.
        </p>
      </div>
    </div>
  );
}
