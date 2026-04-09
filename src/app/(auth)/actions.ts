"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})

export async function registerUser(prevState: any, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      error: "Datos inválidos. Por favor, verifica el formulario."
    }
  }

  const { name, email, password } = parsed.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return {
        error: "El correo electrónico ya está registrado."
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      }
    })

    return {
      success: true
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      error: "Ha ocurrido un error al registrar la cuenta."
    }
  }
}
