import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { EditorClient } from "./editor-client"
import type { JSONContent } from "@tiptap/core"

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!project) {
    notFound()
  }

  return (
    <EditorClient
      projectId={project.id}
      initialTitle={project.title}
      initialContent={project.content as JSONContent}
    />
  )
}
