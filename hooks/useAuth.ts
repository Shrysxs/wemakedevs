"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const [loading, setLoading] = React.useState(true)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [accessToken, setAccessToken] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUserId(data.session?.user?.id ?? null)
      setAccessToken(data.session?.access_token ?? null)
      setLoading(false)
    }
    load()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setAccessToken(session?.access_token ?? null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { loading, userId, accessToken }
}
