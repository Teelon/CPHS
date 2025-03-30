"use client"

import type React from "react"
import { useState } from "react"
import { CalendarIcon, Heart, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useLanguage } from "@/contexts/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import type { Organization, Location, Topic } from "@/lib/db"
import { supabase } from "@/lib/supabase"

export function RecordSubmissionForm() {
  const { language } = useLanguage()

  // Form data
  const [date, setDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [titleEn, setTitleEn] = useState("")
  const [titleFr, setTitleFr] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [descriptionFr, setDescriptionFr] = useState("")
  const [sourceLink, setSourceLink] = useState("")
  const [tags, setTags] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState<string>("")
  const [newOrganizationName, setNewOrganizationName] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")

  // Options for dropdowns
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  // Ensure we're only rendering on the client side where the context is available
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load options from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase.from("organizations").select("*").order("name")

        if (orgsError) throw orgsError
        setOrganizations(orgsData || [])

        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("*")
          .order("province")
          .order("city")

        if (locationsError) throw locationsError
        setLocations(locationsData || [])

        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase.from("topics").select("*").order("name")

        if (topicsError) throw topicsError
        setTopics(topicsData || [])
      } catch (error: any) {
        console.error("Error fetching options:", error)
        setError(error.message || "Failed to load form options")
      } finally {
        setIsLoading(false)
      }
    }

    if (isClient) {
      fetchOptions()
    }
  }, [isClient])

  // Update the handleSubmit function to correctly handle organization data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!titleEn || !selectedLocation || !descriptionEn) {
        throw new Error(
          language === "en" ? "Please fill in all required fields" : "Veuillez remplir tous les champs obligatoires",
        )
      }

      // Format date string
      const formattedDate = date ? format(date, "MMMM d, yyyy") : null

      // Handle organization - either use existing or create new one
      let organizationId = null

      if (selectedOrganization && selectedOrganization !== "new") {
        // Use existing organization
        organizationId = Number.parseInt(selectedOrganization)
      } else if (newOrganizationName && newOrganizationName.trim() !== "") {
        // Create new organization
        const { data: newOrg, error: newOrgError } = await supabase
          .from("organizations")
          .insert({ name: newOrganizationName.trim() })
          .select()

        if (newOrgError) throw newOrgError

        if (newOrg && newOrg.length > 0) {
          organizationId = newOrg[0].id
        }
      }

      // Insert new PIMS entry
      const { data: entry, error: entryError } = await supabase
        .from("pims_entries")
        .insert({
          title: titleEn, // Use English title as primary
          organization_id: organizationId,
          location_id: selectedLocation ? Number.parseInt(selectedLocation) : null,
          date: formattedDate,
          summary: descriptionEn, // Use English description as primary
          source_link: sourceLink || null,
        })
        .select()

      if (entryError) throw entryError

      // If entry was created successfully, process tags
      if (entry && entry.length > 0) {
        const entryId = entry[0].id

        // Process tags
        if (tags) {
          const tagList = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)

          for (const tag of tagList) {
            // Check if topic exists
            let topicId: number

            const { data: existingTopic, error: topicError } = await supabase
              .from("topics")
              .select("id")
              .eq("name", tag)
              .limit(1)

            if (topicError) throw topicError

            if (existingTopic && existingTopic.length > 0) {
              topicId = existingTopic[0].id
            } else {
              // Create new topic
              const { data: newTopic, error: newTopicError } = await supabase
                .from("topics")
                .insert({ name: tag })
                .select()

              if (newTopicError) throw newTopicError

              if (!newTopic || newTopic.length === 0) {
                throw new Error("Failed to create new topic")
              }

              topicId = newTopic[0].id
            }

            // Create event_topic relationship
            const { error: eventTopicError } = await supabase.from("event_topics").insert({
              pims_entry_id: entryId,
              topic_id: topicId,
            })

            if (eventTopicError) throw eventTopicError
          }
        }
      }

      // Reset form
      setTitleEn("")
      setTitleFr("")
      setDescriptionEn("")
      setDescriptionFr("")
      setSourceLink("")
      setTags("")
      setSelectedOrganization("")
      setNewOrganizationName("")
      setSelectedLocation("")
      setDate(undefined)

      // Show success message
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("Error submitting record:", error)
      setError(error.message || "Failed to submit record")
    } finally {
      setIsSubmitting(false)
    }
  }

  const texts = {
    title: {
      en: "Title",
      fr: "Titre",
    },
    titleEn: {
      en: "Title (English)",
      fr: "Titre (Anglais)",
    },
    titleFr: {
      en: "Title (French)",
      fr: "Titre (Français)",
    },
    date: {
      en: "Date",
      fr: "Date",
    },
    selectDate: {
      en: "Select date",
      fr: "Sélectionner une date",
    },
    location: {
      en: "Location",
      fr: "Lieu",
    },
    selectLocation: {
      en: "Select location",
      fr: "Sélectionner un lieu",
    },
    organization: {
      en: "Organization",
      fr: "Organisation",
    },
    selectOrganization: {
      en: "Select organization",
      fr: "Sélectionner une organisation",
    },
    descriptionEn: {
      en: "Description (English)",
      fr: "Description (Anglais)",
    },
    descriptionFr: {
      en: "Description (French)",
      fr: "Description (Français)",
    },
    tags: {
      en: "Tags (comma separated)",
      fr: "Tags (séparés par des virgules)",
    },
    tagsPlaceholder: {
      en: "e.g. Pride, Parade, Toronto, 1980s",
      fr: "ex. Fierté, Défilé, Toronto, 1980s",
    },
    sourceInfo: {
      en: "Source Information",
      fr: "Informations sur la source",
    },
    sourcePlaceholder: {
      en: "Please provide information about the source of this record (e.g., personal collection, archive, publication)",
      fr: "Veuillez fournir des informations sur la source de cet enregistrement (par exemple, collection personnelle, archive, publication)",
    },
    submit: {
      en: "Submit Record",
      fr: "Soumettre l'enregistrement",
    },
    submitting: {
      en: "Submitting...",
      fr: "Soumission en cours...",
    },
    recordSubmitted: {
      en: "Record Submitted",
      fr: "Enregistrement soumis",
    },
    thankYou: {
      en: "Thank you for your contribution! Our team will review your submission.",
      fr: "Merci pour votre contribution! Notre équipe examinera votre soumission.",
    },
    submitAnother: {
      en: "Submit Another Record",
      fr: "Soumettre un autre enregistrement",
    },
    required: {
      en: "Required",
      fr: "Requis",
    },
    optional: {
      en: "Optional",
      fr: "Optionnel",
    },
    loading: {
      en: "Loading form options...",
      fr: "Chargement des options du formulaire...",
    },
    formTitle: {
      en: "Share Your Pride Story",
      fr: "Partagez Votre Histoire de Fierté",
    },
    formSubtitle: {
      en: "Help us document and celebrate LGBTQ+ history across Canada",
      fr: "Aidez-nous à documenter et célébrer l'histoire LGBTQ+ à travers le Canada",
    },
    createNew: {
      en: "Create new",
      fr: "Créer nouveau",
    },
  }

  if (!isClient) {
    return null
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center bg-gradient-to-r from-pink-100 to-violet-100 rounded-lg p-8">
        <div className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 p-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
          {texts.recordSubmitted[language]}
        </h3>
        <p className="mt-2 text-gray-700">{texts.thankYou[language]}</p>
        <Button
          className="mt-6 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
          onClick={() => setIsSubmitted(false)}
        >
          {texts.submitAnother[language]}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Flag className="h-8 w-8 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
          {texts.formTitle[language]}
        </h2>
        <p className="text-gray-600">{texts.formSubtitle[language]}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mr-3"></div>
          <p>{texts.loading[language]}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-r from-pink-50 to-violet-50 p-6 rounded-lg">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 flex items-start">
              <div className="flex-shrink-0 mr-2">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title-en" className="text-gray-700">
                  {texts.titleEn[language]} <span className="text-pink-500">*</span>
                </Label>
                <Input
                  id="title-en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title-fr" className="text-gray-700">
                  {texts.titleFr[language]} <span className="text-gray-400 text-sm">({texts.optional[language]})</span>
                </Label>
                <Input
                  id="title-fr"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="event-date" className="text-gray-700">
                  {texts.date[language]} <span className="text-gray-400 text-sm">({texts.optional[language]})</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="event-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-pink-200 hover:bg-pink-50",
                        !date && "text-gray-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-pink-500" />
                      {date ? format(date, "PPP") : texts.selectDate[language]}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="rounded-md border border-pink-200"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="text-gray-700">
                  {texts.organization[language]}{" "}
                  <span className="text-gray-400 text-sm">({texts.optional[language]})</span>
                </Label>
                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                  <SelectTrigger id="organization" className="border-pink-200 focus:ring-pink-500">
                    <SelectValue placeholder={texts.selectOrganization[language]} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">-- {texts.createNew[language]} --</SelectItem>
                    {organizations &&
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={String(org.id)}>
                          {org.name || org.organization_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedOrganization === "new" && (
                  <div className="mt-2">
                    <Label htmlFor="new-organization" className="text-gray-700">
                      {language === "en" ? "New Organization Name" : "Nom de la nouvelle organisation"}
                    </Label>
                    <Input
                      id="new-organization"
                      value={newOrganizationName}
                      onChange={(e) => setNewOrganizationName(e.target.value)}
                      placeholder={
                        language === "en" ? "Enter new organization name" : "Entrez le nom de la nouvelle organisation"
                      }
                      className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700">
                  {texts.location[language]} <span className="text-pink-500">*</span>
                </Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation} required>
                  <SelectTrigger id="location" className="border-pink-200 focus:ring-pink-500">
                    <SelectValue placeholder={texts.selectLocation[language]} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations &&
                      locations.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          {loc.city}, {loc.province}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-en" className="text-gray-700">
                {texts.descriptionEn[language]} <span className="text-pink-500">*</span>
              </Label>
              <Textarea
                id="description-en"
                rows={4}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-fr" className="text-gray-700">
                {texts.descriptionFr[language]}{" "}
                <span className="text-gray-400 text-sm">({texts.optional[language]})</span>
              </Label>
              <Textarea
                id="description-fr"
                rows={4}
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-700">
                {texts.tags[language]} <span className="text-gray-400 text-sm">({texts.optional[language]})</span>
              </Label>
              <Input
                id="tags"
                placeholder={texts.tagsPlaceholder[language]}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>
          </div>

          <Separator className="my-6 bg-gradient-to-r from-pink-200 to-violet-200" />

          <div className="space-y-2">
            <Label htmlFor="source" className="text-gray-700">
              {texts.sourceInfo[language]} <span className="text-gray-400 text-sm">({texts.optional[language]})</span>
            </Label>
            <Textarea
              id="source"
              placeholder={texts.sourcePlaceholder[language]}
              rows={2}
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-6 py-2"
            >
              {isSubmitting ? texts.submitting[language] : texts.submit[language]}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

