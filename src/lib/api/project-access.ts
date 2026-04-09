import { prisma } from "@/lib/prisma"

export async function getOwnedProjectOrNull(id: string, userId: string) {
  return prisma.project.findFirst({
    where: { id, userId },
  })
}
