"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ReportsSection } from "@/components/ReportsSection"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { AuthGuard } from "@/components/AuthGuard"

function ReportContent() {
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get("userId")
  // TODO: Replace with actual user id from your auth/session
  const userId = userIdParam || "demo-user-id"

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Reports" />
        <div className="flex-1 p-4 lg:p-6">
          <ReportsSection userId={userId} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <ReportContent />
      </Suspense>
    </AuthGuard>
  )
}
