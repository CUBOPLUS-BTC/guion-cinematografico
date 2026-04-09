import { auth } from "@/lib/auth/auth"
import { getOwnedProjectOrNull } from "@/lib/api/project-access"
import { PDFGenerator, PDFExportOptions } from "@/lib/core/export/pdf-generator"
import { FDXGenerator } from "@/lib/core/export/fdx-generator"
import { projectContentToFountainElements } from "@/lib/core/fountain/project-content"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

type ExportBody = {
  format?: "pdf" | "fdx"
  options?: PDFExportOptions & {
    includeSceneNumbers?: boolean
    includeNotes?: boolean
  }
}

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/projects/[id]/export — cuerpo: { format: 'pdf' | 'fdx', options?: {...} }
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await context.params
  const project = await getOwnedProjectOrNull(id, session.user.id)
  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
  }

  let body: ExportBody = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const format = body.format ?? "pdf"
  const elements = projectContentToFountainElements(project.content)

  const safeName =
    project.title.replace(/[^\w\s-]/g, "").trim().slice(0, 80) || "guion"

  if (format === "pdf") {
    const blob = PDFGenerator.generate(project.title, elements, {
      includeTitlePage: body.options?.includeTitlePage,
      includeSceneNumbers: body.options?.includeSceneNumbers,
      includeNotes: body.options?.includeNotes,
      revision: body.options?.revision,
    })
    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    })
  }

  if (format === "fdx") {
    const xml = FDXGenerator.generate(elements)
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="${safeName}.fdx"`,
      },
    })
  }

  return NextResponse.json({ error: "Formato no soportado" }, { status: 400 })
}
