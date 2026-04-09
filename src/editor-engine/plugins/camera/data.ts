/** specs/06-sistema-plugins.md — §6.5 Cámara / Lente */

export const CAMERA_BODIES: { id: string; label: string; brand: string }[] = [
  { brand: "ARRI", id: "alexa-35", label: "ALEXA 35" },
  { brand: "ARRI", id: "alexa-mini-lf", label: "ALEXA Mini LF" },
  { brand: "ARRI", id: "alexa-mini", label: "ALEXA Mini" },
  { brand: "ARRI", id: "amira", label: "AMIRA" },
  { brand: "RED", id: "v-raptor-x", label: "V-RAPTOR [X]" },
  { brand: "RED", id: "komodo-x", label: "KOMODO-X" },
  { brand: "RED", id: "komodo", label: "KOMODO" },
  { brand: "Sony", id: "venice-2", label: "VENICE 2" },
  { brand: "Sony", id: "fx9", label: "FX9" },
  { brand: "Sony", id: "fx6", label: "FX6" },
  { brand: "Sony", id: "fx3", label: "FX3" },
  { brand: "Canon", id: "c500-ii", label: "EOS C500 Mark II" },
  { brand: "Canon", id: "c300-iii", label: "EOS C300 Mark III" },
  { brand: "Canon", id: "c70", label: "EOS C70" },
  { brand: "Blackmagic", id: "ursa-12k", label: "URSA Mini Pro 12K" },
  { brand: "Blackmagic", id: "ursa-g2", label: "URSA Mini Pro G2" },
  { brand: "Blackmagic", id: "pocket-6k", label: "Pocket 6K Pro" },
  { brand: "Panavision", id: "dxl2", label: "Millennium DXL2" },
  { brand: "Panavision", id: "genesis", label: "Genesis" },
]

export const LENS_FOCALS = [
  "14mm",
  "18mm",
  "21mm",
  "24mm",
  "28mm",
  "35mm",
  "40mm",
  "50mm",
  "85mm",
  "100mm",
  "135mm",
  "200mm",
  "24-70mm",
  "70-200mm",
  "28-300mm",
  "Anamórfico 2x",
  "Macro",
  "Tilt-Shift",
  "Probe",
] as const

export const F_STOPS = ["f/1.4", "f/2", "f/2.8", "f/4", "f/5.6", "f/8", "f/11", "f/16"] as const

export const DEPTH_OF_FIELD = [
  { id: "shallow", label: "Shallow (bokeh)" },
  { id: "medium", label: "Medium" },
  { id: "deep", label: "Deep" },
] as const
