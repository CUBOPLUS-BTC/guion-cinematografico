"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type RenameProjectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  initialTitle: string
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  projectId,
  initialTitle,
}: RenameProjectDialogProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setError(null)
    }
  }, [open, initialTitle])

  async function submit() {
    const trimmed = title.trim()
    if (!trimmed) {
      setError("El título no puede estar vacío.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? "No se pudo guardar.")
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
          <DialogTitle className="text-text-primary">Renombrar guion</DialogTitle>
          <DialogDescription className="text-text-muted">
            El nuevo nombre se mostrará en el panel y en el editor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="rename-title" className="text-text-secondary">
            Título
          </Label>
          <Input
            id="rename-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit()
            }}
            className="border-accent-muted bg-bg-primary"
            autoComplete="off"
            maxLength={200}
          />
          {error ? <p className="text-sm text-error">{error}</p> : null}
        </div>
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
            className="bg-accent text-white hover:bg-accent/90"
            disabled={loading}
            onClick={() => void submit()}
          >
            {loading ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
