"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CategoryChartProps {
  categories: Record<string, number>
}

const COLORS = {
  'Social Media': '#ef4444',
  'Entertainment': '#f59e0b',
  'Productivity': '#10b981',
  'Communication': '#3b82f6',
  'Other': '#6b7280',
}

export function CategoryChart({ categories }: CategoryChartProps) {
  const chartData = React.useMemo(() => {
    return Object.entries(categories)
      .filter(([_, minutes]) => minutes > 0)
      .map(([name, minutes]) => ({
        name,
        minutes,
        hours: (minutes / 60).toFixed(1),
      }))
      .sort((a, b) => b.minutes - a.minutes)
  }, [categories])

  const totalMinutes = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.minutes, 0),
    [chartData]
  )

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage by Category</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage by Category</CardTitle>
        <CardDescription>
          App usage breakdown by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="minutes"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#f5f5f5',
                }}
                formatter={(value: number) => [
                  `${value} min (${(value / 60).toFixed(1)}h)`,
                  'Usage'
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ color: '#9ca3af' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ 
                    backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other 
                  }}
                />
                <span className="text-sm text-gray-400">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-200">
                {item.hours}h
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
