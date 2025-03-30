"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "@/components/ui/chart"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type CityDataPoint = {
  city: string
  count: number
  province: string
}

export function PrideCitiesChart() {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CityDataPoint[]>([])
  const [needsInitialization, setNeedsInitialization] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all PIMS entries with location data
        const response = await fetch("/api/pims?type=entries")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const entries = await response.json()

        // If the array is empty, it might mean the database isn't initialized
        if (entries.length === 0) {
          setNeedsInitialization(true)
          setData([])
        } else {
          // Count events by city
          const cityCounts: Record<string, { count: number; province: string }> = {}

          entries.forEach((entry: any) => {
            if (entry.city && entry.province) {
              const key = entry.city
              if (!cityCounts[key]) {
                cityCounts[key] = { count: 0, province: entry.province }
              }
              cityCounts[key].count += 1
            }
          })

          // Convert to array and sort by count
          const cityData = Object.entries(cityCounts)
            .map(([city, data]) => ({
              city,
              count: data.count,
              province: data.province,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15) // Take top 15 cities

          setData(cityData)
        }
      } catch (error: any) {
        console.error("Error fetching cities data:", error)
        setError(error.message || "Failed to load cities data")

        // Check if the error is related to missing tables
        if (error.message && error.message.includes("does not exist")) {
          setNeedsInitialization(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const texts = {
    cities: {
      en: "Cities",
      fr: "Villes",
    },
    count: {
      en: "Number of Events",
      fr: "Nombre d'événements",
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
    province: {
      en: "Province",
      fr: "Province",
    },
    needsInitialization: {
      en: "Database needs to be initialized. Please visit /admin to set up the database.",
      fr: "La base de données doit être initialisée. Veuillez visiter /admin pour configurer la base de données.",
    },
    tryAgain: {
      en: "Try Again",
      fr: "Réessayer",
    },
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-gray-700">
            {texts.count[language]}: {payload[0].value}
          </p>
          <p className="text-gray-700">
            {texts.province[language]}: {payload[0].payload.province}
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
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-600">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{texts.error[language]}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          {texts.tryAgain[language]}
        </Button>
      </div>
    )
  }

  if (needsInitialization) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-amber-600">
        <span>{texts.needsInitialization[language]}</span>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin">Go to Admin</Link>
        </Button>
      </div>
    )
  }

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">{texts.noData[language]}</div>
  }

  // Create a color map based on provinces
  const provinceColorMap: Record<string, string> = {}
  const colors = [
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

  // Assign colors to unique provinces
  const uniqueProvinces = Array.from(new Set(data.map((item) => item.province)))
  uniqueProvinces.forEach((province, index) => {
    provinceColorMap[province] = colors[index % colors.length]
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: texts.count[language], position: "insideBottom", offset: -5 }} />
        <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="count" name={texts.count[language]} fill="#8884d8" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={provinceColorMap[entry.province] || "#8884d8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

