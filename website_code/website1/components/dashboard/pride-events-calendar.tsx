"use client"

import Link from "next/link"
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
import { Button } from "@/components/ui/button"

type MonthDataPoint = {
  month: string
  count: number
  monthNum?: number
}

export function PrideEventsCalendar() {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [monthData, setMonthData] = useState<MonthDataPoint[]>([])
  const [needsInitialization, setNeedsInitialization] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch month data from the API
        const response = await fetch("/api/pims?type=events-by-month")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()

        // Check if we have any non-zero counts
        const hasData = data.some((item: MonthDataPoint) => item.count > 0)

        if (!hasData) {
          setNeedsInitialization(true)
          setMonthData([])
        } else {
          // Add month number for sorting and coloring
          const monthOrder = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ]

          const enhancedData = data.map((item: MonthDataPoint) => ({
            ...item,
            monthNum: monthOrder.indexOf(item.month),
          }))

          // Translate month names if needed
          if (language === "fr") {
            const frenchMonths = [
              "Janvier",
              "Février",
              "Mars",
              "Avril",
              "Mai",
              "Juin",
              "Juillet",
              "Août",
              "Septembre",
              "Octobre",
              "Novembre",
              "Décembre",
            ]

            enhancedData.forEach((item: MonthDataPoint) => {
              if (item.monthNum !== undefined) {
                item.month = frenchMonths[item.monthNum]
              }
            })
          }

          // Sort by month number for proper display
          enhancedData.sort((a, b) => (a.monthNum || 0) - (b.monthNum || 0))

          setMonthData(enhancedData)
        }
      } catch (error) {
        console.error("Error fetching month data:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurred")

        // Check if the error is related to missing tables
        if (error instanceof Error && error.message && error.message.includes("does not exist")) {
          setNeedsInitialization(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [language])

  const texts = {
    title: {
      en: "Pride Events by Month",
      fr: "Événements de la Fierté par mois",
    },
    events: {
      en: "Number of Events",
      fr: "Nombre d'événements",
    },
    month: {
      en: "Month",
      fr: "Mois",
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
    summerPeak: {
      en: "Summer Peak",
      fr: "Pic d'été",
    },
    winterEvents: {
      en: "Winter Events",
      fr: "Événements d'hiver",
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

  // Custom colors to highlight seasons
  const getBarColor = (monthIndex: number) => {
    // Summer months (June, July, August)
    if (monthIndex >= 5 && monthIndex <= 7) {
      return "#ff7e67" // Warm color for summer
    }
    // Spring months (March, April, May)
    else if (monthIndex >= 2 && monthIndex <= 4) {
      return "#7bed9f" // Green for spring
    }
    // Fall months (September, October, November)
    else if (monthIndex >= 8 && monthIndex <= 10) {
      return "#e77f67" // Orange/brown for fall
    }
    // Winter months (December, January, February)
    else {
      return "#70a1ff" // Blue for winter
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthIndex = payload[0].payload.monthNum
      let seasonLabel = ""

      // Determine season based on month index
      if (monthIndex >= 5 && monthIndex <= 7) {
        seasonLabel = language === "en" ? "Summer" : "Été"
      } else if (monthIndex >= 2 && monthIndex <= 4) {
        seasonLabel = language === "en" ? "Spring" : "Printemps"
      } else if (monthIndex >= 8 && monthIndex <= 10) {
        seasonLabel = language === "en" ? "Fall" : "Automne"
      } else {
        seasonLabel = language === "en" ? "Winter" : "Hiver"
      }

      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-gray-700">
            {texts.events[language]}: {payload[0].value}
          </p>
          <p className="text-gray-700">{seasonLabel}</p>
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

  if (monthData.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">{texts.noData[language]}</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          label={{
            value: texts.month[language],
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="count" name={texts.events[language]} fill="#8884d8" radius={[4, 4, 0, 0]}>
          {monthData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.monthNum || 0)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

