"use client"

import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer as RechartsResponsiveContainer,
} from "recharts"

export const Cell = RechartsCell
export const Pie = RechartsPie
export const PieChart = RechartsPieChart
export const ResponsiveContainer = RechartsResponsiveContainer
export const Tooltip = RechartsTooltip
export const Legend = RechartsLegend
export const Bar = RechartsBar
export const BarChart = RechartsBarChart
export const CartesianGrid = RechartsCartesianGrid
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis
export const Line = RechartsLine
export const LineChart = RechartsLineChart

export const ChartContainer = ({ children, className, config }: any) => {
  return (
    <div className={className}>
      <style jsx global>{`
        :root {
          --color-chart-1: ${config?.chart1?.color || "hsl(var(--primary))"};
          --color-chart-2: ${config?.chart2?.color || "hsl(var(--secondary))"};
          --color-chart-3: ${config?.chart3?.color || "#8884d8"};
          --color-chart-4: ${config?.chart4?.color || "#82ca9d"};
          --color-chart-5: ${config?.chart5?.color || "#ffc658"};
        }
      `}</style>
      {children}
    </div>
  )
}

export const ChartTooltip = RechartsTooltip

export const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
            <span className="font-bold text-foreground">{payload[0].value}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

