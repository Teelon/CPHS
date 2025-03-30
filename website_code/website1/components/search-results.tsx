"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"
import type { OIMSRecord } from "@/lib/db"
import { useSearchParams } from "next/navigation"

type SearchResultsProps = {
  searchQuery?: string
  filters?: {
    province?: string
    city?: string
    organization?: string
    topics?: string[]
    dateRange?: {
      from?: Date
      to?: Date
    }
    yearRange?: [number, number]
  }
}

export function SearchResults({ searchQuery, filters }: SearchResultsProps) {
  const { language } = useLanguage()
  const [results, setResults] = useState<OIMSRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "")
  const searchParams = useSearchParams()

  // Check for query parameter from URL
  useEffect(() => {
    const urlQuery = searchParams.get("query")
    if (urlQuery) {
      setLocalSearchQuery(urlQuery)
    } else if (searchQuery) {
      setLocalSearchQuery(searchQuery)
    }
  }, [searchParams, searchQuery])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)

        // Fetch all entries from pims_main
        const response = await fetch("/api/pims?type=entries")

        if (!response.ok) {
          throw new Error(`Failed to fetch entries: ${response.statusText}`)
        }

        const data = await response.json()

        // Filter results based on search query and filters
        let filteredResults = data

        if (localSearchQuery) {
          const query = localSearchQuery.toLowerCase()
          filteredResults = filteredResults.filter(
            (entry: OIMSRecord) =>
              entry.title.toLowerCase().includes(query) ||
              (entry.summary && entry.summary.toLowerCase().includes(query)) ||
              (entry.organization_name && entry.organization_name.toLowerCase().includes(query)) ||
              (entry.city && entry.city.toLowerCase().includes(query)) ||
              (entry.province && entry.province.toLowerCase().includes(query)),
          )
        }

        // Apply filters if provided
        if (filters) {
          if (filters.province) {
            filteredResults = filteredResults.filter((entry: OIMSRecord) => entry.province === filters.province)
          }

          if (filters.city) {
            filteredResults = filteredResults.filter((entry: OIMSRecord) => entry.city === filters.city)
          }

          if (filters.organization) {
            filteredResults = filteredResults.filter(
              (entry: OIMSRecord) => entry.organization_name === filters.organization,
            )
          }

          // More filters can be applied here
        }

        // Sort results
        switch (sortBy) {
          case "dateNewest":
            filteredResults.sort((a: OIMSRecord, b: OIMSRecord) => {
              if (!a.date) return 1
              if (!b.date) return -1
              return new Date(b.date).getTime() - new Date(a.date).getTime()
            })
            break
          case "dateOldest":
            filteredResults.sort((a: OIMSRecord, b: OIMSRecord) => {
              if (!a.date) return 1
              if (!b.date) return -1
              return new Date(a.date).getTime() - new Date(b.date).getTime()
            })
            break
          case "alphabetical":
            filteredResults.sort((a: OIMSRecord, b: OIMSRecord) => a.title.localeCompare(b.title))
            break
          // Default is relevance, which is the order returned from the database
        }

        setResults(filteredResults)
        setError(null)
      } catch (error: any) {
        console.error("Error fetching search results:", error)
        setError(error.message || "Failed to fetch search results")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [localSearchQuery, filters, sortBy])

  const texts = {
    showing: {
      en: "Showing",
      fr: "Affichage de",
    },
    results: {
      en: "results",
      fr: "résultats",
    },
    sortBy: {
      en: "Sort by:",
      fr: "Trier par:",
    },
    relevance: {
      en: "Relevance",
      fr: "Pertinence",
    },
    dateNewest: {
      en: "Date (Newest)",
      fr: "Date (Plus récent)",
    },
    dateOldest: {
      en: "Date (Oldest)",
      fr: "Date (Plus ancien)",
    },
    alphabetical: {
      en: "A-Z",
      fr: "A-Z",
    },
    viewRecord: {
      en: "View Record",
      fr: "Voir l'enregistrement",
    },
    loadMore: {
      en: "Load More",
      fr: "Charger plus",
    },
    loading: {
      en: "Loading results...",
      fr: "Chargement des résultats...",
    },
    error: {
      en: "Error loading results",
      fr: "Erreur lors du chargement des résultats",
    },
    noResults: {
      en: "No results found",
      fr: "Aucun résultat trouvé",
    },
    searchingFor: {
      en: "Searching for",
      fr: "Recherche de",
    },
  }

  return (
    <div className="space-y-6">
      {localSearchQuery && (
        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <p className="text-purple-800">
            <strong>{texts.searchingFor[language]}:</strong> {localSearchQuery}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>{texts.loading[language]}</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          {texts.error[language]}: {error}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {texts.showing[language]} <strong>{results.length}</strong> {texts.results[language]}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{texts.sortBy[language]}</span>
              <select
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">{texts.relevance[language]}</option>
                <option value="dateNewest">{texts.dateNewest[language]}</option>
                <option value="dateOldest">{texts.dateOldest[language]}</option>
                <option value="alphabetical">{texts.alphabetical[language]}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {results.map((result) => (
              <Card key={result.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={result.image_url || "/placeholder.svg?height=200&width=400"}
                    alt={result.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/records/${result.id}`} className="hover:underline">
                      {result.title}
                    </Link>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {result.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{result.date}</span>
                      </div>
                    )}
                    {result.city && result.province && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {result.city}, {result.province}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                  {result.topics && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.topics.split(",").map((topic, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="mr-1 h-3 w-3" />
                          {topic.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/records/${result.id}`}>{texts.viewRecord[language]}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {results.length > 10 && (
            <div className="flex justify-center">
              <Button variant="outline">{texts.loadMore[language]}</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">{texts.noResults[language]}</div>
      )}
    </div>
  )
}

