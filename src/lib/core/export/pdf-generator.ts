import { jsPDF } from "jspdf"
import { FountainElement } from "@/types/fountain"

export interface PDFExportOptions {
  includeTitlePage?: boolean
  includeSceneNumbers?: boolean
  revision?: string
  author?: string
  program?: string
}

// ── Constantes de diseño ──────────────────────────────────────────────────
const PAGE_W = 8.5
const PAGE_H = 11
const MARGIN = { top: 0.9, bottom: 0.8, left: 1.0, right: 0.8 }
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right   // 6.7"
const FONT_SIZE = 11
const LH = 0.175      // line height in inches (~12.6pt)
const LH_SM = 0.145   // small line height

// RGB helpers
const rgb = (r: number, g: number, b: number) => ({ r, g, b })
const COLORS = {
  // Backgrounds (light - for light blocks)
  sceneBg:    rgb(235, 242, 255),   // blue-50
  charBg:     rgb(255, 245, 235),   // orange-50
  scenoBg:    rgb(236, 253, 245),   // emerald-50
  cameraBg:   rgb(253, 240, 255),   // fuchsia-50
  soundBg:    rgb(240, 249, 255),   // sky-50
  musicBg:    rgb(245, 243, 255),   // violet-50
  timingBg:   rgb(255, 251, 235),   // amber-50
  sectionBg:  rgb(255, 252, 245),   // accent/50

  // Borders / accent lines
  sceneBar:   rgb(59, 130, 246),    // blue-500
  charBar:    rgb(249, 115, 22),    // orange-500
  scenoBar:   rgb(16, 185, 129),    // emerald-500
  cameraBar:  rgb(217, 70, 239),    // fuchsia-500
  soundBar:   rgb(14, 165, 233),    // sky-500
  musicBar:   rgb(139, 92, 246),    // violet-500
  timingBar:  rgb(245, 158, 11),    // amber-500
  accentBar:  rgb(180, 120, 40),    // accent

  // Text
  sceneText:  rgb(29, 78, 216),     // blue-700
  charText:   rgb(194, 65, 12),     // orange-700
  scenoText:  rgb(4, 120, 87),      // emerald-700
  cameraText: rgb(162, 28, 175),    // fuchsia-700
  soundText:  rgb(3, 105, 161),     // sky-700
  musicText:  rgb(109, 40, 217),    // violet-700
  timingText: rgb(146, 64, 14),     // amber-800
  black:      rgb(15, 15, 15),
  dark:       rgb(40, 40, 50),
  muted:      rgb(120, 120, 140),
  accentText: rgb(160, 100, 20),
}

// ── Tipos semánticos detectados por prefijo ──────────────────────────────
const SEMANTIC = /^\[(ESCENOGRAF[IÍ]A|C[AÁ]MARA|SONIDO|M[UÚ]SICA|ILUMINACI[OÓ]N|VFX)\]\s*/i
const TIMING   = /^\[\[(.+)\]\]$/
const TRANS    = /^(>\s*)(.+)$/

