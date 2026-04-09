import { create } from "zustand";
import { pluginRegistry } from "../plugins/registry";

interface PluginStoreState {
  /** Estados de datos de cada plugin { shots: { selected: [...] }, lighting: { key: 'low-key' } } */
  states: Record<string, any>;
  
  /** IDs de plugins activos para envío a la IA */
  activePlugins: string[];
  
  /** Actualizar estado de un plugin específico */
  updatePluginState: (pluginId: string, partial: any) => void;
  
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
          ...(state.states[pluginId] || pluginRegistry.get(pluginId)?.defaultState || {}),
          ...partial,
        },
      },
    }));
  },

  togglePlugin: (pluginId) => {
    set((state) => {
      const active = state.activePlugins.includes(pluginId);
      return {
        activePlugins: active
          ? state.activePlugins.filter(id => id !== pluginId)
          : [...state.activePlugins, pluginId]
      };
    });
  },

  getAIModifiers: () => {
    const { states, activePlugins } = get();
    const activeStates: Record<string, any> = {};
    
    activePlugins.forEach(id => {
      if (states[id]) activeStates[id] = states[id];
    });

    return pluginRegistry.buildCombinedPrompt(activeStates);
  }
}));
