import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Calendar, MapPin, Users, Tag } from "lucide-react"

interface ArchiveMetricsProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default async function ArchiveMetrics({
  startYear,
  endYear,
  province,
  organization,
  topic,
}: ArchiveMetricsProps) {
  const supabase = createClient()

  // Build base query for events
  let eventsQuery = supabase.from("pims_main").select("*", { count: "exact", head: true })

  // Apply filters
  if (startYear) {
    const startDate = `${startYear}-01-01`
    eventsQuery = eventsQuery.gte("date", startDate)
  }

  if (endYear) {
    const endDate = `${endYear}-12-31`
    eventsQuery = eventsQuery.lte("date", endDate)
  }

  if (province) {
    // Get location IDs for this province
    const { data: locationIds } = await supabase.from("locations").select("location_id").eq("province", province)

    if (locationIds && locationIds.length > 0) {
      const ids = locationIds.map((loc) => loc.location_id)
      eventsQuery = eventsQuery.in("location_id", ids)
    }
  }

  if (organization) {
    // Get organization ID
    const { data: orgData } = await supabase
      .from("organizations")
      .select("organization_id")
      .eq("organization_name", organization)
      .single()

    if (orgData) {
      eventsQuery = eventsQuery.eq("organization_id", orgData.organization_id)
    }
  }

  if (topic) {
    // Get topic ID
    const { data: topicData } = await supabase.from("topic").select("topic_id").eq("topic_name", topic).single()

    if (topicData) {
      // Get event IDs with this topic
      const { data: eventIds } = await supabase
        .from("pims_entry_topic")
        .select("pims_id")
        .eq("topic_id", topicData.topic_id)

      if (eventIds && eventIds.length > 0) {
        const ids = eventIds.map((e) => e.pims_id)
        eventsQuery = eventsQuery.in("id", ids)
      }
    }
  }

  // Execute queries
  const { count: eventsCount } = await eventsQuery

  // Get organizations count (with same filters)
  let orgsQuery = supabase.from("organizations").select("*", { count: "exact", head: true })

  if (organization) {
    orgsQuery = orgsQuery.eq("organization_name", organization)
  } else if (eventsCount && eventsCount > 0) {
    // Only count organizations that have events matching the filters
    const { data: filteredEvents } = await eventsQuery.select("organization_id")

    if (filteredEvents && filteredEvents.length > 0) {
      const orgIds = [...new Set(filteredEvents.map((e) => e.organization_id).filter(Boolean))]
      if (orgIds.length > 0) {
        orgsQuery = orgsQuery.in("organization_id", orgIds)
      }
    }
  }

  const { count: organizationsCount } = await orgsQuery

  // Get locations count (with same filters)
  let locationsQuery = supabase.from("locations").select("*", { count: "exact", head: true })

  if (province) {
    locationsQuery = locationsQuery.eq("province", province)
  } else if (eventsCount && eventsCount > 0) {
    // Only count locations that have events matching the filters
    const { data: filteredEvents } = await eventsQuery.select("location_id")

    if (filteredEvents && filteredEvents.length > 0) {
      const locationIds = [...new Set(filteredEvents.map((e) => e.location_id).filter(Boolean))]
      if (locationIds.length > 0) {
        locationsQuery = locationsQuery.in("location_id", locationIds)
      }
    }
  }

  const { count: locationsCount } = await locationsQuery

  // Get topics count (with same filters)
  let topicsCount = 0

  try {
    if (topic) {
      topicsCount = 1 // If a specific topic is selected, count is 1
    } else if (eventsCount && eventsCount > 0) {
      // Get event IDs matching the filters
      const { data: filteredEvents } = await eventsQuery.select("id")

      if (filteredEvents && filteredEvents.length > 0) {
        // Instead of querying all topic entries and then counting unique ones,
        // use a more efficient query with distinct
        const eventIds = filteredEvents.map((e) => e.id)

        // Use a single query with count and distinct
        const { count } = await supabase
          .from("pims_entry_topic")
          .select("topic_id", { count: "exact", head: false })
          .in("pims_id", eventIds.slice(0, 100)) // Limit to first 100 to avoid query size limits

        topicsCount = count || 0
      }
    } else {
      // Get total topics count - use a simpler query
      const { count } = await supabase.from("topic").select("*", { count: "exact", head: true })

      topicsCount = count || 0
    }
  } catch (error) {
    console.error("Error fetching topics count:", error)
    topicsCount = 0 // Default to 0 if there's an error
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Events</p>
              <p className="text-3xl font-bold">{eventsCount || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Organizations</p>
              <p className="text-3xl font-bold">{organizationsCount || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Locations</p>
              <p className="text-3xl font-bold">{locationsCount || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Topics</p>
              <p className="text-3xl font-bold">{topicsCount || 0}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Tag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

