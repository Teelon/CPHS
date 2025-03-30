"use client"

import { useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

// Sample photo data with bilingual metadata
const samplePhotos = [
  {
    id: "1",
    title: {
      en: "Toronto Pride Parade 1981",
      fr: "Défilé de la Fierté de Toronto 1981",
    },
    description: {
      en: "The first official Pride parade in Toronto following protests against police raids.",
      fr: "Le premier défilé officiel de la Fierté à Toronto suite aux manifestations contre les descentes policières.",
    },
    date: "1981-06-28",
    displayDate: {
      en: "June 28, 1981",
      fr: "28 juin 1981",
    },
    thumbnail: "/placeholder.svg?height=200&width=300",
    tags: {
      en: ["pride", "parade", "toronto", "historical"],
      fr: ["fierté", "défilé", "toronto", "historique"],
    },
  },
  {
    id: "2",
    title: {
      en: "Montreal Pride Festival",
      fr: "Festival de la Fierté de Montréal",
    },
    description: {
      en: "Images from early Montreal Pride celebrations, now one of the largest Pride festivals in the Francophone world.",
      fr: "Images des premières célébrations de la Fierté de Montréal, maintenant l'un des plus grands festivals de la Fierté dans le monde francophone.",
    },
    date: "2007-07-29",
    displayDate: {
      en: "July 29, 2007",
      fr: "29 juillet 2007",
    },
    thumbnail: "/placeholder.svg?height=200&width=300",
    tags: {
      en: ["pride", "festival", "montreal", "quebec"],
      fr: ["fierté", "festival", "montréal", "québec"],
    },
  },
  {
    id: "3",
    title: {
      en: "Vancouver Pride Society",
      fr: "Société de la Fierté de Vancouver",
    },
    description: {
      en: "Historical photos from Vancouver Pride events showcasing the evolution of Pride celebrations on the West Coast.",
      fr: "Photos historiques des événements de la Fierté de Vancouver illustrant l'évolution des célébrations de la Fierté sur la côte ouest.",
    },
    date: "1978-08-05",
    displayDate: {
      en: "August 5, 1978",
      fr: "5 août 1978",
    },
    thumbnail: "/placeholder.svg?height=200&width=300",
    tags: {
      en: ["pride", "vancouver", "british columbia", "west coast"],
      fr: ["fierté", "vancouver", "colombie-britannique", "côte ouest"],
    },
  },
  {
    id: "4",
    title: {
      en: "Halifax Pride",
      fr: "Fierté de Halifax",
    },
    description: {
      en: "Images from Halifax Pride celebrations, one of the oldest Pride events in Atlantic Canada.",
      fr: "Images des célébrations de la Fierté de Halifax, l'un des plus anciens événements de la Fierté au Canada atlantique.",
    },
    date: "1988-07-19",
    displayDate: {
      en: "July 19, 1988",
      fr: "19 juillet 1988",
    },
    thumbnail: "/placeholder.svg?height=200&width=300",
    tags: {
      en: ["pride", "halifax", "nova scotia", "atlantic"],
      fr: ["fierté", "halifax", "nouvelle-écosse", "atlantique"],
    },
  },
]

export function PhotoGallery() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter photos based on search query
  const filteredPhotos = samplePhotos.filter((photo) => {
    if (!searchQuery) return true

    return (
      photo.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags[language].some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  // Sort photos by date (newest first)
  const sortedPhotos = [...filteredPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Translations for UI elements
  const uiText = {
    searchPlaceholder: {
      en: "Search photos...",
      fr: "Rechercher des photos...",
    },
    gridView: {
      en: "Grid View",
      fr: "Vue en grille",
    },
    listView: {
      en: "List View",
      fr: "Vue en liste",
    },
    viewDetails: {
      en: "View Details",
      fr: "Voir les détails",
    },
    noPhotosFound: {
      en: "No photos found matching your search.",
      fr: "Aucune photo trouvée correspondant à votre recherche.",
    },
    photo: {
      en: "Photo",
      fr: "Photo",
    },
    title: {
      en: "Title",
      fr: "Titre",
    },
    date: {
      en: "Date",
      fr: "Date",
    },
    view: {
      en: "View",
      fr: "Voir",
    },
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={uiText.searchPlaceholder[language]}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">{uiText.gridView[language]}</TabsTrigger>
          <TabsTrigger value="list">{uiText.listView[language]}</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={photo.thumbnail || "/placeholder.svg"}
                    alt={photo.title[language]}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg">{photo.title[language]}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{photo.displayDate[language]}</p>
                  <p className="text-sm line-clamp-2">{photo.description[language]}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {photo.tags[language].map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`/photos/${photo.id}`, "_blank")}
                  >
                    {uiText.viewDetails[language]}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {uiText.photo[language]}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {uiText.title[language]}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {uiText.date[language]}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {uiText.view[language]}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPhotos.map((photo) => (
                  <tr key={photo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative h-16 w-24">
                        <Image
                          src={photo.thumbnail || "/placeholder.svg"}
                          alt={photo.title[language]}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{photo.title[language]}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {photo.tags[language].slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{photo.displayDate[language]}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button variant="outline" size="sm">
                        {uiText.view[language]}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {sortedPhotos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{uiText.noPhotosFound[language]}</p>
        </div>
      )}
    </div>
  )
}

