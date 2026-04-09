import type {
  FountainBlock,
  FountainElementType,
  FountainSemanticTag,
} from "@/types/fountain"

let blockIdCounter = 0
function nextBlockId(): string {
  blockIdCounter += 1
  return `blk-${blockIdCounter}-${Math.random().toString(36).slice(2, 9)}`
}

export function resetBlockIdCounter(): void {
  blockIdCounter = 0
}

const SEMANTIC_PREFIXES: Array<{
  re: RegExp
  tag: FountainSemanticTag
}> = [
  { re: /^\[ESCENOGRAF[IÍ]A\]\s*/i, tag: "scenography" },
  { re: /^\[SONIDO\]\s*/i, tag: "sound" },
  { re: /^\[M[UÚ]SICA\]\s*/i, tag: "music" },
  { re: /^\[C[ÁA]MARA\]\s*/i, tag: "camera" },
]

function stripSemanticPrefix(
  line: string
): { tag: FountainSemanticTag; text: string } {
  const trimmed = line.trim()
  for (const { re, tag } of SEMANTIC_PREFIXES) {
    if (re.test(trimmed)) {
      return {
        tag,
        text: trimmed.replace(re, "").trim(),
      }
    }
  }
  return { tag: "none", text: trimmed }
}

function isTimeNoteLine(line: string): boolean {
  return /^\[\[.*\]\]$/.test(line.trim())
}

function parseTimeFromLine(line: string): string {
  const m = line.trim().match(/^\[\[(.*)\]\]$/)
  return m ? m[1].trim() : line.trim()
}

/** Scene heading, transition, character regexes aligned with FountainTokenizer */
const SCENE_HEADING_REGEX =
  /^(INT|EXT|EST|I\/E|INT\.?\/EXT\.?|INT\.|EXT\.)[\s\.]/i
const TRANSITION_REGEX = /^(.*TO:)$|^(>.*)$/
const CHARACTER_REGEX = /^[A-Z0-9\s\(\)\d]+(\s\^)?$/
const PARENTHETICAL_REGEX = /^\(.*\)$/

/**
 * Parsea un guion Fountain en bloques con etiquetas semánticas para el editor.
 */
export function parseFountainToBlocks(fountain: string): FountainBlock[] {
  resetBlockIdCounter()
  const lines = fountain.split(/\r?\n/)
  const blocks: FountainBlock[] = []
  let lastType: FountainElementType | null = null

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const line = rawLine.trim()

    if (line === "") {
      lastType = null
      continue
    }

    let type: FountainElementType = "action"
    let semanticTag: FountainSemanticTag = "none"
    let displayText = line.startsWith(".") || (line.startsWith(">") && line.endsWith("<"))
      ? line.startsWith(">")
        ? line.slice(1, -1).trim()
        : line.substring(1).trim()
      : line

    if (isTimeNoteLine(line)) {
      type = "note"
      semanticTag = "time"
      displayText = parseTimeFromLine(line)
    } else if (SCENE_HEADING_REGEX.test(line) || line.startsWith(".")) {
      type = "scene_heading"
    } else if (PARENTHETICAL_REGEX.test(line)) {
      type = "parenthetical"
    } else if (TRANSITION_REGEX.test(line)) {
      type = "transition"
    } else if (line.startsWith(">") && line.endsWith("<")) {
      type = "centered"
    } else if (line.startsWith("#")) {
      type = "section"
    } else if (CHARACTER_REGEX.test(line) && lastType === null) {
      type = "character"
    } else if (lastType === "character" || lastType === "parenthetical") {
      type = "dialogue"
    } else {
      type = "action"
      const stripped = stripSemanticPrefix(line)
      if (stripped.tag !== "none") {
        semanticTag = stripped.tag
        displayText = stripped.text
      }
    }

    blocks.push({
      id: nextBlockId(),
      type,
      text: displayText,
      semanticTag,
      metadata:
        semanticTag === "time"
          ? { rawLine: line }
          : semanticTag !== "none"
            ? { originalPrefix: true }
            : undefined,
    })

    lastType = type
  }

  return blocks
}

function lineForBlock(block: FountainBlock): string {
  const { type, text, semanticTag } = block

  if (type === "note" && semanticTag === "time") {
    return `[[${text}]]`
  }

  const body = text

  switch (type) {
    case "scene_heading":
      if (body && !body.match(/^(INT|EXT|EST)/i)) {
        return `.${body.toUpperCase()}`
      }
      return body
    case "character":
      return body.toUpperCase()
    case "transition":
      if (body.startsWith(">")) return body
      return body.toUpperCase().endsWith("TO:")
        ? body
        : `> ${body.toUpperCase()}`
    case "centered":
      return `> ${body} <`
    case "section":
      return body.startsWith("#") ? body : `# ${body}`
    case "parenthetical":
      return body.startsWith("(") ? body : `(${body})`
    case "action": {
      if (semanticTag === "scenography") return `[ESCENOGRAFIA] ${body}`
      if (semanticTag === "sound") return `[SONIDO] ${body}`
      if (semanticTag === "music") return `[MUSICA] ${body}`
      if (semanticTag === "camera") return `[CAMARA] ${body}`
      return body
    }
    default:
      return body
  }
}

/**
 * Reconstruye el string Fountain a partir de bloques editados.
 */
export function blocksToFountain(blocks: FountainBlock[]): string {
  return blocks.map(lineForBlock).join("\n\n")
}

/**
 * Actualiza el texto de un bloque por id y devuelve el nuevo Fountain completo.
 */
export function updateBlockText(
  blocks: FountainBlock[],
  id: string,
  newText: string
): FountainBlock[] {
  return blocks.map((b) =>
    b.id === id ? { ...b, text: newText } : b
  )
}
