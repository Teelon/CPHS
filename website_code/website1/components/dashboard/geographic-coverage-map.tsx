"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Province name translations and codes
const provinceInfo = [
  { id: "ON", name: { en: "Ontario", fr: "Ontario" } },
  { id: "QC", name: { en: "Quebec", fr: "Québec" } },
  { id: "BC", name: { en: "British Columbia", fr: "Colombie-Britannique" } },
  { id: "AB", name: { en: "Alberta", fr: "Alberta" } },
  { id: "NS", name: { en: "Nova Scotia", fr: "Nouvelle-Écosse" } },
  { id: "MB", name: { en: "Manitoba", fr: "Manitoba" } },
  { id: "SK", name: { en: "Saskatchewan", fr: "Saskatchewan" } },
  { id: "NB", name: { en: "New Brunswick", fr: "Nouveau-Brunswick" } },
  { id: "NL", name: { en: "Newfoundland and Labrador", fr: "Terre-Neuve-et-Labrador" } },
  { id: "PE", name: { en: "Prince Edward Island", fr: "Île-du-Prince-Édouard" } },
  { id: "YT", name: { en: "Yukon", fr: "Yukon" } },
  { id: "NT", name: { en: "Northwest Territories", fr: "Territoires du Nord-Ouest" } },
  { id: "NU", name: { en: "Nunavut", fr: "Nunavut" } },
]

// Province code mapping (full name to code)
const provinceCodeMap: Record<string, string> = {
  Ontario: "ON",
  Quebec: "QC",
  "British Columbia": "BC",
  Alberta: "AB",
  "Nova Scotia": "NS",
  Manitoba: "MB",
  Saskatchewan: "SK",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Prince Edward Island": "PE",
  Yukon: "YT",
  "Northwest Territories": "NT",
  Nunavut: "NU",
}

type ProvinceDataPoint = {
  province: string
  count: number
}

export function GeographicCoverageMap() {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<
    Array<{
      id: string
      name: { en: string; fr: string }
      count: number
      percentage: number
    }>
  >([])
  const [totalEvents, setTotalEvents] = useState(0)
  const [needsInitialization, setNeedsInitialization] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch province data from API
        const response = await fetch("/api/pims?type=events-by-province")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const provinceData: ProvinceDataPoint[] = await response.json()

        // If the array is empty, it might mean the database isn't initialized
        if (provinceData.length === 0) {
          setNeedsInitialization(true)
          setProvinces([])
          setTotalEvents(0)
        } else {
          // Calculate total events
          const total = provinceData.reduce((sum, item) => sum + item.count, 0)
          setTotalEvents(total)

          // Create province data with counts and percentages
          const provinceDataMap: Record<string, { count: number; percentage: number }> = {}

          provinceData.forEach((item) => {
            // Map province name to province code
            const provinceCode = provinceCodeMap[item.province] || item.province

            provinceDataMap[provinceCode] = {
              count: item.count,
              percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
            }
          })

          // Create full province data array
          const fullProvinceData = provinceInfo
            .map((province) => ({
              ...province,
              count: provinceDataMap[province.id]?.count || 0,
              percentage: provinceDataMap[province.id]?.percentage || 0,
            }))
            .sort((a, b) => b.count - a.count)

          setProvinces(fullProvinceData)
        }
      } catch (error: any) {
        console.error("Error fetching province data:", error)
        setError(error.message || "Failed to load province data")

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

  const handleProvinceClick = (provinceId: string) => {
    setSelectedProvince(provinceId === selectedProvince ? null : provinceId)
  }

  const selectedProvinceData = selectedProvince ? provinces.find((p) => p.id === selectedProvince) : null

  const texts = {
    records: {
      en: "records",
      fr: "enregistrements",
    },
    events: {
      en: "documented Pride events",
      fr: "événements de la Fierté documentés",
    },
    noSelection: {
      en: "Select a province or territory to see details",
      fr: "Sélectionnez une province ou un territoire pour voir les détails",
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
    percentage: {
      en: "of total events",
      fr: "du total des événements",
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

  if (provinces.length === 0 || totalEvents === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">{texts.noData[language]}</div>
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="relative h-[200px] w-full mb-4">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=200&width=400&text=Canada+Map"
            alt="Map of Canada"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[120px] overflow-y-auto mb-4">
        {provinces.map((province) => (
          <button
            key={province.id}
            className={`rounded-md p-2 text-left text-sm transition-colors ${
              selectedProvince === province.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => handleProvinceClick(province.id)}
          >
            <div className="font-medium">{province.name[language]}</div>
            <div className="text-xs">
              {province.count} {texts.records[language]}
            </div>
          </button>
        ))}
      </div>

      {selectedProvinceData ? (
        <div className="mt-auto rounded-md bg-muted p-3">
          <h4 className="font-medium">{selectedProvinceData.name[language]}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {selectedProvinceData.count} {texts.records[language]} ({selectedProvinceData.percentage}%{" "}
            {texts.percentage[language]})
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>
                  {selectedProvinceData.count} {texts.events[language]}
                </span>
              </div>

              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${selectedProvinceData.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto rounded-md bg-muted p-3 text-center text-muted-foreground">
          {texts.noSelection[language]}
        </div>
      )}
    </div>
  )
}

