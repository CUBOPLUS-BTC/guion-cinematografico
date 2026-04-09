import { jsPDF } from "jspdf"
import { FountainElement } from "@/types/fountain"

/** Opciones alineadas con specs/09-exportacion.md */
export interface PDFExportOptions {
  includeTitlePage?: boolean
  /** Reservado — numeración de escena en PDF (futuro) */
  includeSceneNumbers?: boolean
  /** Reservado — notas en PDF (futuro) */
  includeNotes?: boolean
  revision?: string
}

/**
 * Generador de PDF profesional que sigue los estándares de la industria cinematográfica:
 * - Fuente: Courier 12pt
 * - Márgenes: Izquierdo 1.5", Derecho 1", Superior 1", Inferior 1"
 * - Interlineado: Simple
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
    });

    const config = {
      margins: { top: 1.0, bottom: 1.0, left: 1.5, right: 1.0 },
      pageHeight: 11,
      pageWidth: 8.5,
      fontSize: 12,
      lineHeight: 0.166, // Aproximadamente 1/6 de pulgada por línea
    };

    let yPosition = config.margins.top;
    doc.setFont("courier", "normal");
    doc.setFontSize(config.fontSize);

    const includeTitlePage = options.includeTitlePage !== false

    // 1. Portada (opcional)
    if (includeTitlePage) {
      doc.text(title.toUpperCase(), 4.25, 4, { align: "center" })
      if (options.revision) {
        doc.setFontSize(10)
        doc.text(options.revision, 4.25, 5.2, { align: "center" })
        doc.setFontSize(config.fontSize)
      }
      doc.addPage()
      yPosition = config.margins.top
    }

    // 2. Renderizado de Elementos
    elements.forEach((el) => {
      let xOffset = config.margins.left;
      let maxWidth = config.pageWidth - config.margins.left - config.margins.right;

      // Ajustes específicos por tipo de elemento
      switch (el.type) {
        case "scene_heading":
          doc.setFont("courier", "bold");
          yPosition += config.lineHeight; // Espacio antes
          break;
        case "character":
          xOffset += 2.2; // Centrado relativo
          maxWidth = 3.0;
          yPosition += config.lineHeight;
          break;
        case "dialogue":
          xOffset += 1.0;
          maxWidth = 3.5;
          break;
        case "parenthetical":
          xOffset += 1.5;
          maxWidth = 2.5;
          break;
        case "transition":
          xOffset = 6.0;
          maxWidth = 2.0;
          break;
        default:
          doc.setFont("courier", "normal");
          yPosition += config.lineHeight * 0.5;
      }

      // Dividir texto por ancho
      const lines = doc.splitTextToSize(el.text, maxWidth);
      
      // Control de salto de página
      if (yPosition + (lines.length * config.lineHeight) > config.pageHeight - config.margins.bottom) {
        doc.addPage();
        yPosition = config.margins.top;
      }

      lines.forEach((line: string) => {
        doc.text(line, xOffset, yPosition);
        yPosition += config.lineHeight;
      });

      // Reset
      doc.setFont("courier", "normal");
    });

    return doc.output("blob");
  }
}
