"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

export const description = "Daily usage chart showing app usage over the last 7 days"

// Chart configuration for daily usage
const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "hsl(var(--chart-2))", // Purple from theme
  },
} satisfies ChartConfig

interface DailyUsageChartProps {
  dailyMinutes: number[] // Array of 7 days of usage in minutes
  startDate?: Date
}

export function DailyUsageChart({ dailyMinutes, startDate }: DailyUsageChartProps) {
  // Transform daily minutes array into chart data
  const chartData = React.useMemo(() => {
    const start = startDate || new Date()
    start.setDate(start.getDate() - 6) // Go back 6 days to get 7 days total
    
    return dailyMinutes.map((minutes, index) => {
      const date = new Date(start)
      date.setDate(date.getDate() + index)
      
      return {
        date: date.toISOString().split('T')[0],
        minutes: minutes,
        hours: (minutes / 60).toFixed(1),
      }
    })
  }, [dailyMinutes, startDate])

  const totalMinutes = React.useMemo(
    () => dailyMinutes.reduce((acc, curr) => acc + curr, 0),
    [dailyMinutes]
  )

  const averageMinutes = React.useMemo(
    () => Math.round(totalMinutes / dailyMinutes.length),
    [totalMinutes, dailyMinutes.length]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Daily Usage Overview</CardTitle>
          <CardDescription>
            Total app usage for the last 7 days
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Total Usage</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {(totalMinutes / 60).toFixed(1)}h
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Daily Average</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {averageMinutes} min
            </span>
          </div>
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}m`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  formatter={(value, name, item) => `${value} min (${item.payload.hours}h)`}
                />
              }
            />
            <Bar 
              dataKey="minutes" 
              fill="var(--color-minutes)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
