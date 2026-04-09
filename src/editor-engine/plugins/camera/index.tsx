import React from "react"
import { PluginDefinition } from "../types"
import { Badge } from "@/components/ui/badge"
import {
  CAMERA_BODIES,
  DEPTH_OF_FIELD,
  F_STOPS,
  LENS_FOCALS,
} from "./data"

export interface CameraState {
  bodyId: string
  lens: string
  fStop: string
  dof: string
}

const defaultBody = CAMERA_BODIES[0]?.id ?? "alexa-35"

export const CameraPlugin: PluginDefinition<CameraState> = {
  id: "camera",
  name: "Cámara y Lentes",
  description: "Cuerpo, focal, apertura y profundidad de campo.",
  icon: "Camera",
  category: "cinematography",
  version: "1.0.0",
  defaultState: {
    bodyId: defaultBody,
    lens: "35mm",
    fStop: "f/2.8",
    dof: "medium",
  },

  PanelComponent: ({ state, updateState }) => {
    const byBrand = CAMERA_BODIES.reduce(
      (acc, cam) => {
        if (!acc[cam.brand]) acc[cam.brand] = []
        acc[cam.brand].push(cam)
        return acc
      },
      {} as Record<string, typeof CAMERA_BODIES>
    )

    return (
      <div className="space-y-4">
        {Object.entries(byBrand).map(([brand, cams]) => (
          <div key={brand} className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-text-muted">{brand}</p>
            <div className="flex flex-wrap gap-2">
              {cams.map((cam) => (
                <Badge
                  key={cam.id}
                  variant={state.bodyId === cam.id ? "default" : "outline"}
                  className="cursor-pointer py-1 text-[10px]"
                  onClick={() => updateState({ bodyId: cam.id })}
                >
                  {cam.label}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-text-muted">Lentes</p>
          <div className="flex flex-wrap gap-2">
            {LENS_FOCALS.map((lens) => (
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
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-text-muted">Apertura</p>
          <div className="flex flex-wrap gap-2">
            {F_STOPS.map((f) => (
              <Badge
                key={f}
                variant={state.fStop === f ? "default" : "outline"}
                className="cursor-pointer py-1 font-mono text-[10px]"
                onClick={() => updateState({ fStop: f })}
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-text-muted">Profundidad de campo</p>
          <div className="flex flex-wrap gap-2">
            {DEPTH_OF_FIELD.map((d) => (
              <Badge
                key={d.id}
                variant={state.dof === d.id ? "default" : "outline"}
                className="cursor-pointer py-1"
                onClick={() => updateState({ dof: d.id })}
              >
                {d.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  },

  toPromptFragment: (state) => {
    const body = CAMERA_BODIES.find((c) => c.id === state.bodyId)
    return `[CAMERA & LENS]\nCamera: ${body?.label ?? state.bodyId}\nLens: ${state.lens} at ${state.fStop}\nDepth of field: ${state.dof}`
  },
}
