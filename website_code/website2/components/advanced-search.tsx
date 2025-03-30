"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X, MapPin, Users, Clock } from "lucide-react"
import { TagInput } from "@/components/tag-input"
import { useDebouncedCallback } from "use-debounce"

interface AdvancedSearchProps {
  topics: { topic_id: number; topic_name: string | null }[]
  locations: { location_id: number; city: string | null; province: string | null }[]
  organizations: { organization_id: number; organization_name: string }[]
  searchParams: { [key: string]: string | string[] | undefined }
  updateSearchParams: (params: Record<string, string | null>) => void
  isPending: boolean
}

export default function AdvancedSearch({
  topics,
  locations,
  organizations,
  searchParams,
  updateSearchParams,
  isPending,
}: AdvancedSearchProps) {
  // Group locations by province for better organization
  const locationsByProvince = useRef(
    locations.reduce(
      (acc, location) => {
        if (!location.province || !location.city) return acc

        if (!acc[location.province]) {
          acc[location.province] = []
        }

        acc[location.province].push({
          id: location.location_id,
          name: location.city,
        })

        return acc
      },
      {} as Record<string, { id: number; name: string }[]>,
    ),
  ).current

  // State for all filters
  const [searchQuery, setSearchQuery] = useState<string>((searchParams.q as string) || "")
  const [eventType, setEventType] = useState<string>((searchParams.organization as string) || "")
  const [location, setLocation] = useState<string>((searchParams.location as string) || "")
  const [decade, setDecade] = useState<string>((searchParams.decade as string) || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.startDate ? new Date(searchParams.startDate as string) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.endDate ? new Date(searchParams.endDate as string) : undefined,
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.tags ? (searchParams.tags as string).split(",") : [],
  )
  const [photosOnly, setPhotosOnly] = useState<boolean>(searchParams.photosOnly === "true")
  const [sqlGenerator, setSqlGenerator] = useState<boolean>(searchParams.sqlGenerator === "true")

  // Extract topic names from the topics array
  const topicNames = topics
    .map((topic) => topic.topic_name)
    .filter((name): name is string => name !== null)
    .sort()

  // Generate decades for the dropdown
  const decades = [
    { value: "1960s", label: "1960s" },
    { value: "1970s", label: "1970s" },
    { value: "1980s", label: "1980s" },
    { value: "1990s", label: "1990s" },
    { value: "2000s", label: "2000s" },
    { value: "2010s", label: "2010s" },
    { value: "2020s", label: "2020s" },
  ]

  // Debounced search handler to prevent excessive URL updates
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateSearchParams({ q: value || null })
  }, 500)

  // Apply filters when form is submitted
  const applyFilters = () => {
    updateSearchParams({
      q: searchQuery || null,
      organization: eventType !== "all" ? eventType : null,
      location: location !== "all" ? location : null,
      decade: decade !== "all" ? decade : null,
      startDate: startDate ? startDate.toISOString().split("T")[0] : null,
      endDate: endDate ? endDate.toISOString().split("T")[0] : null,
      tags: selectedTags.length > 0 ? selectedTags.join(",") : null,
      photosOnly: photosOnly ? "true" : null,
      sqlGenerator: sqlGenerator ? "true" : null,
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setEventType("")
    setLocation("")
    setDecade("")
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectedTags([])
    setPhotosOnly(false)
    setSqlGenerator(false)

    updateSearchParams({
      q: null,
      organization: null,
      location: null,
      decade: null,
      startDate: null,
      endDate: null,
      tags: null,
      photosOnly: null,
      sqlGenerator: null,
    })
  }

  // Handle SQL Generator toggle separately to update immediately
  const handleSqlGeneratorToggle = (checked: boolean) => {
    setSqlGenerator(checked)
    updateSearchParams({
      sqlGenerator: checked ? "true" : null,
      // Preserve all other current search params
      ...Object.fromEntries(
        Object.entries(searchParams)
          .filter(([key]) => key !== "sqlGenerator")
          .map(([key, value]) => [key, typeof value === "string" ? value : null]),
      ),
    })
  }

  // Check if any filters are applied
  const hasActiveFilters =
    searchQuery ||
    eventType ||
    location ||
    decade ||
    startDate ||
    endDate ||
    selectedTags.length > 0 ||
    photosOnly ||
    sqlGenerator

  return (
    <Card className="border-amber-900/30 bg-amber-950/10">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-300">Advanced Search</h1>
          <div className="flex items-center space-x-2 bg-amber-950/40 p-2 rounded-md border border-amber-900/30">
            <span className="text-amber-300 text-sm">Show SQL Query</span>
            <Switch
              checked={sqlGenerator}
              onCheckedChange={handleSqlGeneratorToggle}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>
        </div>

        {/* Main search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-amber-500" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              debouncedSearch(e.target.value)
            }}
            placeholder="Search events by title, organization, or content..."
            className="pl-10 bg-amber-950/30 border-amber-900/50 text-amber-50 placeholder:text-amber-500/50 h-12"
          />
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-300 mb-2">
                <Clock className="h-4 w-4" />
                <h2 className="text-lg font-semibold">Date Range</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="text-amber-200 mb-1.5 block">
                    Start Date
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="start-date-input"
                        type="date"
                        value={startDate ? startDate.toISOString().split("T")[0] : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined
                          setStartDate(date)
                          if (date) {
                            updateSearchParams({ startDate: date.toISOString().split("T")[0] })
                          } else {
                            updateSearchParams({ startDate: null })
                          }
                        }}
                        className="bg-amber-950/30 border-amber-900/50 text-amber-50 h-10 w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="end-date" className="text-amber-200 mb-1.5 block">
                    End Date
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="end-date-input"
                        type="date"
                        value={endDate ? endDate.toISOString().split("T")[0] : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined
                          setEndDate(date)
                          if (date) {
                            updateSearchParams({ endDate: date.toISOString().split("T")[0] })
                          } else {
                            updateSearchParams({ endDate: null })
                          }
                        }}
                        className="bg-amber-950/30 border-amber-900/50 text-amber-50 h-10 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="decade" className="text-amber-200 mb-1.5 block">
                  Decade
                </Label>
                <Select
                  value={decade}
                  onValueChange={(value) => {
                    setDecade(value)
                    updateSearchParams({ decade: value !== "all" ? value : null })
                  }}
                >
                  <SelectTrigger id="decade" className="bg-amber-950/30 border-amber-900/50 text-amber-50 h-10">
                    <SelectValue placeholder="All Decades" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-950 border-amber-900/50 text-amber-50">
                    <SelectItem value="all">All Decades</SelectItem>
                    {decades.map((decade) => (
                      <SelectItem key={decade.value} value={decade.value}>
                        {decade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location & Organization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-300 mb-2">
                <MapPin className="h-4 w-4" />
                <h2 className="text-lg font-semibold">Location & Organization</h2>
              </div>

              <div>
                <Label htmlFor="location" className="text-amber-200 mb-1.5 block">
                  Location
                </Label>
                <Select
                  value={location}
                  onValueChange={(value) => {
                    setLocation(value)
                    updateSearchParams({ location: value !== "all" ? value : null })
                  }}
                >
                  <SelectTrigger id="location" className="bg-amber-950/30 border-amber-900/50 text-amber-50 h-10">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-950 border-amber-900/50 text-amber-50 max-h-[300px]">
                    <SelectItem value="all">All Locations</SelectItem>
                    {Object.entries(locationsByProvince).map(([province, cities]) => (
                      <div key={province}>
                        <SelectItem value={province} disabled className="font-bold text-amber-400">
                          {province}
                        </SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={`${city.name}, ${province}`} className="pl-6">
                            {city.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="organization" className="text-amber-200 mb-1.5 block">
                  Organization
                </Label>
                <Select
                  value={eventType}
                  onValueChange={(value) => {
                    setEventType(value)
                    updateSearchParams({ organization: value !== "all" ? value : null })
                  }}
                >
                  <SelectTrigger id="organization" className="bg-amber-950/30 border-amber-900/50 text-amber-50 h-10">
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-950 border-amber-900/50 text-amber-50 max-h-[300px]">
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.organization_id} value={org.organization_name}>
                        {org.organization_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="photos-only"
                  checked={photosOnly}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true
                    setPhotosOnly(isChecked)
                    updateSearchParams({ photosOnly: isChecked ? "true" : null })
                  }}
                  className="border-amber-700 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <Label htmlFor="photos-only" className="text-amber-200">
                  Show results with photos only
                </Label>
              </div>
            </div>
          </div>

          {/* Tags Filter - Moved from Advanced tab */}
          <div className="mt-6">
            <div className="flex items-center gap-2 text-amber-300 mb-3">
              <Users className="h-4 w-4" />
              <h2 className="text-lg font-semibold">Tags</h2>
            </div>
            <TagInput
              availableTags={topicNames}
              selectedTags={selectedTags}
              onTagsChange={(tags) => {
                setSelectedTags(tags)
                updateSearchParams({ tags: tags.length > 0 ? tags.join(",") : null })
              }}
              placeholder="Select or create tags..."
            />
          </div>
        </div>

        <Separator className="my-6 bg-amber-900/30" />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={applyFilters}
            className="bg-amber-600 hover:bg-amber-700 text-black font-medium h-12 flex-1"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Applying...
              </>
            ) : (
              <>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="outline"
              className="border-amber-600 text-amber-300 hover:bg-amber-900/20 hover:text-amber-50 h-12 flex-1"
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

