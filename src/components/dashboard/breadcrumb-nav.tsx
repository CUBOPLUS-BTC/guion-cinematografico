"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Proyectos",
  "/history": "Historial IA",
  "/settings": "Configuración",
  "/billing": "Facturación",
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const currentTitle = ROUTE_TITLES[pathname] ?? "Panel"

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-text-muted sm:gap-2.5">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-text-primary"
            >
              Inicio
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-text-muted" />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-text-primary">
            {currentTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
