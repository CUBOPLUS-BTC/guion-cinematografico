import React from "react"
import { PluginDefinition } from "../types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ERA_OPTIONS, PALETTE_OPTIONS, VISUAL_STYLE_OPTIONS } from "./data"

export interface ScenographyState {
  era: (typeof ERA_OPTIONS)[number]["id"]
  visualStyle: (typeof VISUAL_STYLE_OPTIONS)[number]["id"]
  palette: (typeof PALETTE_OPTIONS)[number]["id"]
  setPieces: string
}

function labelFor<T extends { id: string; label: string }>(
  options: readonly T[],
  id: string
): string {
  return options.find((o) => o.id === id)?.label ?? id
}

export const ScenographyPlugin: PluginDefinition<ScenographyState> = {
  id: "scenography",
  name: "Escenografía",
  description: "Época, estilo visual, paleta y elementos clave del set para [ESCENOGRAFIA].",
  icon: "Image",
  category: "visual",
  version: "1.0.0",
  defaultState: {
    era: "contemporary",
    visualStyle: "realistic",
    palette: "neutral",
    setPieces: "",
  },

  PanelComponent: ({ state, updateState }) => (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Época</Label>
        <Select
          value={state.era}
          onValueChange={(v) => updateState({ era: v as ScenographyState["era"] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ERA_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Estilo visual</Label>
        <Select
          value={state.visualStyle}
          onValueChange={(v) =>
            updateState({ visualStyle: v as ScenographyState["visualStyle"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISUAL_STYLE_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Paleta</Label>
        <Select
          value={state.palette}
          onValueChange={(v) =>
            updateState({ palette: v as ScenographyState["palette"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PALETTE_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">
          Objetos / set (opcional)
        </Label>
        <Input
          value={state.setPieces}
          onChange={(e) => updateState({ setPieces: e.target.value })}
          placeholder="Ej. ventana, mesa, lluvia en cristal…"
          className="h-8 text-xs"
        />
      </div>
    </div>
  ),

  toPromptFragment: (state) => {
    const pieces = state.setPieces.trim()
    return `[ESCENOGRAFIA — contexto]\nÉpoca: ${labelFor([...ERA_OPTIONS], state.era)}. Estilo: ${labelFor([...VISUAL_STYLE_OPTIONS], state.visualStyle)}. Paleta: ${labelFor([...PALETTE_OPTIONS], state.palette)}.${pieces ? ` Elementos de set prioritarios: ${pieces}.` : ""} Usar líneas [ESCENOGRAFIA] detalladas en acción.`
  },
}
