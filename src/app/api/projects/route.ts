import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { DEFAULT_EDITOR_JSON } from "@/lib/core/editor-default-content"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      logline: true,
      genre: true,
      status: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    projects: projects.map((p) => ({
      ...p,
      genre: String(p.genre),
      status: String(p.status),
      pageCount: 0,
    })),
    total: projects.length,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  let body: { title?: string; logline?: string; genre?: string } = {}
  try {
    body = await request.json()
  } catch {
    /* cuerpo vacío */
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      title: body.title?.trim() || "Sin título",
      logline: body.logline?.trim() ?? "",
      content: DEFAULT_EDITOR_JSON as object,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
