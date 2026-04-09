import React from "react";

export type PluginCategory = 'cinematography' | 'audio' | 'visual' | 'narrative';

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
  toDocumentMetadata?: (state: T) => Record<string, any>;
}

export interface PluginAIContext {
  [pluginId: string]: string; // fragmentos de prompt por plugin
}
