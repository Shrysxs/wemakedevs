# Integration Guide for Chart Components

## Quick Start

### Step 1: Import the Component

```tsx
import { ReportsSection } from "@/components/ReportsSection"
```

### Step 2: Use in Your Page

```tsx
export default function ReportsPage() {
  const userId = "your-user-id-here" // Get from auth/session
  
  return (
    <div className="min-h-screen bg-black">
      <ReportsSection userId={userId} />
    </div>
  )
}
```

## Individual Chart Usage

### Using DailyUsageChart

```tsx
"use client"

import { useEffect, useState } from "react"
import { DailyUsageChart } from "@/components/DailyUsageChart"

export default function MyReportsPage() {
  const [reportData, setReportData] = useState(null)
  
  useEffect(() => {
    fetch('/api/report?userId=your-user-id')
      .then(res => res.json())
      .then(data => setReportData(data))
  }, [])
  
  if (!reportData) return <div>Loading...</div>
  
  return (
    <div className="p-6">
      <DailyUsageChart dailyMinutes={reportData.daily} />
    </div>
  )
}
```

### Using AppUsageChart

```tsx
"use client"

import { useEffect, useState } from "react"
import { AppUsageChart } from "@/components/AppUsageChart"

export default function AppsPage() {
  const [apps, setApps] = useState([])
  
  useEffect(() => {
    fetch('/api/report?userId=your-user-id')
      .then(res => res.json())
      .then(data => setApps(data.apps))
  }, [])
  
  return (
    <div className="p-6">
      <AppUsageChart apps={apps} maxApps={10} />
    </div>
  )
}
```

### Using FocusReportChart

```tsx
"use client"

import { FocusReportChart } from "@/components/FocusReportChart"

export default function FocusPage() {
  // You'll need to create this data from your focus sessions and usage logs
  const focusData = [
    { date: "2024-10-01", focusTime: 90, appUsage: 120 },
    { date: "2024-10-02", focusTime: 120, appUsage: 90 },
    // ... more days
  ]
  
  return (
    <div className="p-6">
      <FocusReportChart data={focusData} />
    </div>
  )
}
```

## API Integration

### Current API Endpoint: `/api/report`

**Request:**
```
GET /api/report?userId=<user-id>
```

**Response:**
```json
{
  "daily": [120, 150, 90, 180, 200, 110, 95],
  "apps": [
    { "name": "Instagram", "minutes": 180 },
    { "name": "YouTube", "minutes": 150 },
    { "name": "Twitter", "minutes": 120 }
  ],
  "streak": 5,
  "badges": []
}
```

### Data Transformation

If you need to transform focus session data:

```typescript
// Combine focus sessions with usage logs
async function getFocusReportData(userId: string) {
  // Fetch usage logs
  const usageResponse = await fetch(`/api/report?userId=${userId}`)
  const usageData = await usageResponse.json()
  
  // Fetch focus sessions (you'll need to create this endpoint)
  const focusResponse = await fetch(`/api/focus/history?userId=${userId}`)
  const focusSessions = await focusResponse.json()
  
  // Transform into chart format
  const chartData = usageData.daily.map((minutes, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const dateStr = date.toISOString().split('T')[0]
    
    // Calculate focus time for this date
    const dayFocusTime = focusSessions
      .filter(session => session.startedAt.startsWith(dateStr))
      .reduce((sum, session) => sum + session.reclaimed, 0)
    
    return {
      date: dateStr,
      focusTime: dayFocusTime,
      appUsage: minutes
    }
  })
  
  return chartData
}
```

## Styling Customization

### Dark Theme (Default)
All components use the dark theme by default:
- Background: `#000000`
- Text: `#F5F5F5`
- Borders: `#374151`

### Custom Colors

Edit the `chartConfig` in each component:

```typescript
const chartConfig = {
  focusTime: {
    label: "Focus Time",
    color: "#your-hex-color", // Change this
  },
}
```

### Custom Styles

Add Tailwind classes to the Card component:

```tsx
<Card className="py-0 shadow-lg border-2 border-blue-500">
  {/* ... */}
</Card>
```

## Advanced Usage

### Multiple Charts in a Grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
  <DailyUsageChart dailyMinutes={reportData.daily} />
  <AppUsageChart apps={reportData.apps} maxApps={5} />
  <div className="lg:col-span-2">
    <FocusReportChart data={focusData} />
  </div>
</div>
```

### With Loading States

```tsx
{loading ? (
  <div className="animate-pulse">
    <div className="h-[400px] bg-gray-900 rounded-lg"></div>
  </div>
) : (
  <DailyUsageChart dailyMinutes={reportData.daily} />
)}
```

### With Error Handling

```tsx
{error ? (
  <Card className="p-6">
    <div className="text-red-400">
      Failed to load chart data: {error}
    </div>
  </Card>
) : (
  <DailyUsageChart dailyMinutes={reportData.daily} />
)}
```

## Common Issues

### Issue: Charts not rendering
**Solution:** Make sure you have `"use client"` at the top of your page/component.

### Issue: Import errors
**Solution:** Check that `@/` path alias is configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Recharts errors
**Solution:** Ensure recharts is installed:
```bash
npm install recharts
```

### Issue: Empty charts
**Solution:** Check that your API is returning data in the correct format:
```typescript
// Correct format
{ daily: [120, 150, ...], apps: [...] }

// Not this
{ data: { daily: [...] } }
```

## Next Steps

1. **Create a reports page** at `app/reports/page.tsx`
2. **Add authentication** to get the current user's ID
3. **Fetch data** from your API endpoints
4. **Customize colors** to match your brand
5. **Add more charts** as needed (pie charts, line charts, etc.)

## Support

For issues or questions:
- Check the component README: `components/README.md`
- Review the API endpoint: `app/api/report/route.ts`
- Check Recharts docs: https://recharts.org/
