"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Database, Check, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export function DatabaseInitializer() {
  const { language } = useLanguage()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update the initializeDatabase function to provide better feedback
  const initializeDatabase = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      const response = await fetch("/api/init-database")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setIsInitialized(true)
        // Add a small delay to show success message before redirecting
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        throw new Error(data.message || "Unknown error occurred during initialization")
      }
    } catch (error: any) {
      console.error("Error initializing database:", error)
      setError(error.message || "An unknown error occurred")
    } finally {
      setIsInitializing(false)
    }
  }

  const texts = {
    initialize: {
      en: "Initialize Database",
      fr: "Initialiser la base de données",
    },
    initializing: {
      en: "Initializing...",
      fr: "Initialisation en cours...",
    },
    initialized: {
      en: "Database Initialized",
      fr: "Base de données initialisée",
    },
    error: {
      en: "Error:",
      fr: "Erreur:",
    },
    description: {
      en: "This will create the necessary tables and sample data in your Supabase database.",
      fr: "Cela créera les tables nécessaires et des données d'exemple dans votre base de données Supabase.",
    },
    warning: {
      en: "Warning: This will reset any existing data in the database.",
      fr: "Avertissement: Cela réinitialisera toutes les données existantes dans la base de données.",
    },
  }

  // Add a success message after initialization
  if (isInitialized) {
    return (
      <div className="p-6 border rounded-lg bg-green-50">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-full bg-green-100 p-2">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-700">{texts.initialized[language]}</h2>
        </div>
        <p className="text-sm text-green-600 mb-4">
          {language === "en"
            ? "Database has been successfully initialized. Redirecting to dashboard..."
            : "La base de données a été initialisée avec succès. Redirection vers le tableau de bord..."}
        </p>
        <Button variant="outline" asChild className="w-full">
          <Link href="/dashboard">{language === "en" ? "Go to Dashboard" : "Aller au tableau de bord"}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <Database className="mr-2 h-5 w-5" />
        {texts.initialize[language]}
      </h2>

      <p className="text-sm text-muted-foreground mb-4">{texts.description[language]}</p>

      <p className="text-sm text-amber-600 mb-4 flex items-center">
        <AlertTriangle className="mr-2 h-4 w-4" />
        {texts.warning[language]}
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 mb-4">
          {texts.error[language]} {error}
        </div>
      )}

      {isInitialized ? (
        <Button disabled className="bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          {texts.initialized[language]}
        </Button>
      ) : (
        <Button onClick={initializeDatabase} disabled={isInitializing}>
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {texts.initializing[language]}
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              {texts.initialize[language]}
            </>
          )}
        </Button>
      )}
    </div>
  )
}

