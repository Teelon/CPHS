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
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type YearDataPoint = {
  year: string
  count: number
}

export function PrideEventsTimelineChart() {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<YearDataPoint[]>([])
  const [needsInitialization, setNeedsInitialization] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch events by year from API
        const response = await fetch("/api/pims?type=events-by-year")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch data")
        }

        const yearData = await response.json()

        // If the array is empty, it might mean the database isn't initialized
        if (yearData.length === 0) {
          setNeedsInitialization(true)
          setData([])
        } else {
          setData(yearData)
        }

        setError(null)
      } catch (error: any) {
        console.error("Error fetching timeline data:", error)
        setError(error.message || "Failed to load timeline data")

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
    events: {
      en: "Pride Events",
      fr: "Événements de la Fierté",
    },
    tooltip: {
      en: "Year",
      fr: "Année",
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
    needsInitialization: {
      en: "Database needs to be initialized. Please visit /admin to set up the database.",
      fr: "La base de données doit être initialisée. Veuillez visiter /admin pour configurer la base de données.",
    },
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>{texts.loading[language]}</span>
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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        {texts.error[language]}: {error}
      </div>
    )
  }

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">{texts.noData[language]}</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          label={{
            value: language === "en" ? "Year" : "Année",
            position: "insideBottom",
            offset: -5,
          }}
        />
        <YAxis
          label={{
            value: texts.events[language],
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          labelFormatter={(label) => `${texts.tooltip[language]}: ${label}`}
          formatter={(value) => [value, texts.events[language]]}
        />
        <Legend />
        <Line type="monotone" dataKey="count" name={texts.events[language]} stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

