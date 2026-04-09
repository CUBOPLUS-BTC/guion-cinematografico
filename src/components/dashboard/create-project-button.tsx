"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreateProjectButton({
  variant = "default",
  className,
  children,
}: {
  variant?: "default" | "link" | "outline"
  className?: string
  children?: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nuevo Guion" }),
      })
      if (!res.ok) return
      const project = (await res.json()) as { id: string }
      router.push(`/editor/${project.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={loading}
      onClick={() => void create()}
    >
      {children ?? (
        <>
          <Plus className="h-4 w-4" />
          Nuevo Guion
        </>
      )}
    </Button>
  )
}
