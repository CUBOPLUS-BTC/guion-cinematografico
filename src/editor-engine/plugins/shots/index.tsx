import React from "react";
import { PluginDefinition } from "../types";
import { Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShotsState {
  selected: string[];
}

export const ShotsPlugin: PluginDefinition<ShotsState> = {
  id: "shots",
  name: "Planos Cinematográficos",
  description: "Define el tamaño y ángulo del plano para la escena.",
  icon: "Video",
  category: "cinematography",
  version: "1.0.0",
  defaultState: { selected: [] },

  PanelComponent: ({ state, updateState }) => {
    const options = [
      { id: "ELS", label: "Extreme Long Shot" },
      { id: "LS", label: "Long Shot" },
      { id: "MCU", label: "Medium Close-up" },
      { id: "CU", label: "Close-up" },
      { id: "LOW", label: "Low Angle" },
      { id: "HIGH", label: "High Angle" },
      { id: "OTS", label: "Over the Shoulder" },
    ];

    const toggleShot = (id: string) => {
      const isSelected = state.selected.includes(id);
      updateState({
        selected: isSelected 
          ? state.selected.filter(s => s !== id) 
          : [...state.selected, id]
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Badge
              key={opt.id}
              variant={state.selected.includes(opt.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent transition-colors py-1"
              onClick={() => toggleShot(opt.id)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
        {state.selected.length > 0 && (
          <p className="text-[10px] text-text-muted italic">
            Seleccionados: {state.selected.join(", ")}
          </p>
        )}
      </div>
    );
  },

  toPromptFragment: (state) => {
    if (state.selected.length === 0) return "";
    return `[CINEMATOGRAPHY] Use these camera shots: ${state.selected.join(", ")}.`;
  },
};
