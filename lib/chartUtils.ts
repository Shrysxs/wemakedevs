/**
 * Utility functions for chart data transformation
 */

export interface FocusSession {
  id: string
  userId: string
  duration: number
  reclaimed: number
  startedAt: string
  endedAt: string
}

export interface UsageLog {
  date: string
  apps: Array<{ name: string; minutes: number }>
}

/**
 * Transform focus sessions and usage logs into chart data
 */
export function transformToFocusChartData(
  usageLogs: UsageLog[],
  focusSessions: FocusSession[]
): Array<{ date: string; focusTime: number; appUsage: number }> {
  const chartData: Array<{ date: string; focusTime: number; appUsage: number }> = []
  
  // Create a map of dates to focus time
  const focusTimeByDate = new Map<string, number>()
  focusSessions.forEach(session => {
    const date = session.startedAt.split('T')[0]
    const currentTime = focusTimeByDate.get(date) || 0
    focusTimeByDate.set(date, currentTime + session.reclaimed)
  })
  
  // Combine with usage logs
  usageLogs.forEach(log => {
    const totalAppUsage = log.apps.reduce((sum, app) => sum + app.minutes, 0)
    const focusTime = focusTimeByDate.get(log.date) || 0
    
    chartData.push({
      date: log.date,
      focusTime,
      appUsage: totalAppUsage
    })
  })
  
  return chartData
}

/**
 * Generate date labels for the last N days
 */
export function generateDateLabels(days: number = 7): string[] {
  const labels: string[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(date.toISOString().split('T')[0])
  }
  
  return labels
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Format minutes to human-readable time
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get color based on usage intensity
 */
export function getUsageColor(minutes: number): string {
  if (minutes < 60) return "#10b981" // Green - low usage
  if (minutes < 120) return "#f59e0b" // Amber - medium usage
  if (minutes < 180) return "#f97316" // Orange - high usage
  return "#ef4444" // Red - very high usage
}

/**
 * Calculate streak from daily data
 */
export function calculateStreak(dailyMinutes: number[]): number {
  let streak = 0
  
  // Start from the end (most recent day) and count backwards
  for (let i = dailyMinutes.length - 1; i >= 0; i--) {
    if (dailyMinutes[i] > 0) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

/**
 * Get top N apps by usage
 */
export function getTopApps(
  apps: Array<{ name: string; minutes: number }>,
  limit: number = 5
): Array<{ name: string; minutes: number }> {
  return apps
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit)
}

/**
 * Calculate daily average
 */
export function calculateDailyAverage(dailyMinutes: number[]): number {
  if (dailyMinutes.length === 0) return 0
  const total = dailyMinutes.reduce((sum, minutes) => sum + minutes, 0)
  return Math.round(total / dailyMinutes.length)
}

/**
 * Group apps by category (you can customize categories)
 */
export function groupAppsByCategory(
  apps: Array<{ name: string; minutes: number }>
): Record<string, number> {
  const categories: Record<string, number> = {
    'Social Media': 0,
    'Entertainment': 0,
    'Productivity': 0,
    'Communication': 0,
    'Other': 0
  }
  
  // Simple categorization - you can expand this
  const categoryMap: Record<string, string> = {
    'Instagram': 'Social Media',
    'Facebook': 'Social Media',
    'Twitter': 'Social Media',
    'TikTok': 'Social Media',
    'YouTube': 'Entertainment',
    'Netflix': 'Entertainment',
    'Spotify': 'Entertainment',
    'WhatsApp': 'Communication',
    'Telegram': 'Communication',
    'Slack': 'Communication',
    'Gmail': 'Productivity',
    'Notion': 'Productivity',
    'VSCode': 'Productivity',
  }
  
  apps.forEach(app => {
    const category = categoryMap[app.name] || 'Other'
    categories[category] += app.minutes
  })
  
  return categories
}
