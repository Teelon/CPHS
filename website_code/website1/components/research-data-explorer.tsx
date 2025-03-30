"use client"

import { useState } from "react"
import { Search, Calendar, MapPin, Tag, Database, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

// Mock search results
const mockSearchResults = [
  {
    id: "1",
    title: "Toronto Pride Parade 1981",
    date: "1981-06-28",
    location: { city: "Toronto", province: "ON" },
    organization: { name: "Pride Toronto" },
    summary: "The first official Pride celebration in Toronto, following protests against police raids.",
    topics: [
      { id: 1, name: "Pride" },
      { id: 2, name: "Parade" },
      { id: 3, name: "Historical" },
    ],
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    title: "Edmonton Pride Festival Cancellation",
    date: "2019-04-10",
    location: { city: "Edmonton", province: "AB" },
    organization: { name: "Edmonton Pride Festival Society" },
    summary:
      "Edmonton Pride Festival was cancelled in 2019 due to internal conflicts and demands from QTBIPOC groups for greater inclusion and representation.",
    topics: [
      { id: 1, name: "Pride" },
      { id: 5, name: "Cancellation" },
      { id: 6, name: "Inclusion" },
    ],
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    title: "Regina Pride History",
    date: "1990-06-15",
    location: { city: "Regina", province: "SK" },
    organization: { name: "Queen City Pride" },
    summary:
      "Regina has been hosting Pride events since 1990, with the first official Pride parade taking place in 1993.",
    topics: [
      { id: 1, name: "Pride" },
      { id: 3, name: "Historical" },
    ],
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

// Update the component to accept an initialQuery prop
export function ResearchDataExplorer({ initialQuery = "" }: { initialQuery?: string | null }) {
  const { language } = useLanguage()
  const [query, setQuery] = useState(initialQuery || "")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [activeTab, setActiveTab] = useState("search")

  // Mock provinces and topics
  const provinces = [
    { code: "ON", name: "Ontario" },
    { code: "QC", name: "Quebec" },
    { code: "BC", name: "British Columbia" },
    { code: "AB", name: "Alberta" },
    { code: "SK", name: "Saskatchewan" },
    { code: "MB", name: "Manitoba" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "YT", name: "Yukon" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
  ]

  const topics = [
    { id: 1, name: "Pride" },
    { id: 2, name: "Parade" },
    { id: 3, name: "Historical" },
    { id: 4, name: "Festival" },
    { id: 5, name: "Cancellation" },
    { id: 6, name: "Inclusion" },
    { id: 7, name: "Same-Sex Marriage" },
    { id: 8, name: "Legal Impact" },
    { id: 9, name: "Political Support" },
    { id: 10, name: "Rural Pride" },
  ]

  // Automatically search if initialQuery is provided
  useState(() => {
    if (initialQuery) {
      handleSearch()
    }
  })

  // Update the search button to show loading state and handle errors properly
  const handleSearch = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Filter results based on query and filters
      let filteredResults = [...mockSearchResults]

      if (query) {
        filteredResults = filteredResults.filter(
          (result) =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.summary.toLowerCase().includes(query.toLowerCase()) ||
            result.organization.name.toLowerCase().includes(query.toLowerCase()) ||
            result.location.city.toLowerCase().includes(query.toLowerCase()) ||
            result.location.province.toLowerCase().includes(query.toLowerCase()) ||
            result.topics.some((topic) => topic.name.toLowerCase().includes(query.toLowerCase())),
        )
      }

      if (selectedProvince) {
        filteredResults = filteredResults.filter((result) => result.location.province === selectedProvince)
      }

      if (selectedTopics.length > 0) {
        filteredResults = filteredResults.filter((result) =>
          result.topics.some((topic) => selectedTopics.includes(topic.id)),
        )
      }

      if (dateRange.from) {
        filteredResults = filteredResults.filter((result) => new Date(result.date) >= dateRange.from!)
      }

      if (dateRange.to) {
        filteredResults = filteredResults.filter((result) => new Date(result.date) <= dateRange.to!)
      }

      setResults(filteredResults)

      // Switch to results tab after search
      setActiveTab("results")
    } catch (error) {
      console.error("Error searching database:", error)
      // Show error message to user
      alert(language === "en" ? "Error searching database" : "Erreur lors de la recherche dans la base de données")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  // Translations for UI elements
  const texts = {
    title: {
      en: "Database Explorer",
      fr: "Explorateur de base de données",
    },
    subtitle: {
      en: "Search the PIMS database directly to gain insights",
      fr: "Recherchez directement dans la base de données PIMS pour obtenir des informations",
    },
    searchPlaceholder: {
      en: "Search for events, organizations, locations...",
      fr: "Rechercher des événements, organisations, lieux...",
    },
    search: {
      en: "Search",
      fr: "Rechercher",
    },
    filters: {
      en: "Filters",
      fr: "Filtres",
    },
    results: {
      en: "Results",
      fr: "Résultats",
    },
    province: {
      en: "Province",
      fr: "Province",
    },
    selectProvince: {
      en: "Select province",
      fr: "Sélectionner une province",
    },
    topics: {
      en: "Topics",
      fr: "Sujets",
    },
    dateRange: {
      en: "Date Range",
      fr: "Plage de dates",
    },
    selectDateRange: {
      en: "Select date range",
      fr: "Sélectionner une plage de dates",
    },
    clearFilters: {
      en: "Clear Filters",
      fr: "Effacer les filtres",
    },
    noResults: {
      en: "No results found. Try adjusting your search or filters.",
      fr: "Aucun résultat trouvé. Essayez d'ajuster votre recherche ou vos filtres.",
    },
    searching: {
      en: "Searching...",
      fr: "Recherche en cours...",
    },
    viewDetails: {
      en: "View Details",
      fr: "Voir les détails",
    },
    searchResults: {
      en: "Search Results",
      fr: "Résultats de recherche",
    },
    searchTips: {
      en: "Search Tips",
      fr: "Conseils de recherche",
    },
    tip1: {
      en: "Use specific terms to narrow your search",
      fr: "Utilisez des termes spécifiques pour affiner votre recherche",
    },
    tip2: {
      en: "Combine filters for more precise results",
      fr: "Combinez les filtres pour des résultats plus précis",
    },
    tip3: {
      en: "Search by city, province, or organization name",
      fr: "Recherchez par ville, province ou nom d'organisation",
    },
  }

  const clearFilters = () => {
    setSelectedProvince(null)
    setSelectedTopics([])
    setDateRange({
      from: undefined,
      to: undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{texts.title[language]}</h2>
        <p className="text-muted-foreground">{texts.subtitle[language]}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">{texts.search[language]}</TabsTrigger>
          <TabsTrigger value="results">{texts.results[language]}</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={texts.searchPlaceholder[language]}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {texts.searching[language]}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  {texts.search[language]}
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {texts.province[language]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {provinces.map((province) => (
                    <div key={province.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`province-${province.code}`}
                        checked={selectedProvince === province.code}
                        onCheckedChange={() =>
                          setSelectedProvince(selectedProvince === province.code ? null : province.code)
                        }
                      />
                      <Label htmlFor={`province-${province.code}`}>{province.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  {texts.topics[language]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {topics.map((topic) => (
                    <div key={topic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={selectedTopics.includes(topic.id)}
                        onCheckedChange={() => handleTopicToggle(topic.id)}
                      />
                      <Label htmlFor={`topic-${topic.id}`}>{topic.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {texts.dateRange[language]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{texts.selectDateRange[language]}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" className="w-full mt-2" onClick={clearFilters}>
                  {texts.clearFilters[language]}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{texts.searchTips[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>{texts.tip1[language]}</li>
                <li>{texts.tip2[language]}</li>
                <li>{texts.tip3[language]}</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                {texts.searchResults[language]}
                {results.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {results.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {result.imageUrl && (
                            <div className="md:w-1/4">
                              <div className="relative h-32 w-full rounded-md overflow-hidden">
                                <img
                                  src={result.imageUrl || "/placeholder.svg"}
                                  alt={result.title}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{result.title}</h3>
                            <div className="flex flex-wrap gap-2 my-2">
                              {result.date && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(result.date).toLocaleDateString(language === "en" ? "en-CA" : "fr-CA")}
                                </Badge>
                              )}
                              {result.location && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {result.location.city}, {result.location.province}
                                </Badge>
                              )}
                              {result.organization && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Database className="h-3 w-3" />
                                  {result.organization.name}
                                </Badge>
                              )}
                            </div>
                            {result.topics && (
                              <div className="flex flex-wrap gap-1 my-2">
                                {result.topics.map((topic) => (
                                  <Badge key={topic.id} variant="secondary" className="text-xs">
                                    {topic.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">{result.summary}</p>
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/records/${result.id}`, "_blank")}
                              >
                                {texts.viewDetails[language]}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">{texts.noResults[language]}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

