"use client"

import { useActionState } from "react"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ShieldCheck, Mail, CreditCard } from "lucide-react"

export function SettingsForm({ 
  initialData 
}: { 
  initialData: { name: string | null; email: string; plan: string } 
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, null)

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <section className="p-4 md:p-6 rounded-2xl border border-accent-muted bg-bg-secondary space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-accent-muted">
              <User className="size-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">Perfil de Usuario</h2>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Público</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={initialData.name || ""} 
                  className="bg-bg-primary text-base md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Correo Electrónico (No modificable)</Label>
                <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-bg-tertiary border border-accent-muted text-text-muted text-base md:text-sm">
                  <Mail className="size-4" />
                  <span className="truncate">{initialData.email}</span>
                </div>
              </div>

              {state?.error && (
                <p className="text-sm text-red-500 font-medium">{state.error}</p>
              )}
              {state?.success && (
                <p className="text-sm text-green-500 font-medium">{state.success}</p>
              )}

              <Button type="submit" disabled={isPending} className="bg-accent text-white w-full sm:w-auto">
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </section>

          <section className="p-4 md:p-6 rounded-2xl border border-accent-muted bg-bg-secondary space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-accent-muted">
              <ShieldCheck className="size-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">Seguridad</h2>
            </div>
            <p className="text-sm text-text-muted">
              La gestión de contraseñas y autenticación de dos factores se encuentra en desarrollo.
            </p>
            <Button variant="outline" disabled className="w-full sm:w-auto text-xs border-accent-muted text-text-muted">
              Cambiar contraseña
            </Button>
          </section>
        </div>

        <div className="space-y-4 md:space-y-6">
          <section className="p-4 md:p-6 rounded-2xl border border-accent border-dashed bg-accent/5 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Plan Actual</h2>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-text-primary uppercase tracking-tighter">{initialData.plan}</p>
              <p className="text-xs text-text-muted">Próximo cobro: N/A (Plan gratuito)</p>
            </div>
            <Button className="w-full bg-accent text-white shadow-lg shadow-accent/20">
              Mejorar a PRO
            </Button>
          </section>

          <section className="p-4 md:p-6 rounded-2xl border border-accent-muted bg-bg-secondary space-y-4 text-center">
             <p className="text-xs text-text-muted">¿Necesitas ayuda con tu cuenta?</p>
             <button className="text-xs text-accent font-bold hover:underline">Contactar soporte</button>
          </section>
        </div>
      </div>
    </div>
  )
}
