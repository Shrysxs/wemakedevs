"use client"

import * as React from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface AppRow { name: string; minutes: string }

export default function UsagePage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Usage" />
          <div className="p-4 lg:p-6">
            <UsageForm />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}

function UsageForm() {
  const { userId } = useAuth()
  const [date, setDate] = React.useState<string>(() => new Date().toISOString().split('T')[0])
  const [rows, setRows] = React.useState<AppRow[]>([{ name: "", minutes: "" }])
  const [submitting, setSubmitting] = React.useState(false)

  function addRow() {
    setRows((r) => [...r, { name: "", minutes: "" }])
  }

  function updateRow(index: number, key: keyof AppRow, value: string) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return toast.error("No user session")

    const apps = rows
      .map((r) => ({ name: r.name.trim(), minutes: Number(r.minutes) }))
      .filter((a) => a.name.length > 0 && Number.isFinite(a.minutes) && a.minutes >= 0)

    if (apps.length === 0) return toast.error("Add at least one valid app entry")

    try {
      setSubmitting(true)
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date, apps }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to save usage")
      toast.success("Usage saved")
    } catch (e: any) {
      toast.error(e?.message || "Failed to save usage")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Daily Usage</CardTitle>
        <CardDescription>Enter apps and minutes used for the selected day</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-4">
                  <Label className="sr-only">App Name</Label>
                  <Input placeholder="App name (e.g. Instagram)" value={row.name} onChange={(e) => updateRow(i, "name", e.target.value)} />
                </div>
                <div className="sm:col-span-1">
                  <Label className="sr-only">Minutes</Label>
                  <Input type="number" min={0} placeholder="Minutes" value={row.minutes} onChange={(e) => updateRow(i, "minutes", e.target.value)} />
                </div>
                <div className="sm:col-span-1 flex gap-2">
                  <Button type="button" variant="secondary" onClick={addRow} className="w-full">Add</Button>
                  {rows.length > 1 && (
                    <Button type="button" variant="destructive" onClick={() => removeRow(i)} className="w-full">Remove</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Usage"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
