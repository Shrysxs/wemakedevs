"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [isAuthed, setIsAuthed] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession()
        const hasSession = !!data.session
        if (!mounted) return
        setIsAuthed(hasSession)
        if (!hasSession) {
          router.replace("/login")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session)
      if (!session) router.replace("/login")
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (!isAuthed) return null

  return <>{children}</>
}
