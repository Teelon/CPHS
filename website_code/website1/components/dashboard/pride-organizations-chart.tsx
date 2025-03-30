"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "@/components/ui/chart"
import { useLanguage } from "@/contexts/language-context"
import { usePIMSData, countEventsByOrganization } from "@/lib/data-utils"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

type OrgDataPoint = {
  name: string
  value: number
}

// Colors for the pie chart
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF6666",
]

export function PrideOrganizationsChart() {
  const { language } = useLanguage()
  const { data, isLoading, error } = usePIMSData()
  const [orgsData, setOrgsData] = useState<OrgDataPoint[]>([])

  useEffect(() => {
    if (data.length > 0) {
      // Count events by organization
      const orgCounts = countEventsByOrganization(data)

      // Convert to array, sort by count, and take top 10
      const topOrgs = Object.entries(orgCounts)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      setOrgsData(topOrgs)
    }
  }, [data])

  const texts = {
    organizations: {
      en: "Organizations",
      fr: "Organisations",
    },
    events: {
      en: "Events",
      fr: "Événements",
    },
    loading: {
      en: "Loading data...",
      fr: "Chargement des données...",
    },
    error: {
      en: "Error loading data",
      fr: "Erreur lors du chargement des données",
    },
    noData: {
      en: "No data available",
      fr: "Aucune donnée disponible",
    },
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-gray-700">
            {texts.events[language]}: {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>{texts.loading[language]}</span>
      </div>
    )
  }

  if (error) {
    return <div className="h-full flex items-center justify-center text-red-500">{texts.error[language]}</div>
  }

  if (orgsData.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">{texts.noData[language]}</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={orgsData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name.substring(0, 15)}${name.length > 15 ? "..." : ""} ${(percent * 100).toFixed(0)}%`
          }
        >
          {orgsData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

