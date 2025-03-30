"use client"

import { ResearchDataExplorer } from "@/components/research-data-explorer"
import { ResearchQuestions } from "@/components/research-questions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"

export default function ResearchPage() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const [initialQuery, setInitialQuery] = useState<string | null>(null)

  useEffect(() => {
    // Get query from URL parameters
    const query = searchParams.get("query")
    if (query) {
      setInitialQuery(query)
    } else {
      // Check if there's a query in localStorage
      const savedQuery = localStorage.getItem("lastResearchQuery")
      if (savedQuery) {
        setInitialQuery(savedQuery)
        // Clear the saved query
        localStorage.removeItem("lastResearchQuery")
      }
    }
  }, [searchParams])

  const texts = {
    title: {
      en: "Research Portal",
      fr: "Portail de recherche",
    },
    description: {
      en: "Search the PIMS database directly to answer research questions about Pride history in Canada. This tool is designed to help researchers find answers to questions about Pride events across the country.",
      fr: "Recherchez directement dans la base de données PIMS pour répondre aux questions de recherche sur l'histoire de la Fierté au Canada. Cet outil est conçu pour aider les chercheurs à trouver des réponses aux questions sur les événements de la Fierté à travers le pays.",
    },
    questionsTitle: {
      en: "Research Questions",
      fr: "Questions de recherche",
    },
    explorerTitle: {
      en: "Database Explorer",
      fr: "Explorateur de base de données",
    },
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{texts.title[language]}</h1>
      <p className="text-gray-600 mb-8">{texts.description[language]}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{texts.questionsTitle[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchQuestions />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{texts.explorerTitle[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResearchDataExplorer initialQuery={initialQuery} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

