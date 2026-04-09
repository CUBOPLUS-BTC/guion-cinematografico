"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Film } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "../actions"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)

      const result = await registerUser(null, formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Si el registro fue exitoso, iniciar sesión automáticamente
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Cuenta creada, pero ocurrió un error al iniciar sesión.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.")
    } finally {
      if (error) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 mb-10">
        <div className="size-10 bg-accent rounded-lg flex items-center justify-center">
          <Film className="text-white size-6" />
        </div>
        <span className="font-bold text-2xl tracking-tighter text-text-primary">GUION.AI</span>
      </div>

      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-accent-muted bg-bg-secondary p-8 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-text-primary">Crear cuenta</h1>
          <p className="text-sm text-text-muted">Ingresa tus datos para registrarte</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/20 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="bg-bg-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-bg-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-bg-primary"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta con email"}
          </Button>
        </form>

        {(!!process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED || !!process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED) && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-accent-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bg-secondary px-2 text-text-muted">O regístrate con</span>
              </div>
            </div>
            <div className="space-y-3">
              {!!process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED && (
                <Button
                  type="button"
                  className="w-full bg-white text-gray-900 hover:bg-gray-100"
                  onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Google
                </Button>
              )}
              {!!process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-accent-muted"
                  onClick={() => void signIn("github", { callbackUrl: "/dashboard" })}
                >
                  GitHub
                </Button>
              )}
            </div>
          </>
        )}

        <p className="text-center text-xs text-text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
