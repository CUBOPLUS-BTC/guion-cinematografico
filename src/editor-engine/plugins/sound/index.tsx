import React from "react"
import { PluginDefinition } from "../types"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AMBIENT_OPTIONS,
  INTENSITY_OPTIONS,
  MUSIC_GENRE_OPTIONS,
  SFX_FOCUS_OPTIONS,
} from "./data"

export interface SoundState {
  ambient: (typeof AMBIENT_OPTIONS)[number]["id"]
  musicGenre: (typeof MUSIC_GENRE_OPTIONS)[number]["id"]
  intensity: (typeof INTENSITY_OPTIONS)[number]["id"]
  sfxFocus: (typeof SFX_FOCUS_OPTIONS)[number]["id"]
}

function labelFor<T extends { id: string; label: string }>(
  options: readonly T[],
  id: string
): string {
  return options.find((o) => o.id === id)?.label ?? id
}

export const SoundPlugin: PluginDefinition<SoundState> = {
  id: "sound",
  name: "Sonido y música",
  description:
    "Ambiente sonoro, música sugerida e intensidad para que la IA detalle [SONIDO] y [MUSICA].",
  icon: "Mic2",
  category: "audio",
  version: "1.0.0",
  defaultState: {
    ambient: "urban",
    musicGenre: "orchestral",
    intensity: "moderate",
    sfxFocus: "foley",
  },

  PanelComponent: ({ state, updateState }) => (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Ambiente</Label>
        <Select
          value={state.ambient}
          onValueChange={(v) =>
            updateState({ ambient: v as SoundState["ambient"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AMBIENT_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Música (estilo)</Label>
        <Select
          value={state.musicGenre}
          onValueChange={(v) =>
            updateState({ musicGenre: v as SoundState["musicGenre"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MUSIC_GENRE_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Intensidad</Label>
        <Select
          value={state.intensity}
          onValueChange={(v) =>
            updateState({ intensity: v as SoundState["intensity"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTENSITY_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Foco SFX</Label>
        <Select
          value={state.sfxFocus}
          onValueChange={(v) =>
            updateState({ sfxFocus: v as SoundState["sfxFocus"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SFX_FOCUS_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  ),

  toPromptFragment: (state) => {
    return `[AUDIO]\nAmbiente preferido: ${labelFor([...AMBIENT_OPTIONS], state.ambient)}. Música sugerida: ${labelFor([...MUSIC_GENRE_OPTIONS], state.musicGenre)}. Intensidad: ${labelFor([...INTENSITY_OPTIONS], state.intensity)}. Foco SFX: ${labelFor([...SFX_FOCUS_OPTIONS], state.sfxFocus)}. Incluir líneas [SONIDO] y [MUSICA] acordes a esto.`
  },
}
