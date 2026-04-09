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

const WEATHER = [
  { id: "clear", label: "Despejado" },
  { id: "rain", label: "Lluvia" },
  { id: "fog", label: "Niebla" },
  { id: "snow", label: "Nieve" },
  { id: "storm", label: "Tormenta" },
  { id: "heat", label: "Calor / bochorno" },
] as const

const TIME_OF_DAY = [
  { id: "dawn", label: "Amanecer" },
  { id: "morning", label: "Mañana" },
  { id: "noon", label: "Mediodía" },
  { id: "golden", label: "Hora dorada" },
  { id: "night", label: "Noche" },
  { id: "deep_night", label: "Madrugada" },
] as const

const DRAMATIC = [
  { id: "low", label: "Baja tensión" },
  { id: "medium", label: "Media" },
  { id: "high", label: "Alta tensión" },
  { id: "climax", label: "Clímax" },
] as const

const PACE = [
  { id: "slow", label: "Lento / contemplativo" },
  { id: "steady", label: "Constante" },
  { id: "dynamic", label: "Dinámico" },
  { id: "frantic", label: "Frenético" },
] as const

function labelFor<T extends { id: string; label: string }>(
  options: readonly T[],
  id: string
): string {
  return options.find((o) => o.id === id)?.label ?? id
}

export interface EventsState {
  weather: (typeof WEATHER)[number]["id"]
  timeOfDay: (typeof TIME_OF_DAY)[number]["id"]
  dramatic: (typeof DRAMATIC)[number]["id"]
  pace: (typeof PACE)[number]["id"]
}

export const EventsPlugin: PluginDefinition<EventsState> = {
  id: "events",
  name: "Eventos de escena",
  description: "Clima, momento del día, intensidad dramática y ritmo para coherencia entre escenas.",
  icon: "CloudSun",
  category: "narrative",
  version: "1.0.0",
  defaultState: {
    weather: "clear",
    timeOfDay: "night",
    dramatic: "medium",
    pace: "steady",
  },

  PanelComponent: ({ state, updateState }) => (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Clima</Label>
        <Select
          value={state.weather}
          onValueChange={(v) =>
            updateState({ weather: v as EventsState["weather"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEATHER.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Momento del día</Label>
        <Select
          value={state.timeOfDay}
          onValueChange={(v) =>
            updateState({ timeOfDay: v as EventsState["timeOfDay"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_OF_DAY.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Intensidad dramática</Label>
        <Select
          value={state.dramatic}
          onValueChange={(v) =>
            updateState({ dramatic: v as EventsState["dramatic"] })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DRAMATIC.map((o) => (
              <SelectItem key={o.id} value={o.id} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase text-text-muted">Ritmo</Label>
        <Select
          value={state.pace}
          onValueChange={(v) => updateState({ pace: v as EventsState["pace"] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PACE.map((o) => (
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
    return `[EVENTOS DE ESCENA]\nClima: ${labelFor(WEATHER, state.weather)}. Momento: ${labelFor(TIME_OF_DAY, state.timeOfDay)}. Intensidad dramática: ${labelFor(DRAMATIC, state.dramatic)}. Ritmo: ${labelFor(PACE, state.pace)}. Reflejar en encabezados, acción y [CAMARA] cuando aplique.`
  },
}
