import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { EditorClient } from "./editor-client"
import type { UIMessage } from "ai"

function toUIMessage(row: {
  id: string
  role: string
  content: string
}): UIMessage {
  const role =
    row.role === "USER"
      ? "user"
      : row.role === "ASSISTANT"
        ? "assistant"
        : "system"
  return {
    id: row.id,
    role,
    parts: [{ type: "text", text: row.content }],
  }
}

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

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      chatMessages: {
        orderBy: { createdAt: "asc" },
        take: 200,
      },
    },
  })

  if (!project) {
    notFound()
  }

  const initialChatMessages = project.chatMessages.map(toUIMessage)

  return (
    <EditorClient
      projectId={project.id}
      initialTitle={project.title}
      initialContent={project.content}
      initialSettings={project.settings}
      initialChatMessages={initialChatMessages}
    />
  )
}
