import React from "react";

export type PluginCategory = 'cinematography' | 'audio' | 'visual' | 'narrative';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- plugins heterogéneos por diseño
export interface PluginDefinition<T = any> {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: PluginCategory;
  version: string;
  defaultState: T;
  
  // Componente para la UI del panel
  PanelComponent: React.ComponentType<{
    state: T;
    updateState: (partial: Partial<T>) => void;
  }>;
  
  // Generadores de prompts y metadata
  toPromptFragment: (state: T) => string;
  toDocumentMetadata?: (state: T) => Record<string, unknown>;
}

export interface PluginAIContext {
  [pluginId: string]: string; // fragmentos de prompt por plugin
}
