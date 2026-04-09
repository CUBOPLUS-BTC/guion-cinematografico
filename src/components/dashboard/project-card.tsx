"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock, Film, MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react"
import { formatRelativePast } from "@/lib/format-relative"
import {
  labelFormat,
  labelGenre,
  labelStatus,
  statusBadgeClass,
} from "@/lib/project-labels"
import { RenameProjectDialog } from "@/components/dashboard/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/dashboard/delete-project-dialog"
import { cn } from "@/lib/utils"
import type { DashboardProjectRow } from "@/components/dashboard/dashboard-projects"

type ProjectCardProps = DashboardProjectRow & {
  featured?: boolean
  staggerIndex?: number
}

export function ProjectCard({
  id,
  title,
  logline,
  genre,
  format,
  status,
  updatedAt,
  featured = false,
  staggerIndex = 0,
}: ProjectCardProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const updated = new Date(updatedAt)

  const delayStyle = {
    animationDelay: `${Math.min(staggerIndex, 12) * 45}ms`,
  } as React.CSSProperties

  return (
    <>
      <Card
        style={delayStyle}
        className={cn(
          "group relative overflow-hidden border-accent-muted bg-bg-secondary transition-all duration-300",
          "animate-in fade-in slide-in-from-bottom-3 duration-500",
          "hover:border-accent/50 hover:shadow-md",
          featured && "md:flex md:min-h-[188px] md:flex-row"
        )}
      >
        {featured ? (
          <div
            className="hidden w-2 shrink-0 bg-linear-to-b from-accent via-accent/60 to-accent-muted md:block"
            aria-hidden
          />
        ) : null}

        <div className={cn("flex min-w-0 flex-1 flex-col")}>
          <div
            className={cn(
              "flex gap-2 p-5 pb-4",
              featured && "md:gap-4 md:p-8 md:pb-6"
            )}
          >
            <Link
              href={`/editor/${id}`}
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary rounded-sm",
                featured && "md:justify-center"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    statusBadgeClass(status)
                  )}
                >
                  {labelStatus(status)}
                </Badge>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {labelGenre(genre)}
                </span>
                <span className="text-[10px] text-text-muted">·</span>
                <span className="text-[10px] font-medium text-text-muted">
                  {labelFormat(format)}
                </span>
              </div>

              <h3
                className={cn(
                  "font-semibold leading-tight text-text-primary group-hover:text-accent",
                  featured ? "text-xl md:text-2xl" : "text-base"
                )}
              >
                {title}
              </h3>

              {logline.trim() ? (
                <p
                  className={cn(
                    "line-clamp-2 text-sm text-text-muted",
                    featured && "line-clamp-3 md:max-w-2xl md:text-base"
                  )}
                >
                  {logline}
                </p>
              ) : (
                <p className="text-sm italic text-text-muted/80">Sin logline aún.</p>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                <span>Editado {formatRelativePast(updated)}</span>
                <Film className="size-3.5 shrink-0 text-accent/80" aria-hidden />
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                  aria-label="Más acciones"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-accent-muted bg-bg-secondary"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/editor/${id}`} className="flex items-center gap-2">
                    <ExternalLink className="size-4" />
                    Abrir editor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setRenameOpen(true)}
                >
                  <Pencil className="size-4" />
                  Renombrar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-accent-muted" />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardFooter className="border-t border-accent-muted bg-bg-primary/40 px-5 py-3">
            <Button
              asChild
              variant="secondary"
              className="h-9 w-full border border-accent-muted bg-transparent text-xs font-semibold hover:bg-accent/10 hover:text-accent"
            >
              <Link href={`/editor/${id}`}>Abrir editor</Link>
            </Button>
          </CardFooter>
        </div>
      </Card>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        projectId={id}
        initialTitle={title}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={id}
        projectTitle={title}
      />
    </>
  )
}
