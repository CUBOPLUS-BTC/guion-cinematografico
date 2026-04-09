import { PluginDefinition } from "./types";

class PluginRegistry {
  private plugins: Map<string, PluginDefinition> = new Map();

  /**
   * Registra un nuevo plugin en el sistema.
   */
  public register(plugin: PluginDefinition): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin con ID "${plugin.id}" ya está registrado. Sobrescribiendo...`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Obtiene un plugin por su ID.
   */
  public get(id: string): PluginDefinition | undefined {
    return this.plugins.get(id);
  }

  /**
   * Retorna todos los plugins registrados.
   */
  public getAll(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Filtra plugins por categoría.
   */
  public getByCategory(category: string): PluginDefinition[] {
    return this.getAll().filter(p => p.category === category);
  }

  /**
   * Construye un prompt combinado basado en el estado actual de los plugins.
   */
  public buildCombinedPrompt(states: Record<string, any>): string {
    let combined = "";
    
    for (const [id, state] of Object.entries(states)) {
      const plugin = this.get(id);
      if (plugin && state) {
        const fragment = plugin.toPromptFragment(state);
        if (fragment) {
          combined += `\n${fragment}`;
        }
      }
    }
    
    return combined;
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();
