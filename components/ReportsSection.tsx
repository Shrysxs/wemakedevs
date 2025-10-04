"use client"

import * as React from "react"
import { DailyUsageChart } from "./DailyUsageChart"
import { AppUsageChart } from "./AppUsageChart"
import { FocusReportChart } from "./FocusReportChart"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

interface ReportData {
  daily: number[]
  apps: Array<{
    name: string
    minutes: number
  }>
  streak: number
  badges: any[]
}

interface ReportsSectionProps {
  userId?: string
}

export function ReportsSection({ userId: propUserId }: ReportsSectionProps) {
  const { loading: authLoading, userId: sessionUserId } = useAuth()
  const userId = propUserId || sessionUserId || undefined
  const [reportData, setReportData] = React.useState<ReportData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/report?userId=${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data')
        }
        
        const data = await response.json()
        setReportData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchReportData()
    }
  }, [userId])

  if (authLoading || (!userId && !reportData && !error)) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground">No user session</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading reports...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">No data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-100">Usage Reports</h1>
        <p className="text-gray-400">
          Your app usage analytics and insights for the last 7 days
        </p>
      </div>

      {/* Streak Badge */}
      {reportData.streak > 0 && (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔥</div>
            <div>
              <h3 className="text-lg font-semibold text-green-400">
                {reportData.streak} Day Streak!
              </h3>
              <p className="text-sm text-gray-400">
                Keep logging your usage to maintain your streak
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Usage Chart */}
      <DailyUsageChart dailyMinutes={reportData.daily} />

      {/* App Usage Chart */}
      {reportData.apps.length > 0 && (
        <AppUsageChart apps={reportData.apps} maxApps={10} />
      )}

      {/* Focus Report Chart (if you have focus session data) */}
      {/* Uncomment this when you have focus session data integrated */}
      {/* <FocusReportChart data={focusData} /> */}
    </div>
  )
}
