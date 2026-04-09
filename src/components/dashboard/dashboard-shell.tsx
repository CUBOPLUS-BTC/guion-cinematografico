"use client"

import { AppSidebar, type AppSidebarUser } from "@/components/dashboard/app-sidebar"
import { BreadcrumbNav } from "@/components/dashboard/breadcrumb-nav"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardShell({
  user,
  children,
}: {
  user: AppSidebarUser
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="bg-background min-h-svh">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbNav />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-text-primary md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
