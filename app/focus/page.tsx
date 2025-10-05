"use client"

import * as React from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export default function FocusPage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Focus" />
          <div className="p-4 lg:p-6">
            <FocusContent />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}

function FocusContent() {
  const { userId } = useAuth()
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [starting, setStarting] = React.useState(false)
  const [ending, setEnding] = React.useState(false)
  const [startedAt, setStartedAt] = React.useState<string | null>(null)

  async function startSession() {
    if (!userId) return toast.error("No user session")
    try {
      setStarting(true)
      const res = await fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to start")
      setSessionId(data.data.id)
      setStartedAt(data.data.startedAt)
      toast.success("Focus session started")
    } catch (e: any) {
      toast.error(e?.message || "Failed to start session")
    } finally {
      setStarting(false)
    }
  }

  async function endSession() {
    if (!userId || !sessionId) return toast.error("No active session")
    try {
      setEnding(true)
      const res = await fetch("/api/focus/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sessionId }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to end")
      setSessionId(null)
      toast.success(`Session ended • ${data.data.duration} min reclaimed`)
    } catch (e: any) {
      toast.error(e?.message || "Failed to end session")
    } finally {
      setEnding(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Focus Session</CardTitle>
          <CardDescription>Start a session and end when you&apos;re done.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!sessionId ? (
            <Button onClick={startSession} disabled={starting} className="w-full sm:w-auto">
              {starting ? "Starting..." : "Start Focus"}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Started at: {startedAt ? new Date(startedAt).toLocaleTimeString() : "-"}
              </div>
              <Button variant="destructive" onClick={endSession} disabled={ending}>
                {ending ? "Ending..." : "End Session"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
