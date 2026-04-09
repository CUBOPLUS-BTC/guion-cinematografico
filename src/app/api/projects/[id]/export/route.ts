import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PDFGenerator } from "@/lib/core/export/pdf-generator";
import { FDXGenerator } from "@/lib/core/export/fdx-generator";
import { convertTipTapToFountain } from "@/lib/core/fountain/convert-tiptap";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "pdf";

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const elements = convertTipTapToFountain(project.content);

    if (format === "pdf") {
      const blob = PDFGenerator.generate(project.title, elements);
      return new Response(blob, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${project.title}.pdf"`,
        },
      });
    }

    if (format === "fdx") {
        const xml = FDXGenerator.generate(elements);
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Content-Disposition": `attachment; filename="${project.title}.fdx"`,
          },
        });
      }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Error en la exportación" }, { status: 500 });
  }
}
