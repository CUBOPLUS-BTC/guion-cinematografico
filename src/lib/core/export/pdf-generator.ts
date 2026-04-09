import { jsPDF } from "jspdf"
import { FountainElement } from "@/types/fountain"

export interface PDFExportOptions {
  includeTitlePage?: boolean
  includeSceneNumbers?: boolean
  includeNotes?: boolean
  revision?: string
}

/**
 * Generador de PDF cinematográfico profesional.
 * Estándar de industria: Courier 12pt, márgenes Hollywood, espaciado limpio.
 */
export class PDFGenerator {
  public static generate(
    title: string,
    elements: FountainElement[],
    options: PDFExportOptions = {}
  ): Blob {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
    })

    const cfg = {
      pageWidth: 8.5,
      pageHeight: 11,
      margin: { top: 1.0, bottom: 1.0, left: 1.5, right: 1.0 },
      fontSize: 12,
      lh: 0.1875,       // line height: ~1/5.3in — Courier 12pt standard
    }

    const contentWidth = cfg.pageWidth - cfg.margin.left - cfg.margin.right // 6.0in

    let y = cfg.margin.top
    doc.setFont("courier", "normal")
    doc.setFontSize(cfg.fontSize)

    const newPage = () => {
      doc.addPage()
      y = cfg.margin.top
    }

    const checkPage = (needed: number) => {
      if (y + needed > cfg.pageHeight - cfg.margin.bottom) newPage()
    }

    const writeLine = (text: string, x: number, width: number, style: "normal" | "bold" = "normal") => {
      doc.setFont("courier", style)
      const lines = doc.splitTextToSize(text, width) as string[]
      checkPage(lines.length * cfg.lh)
      lines.forEach((line) => {
        doc.text(line, x, y)
        y += cfg.lh
      })
      doc.setFont("courier", "normal")
    }

    const skip = (lines = 1) => {
      y += cfg.lh * lines
    }

    // ─── PORTADA ──────────────────────────────────────────────────────────────
    if (options.includeTitlePage !== false) {
      const cx = cfg.pageWidth / 2

      // Título centrado a ~1/3 de la página
      doc.setFont("courier", "bold")
      doc.setFontSize(16)
      doc.text(title.toUpperCase(), cx, 3.5, { align: "center" })

      doc.setFont("courier", "normal")
      doc.setFontSize(cfg.fontSize)

      if (options.revision) {
        doc.text(options.revision.toUpperCase(), cx, 4.0, { align: "center" })
      }

      // Línea separadora
      doc.setDrawColor(180, 180, 180)
      doc.line(2.5, 4.4, 6.0, 4.4)

      // Créditos al pie de portada
      doc.setFontSize(10)
      doc.text("Sovereign AI Film Factory 2026", cx, 9.2, { align: "center" })
      doc.text("CuboIA — El Salvador", cx, 9.45, { align: "center" })
      doc.setFontSize(cfg.fontSize)

      newPage()
    }

    // ─── CUERPO DEL GUION ─────────────────────────────────────────────────────
    const SEMANTIC_PREFIXES = /^\[(ESCENOGRAF[IÍ]A|CAMARA|C[ÁA]MARA|SONIDO|M[UÚ]SICA|MUSICA|VFX|ILUMINACION|TITULO|SUBTITULO)\]\s*/i
    const TIME_NOTE = /^\[\[(.*)\]\]$/
    const SEMANTIC_TAG_LABEL: Record<string, string> = {
      ESCENOGRAFIA: "ESCENOGRAFÍA",
      ESCENOGRAFÍA: "ESCENOGRAFÍA",
      CAMARA: "CÁMARA",
      CÁMARA: "CÁMARA",
      SONIDO: "SONIDO",
      MUSICA: "MÚSICA",
      MÚSICA: "MÚSICA",
      VFX: "VFX",
      ILUMINACION: "ILUMINACIÓN",
      ILUMINACIÓN: "ILUMINACIÓN",
      TITULO: "TÍTULO",
      SUBTITULO: "SUBTÍTULO",
    }

    let sceneNumber = 0

    elements.forEach((el) => {
      const text = el.text?.trim() ?? ""
      if (!text) return

      switch (el.type) {
        // ── ENCABEZADO DE ESCENA ──────────────────────────────────────────────
        case "scene_heading": {
          sceneNumber++
          skip(1.2) // Espacio generoso antes de escena
          checkPage(cfg.lh * 4)
          doc.setFont("courier", "bold")
          const sceneText = options.includeSceneNumbers
            ? `${sceneNumber}. ${text.toUpperCase()}`
            : text.toUpperCase()
          doc.text(sceneText, cfg.margin.left, y)
          y += cfg.lh
          // Línea decorativa bajo el encabezado
          doc.setDrawColor(100, 100, 100)
          doc.setLineWidth(0.005)
          doc.line(cfg.margin.left, y, cfg.margin.left + contentWidth, y)
          y += cfg.lh * 0.6
          doc.setFont("courier", "normal")
          break
        }

        // ── ACCIÓN ────────────────────────────────────────────────────────────
        case "action": {
          // Detectar prefijos semánticos [CAMARA], [SONIDO], etc.
          const match = text.match(SEMANTIC_PREFIXES)
          if (match) {
            const rawTag = match[1].toUpperCase().replace(/[ÁÉÍÓÚáéíóú]/g, (c) => {
              const m: Record<string, string> = { á:"A",é:"E",í:"I",ó:"O",ú:"U",Á:"A",É:"E",Í:"I",Ó:"O",Ú:"U" }
              return m[c] ?? c
            })
            const cleanTag = rawTag.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            const labelKey = Object.keys(SEMANTIC_TAG_LABEL).find(k =>
              k.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === cleanTag
            )
            const label = labelKey ? SEMANTIC_TAG_LABEL[labelKey] : rawTag
            const body = text.replace(SEMANTIC_PREFIXES, "").trim()

            skip(0.5)
            checkPage(cfg.lh * 3)

            // Etiqueta en gris pequeño
            doc.setFont("courier", "bold")
            doc.setFontSize(9)
            doc.setTextColor(100, 100, 100)
            doc.text(`[ ${label} ]`, cfg.margin.left + 0.2, y)
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(cfg.fontSize)
            doc.setFont("courier", "normal")
            y += cfg.lh * 0.9

            // Contenido con sangría
            const lines = doc.splitTextToSize(body, contentWidth - 0.3) as string[]
            checkPage(lines.length * cfg.lh)
            doc.setTextColor(40, 40, 40)
            lines.forEach((line) => {
              doc.text(line, cfg.margin.left + 0.3, y)
              y += cfg.lh
            })
            doc.setTextColor(0, 0, 0)
            skip(0.3)
          } else {
            skip(0.4)
            writeLine(text, cfg.margin.left, contentWidth)
            skip(0.2)
          }
          break
        }

        // ── NOTA DE TIEMPO ────────────────────────────────────────────────────
        case "note": {
          const tm = text.match(TIME_NOTE)
          const noteText = tm ? tm[1] : text
          skip(0.3)
          checkPage(cfg.lh * 2)
          doc.setFont("courier", "normal")
          doc.setFontSize(9)
          doc.setTextColor(120, 100, 50)
          doc.text(`⏱  ${noteText}`, cfg.margin.left, y)
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(cfg.fontSize)
          y += cfg.lh * 0.9
          break
        }

        // ── PERSONAJE ─────────────────────────────────────────────────────────
        case "character": {
          skip(0.8)
          checkPage(cfg.lh * 4)
          const charX = cfg.margin.left + 2.2
          writeLine(text.toUpperCase(), charX, 3.0, "bold")
          break
        }

        // ── DIÁLOGO ───────────────────────────────────────────────────────────
        case "dialogue": {
          const dX = cfg.margin.left + 1.0
          const dW = 3.5
          const lines = doc.splitTextToSize(text, dW) as string[]
          checkPage(lines.length * cfg.lh + cfg.lh * 0.5)
          lines.forEach((line) => {
            doc.text(line, dX, y)
            y += cfg.lh
          })
          skip(0.3)
          break
        }

        // ── ACOTACIÓN ─────────────────────────────────────────────────────────
        case "parenthetical": {
          const pX = cfg.margin.left + 1.5
          const pText = text.startsWith("(") ? text : `(${text})`
          writeLine(pText, pX, 2.5, "normal")
          break
        }

        // ── TRANSICIÓN ────────────────────────────────────────────────────────
        case "transition": {
          skip(0.8)
          checkPage(cfg.lh * 2)
          const cleanT = text.replace(/^>\s*/, "").trim().toUpperCase()
          doc.setFont("courier", "bold")
          doc.text(cleanT, cfg.margin.left + contentWidth, y, { align: "right" })
          doc.setFont("courier", "normal")
          y += cfg.lh
          skip(0.4)
          break
        }

        // ── SECCIÓN / ACTO ────────────────────────────────────────────────────
        case "section": {
          skip(1.0)
          checkPage(cfg.lh * 3)
          const cleanS = text.replace(/^#+\s*/, "").trim().toUpperCase()
          doc.setFont("courier", "bold")
          doc.setFontSize(13)
          doc.text(cleanS, cfg.pageWidth / 2, y, { align: "center" })
          doc.setFontSize(cfg.fontSize)
          doc.setFont("courier", "normal")
          y += cfg.lh
          skip(0.4)
          break
        }

        // ── CENTRADO (título final, etc.) ─────────────────────────────────────
        case "centered": {
          skip(0.6)
          checkPage(cfg.lh * 2)
          doc.setFont("courier", "bold")
          doc.setFontSize(14)
          doc.text(text, cfg.pageWidth / 2, y, { align: "center" })
          doc.setFontSize(cfg.fontSize)
          doc.setFont("courier", "normal")
          y += cfg.lh * 1.2
          break
        }

        default: {
          if (text) writeLine(text, cfg.margin.left, contentWidth)
          break
        }
      }
    })

    return doc.output("blob")
  }
}
