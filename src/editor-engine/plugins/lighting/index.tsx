import React from "react";
import { PluginDefinition } from "../types";
import { Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LightingState {
  key: "high-key" | "low-key" | "natural" | "none";
}

export const LightingPlugin: PluginDefinition<LightingState> = {
  id: "lighting",
  name: "Iluminación",
  description: "Controla la atmósfera lumínica de la escena.",
  icon: "Sun",
  category: "visual",
  version: "1.0.0",
  defaultState: { key: "none" },

  PanelComponent: ({ state, updateState }) => {
    const options = [
      { id: "high-key", label: "High Key" },
      { id: "low-key", label: "Low Key" },
      { id: "natural", label: "Natural Light" },
      { id: "none", label: "Predeterminado" },
    ] as const;

    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Badge
            key={opt.id}
            variant={state.key === opt.id ? "default" : "outline"}
            className="cursor-pointer py-1"
            onClick={() => updateState({ key: opt.id })}
          >
            {opt.label}
          </Badge>
        ))}
      </div>
    );
  },

  toPromptFragment: (state) => {
    if (state.key === "none") return "";
    return `[LIGHTING] Atmospheric lighting key: ${state.key}.`;
  },
};
