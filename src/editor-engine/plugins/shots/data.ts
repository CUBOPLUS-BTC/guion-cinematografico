/** Catálogo alineado con specs/06-sistema-plugins.md — §6.3 Planos */

export type ShotOption = { id: string; label: string; category: string }

export const SHOT_CATALOG: ShotOption[] = [
  // Por tamaño
  { id: "ELS", label: "Extreme Long Shot (ELS)", category: "Tamaño" },
  { id: "LS", label: "Long Shot / Wide Shot (LS/WS)", category: "Tamaño" },
  { id: "FS", label: "Full Shot (FS)", category: "Tamaño" },
  { id: "MLS", label: "Medium Long Shot / Cowboy (MLS)", category: "Tamaño" },
  { id: "MS", label: "Medium Shot (MS)", category: "Tamaño" },
  { id: "MCU", label: "Medium Close-Up (MCU)", category: "Tamaño" },
  { id: "CU", label: "Close-Up (CU)", category: "Tamaño" },
  { id: "ECU", label: "Extreme Close-Up (ECU)", category: "Tamaño" },
  { id: "INSERT", label: "Insert Shot", category: "Tamaño" },
  // Por ángulo
  { id: "EYE", label: "Eye Level", category: "Ángulo" },
  { id: "LOW", label: "Low Angle", category: "Ángulo" },
  { id: "HIGH", label: "High Angle", category: "Ángulo" },
  { id: "BIRD", label: "Bird's Eye / Top Down", category: "Ángulo" },
  { id: "WORM", label: "Worm's Eye", category: "Ángulo" },
  { id: "DUTCH", label: "Dutch Angle / Canted", category: "Ángulo" },
  { id: "OTS", label: "Over-the-Shoulder (OTS)", category: "Ángulo" },
  { id: "POV", label: "Point of View (POV)", category: "Ángulo" },
  // Por movimiento
  { id: "STATIC", label: "Static (Tripod)", category: "Movimiento" },
  { id: "PAN", label: "Pan (Left/Right)", category: "Movimiento" },
  { id: "TILT", label: "Tilt (Up/Down)", category: "Movimiento" },
  { id: "DOLLY", label: "Dolly / Tracking", category: "Movimiento" },
  { id: "CRANE", label: "Crane / Jib", category: "Movimiento" },
  { id: "STEADICAM", label: "Steadicam / Gimbal", category: "Movimiento" },
  { id: "HANDHELD", label: "Handheld", category: "Movimiento" },
  { id: "ZOOM", label: "Zoom (In/Out)", category: "Movimiento" },
  { id: "WHIP", label: "Whip Pan", category: "Movimiento" },
  { id: "RACK", label: "Rack Focus", category: "Movimiento" },
  { id: "PULL_FOCUS", label: "Pull Focus", category: "Movimiento" },
]
