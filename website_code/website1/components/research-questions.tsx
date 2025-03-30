"use client"

import { useState } from "react"
import { Search, Database, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"

// Sample research questions based on sponsor requirements
const sampleQuestions = [
  {
    id: "q1",
    question: {
      en: "How long has Regina been hosting Pride parades and events?",
      fr: "Depuis combien de temps Regina organise-t-elle des défilés et des événements de la Fierté?",
    },
    keywords: ["Regina", "Pride", "history", "events"],
    searchQuery: "Regina Pride history",
  },
  {
    id: "q2",
    question: {
      en: "Why didn't Edmonton have a Pride Festival in 2019?",
      fr: "Pourquoi Edmonton n'a pas eu de Festival de la Fierté en 2019?",
    },
    keywords: ["Edmonton", "2019", "cancellation", "Pride Festival"],
    searchQuery: "Edmonton Pride 2019 cancellation",
  },
  {
    id: "q3",
    question: {
      en: "Did the legalization of same-sex marriage lead to an increase in attendance in Vancouver?",
      fr: "La légalisation du mariage entre personnes de même sexe a-t-elle entraîné une augmentation de la participation à Vancouver?",
    },
    keywords: ["same-sex marriage", "attendance", "Vancouver", "impact"],
    searchQuery: "Vancouver Pride same-sex marriage impact",
  },
  {
    id: "q4",
    question: {
      en: "What years did Pride celebrations begin to gain political support in Toronto?",
      fr: "En quelles années les célébrations de la Fierté ont-elles commencé à gagner un soutien politique à Toronto?",
    },
    keywords: ["political support", "mayors", "proclamations", "Pride flags", "Toronto"],
    searchQuery: "Toronto Pride political support history",
  },
  {
    id: "q5",
    question: {
      en: "Which non-urban areas in Canada host Pride celebrations?",
      fr: "Quelles zones non urbaines au Canada organisent des célébrations de la Fierté?",
    },
    keywords: ["non-urban", "rural", "small town", "Pride events"],
    searchQuery: "rural non-urban Pride Canada",
  },
]

export function ResearchQuestions() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Filter questions based on search query
  const filteredQuestions = sampleQuestions.filter(
    (q) =>
      q.question[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Translations for UI elements
  const uiText = {
    searchPlaceholder: {
      en: "Search research questions...",
      fr: "Rechercher des questions de recherche...",
    },
    exploreDatabase: {
      en: "Search Archives",
      fr: "Rechercher dans les archives",
    },
    noQuestionsFound: {
      en: "No questions found matching your search.",
      fr: "Aucune question trouvée correspondant à votre recherche.",
    },
  }

  // Update the handleExploreQuestion function to navigate to search with query parameters
  const handleExploreQuestion = (searchQuery: string) => {
    // Navigate to the search page with the query
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={uiText.searchPlaceholder[language]}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{q.question[language]}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1">
                  {q.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center"
                  onClick={() => handleExploreQuestion(q.searchQuery)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {uiText.exploreDatabase[language]}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{uiText.noQuestionsFound[language]}</p>
          </div>
        )}
      </div>
    </div>
  )
}

