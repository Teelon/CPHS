"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, X } from "lucide-react"

interface DashboardFiltersProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function DashboardFilters({ startYear, endYear, province, organization, topic }: DashboardFiltersProps) {
  const router = useRouter()
  const supabase = createClient()

  // State for filter options
  const [provinces, setProvinces] = useState<string[]>([])
  const [organizations, setOrganizations] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // State for selected filters
  const [selectedStartYear, setSelectedStartYear] = useState<string>(startYear?.toString() || "")
  const [selectedEndYear, setSelectedEndYear] = useState<string>(endYear?.toString() || "")
  const [selectedProvince, setSelectedProvince] = useState<string>(province || "")
  const [selectedOrganization, setSelectedOrganization] = useState<string>(organization || "")
  const [selectedTopic, setSelectedTopic] = useState<string>(topic || "")

  // Fetch filter options on component mount
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        setLoading(true)

        // Fetch provinces
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("province")
          .not("province", "is", null)
          .order("province")

        if (locationsError) throw locationsError

        if (locationsData) {
          const uniqueProvinces = [...new Set(locationsData.map((l) => l.province).filter(Boolean))]
          setProvinces(uniqueProvinces as string[])
        }

        // Fetch organizations
        const { data: orgsData, error: orgsError } = await supabase
          .from("organizations")
          .select("organization_name")
          .order("organization_name")

        if (orgsError) throw orgsError

        if (orgsData) {
          setOrganizations(orgsData.map((o) => o.organization_name).filter(Boolean))
        }

        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("topic")
          .select("topic_name")
          .order("topic_name")

        if (topicsError) throw topicsError

        if (topicsData) {
          setTopics(topicsData.map((t) => t.topic_name).filter(Boolean) as string[])
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [supabase])

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (selectedStartYear) params.set("startYear", selectedStartYear)
    if (selectedEndYear) params.set("endYear", selectedEndYear)
    if (selectedProvince) params.set("province", selectedProvince)
    if (selectedOrganization) params.set("organization", selectedOrganization)
    if (selectedTopic) params.set("topic", selectedTopic)

    router.push(`/dashboard?${params.toString()}`)
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedStartYear("")
    setSelectedEndYear("")
    setSelectedProvince("")
    setSelectedOrganization("")
    setSelectedTopic("")

    router.push("/dashboard")
  }

  // Check if any filters are applied
  const hasActiveFilters =
    selectedStartYear || selectedEndYear || selectedProvince || selectedOrganization || selectedTopic

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="start-year">Start Year</Label>
        <Input
          id="start-year"
          type="number"
          placeholder="e.g., 1970"
          value={selectedStartYear}
          onChange={(e) => setSelectedStartYear(e.target.value)}
          min="1900"
          max="2099"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end-year">End Year</Label>
        <Input
          id="end-year"
          type="number"
          placeholder="e.g., 2023"
          value={selectedEndYear}
          onChange={(e) => setSelectedEndYear(e.target.value)}
          min="1900"
          max="2099"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="province">Province</Label>
        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
          <SelectTrigger id="province">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Provinces</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
          <SelectTrigger id="organization">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <SelectTrigger id="topic">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2 pt-4">
        <Button onClick={applyFilters} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters} className="flex items-center">
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}

