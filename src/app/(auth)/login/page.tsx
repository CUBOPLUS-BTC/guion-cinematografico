"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Film } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-2 mb-10">
        <div className="size-10 bg-accent rounded-lg flex items-center justify-center">
          <Film className="text-white size-6" />
        </div>
        <span className="font-bold text-2xl tracking-tighter text-text-primary">GUION.AI</span>
      </div>

      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-accent-muted bg-bg-secondary p-8">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-text-primary">Iniciar sesión</h1>
          <p className="text-sm text-text-muted">Continúa con tu proveedor preferido.</p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            className="w-full bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continuar con Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-accent-muted"
            onClick={() => void signIn("github", { callbackUrl: "/dashboard" })}
          >
            Continuar con GitHub
          </Button>
        </div>

        <p className="text-center text-xs text-text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-accent font-medium hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
