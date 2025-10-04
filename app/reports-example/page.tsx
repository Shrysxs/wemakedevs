"use client"

import * as React from "react"
import { DailyUsageChart } from "@/components/DailyUsageChart"
import { AppUsageChart } from "@/components/AppUsageChart"
import { FocusReportChart } from "@/components/FocusReportChart"
import { CategoryChart } from "@/components/CategoryChart"
import { StatsCard } from "@/components/StatsCard"
import { 
  formatMinutes, 
  calculateDailyAverage, 
  groupAppsByCategory,
  calculatePercentageChange 
} from "@/lib/chartUtils"

interface ReportData {
  daily: number[]
  apps: Array<{
    name: string
    minutes: number
  }>
  streak: number
  badges: any[]
}

export default function ReportsExamplePage() {
  const [reportData, setReportData] = React.useState<ReportData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Replace with actual user ID from your auth system
  const userId = "demo-user-id"

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
        console.error('Error fetching report data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading your reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Reports</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">No Data Available</h2>
          <p className="text-gray-500">Start tracking your usage to see reports</p>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalMinutes = reportData.daily.reduce((sum, min) => sum + min, 0)
  const averageMinutes = calculateDailyAverage(reportData.daily)
  const todayMinutes = reportData.daily[reportData.daily.length - 1] || 0
  const yesterdayMinutes = reportData.daily[reportData.daily.length - 2] || 0
  const percentageChange = calculatePercentageChange(todayMinutes, yesterdayMinutes)
  
  // Get categories
  const categories = groupAppsByCategory(reportData.apps)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Usage Reports</h1>
              <p className="mt-1 text-gray-400">
                Your app usage analytics for the last 7 days
              </p>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium">
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Streak Badge */}
        {reportData.streak > 0 && (
          <div className="mb-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔥</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-green-400">
                  {reportData.streak} Day Streak!
                </h3>
                <p className="text-gray-400 mt-1">
                  You've been tracking consistently. Keep it up!
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {reportData.streak}
                </div>
                <div className="text-sm text-gray-500">days</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Usage"
            value={formatMinutes(totalMinutes)}
            subtitle="Last 7 days"
            icon="📱"
            color="purple"
          />
          <StatsCard
            title="Daily Average"
            value={formatMinutes(averageMinutes)}
            subtitle="Per day"
            icon="📊"
            color="blue"
          />
          <StatsCard
            title="Today's Usage"
            value={formatMinutes(todayMinutes)}
            subtitle="So far"
            icon="⏱️"
            trend={{
              value: percentageChange,
              isPositive: percentageChange < 0, // Less usage is positive
            }}
            color={todayMinutes < averageMinutes ? "green" : "amber"}
          />
          <StatsCard
            title="Top Apps"
            value={reportData.apps.length}
            subtitle="Apps tracked"
            icon="📲"
            color="amber"
          />
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Daily Usage Chart */}
          <DailyUsageChart dailyMinutes={reportData.daily} />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* App Usage Chart */}
            {reportData.apps.length > 0 && (
              <AppUsageChart apps={reportData.apps} maxApps={10} />
            )}

            {/* Category Chart */}
            <CategoryChart categories={categories} />
          </div>

          {/* Focus Report Chart - Uncomment when you have focus data */}
          {/* 
          <FocusReportChart 
            data={[
              // Your focus data here
            ]} 
          />
          */}
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">💡 Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📈</div>
              <div>
                <h4 className="font-medium text-gray-200">Most Active Day</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {(() => {
                    const maxIndex = reportData.daily.indexOf(Math.max(...reportData.daily))
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - maxIndex))
                    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                  })()}
                  {' - '}
                  {formatMinutes(Math.max(...reportData.daily))}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-medium text-gray-200">Most Used App</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {reportData.apps[0]?.name || 'N/A'}
                  {reportData.apps[0] && ` - ${formatMinutes(reportData.apps[0].minutes)}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <h4 className="font-medium text-gray-200">Least Active Day</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {(() => {
                    const minIndex = reportData.daily.indexOf(Math.min(...reportData.daily))
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - minIndex))
                    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                  })()}
                  {' - '}
                  {formatMinutes(Math.min(...reportData.daily))}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🌟</div>
              <div>
                <h4 className="font-medium text-gray-200">Consistency Score</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {reportData.daily.filter(m => m > 0).length} out of 7 days tracked
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
