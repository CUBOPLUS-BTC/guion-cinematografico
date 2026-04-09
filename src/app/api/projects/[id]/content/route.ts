import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { content: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(project.content);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener contenido" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        content: body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, updatedAt: project.updatedAt });
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar contenido" }, { status: 500 });
  }
}
