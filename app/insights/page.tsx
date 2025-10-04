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

interface RecommendationItem {
  title: string
  description: string
  link?: string
}

export default function InsightsPage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Insights" />
          <div className="p-4 lg:p-6">
            <InsightsContent />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}

function InsightsContent() {
  const { accessToken } = useAuth()
  const [generating, setGenerating] = React.useState(false)
  const [items, setItems] = React.useState<RecommendationItem[] | null>(null)

  async function generate() {
    try {
      if (!accessToken) return toast.error("No session token")
      setGenerating(true)
      const res = await fetch("/api/generate-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || "Failed to generate insights")
      setItems(data.data as RecommendationItem[])
      toast.success("Insights generated")
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate insights")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Personalized suggestions based on your usage and profile</CardDescription>
          </div>
          <Button onClick={generate} disabled={generating}>
            {generating ? "Generating..." : "Generate Insights"}
          </Button>
        </CardHeader>
        <CardContent>
          {!items && (
            <div className="text-muted-foreground text-sm">Click "Generate Insights" to fetch new recommendations.</div>
          )}
          {items && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base">{it.title}</CardTitle>
                    <CardDescription>{it.description}</CardDescription>
                  </CardHeader>
                  {it.link && (
                    <CardContent>
                      <a href={it.link} target="_blank" className="text-primary underline text-sm">
                        Explore resource →
                      </a>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
