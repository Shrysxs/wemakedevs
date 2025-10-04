# Chart Components for Reports Section

This directory contains interactive chart components built with Recharts and shadcn/ui for visualizing usage data.

## Components

### 1. **DailyUsageChart**
Shows total app usage over the last 7 days in a bar chart.

**Props:**
- `dailyMinutes: number[]` - Array of 7 numbers representing daily usage in minutes
- `startDate?: Date` - Optional start date (defaults to 6 days ago)

**Usage:**
```tsx
import { DailyUsageChart } from "@/components/DailyUsageChart"

// From API response: { daily: [120, 150, 90, ...] }
<DailyUsageChart dailyMinutes={reportData.daily} />
```

### 2. **AppUsageChart**
Displays top apps by usage time in a horizontal bar chart.

**Props:**
- `apps: Array<{ name: string, minutes: number }>` - Array of app usage data
- `maxApps?: number` - Maximum number of apps to display (default: 10)

**Usage:**
```tsx
import { AppUsageChart } from "@/components/AppUsageChart"

// From API response: { apps: [{ name: "Instagram", minutes: 180 }, ...] }
<AppUsageChart apps={reportData.apps} maxApps={10} />
```

### 3. **FocusReportChart**
Interactive chart showing focus time vs app usage with toggle buttons.

**Props:**
- `data?: Array<{ date: string, focusTime: number, appUsage: number }>` - Optional chart data

**Usage:**
```tsx
import { FocusReportChart } from "@/components/FocusReportChart"

const focusData = [
  { date: "2024-10-01", focusTime: 90, appUsage: 120 },
  { date: "2024-10-02", focusTime: 120, appUsage: 90 },
  // ...
]

<FocusReportChart data={focusData} />
```

### 4. **ReportsSection**
Complete reports page component that fetches data from `/api/report` and displays all charts.

**Props:**
- `userId: string` - User ID to fetch reports for

**Usage:**
```tsx
import { ReportsSection } from "@/components/ReportsSection"

<ReportsSection userId="user-uuid-here" />
```

## UI Components

### Card Components (`ui/card.tsx`)
- `Card` - Container component
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

### Chart Components (`ui/chart.tsx`)
- `ChartContainer` - Wrapper for Recharts with theme support
- `ChartTooltip` - Tooltip component
- `ChartTooltipContent` - Styled tooltip content
- `ChartConfig` - Type for chart configuration

## Integration with API

The charts are designed to work with your existing `/api/report` endpoint:

```typescript
// API Response Format
{
  daily: number[],        // 7 days of usage in minutes
  apps: Array<{          // App-wise breakdown
    name: string,
    minutes: number
  }>,
  streak: number,        // Consecutive days with usage
  badges: any[]          // Future: achievement badges
}
```

## Styling

All components use:
- **Dark theme** with black background (#000000)
- **Gray text** (#F5F5F5, #9CA3AF, #374151)
- **Color scheme**:
  - Green (#10b981) for focus/positive metrics
  - Red (#ef4444) for distractions/negative metrics
  - Purple (#8b5cf6) for general usage
  - Amber (#f59e0b) for app-specific data

## Example Page Implementation

Create a reports page at `app/reports/page.tsx`:

```tsx
import { ReportsSection } from "@/components/ReportsSection"

export default function ReportsPage() {
  // Get userId from session/auth
  const userId = "your-user-id"
  
  return (
    <div className="min-h-screen bg-black">
      <ReportsSection userId={userId} />
    </div>
  )
}
```

## Dependencies

Required packages (already installed):
- `recharts` - Chart library
- `react` - React framework
- `next` - Next.js framework

## Customization

### Change Colors
Edit the `chartConfig` object in each component:

```typescript
const chartConfig = {
  focusTime: {
    label: "Focus Time",
    color: "#your-color-here",
  },
}
```

### Adjust Chart Height
Modify the `className` in `ChartContainer`:

```tsx
<ChartContainer className="aspect-auto h-[300px] w-full">
```

### Date Range
Currently shows last 7 days. To change, modify the API endpoint or data transformation logic.

## Notes

- All charts are client-side components (`"use client"`)
- Charts are responsive and work on mobile devices
- Tooltips show detailed information on hover
- Interactive elements have hover states and transitions
- Empty states are handled gracefully
