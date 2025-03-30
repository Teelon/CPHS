import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import EventsList from "@/components/events-list"
import EventsFilter from "@/components/events-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Filter } from "lucide-react"
import type { Event } from "@/lib/types"
import { handleError } from "@/lib/utils"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const pageSize = 12

  const topic = typeof searchParams.topic === "string" ? searchParams.topic : undefined
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined
  const organization = typeof searchParams.organization === "string" ? searchParams.organization : undefined
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const sortBy = typeof searchParams.sort === "string" ? searchParams.sort : "date_desc"

  try {
    // Fetch events data server-side
    const supabase = createClient()

    // Calculate pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Build query with explicit joins instead of relying on foreign key references
    let query = supabase.from("pims_main").select(
      `
        id,
        title,
        date,
        summary,
        source_link,
        organization_id,
        organizations (
          organization_id,
          organization_name
        ),
        location_id,
        locations (
          location_id,
          city,
          province
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (topic) {
      // Use a more explicit approach to filter by topic
      const { data: topicIds, error: topicError } = await supabase
        .from("topic")
        .select("topic_id")
        .eq("topic_name", topic)
        .single()

      if (topicError) {
        console.error("Error fetching topic ID:", topicError)
        throw new Error(`Could not find topic: ${topic}`)
      }

      if (topicIds) {
        // Get all pims_ids that have this topic
        const { data: pimsIds, error: pimsError } = await supabase
          .from("pims_entry_topic")
          .select("pims_id")
          .eq("topic_id", topicIds.topic_id)

        if (pimsError) {
          console.error("Error fetching pims IDs for topic:", pimsError)
          throw new Error(`Could not find events for topic: ${topic}`)
        }

        if (pimsIds && pimsIds.length > 0) {
          query = query.in(
            "id",
            pimsIds.map((p) => p.pims_id),
          )
        } else {
          // No events with this topic, return empty result
          return (
            <div className="container py-8 px-4">
              <div className="flex flex-col space-y-2 mb-8">
                <h1 className="text-3xl font-bold">Pride History Archive</h1>
                <p className="text-muted-foreground">No events found for topic: {topic}</p>
              </div>
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
              </div>
            </div>
          )
        }
      }
    }

    if (location) {
      const [city, province] = location.split(",").map((part) => part.trim())
      if (province) {
        // Get location_id for this city and province
        const { data: locationData, error: locationError } = await supabase
          .from("locations")
          .select("location_id")
          .eq("city", city)
          .eq("province", province)
          .single()

        if (locationError) {
          console.error("Error fetching location ID:", locationError)
          throw new Error(`Could not find location: ${location}`)
        }

        if (locationData) {
          query = query.eq("location_id", locationData.location_id)
        }
      } else {
        // Just filter by city
        query = query.eq("locations.city", city)
      }
    }

    if (organization) {
      // Get organization_id for this organization name
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("organization_id")
        .eq("organization_name", organization)
        .single()

      if (orgError) {
        console.error("Error fetching organization ID:", orgError)
        throw new Error(`Could not find organization: ${organization}`)
      }

      if (orgData) {
        query = query.eq("organization_id", orgData.organization_id)
      }
    }

    if (startDate) {
      query = query.gte("date", startDate)
    }

    if (endDate) {
      query = query.lte("date", endDate)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // Apply sorting
    if (sortBy === "date_asc") {
      query = query.order("date", { ascending: true })
    } else if (sortBy === "date_desc") {
      query = query.order("date", { ascending: false })
    } else if (sortBy === "title_asc") {
      query = query.order("title", { ascending: true })
    } else if (sortBy === "title_desc") {
      query = query.order("title", { ascending: false })
    }

    // Apply pagination
    query = query.range(from, to)

    // Execute query
    const { data: events, count, error } = await query

    if (error) throw error

    // Fetch topics for each event - THIS IS WHERE THE ERROR OCCURS
    const eventsWithTopics = await Promise.all(
      (events || []).map(async (event) => {
        try {
          // Use a more direct approach to fetch topics for each event
          const { data: topicEntries, error: topicError } = await supabase
            .from("pims_entry_topic")
            .select("topic_id")
            .eq("pims_id", event.id)

          if (topicError) throw topicError

          // If we have topic entries, fetch the topic names separately
          let topicsWithNames = []
          if (topicEntries && topicEntries.length > 0) {
            const topicIds = topicEntries.map((entry) => entry.topic_id)
            const { data: topicData, error: topicDataError } = await supabase
              .from("topic")
              .select("topic_id, topic_name")
              .in("topic_id", topicIds)

            if (topicDataError) throw topicDataError

            // Combine the data
            topicsWithNames = topicEntries.map((entry) => {
              const matchingTopic = topicData?.find((t) => t.topic_id === entry.topic_id)
              return {
                ...entry,
                topic: matchingTopic,
              }
            })
          }

          return {
            ...event,
            pims_entry_topic: topicsWithNames || [],
          }
        } catch (error) {
          console.error(`Error fetching topics for event ${event.id}:`, error)
          // Return the event without topics if there's an error
          return {
            ...event,
            pims_entry_topic: [],
          }
        }
      }),
    )

    return (
      <div className="container py-8 px-4">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Pride History Archive</h1>
          <p className="text-muted-foreground">Browse and discover historical pride events across Canada</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
                <div className="flex items-center mb-4">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>
                <EventsFilter />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Suspense fallback={<EventsListSkeleton />}>
              <EventsList
                events={(eventsWithTopics as Event[]) || []}
                count={count || 0}
                page={page}
                pageSize={pageSize}
                topic={topic}
                location={location}
                organization={organization}
                startDate={startDate}
                endDate={endDate}
                search={search}
                sortBy={sortBy}
              />
            </Suspense>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching events:", error)
    return (
      <div className="container py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Error loading events</h1>
        <p className="text-muted-foreground mb-6">We're having trouble loading the events. Please try again later.</p>
        <p className="text-sm text-destructive mb-6">{handleError(error)}</p>
      </div>
    )
  }
}

function EventsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-center mt-8">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}

