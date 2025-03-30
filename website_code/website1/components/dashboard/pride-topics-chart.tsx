"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type TopicDataPoint = {
  topic: string
  count: number
}

export function PrideTopicsChart() {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TopicDataPoint[]>([])
  const [needsInitialization, setNeedsInitialization] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch topics data from API
        const response = await fetch("/api/pims?type=events-by-topic")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const topicsData = await response.json()

        // If the array is empty, it might mean the database isn't initialized
        if (topicsData.length === 0) {
          setNeedsInitialization(true)
          setData([])
        } else {
          // Take top 10 topics
          setData(topicsData.slice(0, 10))
        }
      } catch (error: any) {
        console.error("Error fetching topics data:", error)
        setError(error.message || "Failed to load topics data")

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
    topics: {
      en: "Topics",
      fr: "Sujets",
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
    needsInitialization: {
      en: "Database needs to be initialized. Please visit /admin to set up the database.",
      fr: "La base de données doit être initialisée. Veuillez visiter /admin pour configurer la base de données.",
    },
    tryAgain: {
      en: "Try Again",
      fr: "Réessayer",
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: texts.count[language], position: "insideBottom", offset: -5 }} />
        <YAxis type="category" dataKey="topic" width={90} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [value, texts.count[language]]} />
        <Legend />
        <Bar dataKey="count" name={texts.count[language]} fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

