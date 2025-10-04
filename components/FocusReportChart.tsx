"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive bar chart showing focus time and app usage"

// Chart configuration for focus tracking
const chartConfig = {
  views: {
    label: "Minutes",
  },
  focusTime: {
    label: "Focus Time",
    color: "hsl(var(--chart-3))", // Green for focus time
  },
  appUsage: {
    label: "App Usage",
    color: "hsl(var(--chart-4))", // Red for app usage/distraction
  },
} satisfies ChartConfig

interface FocusReportChartProps {
  data?: Array<{
    date: string
    focusTime: number
    appUsage: number
  }>
}

export function FocusReportChart({ data }: FocusReportChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("focusTime")

  // Use provided data or generate sample data for last 7 days
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) {
      return data
    }

    // Generate sample data for last 7 days
    const sampleData = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      sampleData.push({
        date: date.toISOString().split('T')[0],
        focusTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        appUsage: Math.floor(Math.random() * 180) + 60, // 60-240 minutes
      })
    }
    
    return sampleData
  }, [data])

  const total = React.useMemo(
    () => ({
      focusTime: chartData.reduce((acc, curr) => acc + curr.focusTime, 0),
      appUsage: chartData.reduce((acc, curr) => acc + curr.appUsage, 0),
    }),
    [chartData]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Weekly Focus Report</CardTitle>
          <CardDescription>
            Showing focus time vs app usage for the last 7 days
          </CardDescription>
        </div>
        <div className="flex">
          {(["focusTime", "appUsage"] as const).map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key].toLocaleString()} min
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => `${value} min`}
                />
              }
            />
            <Bar 
              dataKey={activeChart} 
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
