import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { getOwnedProjectOrNull } from "@/lib/api/project-access"
import type { Genre, ProjectStatus, ScreenplayFormat } from "../../../../prisma/generated/client"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await context.params
  const project = await getOwnedProjectOrNull(id, session.user.id)
  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await getOwnedProjectOrNull(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
  }

  const body = (await request.json()) as {
    title?: string
    logline?: string
    genre?: Genre
    format?: ScreenplayFormat
    language?: string
    status?: ProjectStatus
    settings?: Record<string, unknown>
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.logline !== undefined && { logline: body.logline }),
      ...(body.genre !== undefined && { genre: body.genre }),
      ...(body.format !== undefined && { format: body.format }),
      ...(body.language !== undefined && { language: body.language }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.settings !== undefined && { settings: body.settings as object }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await getOwnedProjectOrNull(id, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
  }

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
