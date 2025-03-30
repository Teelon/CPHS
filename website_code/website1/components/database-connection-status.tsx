"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useDatabase } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Loader2, WifiOff, Wifi, Database } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DatabaseConnectionStatus() {
  const { language } = useLanguage()
  const { isConnected, isLoading, error, needsInitialization } = useDatabase()
  const [mounted, setMounted] = useState(false)
  const [localConnectionStatus, setLocalConnectionStatus] = useState({
    isConnected: false,
    isLoading: true,
    error: null as string | null,
    needsInitialization: false,
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update the useEffect hook to check connection status more accurately
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLocalConnectionStatus((prev) => ({ ...prev, isLoading: true }))

        // Try to fetch stats as a connection test
        const response = await fetch("/api/pims?type=stats")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()

        // If we have data, we're connected
        if (data.totalRecords > 0) {
          setLocalConnectionStatus((prev) => ({
            ...prev,
            isConnected: true,
            needsInitialization: false,
            error: null,
          }))
        } else {
          // If no records, database might need initialization
          setLocalConnectionStatus((prev) => ({
            ...prev,
            isConnected: false,
            needsInitialization: true,
            error: null,
          }))
        }
      } catch (error: any) {
        console.error("Database connection check error:", error)

        // Check if this is an initialization issue
        if (error.message && error.message.includes("does not exist")) {
          setLocalConnectionStatus((prev) => ({
            ...prev,
            isConnected: false,
            needsInitialization: true,
            error: "Database needs to be initialized",
          }))
        } else {
          setLocalConnectionStatus((prev) => ({
            ...prev,
            isConnected: false,
            needsInitialization: false,
            error: error.message || "Failed to connect to database",
          }))
        }
      } finally {
        setLocalConnectionStatus((prev) => ({ ...prev, isLoading: false }))
      }
    }

    checkConnection()
  }, [])

  if (!mounted) {
    return null
  }

  const texts = {
    connected: {
      en: "Connected",
      fr: "Connecté",
    },
    connecting: {
      en: "Connecting...",
      fr: "Connexion en cours...",
    },
    disconnected: {
      en: "Disconnected",
      fr: "Déconnecté",
    },
    error: {
      en: "Connection Error",
      fr: "Erreur de connexion",
    },
    needsInitialization: {
      en: "Needs Initialization",
      fr: "Nécessite une initialisation",
    },
    initialize: {
      en: "Initialize",
      fr: "Initialiser",
    },
  }

  // Use the local state for rendering
  const {
    isLoading: localIsLoading,
    isConnected: localIsConnected,
    error: localError,
    needsInitialization: localNeedsInitialization,
  } = localConnectionStatus

  if (localIsLoading) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        {texts.connecting[language]}
      </Badge>
    )
  }

  if (localNeedsInitialization) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1">
          <Database className="h-3 w-3" />
          {texts.needsInitialization[language]}
        </Badge>
        <Button variant="outline" size="sm" asChild className="h-6 py-0 px-2 text-xs">
          <Link href="/admin">{texts.initialize[language]}</Link>
        </Button>
      </div>
    )
  }

  if (localError) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
        <WifiOff className="h-3 w-3" />
        {texts.error[language]}
      </Badge>
    )
  }

  if (localIsConnected) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
        <Wifi className="h-3 w-3" />
        {texts.connected[language]}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      {texts.disconnected[language]}
    </Badge>
  )
}

