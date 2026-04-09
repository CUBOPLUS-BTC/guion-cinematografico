"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, Settings, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: "Proyectos", href: "/dashboard", icon: LayoutDashboard },
    { label: "Historial IA", href: "/history", icon: History },
    { label: "Configuración", href: "/settings", icon: Settings },
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">G</span>
          </div>
          <h2 className="text-lg font-bold text-text-primary tracking-tighter">GUION.AI</h2>
        </Link>
      </div>
      <nav className="mt-2 flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
              )}
            >
              <Icon className={cn("size-4", isActive ? "text-accent" : "text-text-muted")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-accent-muted">
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-accent-muted bg-bg-secondary hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col w-full">
        {/* Header (visible on Mobile only) */}
        <header className="h-16 border-b border-accent-muted bg-bg-secondary flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Alternar menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-bg-secondary border-accent-muted">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="text-accent font-bold">GUION.AI</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent-muted border border-accent"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 text-text-primary">
          {children}
        </main>
      </div>
    </div>
  )
}
