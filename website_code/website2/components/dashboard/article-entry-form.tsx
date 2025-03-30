"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Globe, Tag, CalendarIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { z } from "zod"
import { createArticle } from "@/app/dashboard/articles/actions"

// Define types for our form data
interface Organization {
  organization_id: number
  organization_name: string
}

interface Location {
  location_id: number
  city: string | null
  province: string | null
}

interface Language {
  language_id: number
  language_name: string
}

interface Topic {
  topic_id: number
  topic_name: string | null
}

interface Translation {
  language_id: number
  language_name: string
  title: string
  summary: string
  source_link: string
}

// Define validation schema
const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date().optional(),
  organization_id: z.string().optional(),
  location_id: z.string().optional(),
  summary: z.string().min(1, "Summary is required"),
  source_link: z.string().optional(),
  has_photos: z.boolean().default(false),
  type: z.string().optional(),
})

export default function ArticleEntryForm() {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [organizationId, setOrganizationId] = useState<string>("")
  const [locationId, setLocationId] = useState<string>("")
  const [summary, setSummary] = useState("")
  const [sourceLink, setSourceLink] = useState("")
  const [hasPhotos, setHasPhotos] = useState(false)
  const [type, setType] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [activeTab, setActiveTab] = useState("basic")

  // Data for dropdowns
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Fetch data for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch organizations
        const { data: orgsData } = await supabase
          .from("organizations")
          .select("organization_id, organization_name")
          .order("organization_name")

        if (orgsData) setOrganizations(orgsData)

        // Fetch locations
        const { data: locsData } = await supabase
          .from("locations")
          .select("location_id, city, province")
          .order("province")
          .order("city")

        if (locsData) setLocations(locsData)

        // Fetch languages
        const { data: langsData } = await supabase
          .from("languages")
          .select("language_id, language_name")
          .order("language_name")

        if (langsData) setLanguages(langsData)

        // Fetch topics
        const { data: topicsData } = await supabase.from("topic").select("topic_id, topic_name").order("topic_name")

        if (topicsData) setTopics(topicsData)
      } catch (error) {
        console.error("Error fetching form data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [supabase])

  // Add a translation
  const addTranslation = (language: Language) => {
    // Check if translation for this language already exists
    const exists = translations.some((t) => t.language_id === language.language_id)

    if (!exists) {
      setTranslations([
        ...translations,
        {
          language_id: language.language_id,
          language_name: language.language_name,
          title: "",
          summary: "",
          source_link: "",
        },
      ])
    }
  }

  // Update a translation
  const updateTranslation = (languageId: number, field: keyof Translation, value: string) => {
    setTranslations(translations.map((t) => (t.language_id === languageId ? { ...t, [field]: value } : t)))
  }

  // Remove a translation
  const removeTranslation = (languageId: number) => {
    setTranslations(translations.filter((t) => t.language_id !== languageId))
  }

  // Toggle topic selection
  const toggleTopic = (topicId: number) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((id) => id !== topicId))
    } else {
      setSelectedTopics([...selectedTopics, topicId])
    }
  }

  // Validate form
  const validateForm = () => {
    try {
      articleSchema.parse({
        title,
        date,
        organization_id: organizationId,
        location_id: locationId,
        summary,
        source_link: sourceLink,
        has_photos: hasPhotos,
        type,
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData object
      const formData = new FormData()
      formData.append("title", title)
      if (date) formData.append("date", date.toISOString().split("T")[0])
      if (organizationId) formData.append("organization_id", organizationId)
      if (locationId) formData.append("location_id", locationId)
      formData.append("summary", summary)
      if (sourceLink) formData.append("source_link", sourceLink)
      formData.append("has_photos", hasPhotos.toString())
      if (type) formData.append("type", type)

      // Add topics
      formData.append("topics", JSON.stringify(selectedTopics))

      // Add translations
      formData.append("translations", JSON.stringify(translations))

      // Submit the form
      const result = await createArticle(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Article created successfully!",
      })

      // Redirect to articles list
      router.push("/dashboard/articles")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Translations</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Topics</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title"
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date)
                        setIsCalendarOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select value={organizationId} onValueChange={setOrganizationId}>
                  <SelectTrigger id="organization">
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
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="location">
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
                <Label htmlFor="summary">
                  Summary <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter article summary"
                  rows={6}
                  className={errors.summary ? "border-destructive" : ""}
                />
                {errors.summary && <p className="text-sm text-destructive">{errors.summary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_link">Source Link</Label>
                <Input
                  id="source_link"
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  placeholder="Enter source URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Enter article type"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="has_photos"
                  checked={hasPhotos}
                  onCheckedChange={(checked) => setHasPhotos(checked === true)}
                />
                <Label htmlFor="has_photos" className="cursor-pointer">
                  Has Photos
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Add Translation</Label>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        const language = languages.find((l) => l.language_id.toString() === value)
                        if (language) addTranslation(language)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages
                          .filter((lang) => !translations.some((t) => t.language_id === lang.language_id))
                          .map((lang) => (
                            <SelectItem key={lang.language_id} value={lang.language_id.toString()}>
                              {lang.language_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                      Back to Basic Info
                    </Button>
                  </div>
                </div>

                {translations.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">
                      No translations added yet. Select a language above to add a translation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {translations.map((translation) => (
                      <div key={translation.language_id} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{translation.language_name}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTranslation(translation.language_id)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`title-${translation.language_id}`}>Title</Label>
                          <Input
                            id={`title-${translation.language_id}`}
                            value={translation.title}
                            onChange={(e) => updateTranslation(translation.language_id, "title", e.target.value)}
                            placeholder={`Title in ${translation.language_name}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`summary-${translation.language_id}`}>Summary</Label>
                          <Textarea
                            id={`summary-${translation.language_id}`}
                            value={translation.summary}
                            onChange={(e) => updateTranslation(translation.language_id, "summary", e.target.value)}
                            placeholder={`Summary in ${translation.language_name}`}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`source_link-${translation.language_id}`}>Source Link</Label>
                          <Input
                            id={`source_link-${translation.language_id}`}
                            value={translation.source_link}
                            onChange={(e) => updateTranslation(translation.language_id, "source_link", e.target.value)}
                            placeholder={`Source link in ${translation.language_name}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select topics that are relevant to this article. Topics help users find related content.
                </p>

                {topics.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">No topics available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {topics.map((topic) => (
                      <div key={topic.topic_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`topic-${topic.topic_id}`}
                          checked={selectedTopics.includes(topic.topic_id)}
                          onCheckedChange={() => toggleTopic(topic.topic_id)}
                        />
                        <Label htmlFor={`topic-${topic.topic_id}`} className="cursor-pointer">
                          {topic.topic_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4">
                  <p className="text-sm">
                    Selected topics: <span className="font-medium">{selectedTopics.length}</span>
                  </p>
                </div>
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
          Create Article
        </Button>
      </div>
    </form>
  )
}

