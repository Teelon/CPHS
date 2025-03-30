"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Loader2, Database, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type DatabaseStats = {
  totalRecords: number
  provinces: number
  cities: number
  organizations: number
  topics: number
}

export function DataSummary() {
  const { language } = useLanguage()
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsInitialization, setNeedsInitialization] = useState(false)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/pims?type=stats")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()

        // Check if we have any data
        const hasData = data.totalRecords > 0

        if (!hasData) {
          setNeedsInitialization(true)
        } else {
          setStats(data)
        }
      } catch (error: any) {
        console.error("Error loading database stats:", error)
        setError(error.message || "Failed to load database stats")

        // Check if the error is related to missing tables
        if (error.message && error.message.includes("does not exist")) {
          setNeedsInitialization(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const texts = {
    title: {
      en: "PIMS Database Summary",
      fr: "Résumé de la base de données PIMS",
    },
    totalRecords: {
      en: "Total Records",
      fr: "Nombre total d'enregistrements",
    },
    provinces: {
      en: "Provinces/Territories",
      fr: "Provinces/Territoires",
    },
    cities: {
      en: "Cities",
      fr: "Villes",
    },
    organizations: {
      en: "Organizations",
      fr: "Organisations",
    },
    topics: {
      en: "Topics",
      fr: "Sujets",
    },
    loading: {
      en: "Loading...",
      fr: "Chargement...",
    },
    error: {
      en: "Error loading data",
      fr: "Erreur lors du chargement des données",
    },
    needsInitialization: {
      en: "Database needs to be initialized",
      fr: "La base de données doit être initialisée",
    },
    initializeDatabase: {
      en: "Initialize Database",
      fr: "Initialiser la base de données",
    },
    databaseNotInitialized: {
      en: "The database has not been initialized yet. Please visit the admin page to set up the database.",
      fr: "La base de données n'a pas encore été initialisée. Veuillez visiter la page d'administration pour configurer la base de données.",
    },
    tryAgain: {
      en: "Try Again",
      fr: "Réessayer",
    },
  }

  if (needsInitialization) {
    return (
      <div className="w-full mb-8 p-6 border rounded-lg bg-amber-50">
        <h2 className="text-xl font-semibold mb-4 text-center">{texts.needsInitialization[language]}</h2>
        <p className="text-center mb-4">{texts.databaseNotInitialized[language]}</p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/admin">
              <Database className="mr-2 h-4 w-4" />
              {texts.initializeDatabase[language]}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mb-8 p-6 border rounded-lg bg-purple-50">
      <h2 className="text-xl font-semibold mb-4 text-center">{texts.title[language]}</h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>{texts.loading[language]}</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-red-500 py-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{texts.error[language]}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} size="sm">
            {texts.tryAgain[language]}
          </Button>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">{texts.totalRecords[language]}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalRecords}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">{texts.provinces[language]}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.provinces}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">{texts.cities[language]}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.cities}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">{texts.organizations[language]}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.organizations}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="text-sm text-gray-500">{texts.topics[language]}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.topics}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

