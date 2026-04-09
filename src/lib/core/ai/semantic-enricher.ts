/**
 * Enriquecedor semántico: inyecta etiquetas de producción ([CAMARA], [ESCENOGRAFIA], etc.)
 * en el output de la IA cuando el modelo no las generó por sí mismo.
 */

// Palabras clave que sugieren descripción de espacio/escenografía
const SCENOGRAPHY_HINTS = [
  /pared(es)?/i, /suelo/i, /techo/i, /ventana/i, /puerta/i, /espacio/i,
  /oscur/i, /ilumina/i, /luz/i, /sombra/i, /polvo/i, /óxido/i, /oxido/i,
  /chatarra/i, /concreto/i, /metal/i, /ambiente/i, /atmósfera/i, /atmosfera/i,
  /sala/i, /cuarto/i, /habitación/i, /habitacion/i, /interior/i, /exterior/i,
  /montón/i, /monton/i, /apilad/i, /decorad/i,
]

// Palabras clave de cámara
const CAMERA_HINTS = [
  /plano\s+(general|medio|detalle|americano|close)/i,
  /close.?up/i, /primer\s+plano/i, /gran\s+angular/i,
  /ángulo/i, /angulo/i, /cámara/i, /camara/i,
  /encuadre/i, /travelling/i, /dolly/i, /pan\s/i, /tilt/i,
  /zoom/i, /lente/i, /focus/i, /rack\s+focus/i, /slow\s+motion/i,
  /120fps/i, /24fps/i, /contraluz/i, /picado/i, /contrapicado/i,
]

// Palabras clave de sonido
const SOUND_HINTS = [
  /ruido/i, /sonido/i, /estruendo/i, /golpe/i, /crack/i, /crujido/i,
  /silencio/i, /eco/i, /reverb/i, /ambiente sonoro/i, /off-screen/i,
  /chirrido/i, /explosión/i, /explosion/i, /disparo/i, /latido/i,
  /respiración/i, /respiracion/i, /susurro/i, /grito/i,
]

// Palabras clave de música
const MUSIC_HINTS = [
  /música/i, /musica/i, /melodía/i, /melodia/i, /acorde/i, /nota\s/i,
  /orquesta/i, /coral/i, /cuerda/i, /piano/i, /tambor/i, /ritmo/i,
  /tensión musical/i, /crescendo/i, /leitmotiv/i,
]

function countMatches(line: string, hints: RegExp[]): number {
  return hints.filter(re => re.test(line)).length
}

function hasSemanticTag(line: string): boolean {
  return /^\[(ESCENOGRAFIA|CAMARA|SONIDO|MUSICA|ESCENOGRAFÍA|CÁMARA|MÚSICA)\]/i.test(line)
}

function isStructuralLine(line: string): boolean {
  const t = line.trim()
  return (
    /^(INT\.|EXT\.|EST\.)/i.test(t) ||  // scene heading
    /^\[\[/.test(t) ||                    // timing note
    /^[A-ZÁÉÍÓÚÜÑ0-9\s\(\)]{3,}$/.test(t) ||     // character name (all caps)
    /^\(/.test(t) ||                      // parenthetical
    /^>/.test(t) ||                       // transition
    /^#/.test(t) ||                       // section
    t.length === 0
  )
}

/**
 * Enriquece el texto Fountain añadiendo etiquetas semánticas automáticamente
 * cuando la IA no las generó.
 */
export function enrichFountainWithSemanticTags(fountain: string): string {
  // Si ya tiene etiquetas semánticas suficientes, no procesar
  const existingTags = (fountain.match(/\[(ESCENOGRAFIA|CAMARA|SONIDO|MUSICA)/gi) ?? []).length
  const totalLines = fountain.split("\n").filter(l => l.trim()).length
  if (existingTags >= Math.floor(totalLines * 0.1)) return fountain // ya tiene >10% de líneas etiquetadas

  const lines = fountain.split(/\r?\n/)
  const result: string[] = []
  let inScene = false
  let sceneDescriptionAdded = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detectar encabezado de escena
    if (/^(INT\.|EXT\.|EST\.)/i.test(trimmed)) {
      inScene = true
      sceneDescriptionAdded = false
      result.push(line)
      // Agregar timing si no hay uno a continuación
      const nextLine = (lines[i + 1] ?? "").trim()
      if (!nextLine.startsWith("[[")) {
        result.push(`[[Escena en curso]]`)
      }
      continue
    }

    // Si la línea ya tiene etiqueta, pasar tal cual
    if (hasSemanticTag(trimmed)) {
      result.push(line)
      continue
    }

    // No procesar líneas estructurales
    if (isStructuralLine(trimmed)) {
      result.push(line)
      continue
    }

    if (!inScene || !trimmed) {
      result.push(line)
      continue
    }

    // Analizar el contenido para determinar si necesita etiqueta
    const scenoScore = countMatches(trimmed, SCENOGRAPHY_HINTS)
    const camScore = countMatches(trimmed, CAMERA_HINTS)
    const soundScore = countMatches(trimmed, SOUND_HINTS)
    const musicScore = countMatches(trimmed, MUSIC_HINTS)
    const maxScore = Math.max(scenoScore, camScore, soundScore, musicScore)

    if (maxScore === 0) {
      // Línea de acción pura — si es la primera descripción de la escena, marcarla como escenografía
      if (!sceneDescriptionAdded && trimmed.length > 30) {
        result.push(`[ESCENOGRAFIA] ${trimmed}`)
        sceneDescriptionAdded = true
        continue
      }
    } else if (camScore === maxScore && camScore >= 1) {
      result.push(`[CAMARA] ${trimmed}`)
      continue
    } else if (soundScore === maxScore && soundScore >= 1) {
      result.push(`[SONIDO] ${trimmed}`)
      continue
    } else if (musicScore === maxScore && musicScore >= 1) {
      result.push(`[MUSICA] ${trimmed}`)
      continue
    } else if (scenoScore === maxScore && scenoScore >= 1) {
      if (!sceneDescriptionAdded) {
        result.push(`[ESCENOGRAFIA] ${trimmed}`)
        sceneDescriptionAdded = true
        continue
      }
    }

    result.push(line)
  }

  return result.join("\n")
}
