import { create } from "zustand";
import { pluginRegistry } from "../plugins/registry";

interface PluginStoreState {
  /** Estados de datos de cada plugin { shots: { selected: [...] }, lighting: { key: 'low-key' } } */
  states: Record<string, Record<string, unknown>>;
  
  /** IDs de plugins activos para envío a la IA */
  activePlugins: string[];
  
  /** Actualizar estado de un plugin específico */
  updatePluginState: (pluginId: string, partial: Record<string, unknown>) => void;
  
  /** Activar/desactivar plugin */
  togglePlugin: (pluginId: string) => void;
  
  /** Obtener el contexto de prompt para la IA */
  getAIModifiers: () => string;
}

export const usePluginStore = create<PluginStoreState>((set, get) => ({
  states: {},
  activePlugins: [],

  updatePluginState: (pluginId, partial) => {
    set((state) => ({
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
          activePlugins: state.activePlugins.filter((id) => id !== pluginId),
        };
      }
      const def = pluginRegistry.get(pluginId)?.defaultState as
        | Record<string, unknown>
        | undefined;
      return {
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
    
    activePlugins.forEach(id => {
      if (states[id]) activeStates[id] = states[id];
    });

    return pluginRegistry.buildCombinedPrompt(activeStates);
  }
}));
