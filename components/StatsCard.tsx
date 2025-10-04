import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "green" | "red" | "blue" | "purple" | "amber"
}

const colorClasses = {
  green: "from-green-950/50 to-emerald-950/50 border-green-800/50",
  red: "from-red-950/50 to-rose-950/50 border-red-800/50",
  blue: "from-blue-950/50 to-cyan-950/50 border-blue-800/50",
  purple: "from-purple-950/50 to-violet-950/50 border-purple-800/50",
  amber: "from-amber-950/50 to-orange-950/50 border-amber-800/50",
}

const iconColorClasses = {
  green: "text-green-500",
  red: "text-red-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  amber: "text-amber-500",
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "purple",
}: StatsCardProps) {
  return (
    <Card className={cn("bg-gradient-to-br", colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={cn("text-3xl", iconColorClasses[color])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
