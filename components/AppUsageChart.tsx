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

export const description = "App-wise usage breakdown chart"

interface AppUsageChartProps {
  apps: Array<{
    name: string
    minutes: number
  }>
  maxApps?: number
}

export function AppUsageChart({ apps, maxApps = 10 }: AppUsageChartProps) {
  // Sort apps by minutes and take top N
  const chartData = React.useMemo(() => {
    return apps
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, maxApps)
      .map(app => ({
        name: app.name,
        minutes: app.minutes,
        hours: (app.minutes / 60).toFixed(1),
      }))
  }, [apps, maxApps])

  // Generate dynamic chart config based on apps
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      minutes: {
        label: "Minutes",
        color: "hsl(var(--chart-1))", // Amber for app usage
      },
    }
    return config
  }, [])

  const totalMinutes = React.useMemo(
    () => apps.reduce((acc, curr) => acc + curr.minutes, 0),
    [apps]
  )

  const topAppMinutes = React.useMemo(
    () => chartData.length > 0 ? chartData[0].minutes : 0,
    [chartData]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Top Apps by Usage</CardTitle>
          <CardDescription>
            Most used apps in the last 7 days
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Total Apps</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {apps.length}
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Top App</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {(topAppMinutes / 60).toFixed(1)}h
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 80,
              right: 12,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}m`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(value, name, item) => `${value} min (${item.payload.hours}h) - ${((item.payload.minutes / totalMinutes) * 100).toFixed(1)}%`}
                />
              }
            />
            <Bar 
              dataKey="minutes" 
              fill="var(--color-minutes)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
