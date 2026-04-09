import { create } from "zustand";
import { pluginRegistry } from "../plugins/registry";

/** Payload guardado en `Project.settings.modifiers`. */
export type PluginModifiersSettings = {
  activePlugins: string[];
  states: Record<string, Record<string, unknown>>;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidPluginId(id: string): boolean {
  return Boolean(pluginRegistry.get(id));
}

interface PluginStoreState {
  /** Estados de datos de cada plugin { shots: { selected: [...] }, lighting: { key: 'low-key' } } */
  states: Record<string, Record<string, unknown>>;

  /** IDs de plugins activos para envío a la IA */
  activePlugins: string[];

  /** Cambios pendientes de guardar en `Project.settings` */
  isDirty: boolean;

  /** Actualizar estado de un plugin específico */
  updatePluginState: (pluginId: string, partial: Record<string, unknown>) => void;

  /** Activar/desactivar plugin */
  togglePlugin: (pluginId: string) => void;

  /** Obtener el contexto de prompt para la IA */
  getAIModifiers: () => string;

  /** Restaurar desde DB sin marcar dirty (tras `initializePlugins`) */
  hydrateFromSettings: (raw: unknown) => void;

  /** Snapshot para `Project.settings.modifiers` */
  getSettingsPayload: () => PluginModifiersSettings;

  markClean: () => void;
}

export const usePluginStore = create<PluginStoreState>((set, get) => ({
  states: {},
  activePlugins: [],
  isDirty: false,

  updatePluginState: (pluginId, partial) => {
    set((state) => ({
      isDirty: true,
      states: {
        ...state.states,
        [pluginId]: {
          ...((state.states[pluginId] ??
            (pluginRegistry.get(pluginId)?.defaultState as Record<string, unknown> | undefined) ??
            {}) as Record<string, unknown>),
          ...partial,
        },
      },
    }));
  },

  togglePlugin: (pluginId) => {
    set((state) => {
      const active = state.activePlugins.includes(pluginId);
      if (active) {
        return {
          isDirty: true,
          activePlugins: state.activePlugins.filter((id) => id !== pluginId),
        };
      }
      const def = pluginRegistry.get(pluginId)?.defaultState as
        | Record<string, unknown>
        | undefined;
      return {
        isDirty: true,
        activePlugins: [...state.activePlugins, pluginId],
        states: def
          ? {
              ...state.states,
              [pluginId]: {
                ...(state.states[pluginId] ?? {}),
                ...def,
              },
            }
          : state.states,
      };
    });
  },

  getAIModifiers: () => {
    const { states, activePlugins } = get();
    const activeStates: Record<string, Record<string, unknown>> = {};

    activePlugins.forEach((id) => {
      if (states[id]) activeStates[id] = states[id];
    });

    return pluginRegistry.buildCombinedPrompt(activeStates);
  },

  hydrateFromSettings: (raw) => {
    if (!isPlainObject(raw)) {
      set({ states: {}, activePlugins: [], isDirty: false });
      return;
    }

    const activeRaw = raw.activePlugins;
    const statesRaw = raw.states;

    const activePlugins = Array.isArray(activeRaw)
      ? activeRaw.filter((id): id is string => typeof id === "string" && isValidPluginId(id))
      : [];

    const states: Record<string, Record<string, unknown>> = {};

    if (isPlainObject(statesRaw)) {
      for (const [id, st] of Object.entries(statesRaw)) {
        if (!isValidPluginId(id) || !isPlainObject(st)) continue;
        const def = pluginRegistry.get(id)?.defaultState as Record<string, unknown> | undefined;
        states[id] = def ? { ...def, ...st } : { ...st };
      }
    }

    for (const id of activePlugins) {
      const def = pluginRegistry.get(id)?.defaultState as Record<string, unknown> | undefined;
      if (def) {
        states[id] = { ...def, ...(states[id] ?? {}) };
      }
    }

    set({ states, activePlugins, isDirty: false });
  },

  getSettingsPayload: () => {
    const { states, activePlugins } = get();
    return {
      activePlugins: [...activePlugins],
      states: structuredClone(states),
    };
  },

  markClean: () => set({ isDirty: false }),
}));
