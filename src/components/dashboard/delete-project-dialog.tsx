"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type DeleteProjectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectTitle: string
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: DeleteProjectDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "No se pudo eliminar.")
        return
      }
      onOpenChange(false)
      router.refresh()
    } catch {
      setError("Error de red. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-accent-muted bg-bg-secondary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Eliminar guion</DialogTitle>
          <DialogDescription className="text-text-muted">
            ¿Seguro que quieres eliminar{" "}
            <span className="font-semibold text-text-primary">&quot;{projectTitle}&quot;</span>?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="border-accent-muted"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => void confirmDelete()}
          >
            {loading ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
