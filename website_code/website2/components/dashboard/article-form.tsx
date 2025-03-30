"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Globe, Tag } from "lucide-react"
import { createArticle, updateArticle } from "@/app/dashboard/articles/actions"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopicSelector } from "./topic-selector"
import { TranslationFields } from "./translation-fields"

interface Organization {
  organization_id: number
  organization_name: string
}

interface Location {
  location_id: number
  city: string | null
  province: string | null
}

interface Translation {
  language_id: number
  title: string
  summary: string
}

interface ArticleFormProps {
  article?: {
    id: number
    title: string | null
    summary: string | null
    date: string | null
    organization_id: number | null
    location_id: number | null
    source_link: string | null
    organizations?: { organization_name: string }
    locations?: { city: string | null; province: string | null }
    topics?: { topic_id: number }[]
    translations?: {
      language_id: number
      title: string | null
      summary: string | null
    }[]
  }
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    article?.organization_id?.toString() || "none",
  )
  const [selectedLocation, setSelectedLocation] = useState<string>(article?.location_id?.toString() || "none")
  const [selectedTopics, setSelectedTopics] = useState<number[]>(article?.topics?.map((t) => t.topic_id) || [])
  const [translations, setTranslations] = useState<Translation[]>(
    article?.translations?.map((t) => ({
      language_id: t.language_id,
      title: t.title || "",
      summary: t.summary || "",
    })) || [],
  )
  const [activeTab, setActiveTab] = useState("basic")

  // Fetch organizations and locations
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from("organizations")
        .select("organization_id, organization_name")
        .order("organization_name")

      if (orgsError) {
        console.error("Error fetching organizations:", orgsError)
      } else {
        setOrganizations(orgsData || [])
      }

      // Fetch locations
      const { data: locsData, error: locsError } = await supabase
        .from("locations")
        .select("location_id, city, province")
        .order("province")
        .order("city")

      if (locsError) {
        console.error("Error fetching locations:", locsError)
      } else {
        setLocations(locsData || [])
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true)

      // Add selected organization and location to form data
      if (selectedOrganization && selectedOrganization !== "none") {
        formData.set("organization_id", selectedOrganization)
      } else {
        formData.set("organization_id", "")
      }

      if (selectedLocation && selectedLocation !== "none") {
        formData.set("location_id", selectedLocation)
      } else {
        formData.set("location_id", "")
      }

      // Add topics
      formData.set("topics", JSON.stringify(selectedTopics))

      // Add translations
      formData.set("translations", JSON.stringify(translations))

      let result

      if (article) {
        // Update existing article
        result = await updateArticle(article.id, formData)
      } else {
        // Create new article
        result = await createArticle(formData)
      }

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: article ? "Article updated successfully" : "Article created successfully",
        })
        router.push("/dashboard/articles")
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={onSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Topics</span>
          </TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Translations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter article title"
                    defaultValue={article?.title || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={article?.date ? new Date(article.date).toISOString().split("T")[0] : ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.organization_id} value={org.organization_id.toString()}>
                          {org.organization_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.location_id} value={loc.location_id.toString()}>
                          {loc.city}, {loc.province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_link">Source Link (optional)</Label>
                  <Input
                    id="source_link"
                    name="source_link"
                    placeholder="Enter source URL"
                    defaultValue={article?.source_link || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder="Enter article summary"
                    defaultValue={article?.summary || ""}
                    rows={10}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select topics that are relevant to this article. Topics help users find related content.
                </p>
                <TopicSelector selectedTopics={selectedTopics} onChange={setSelectedTopics} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add translations for this article in different languages. The primary language is English.
                </p>
                <TranslationFields translations={translations} onChange={setTranslations} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/articles")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {article ? "Update" : "Create"} Article
        </Button>
      </div>
    </form>
  )
}

