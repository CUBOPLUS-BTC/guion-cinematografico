import React from "react";
import { PluginDefinition } from "../types";
import { Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CameraState {
  lens: string;
}

export const CameraPlugin: PluginDefinition<CameraState> = {
  id: "camera",
  name: "Cámara y Lentes",
  description: "Selección técnica de ópticas y sensores.",
  icon: "Camera",
  category: "cinematography",
  version: "1.0.0",
  defaultState: { lens: "35mm" },

  PanelComponent: ({ state, updateState }) => {
    const lenses = ["14mm", "24mm", "35mm", "50mm", "85mm", "Anamorphic"];
    
    return (
      <div className="flex flex-wrap gap-2">
        {lenses.map((lens) => (
          <Badge
            key={lens}
            variant={state.lens === lens ? "default" : "outline"}
            className="cursor-pointer py-1"
            onClick={() => updateState({ lens })}
          >
            {lens}
          </Badge>
        ))}
      </div>
    );
  },

  toPromptFragment: (state) => {
    if (!state.lens) return "";
    return `[CAMERA] Shooting with ${state.lens} lens optics.`;
  },
};
