"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

// Mock data - in a real app, this would come from an API
const data = [
  {
    month: "Jan",
    "English Metadata": 95,
    "French Metadata": 82,
    "AI Validation Rate": 88,
  },
  {
    month: "Feb",
    "English Metadata": 96,
    "French Metadata": 84,
    "AI Validation Rate": 89,
  },
  {
    month: "Mar",
    "English Metadata": 96,
    "French Metadata": 85,
    "AI Validation Rate": 90,
  },
  {
    month: "Apr",
    "English Metadata": 97,
    "French Metadata": 87,
    "AI Validation Rate": 91,
  },
  {
    month: "May",
    "English Metadata": 97,
    "French Metadata": 89,
    "AI Validation Rate": 92,
  },
  {
    month: "Jun",
    "English Metadata": 98,
    "French Metadata": 91,
    "AI Validation Rate": 93,
  },
]

export function MetadataAccuracyChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[75, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="English Metadata" fill="#8884d8" />
        <Bar dataKey="French Metadata" fill="#82ca9d" />
        <Bar dataKey="AI Validation Rate" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  )
}

