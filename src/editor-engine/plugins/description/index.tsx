import React from "react";
import { PluginDefinition } from "../types";
import { Type } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface DescriptionState {
  depth: number;
}

export const DescriptionPlugin: PluginDefinition<DescriptionState> = {
  id: "description",
  name: "Profundidad Narrativa",
  description: "Controla qué tan descriptiva o concisa es la IA con las acciones.",
  icon: "Type",
  category: "narrative",
  version: "1.0.0",
  defaultState: { depth: 5 },

  PanelComponent: ({ state, updateState }) => {
    const getLabel = (val: number) => {
      if (val <= 2) return "Minimalista (Hemingway)";
      if (val <= 4) return "Funcional / Directo";
      if (val <= 6) return "Estándar de Guion";
      if (val <= 8) return "Descriptivo / Atmosférico";
      return "Inmersivo / Literario";
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[10px] text-text-muted font-bold uppercase">
          <span>Conciso</span>
          <span>Imersivo</span>
        </div>
        <Slider
          value={[state.depth]}
          min={1}
          max={10}
          step={1}
          onValueChange={(val) => updateState({ depth: val[0] })}
        />
        <p className="text-center text-xs text-accent font-medium">
          {getLabel(state.depth)}
        </p>
      </div>
    );
  },

  toPromptFragment: (state) => {
    return `[NARRATIVE STYLE] Description depth: ${state.depth}/10. (1=concise, 10=rich/immersive descriptions).`;
  },
};
