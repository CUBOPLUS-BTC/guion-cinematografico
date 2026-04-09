import React from "react"
import { PluginDefinition } from "../types"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  LIGHTING_DIRECTION,
  LIGHTING_KEY,
  LIGHTING_QUALITY,
  LIGHTING_SCHEME,
  LIGHTING_TEMP,
} from "./data"

export interface LightingState {
  key: string
  direction: string
  quality: string
  temperature: string
  scheme: string
  intensity: number
}

const defaultState: LightingState = {
  key: "none",
  direction: "none",
  quality: "none",
  temperature: "none",
  scheme: "none",
  intensity: 5,
}

export const LightingPlugin: PluginDefinition<LightingState> = {
  id: "lighting",
  name: "Iluminación",
  description: "Clave, dirección, calidad, temperatura y esquema lumínico.",
  icon: "Sun",
  category: "visual",
  version: "1.0.0",
  defaultState,

  PanelComponent: ({ state, updateState }) => {
    const row = (
      label: string,
      options: readonly { id: string; label: string }[],
      field: keyof LightingState
    ) => (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase text-text-muted">{label}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Badge
              key={opt.id}
              variant={state[field] === opt.id ? "default" : "outline"}
              className="cursor-pointer py-1"
              onClick={() => updateState({ [field]: opt.id } as Partial<LightingState>)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>
    )

    return (
      <div className="space-y-4">
        {row("Clave", LIGHTING_KEY, "key")}
        {row("Dirección", LIGHTING_DIRECTION, "direction")}
        {row("Calidad", LIGHTING_QUALITY, "quality")}
        {row("Temperatura", LIGHTING_TEMP, "temperature")}
        {row("Esquema", LIGHTING_SCHEME, "scheme")}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-text-muted">Intensidad</p>
          <Slider
            value={[state.intensity]}
            min={1}
            max={10}
            step={1}
            onValueChange={(v) => updateState({ intensity: v[0] ?? 5 })}
          />
          <p className="text-[10px] text-center text-text-muted">{state.intensity}/10</p>
        </div>
      </div>
    )
  },

  toPromptFragment: (state) => {
    if (
      state.key === "none" &&
      state.direction === "none" &&
      state.quality === "none" &&
      state.temperature === "none" &&
      state.scheme === "none"
    ) {
      return ""
    }
    const parts: string[] = []
    if (state.key !== "none") parts.push(`Key: ${state.key}`)
    if (state.direction !== "none") parts.push(`Direction: ${state.direction}`)
    if (state.quality !== "none") parts.push(`Quality: ${state.quality}`)
    if (state.temperature !== "none") parts.push(`Temperature: ${state.temperature}`)
    if (state.scheme !== "none") parts.push(`Scheme: ${state.scheme}`)
    parts.push(`Intensity: ${state.intensity}/10`)
    return `[LIGHTING]\n${parts.join("\n")}`
  },
}
