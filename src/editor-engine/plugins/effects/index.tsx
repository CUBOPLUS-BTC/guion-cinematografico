import React from "react";
import { PluginDefinition } from "../types";
import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EffectsState {
  vfx: {
    rain: boolean;
    smoke: boolean;
    fire: boolean;
  };
  sfx: {
    music: boolean;
    ambience: boolean;
  };
}

export const EffectsPlugin: PluginDefinition<EffectsState> = {
  id: "effects",
  name: "VFX / SFX",
  description: "Añade efectos visuales y sonoros ambientales.",
  icon: "Sparkles",
  category: "visual",
  version: "1.0.0",
  defaultState: {
    vfx: { rain: false, smoke: false, fire: false },
    sfx: { music: false, ambience: false }
  },

  PanelComponent: ({ state, updateState }) => {
    const toggleVfx = (key: keyof EffectsState['vfx']) => {
      updateState({ vfx: { ...state.vfx, [key]: !state.vfx[key] } });
    };

    const toggleSfx = (key: keyof EffectsState['sfx']) => {
      updateState({ sfx: { ...state.sfx, [key]: !state.sfx[key] } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-text-muted">Efectos Visuales (VFX)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={state.vfx.rain} onCheckedChange={() => toggleVfx('rain')} />
              <Label className="text-xs">Lluvia</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={state.vfx.smoke} onCheckedChange={() => toggleVfx('smoke')} />
              <Label className="text-xs">Humo/Niebla</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-text-muted">Efectos de Sonido (SFX)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={state.sfx.music} onCheckedChange={() => toggleSfx('music')} />
              <Label className="text-xs">Música/Score</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={state.sfx.ambience} onCheckedChange={() => toggleSfx('ambience')} />
              <Label className="text-xs">Ambiente</Label>
            </div>
          </div>
        </div>
      </div>
    );
  },

  toPromptFragment: (state) => {
    const activeVfx = Object.entries(state.vfx).filter(([_, v]) => v).map(([k]) => k);
    const activeSfx = Object.entries(state.sfx).filter(([_, v]) => v).map(([k]) => k);
    
    if (activeVfx.length === 0 && activeSfx.length === 0) return "";
    
    return `[EFFECTS] Active VFX: ${activeVfx.join(", ") || "None"}. Active SFX: ${activeSfx.join(", ") || "None"}.`;
  },
};
