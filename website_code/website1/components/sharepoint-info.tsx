"use client"

import { Database, Globe } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { DatabaseConnectionStatus } from "@/components/database-connection-status"
import Link from "next/link"

export function SQLDatabaseInfo() {
  const { language, toggleLanguage } = useLanguage()

  const text = {
    title: {
      en: "SQL Database Integration",
      fr: "Intégration de base de données SQL",
    },
    bilingual: {
      en: "Bilingual",
      fr: "Bilingue",
    },
    description: {
      en: "This dashboard is directly connected to the PIMS SQL database, ensuring all data displayed is accurate and up-to-date.",
      fr: "Ce tableau de bord est directement connecté à la base de données SQL PIMS, garantissant que toutes les données affichées sont précises et à jour.",
    },
    schema: {
      en: "Database Schema",
      fr: "Schéma de base de données",
    },
    schemaDescription: {
      en: "The database includes tables for Organizations, Locations, Topics, Main Entries, and Images.",
      fr: "La base de données comprend des tables pour les Organisations, les Lieux, les Sujets, les Entrées Principales et les Images.",
    },
    tables: {
      en: "Database Tables",
      fr: "Tables de base de données",
    },
    tablesDescription: {
      en: "The normalized schema ensures data integrity and efficient querying across all Pride events.",
      fr: "Le schéma normalisé assure l'intégrité des données et des requêtes efficaces sur tous les événements de la Fierté.",
    },
    databaseUrl: {
      en: "Database Connection:",
      fr: "Connexion à la base de données:",
    },
    cphs: {
      en: "Canadian Pride Historical Society PIMS",
      fr: "PIMS de la Société historique de la fierté canadienne",
    },
    openDatabase: {
      en: "Open Database Admin",
      fr: "Ouvrir l'administrateur de base de données",
    },
    toggleLanguage: {
      en: "Français",
      fr: "English",
    },
    lastUpdated: {
      en: "Last updated:",
      fr: "Dernière mise à jour:",
    },
    dataSource: {
      en: "Data Source:",
      fr: "Source de données:",
    },
    liveConnection: {
      en: "Live Connection",
      fr: "Connexion en direct",
    },
  }

  // Get current date for "last updated" display
  const currentDate = new Date().toLocaleDateString(language === "en" ? "en-CA" : "fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Alert className="mb-6">
      <Database className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center gap-2">
        {text.title[language]}
        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-100">
          <Globe className="mr-1 h-3 w-3" />
          {text.bilingual[language]}
        </Badge>
        <div className="ml-auto">
          <DatabaseConnectionStatus />
        </div>
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{text.description[language]}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">{text.schema[language]}</h4>
            <p className="text-xs text-muted-foreground">{text.schemaDescription[language]}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">{text.tables[language]}</h4>
            <p className="text-xs text-muted-foreground">{text.tablesDescription[language]}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center mt-2">
          <div>
            <p className="text-sm text-muted-foreground">
              {text.databaseUrl[language]} <span className="text-gray-700">{text.cphs[language]}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {text.lastUpdated[language]} {currentDate}
              </span>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {text.liveConnection[language]}
              </Badge>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">{text.openDatabase[language]}</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={toggleLanguage}
            >
              <Globe className="mr-2 h-4 w-4" />
              {text.toggleLanguage[language]}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

