"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
})

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "No autorizado" }
  }

  const name = formData.get("name") as string
  const result = updateProfileSchema.safeParse({ name })

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Datos inválidos" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: result.data.name },
    })

    revalidatePath("/settings")
    return { success: "Perfil actualizado correctamente" }
  } catch (error) {
    return { error: "Error al actualizar el perfil" }
  }
}
