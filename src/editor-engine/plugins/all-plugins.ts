import { pluginRegistry } from "./registry";
import { ShotsPlugin } from "./shots";
import { LightingPlugin } from "./lighting";
import { CameraPlugin } from "./camera";
import { EffectsPlugin } from "./effects";
import { DescriptionPlugin } from "./description";

/**
 * Inicializa y registra todos los plugins disponibles en el sistema.
 */
export function initializePlugins() {
  pluginRegistry.register(ShotsPlugin);
  pluginRegistry.register(LightingPlugin);
  pluginRegistry.register(CameraPlugin);
  pluginRegistry.register(EffectsPlugin);
  pluginRegistry.register(DescriptionPlugin)
}
