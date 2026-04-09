import React from "react"
import { PluginDefinition } from "../types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SHOT_CATALOG } from "./data"

interface ShotsState {
  selected: string[]
}

export const ShotsPlugin: PluginDefinition<ShotsState> = {
  id: "shots",
  name: "Planos Cinematográficos",
  description: "Define el tamaño, ángulo y movimiento de cámara para la escena.",
  icon: "Video",
  category: "cinematography",
  version: "1.0.0",
  defaultState: { selected: [] },

  PanelComponent: ({ state, updateState }) => {
    const toggleShot = (id: string) => {
      const isSelected = state.selected.includes(id)
      updateState({
        selected: isSelected
          ? state.selected.filter((s) => s !== id)
          : [...state.selected, id],
      })
    }

    const byCategory = SHOT_CATALOG.reduce(
      (acc, shot) => {
        if (!acc[shot.category]) acc[shot.category] = []
        acc[shot.category].push(shot)
        return acc
      },
      {} as Record<string, typeof SHOT_CATALOG>
    )

    return (
      <ScrollArea className="max-h-64 pr-2">
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, shots]) => (
            <div key={category} className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-text-muted">{category}</p>
              <div className="flex flex-wrap gap-2">
                {shots.map((opt) => (
                  <Badge
                    key={opt.id}
                    title={opt.label}
                    variant={state.selected.includes(opt.id) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors py-1 text-left h-auto whitespace-normal"
                    onClick={() => toggleShot(opt.id)}
                  >
                    <span className="font-mono text-[10px]">{opt.id}</span>
                    <span className="sr-only"> — {opt.label}</span>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        {state.selected.length > 0 && (
          <p className="text-[10px] text-text-muted italic mt-3">
            Seleccionados:{" "}
            {state.selected
              .map((id) => SHOT_CATALOG.find((s) => s.id === id)?.label ?? id)
              .join(", ")}
          </p>
        )}
      </ScrollArea>
    )
  },

  toPromptFragment: (state) => {
    if (state.selected.length === 0) return ""
    const labels = state.selected
      .map((id) => SHOT_CATALOG.find((s) => s.id === id)?.label ?? id)
      .join(", ")
    return `[CINEMATOGRAPHY]\nShot plan: ${labels}.`
  },
}
