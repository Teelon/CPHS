"use client"

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

// Mock data - in a real app, this would come from an API
const data = [
  {
    week: "Week 1",
    Pride: 120,
    Rights: 85,
    History: 65,
    Activism: 45,
  },
  {
    week: "Week 2",
    Pride: 132,
    Rights: 78,
    History: 72,
    Activism: 53,
  },
  {
    week: "Week 3",
    Pride: 145,
    Rights: 90,
    History: 68,
    Activism: 48,
  },
  {
    week: "Week 4",
    Pride: 160,
    Rights: 95,
    History: 75,
    Activism: 60,
  },
]

export function SearchTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Pride" stroke="#8884d8" />
        <Line type="monotone" dataKey="Rights" stroke="#82ca9d" />
        <Line type="monotone" dataKey="History" stroke="#ffc658" />
        <Line type="monotone" dataKey="Activism" stroke="#ff8042" />
      </LineChart>
    </ResponsiveContainer>
  )
}

