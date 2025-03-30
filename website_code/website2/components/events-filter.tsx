"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Search, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function EventsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // State for filter options
  const [topics, setTopics] = useState<string[]>([])
  const [locations, setLocations] = useState<{ city: string; province: string }[]>([])
  const [organizations, setOrganizations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for selected filters
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get("topic") || "")
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get("location") || "")
  const [selectedOrganization, setSelectedOrganization] = useState<string>(searchParams.get("organization") || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined,
  )
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("search") || "")

  // Fetch filter options on component mount
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching filter options...")

        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("topic")
          .select("topic_name")
          .order("topic_name")

        if (topicsError) {
          console.error("Topics error:", topicsError)
          throw topicsError
        }

        console.log("Topics data:", topicsData)

        if (topicsData) {
          setTopics(topicsData.map((t) => t.topic_name || "").filter(Boolean))
        }

        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("city, province")
          .order("province")
          .order("city")

        if (locationsError) {
          console.error("Locations error:", locationsError)
          throw locationsError
        }

        console.log("Locations data:", locationsData)

        if (locationsData) {
          setLocations(
            locationsData
              .map((l) => ({
                city: l.city || "",
                province: l.province || "",
              }))
              .filter((l) => l.city && l.province),
          )
        }

        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from("organizations")
          .select("organization_name")
          .order("organization_name")

        if (orgsError) {
          console.error("Organizations error:", orgsError)
          throw orgsError
        }

        console.log("Organizations data:", orgsData)

        if (orgsData) {
          setOrganizations(orgsData.map((o) => o.organization_name).filter(Boolean))
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching filter options:", error)
        setError("Failed to load filter options. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchFilterOptions()
  }, [supabase])

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (selectedTopic) params.set("topic", selectedTopic)
    if (selectedLocation) params.set("location", selectedLocation)
    if (selectedOrganization) params.set("organization", selectedOrganization)
    if (startDate) params.set("startDate", startDate.toISOString().split("T")[0])
    if (endDate) params.set("endDate", endDate.toISOString().split("T")[0])
    if (searchQuery) params.set("search", searchQuery)

    // Preserve sort parameter if it exists
    const currentSort = searchParams.get("sort")
    if (currentSort) params.set("sort", currentSort)

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`/events?${params.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedTopic("")
    setSelectedLocation("")
    setSelectedOrganization("")
    setStartDate(undefined)
    setEndDate(undefined)
    setSearchQuery("")

    // Preserve sort parameter if it exists
    const params = new URLSearchParams()
    const currentSort = searchParams.get("sort")
    if (currentSort) params.set("sort", currentSort)

    router.push(`/events?${params.toString()}`)
  }

  // Check if any filters are applied
  const hasActiveFilters =
    selectedTopic || selectedLocation || selectedOrganization || startDate || endDate || searchQuery

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
        <p className="text-destructive font-medium mb-2">Error</p>
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Topic Filter */}
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <select
          id="topic"
          className="w-full p-2 border rounded-md bg-background"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        {isLoading && topics.length === 0 && <p className="text-xs text-muted-foreground">Loading topics...</p>}
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <select
          id="location"
          className="w-full p-2 border rounded-md bg-background"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={`${location.city}-${location.province}`} value={`${location.city}, ${location.province}`}>
              {location.city}, {location.province}
            </option>
          ))}
        </select>
        {isLoading && locations.length === 0 && <p className="text-xs text-muted-foreground">Loading locations...</p>}
      </div>

      {/* Organization Filter */}
      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <select
          id="organization"
          className="w-full p-2 border rounded-md bg-background"
          value={selectedOrganization}
          onChange={(e) => setSelectedOrganization(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
        {isLoading && organizations.length === 0 && (
          <p className="text-xs text-muted-foreground">Loading organizations...</p>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="flex flex-col space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? formatDate(startDate.toISOString()) : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? formatDate(endDate.toISOString()) : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-4">
        <Button onClick={applyFilters} disabled={isLoading}>
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="flex items-center" disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}