function detectSemantic(text: string): { tag: string; body: string } | null {
  const m = text.match(SEMANTIC)
  if (!m) return null
  const tag = m[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  return { tag, body: text.replace(SEMANTIC, "").trim() }
}

// ── PDF Generator ────────────────────────────────────────────────────────

export class PDFGenerator {
  public static generate(
    title: string,
    elements: FountainElement[],
    options: PDFExportOptions = {}
  ): Blob {
    const doc = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" })

    let y = MARGIN.top
    let sceneNum = 0
    doc.setFont("helvetica", "normal")
    doc.setFontSize(FONT_SIZE)

    const newPage = () => {
      doc.addPage()
      y = MARGIN.top
      // Número de página
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
      doc.text(`${doc.getNumberOfPages()}`, PAGE_W - MARGIN.right, PAGE_H - 0.4, { align: "right" })
      doc.setFontSize(FONT_SIZE)
    }

    const checkPage = (needed: number) => {
      if (y + needed > PAGE_H - MARGIN.bottom) newPage()
    }

    const setColor = (c: { r: number; g: number; b: number }) =>
      doc.setTextColor(c.r, c.g, c.b)

    // Draw a colored filled rectangle
    const fillRect = (x: number, ry: number, w: number, h: number, c: { r: number; g: number; b: number }) => {
      doc.setFillColor(c.r, c.g, c.b)
      doc.rect(x, ry, w, h, "F")
    }

    // Draw left accent bar
    const accentBar = (ry: number, h: number, c: { r: number; g: number; b: number }, thickness = 0.05) => {
      doc.setFillColor(c.r, c.g, c.b)
      doc.rect(MARGIN.left, ry, thickness, h, "F")
    }

    // Write wrapped text, return new y
    const writeText = (
      text: string,
      x: number,
      ry: number,
      maxW: number,
      fontStyle: "normal" | "bold" | "italic" = "normal",
      fontSize = FONT_SIZE
    ): number => {
      doc.setFont("helvetica", fontStyle)
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text, maxW) as string[]
      lines.forEach((line) => {
        doc.text(line, x, ry)
        ry += LH
      })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(FONT_SIZE)
      return ry
    }

    // ── PORTADA ───────────────────────────────────────────────────────────
    if (options.includeTitlePage !== false) {
      const cx = PAGE_W / 2

      // Gradient-like header strip
      fillRect(0, 0, PAGE_W, 2.8, rgb(15, 30, 60))

      // Logo / Program
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(150, 180, 255)
      doc.text("SOVEREIGN AI FILM FACTORY 2026  ·  CuboIA", cx, 0.55, { align: "center" })

      // Main title
      doc.setFont("helvetica", "bold")
      doc.setFontSize(26)
      doc.setTextColor(255, 255, 255)
      const titleLines = doc.splitTextToSize(title.toUpperCase(), PAGE_W - 2) as string[]
      let ty = 1.2
      titleLines.forEach((line: string) => {
        doc.text(line, cx, ty, { align: "center" })
        ty += 0.42
      })

      // Revision tag
      if (options.revision) {
        doc.setFont("helvetica", "italic")
        doc.setFontSize(11)
        doc.setTextColor(200, 220, 255)
        doc.text(options.revision, cx, ty + 0.1, { align: "center" })
      }

      // Decorative line
      doc.setDrawColor(80, 140, 255)
      doc.setLineWidth(0.02)
      doc.line(1.5, 3.1, PAGE_W - 1.5, 3.1)

      // Info block
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
      let iy = 3.6
      const infoItems = [
        ["Autor:", options.author || "Humberto Padilla Cuenca"],
        ["Tutor:", "Christian Blaze — Director / VFX Supervisor"],
        ["Programa:", "Sovereign AI Film Factory 2026"],
        ["Premiere:", "SovAI Summit · 19 de abril de 2026 · BINAES"],
        ["Formato:", "Cortometraje ~90 segundos"],
      ]
      infoItems.forEach(([key, val]) => {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        setColor(COLORS.muted)
        doc.text(key, MARGIN.left + 0.2, iy)
        doc.setFont("helvetica", "normal")
        setColor(COLORS.dark)
        doc.text(val, MARGIN.left + 1.3, iy)
        iy += 0.28
      })

      // Footer strip
      fillRect(0, PAGE_H - 0.7, PAGE_W, 0.7, rgb(15, 30, 60))
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(150, 180, 255)
      doc.text("🎬 GUION.AI — Herramienta de escritura cinematográfica con IA", cx, PAGE_H - 0.32, { align: "center" })

      newPage()
    }

    // ── CUERPO DEL GUION ──────────────────────────────────────────────────
    elements.forEach((el) => {
      const rawText = el.text?.trim() ?? ""
      if (!rawText) return

      const semantic = detectSemantic(rawText)
      const timingMatch = rawText.match(TIMING)
      const transMatch = rawText.match(TRANS)

      // ── ENCABEZADO DE ESCENA ──────────────────────────────────────────
      if (el.type === "scene_heading") {
        sceneNum++
        const blockH = LH + 0.24

        checkPage(blockH + 0.2)
        y += 0.25

        fillRect(MARGIN.left, y, CONTENT_W, blockH, COLORS.sceneBg)
        accentBar(y, blockH, COLORS.sceneBar, 0.07)

        // Badge "ESCENA"
        doc.setFont("helvetica", "bold")
        doc.setFontSize(6.5)
        setColor(COLORS.sceneBar)
        doc.text("📍 ESCENA" + (options.includeSceneNumbers ? ` ${sceneNum}` : ""), MARGIN.left + 0.15, y + 0.13)

        // Texto de la escena
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10.5)
        setColor(COLORS.sceneText)
        const sceneLines = doc.splitTextToSize(rawText.toUpperCase(), CONTENT_W - 0.25) as string[]
        let sy = y + 0.26
        sceneLines.forEach((line: string) => { doc.text(line, MARGIN.left + 0.15, sy); sy += LH })

        y = sy + 0.12
        return
      }

      // ── NOTA DE TIMING ────────────────────────────────────────────────
      if (el.type === "note" || timingMatch) {
        const noteText = timingMatch ? timingMatch[1] : rawText
        const blockH = LH_SM + 0.14

        checkPage(blockH + 0.06)
        y += 0.04

        fillRect(MARGIN.left, y, CONTENT_W, blockH, COLORS.timingBg)
        accentBar(y, blockH, COLORS.timingBar, 0.04)

        doc.setFont("courier", "normal")
        doc.setFontSize(8.5)
        setColor(COLORS.timingText)
        doc.text(`⏱  ${noteText}`, MARGIN.left + 0.12, y + LH_SM * 0.85)
        doc.setFont("helvetica", "normal")
        y += blockH + 0.06
        return
      }

      // ── SECCIÓN / ACTO ────────────────────────────────────────────────
      if (el.type === "section") {
        const cleanText = rawText.replace(/^#+\s*/, "").toUpperCase()
        checkPage(0.5)
        y += 0.3

        doc.setDrawColor(COLORS.accentBar.r, COLORS.accentBar.g, COLORS.accentBar.b)
        doc.setLineWidth(0.015)
        doc.line(MARGIN.left, y, MARGIN.left + CONTENT_W, y)
        y += 0.08

        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        setColor(COLORS.accentText)
        doc.text(cleanText, PAGE_W / 2, y + LH, { align: "center" })
        y += LH + 0.08

        doc.line(MARGIN.left, y, MARGIN.left + CONTENT_W, y)
        y += 0.16
        return
      }

      // ── TRANSICIÓN ────────────────────────────────────────────────────
      if (el.type === "transition" || transMatch) {
        const transText = transMatch
          ? transMatch[2].trim().toUpperCase()
          : rawText.replace(/^>\s*/, "").toUpperCase()
        checkPage(LH + 0.1)
        y += 0.12
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        setColor(COLORS.muted)
        doc.text(transText, MARGIN.left + CONTENT_W, y + LH * 0.7, { align: "right" })
        y += LH + 0.12
        return
      }

      // ── TEXTO CENTRADO ────────────────────────────────────────────────
      if (el.type === "centered") {
        checkPage(LH + 0.2)
        y += 0.15
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        setColor(COLORS.dark)
        doc.text(rawText, PAGE_W / 2, y + LH, { align: "center" })
        y += LH + 0.15
        return
      }

      // ── PERSONAJE ─────────────────────────────────────────────────────
      if (el.type === "character") {
        checkPage(LH + 0.16)
        y += 0.18
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        setColor(COLORS.muted)
        doc.text("👤", MARGIN.left + CONTENT_W / 2 - 1.45, y)
        doc.setFontSize(10.5)
        setColor(COLORS.charText)
        doc.text(rawText.toUpperCase(), PAGE_W / 2, y + LH * 0.2, { align: "center" })
        y += LH + 0.04
        return
      }

      // ── DIÁLOGO ───────────────────────────────────────────────────────
      if (el.type === "dialogue") {
        const dX = MARGIN.left + 1.1
        const dW = CONTENT_W - 2.1
        const lines = doc.splitTextToSize(rawText, dW) as string[]
        const blockH = lines.length * LH + 0.06

        checkPage(blockH)

        doc.setFillColor(240, 240, 248)
        doc.rect(dX - 0.04, y, dW + 0.08, blockH, "F")
        doc.setFont("courier", "normal")
        doc.setFontSize(10)
        setColor(COLORS.dark)
        let dy = y + LH * 0.85
        lines.forEach((line: string) => {
          doc.text(line, dX, dy)
          dy += LH
        })
        doc.setFont("helvetica", "normal")
        y = dy + 0.02
        return
      }

      // ── ACOTACIÓN ─────────────────────────────────────────────────────
      if (el.type === "parenthetical") {
        const pText = rawText.startsWith("(") ? rawText : `(${rawText})`
        checkPage(LH + 0.04)
        doc.setFont("helvetica", "italic")
        doc.setFontSize(9.5)
        setColor(COLORS.muted)
        doc.text(pText, PAGE_W / 2, y + LH * 0.7, { align: "center" })
        doc.setFont("helvetica", "normal")
        y += LH + 0.02
        return
      }

      // ── BLOQUE SEMÁNTICO DE PRODUCCIÓN ────────────────────────────────
      if (el.type === "action" && semantic) {
        const tagNorm = semantic.tag
        const cfg: { bg: {r:number;g:number;b:number}; bar: {r:number;g:number;b:number}; text: {r:number;g:number;b:number}; emoji: string; label: string } =
          tagNorm.includes("ESCENOGRAF") ? { bg: COLORS.scenoBg, bar: COLORS.scenoBar, text: COLORS.scenoText, emoji: "🏛", label: "ESCENOGRAFÍA" } :
          tagNorm.includes("CAMARA")     ? { bg: COLORS.cameraBg, bar: COLORS.cameraBar, text: COLORS.cameraText, emoji: "🎬", label: "CÁMARA" } :
          tagNorm.includes("SONIDO")     ? { bg: COLORS.soundBg, bar: COLORS.soundBar, text: COLORS.soundText, emoji: "🎙", label: "SONIDO" } :
          tagNorm.includes("MUSICA")     ? { bg: COLORS.musicBg, bar: COLORS.musicBar, text: COLORS.musicText, emoji: "🎵", label: "MÚSICA" } :
          { bg: COLORS.timingBg, bar: COLORS.timingBar, text: COLORS.timingText, emoji: "⚡", label: tagNorm }

        const bodyLines = doc.splitTextToSize(semantic.body, CONTENT_W - 0.35) as string[]
        const blockH = LH_SM + bodyLines.length * LH + 0.2

        checkPage(blockH + 0.1)
        y += 0.06

        fillRect(MARGIN.left, y, CONTENT_W, blockH, cfg.bg)
        accentBar(y, blockH, cfg.bar, 0.06)

        // Badge label
        doc.setFont("helvetica", "bold")
        doc.setFontSize(6.5)
        setColor(cfg.bar)
        doc.text(`${cfg.emoji} ${cfg.label}`, MARGIN.left + 0.12, y + 0.13)

        // Body text
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9.5)
        setColor(cfg.text)
        let by = y + 0.25
        bodyLines.forEach((line: string) => {
          doc.text(line, MARGIN.left + 0.12, by)
          by += LH
        })

        y = by + 0.06
        return
      }

      // ── ACCIÓN NORMAL ─────────────────────────────────────────────────
      if (el.type === "action") {
        const lines = doc.splitTextToSize(rawText, CONTENT_W) as string[]
        const blockH = lines.length * LH

        checkPage(blockH + 0.05)
        y += 0.05

        doc.setFont("helvetica", "normal")
        doc.setFontSize(FONT_SIZE)
        setColor(COLORS.dark)
        lines.forEach((line: string) => {
          doc.text(line, MARGIN.left, y)
          y += LH
        })
        y += 0.04
        return
      }

      // Fallback
      const fallbackLines = doc.splitTextToSize(rawText, CONTENT_W) as string[]
      checkPage(fallbackLines.length * LH)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(FONT_SIZE)
      setColor(COLORS.dark)
      fallbackLines.forEach((line: string) => { doc.text(line, MARGIN.left, y); y += LH })
    })

    // ── FIN — marca de cierre ─────────────────────────────────────────────
    checkPage(0.5)
    y += 0.3
    doc.setDrawColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b)
    doc.setLineWidth(0.01)
    doc.line(MARGIN.left + CONTENT_W / 2 - 0.4, y, MARGIN.left + CONTENT_W / 2 + 0.4, y)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    setColor(COLORS.muted)
    doc.text("FIN DEL GUION", PAGE_W / 2, y + 0.2, { align: "center" })

    return doc.output("blob")
  }
}
