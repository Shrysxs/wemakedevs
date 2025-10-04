"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success("Logged in successfully")
      router.replace("/dashboard")
    } catch (err: any) {
      toast.error(err?.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setEmail("demo@reclaim.com")
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
              <Button type="button" variant="outline" onClick={fillDemo}>Use demo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
