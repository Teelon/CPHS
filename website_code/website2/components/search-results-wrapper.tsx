import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ClientSearchResults from "@/components/client-search-results"
import { createClient } from "@/lib/supabase/server"

interface SearchResultsWrapperProps {
  searchParams: { [key: string]: string | string[] | undefined }
  currentPage: number
}

export default async function SearchResultsWrapper({ searchParams, currentPage }: SearchResultsWrapperProps) {
  const supabase = createClient()

  // Calculate pagination values
  const pageSize = 9 // Number of results per page
  const offset = (currentPage - 1) * pageSize

  // Parse search parameters
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined
  const organization = typeof searchParams.organization === "string" ? searchParams.organization : undefined
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined
  const decade = typeof searchParams.decade === "string" ? searchParams.decade : undefined
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined
  const tags = typeof searchParams.tags === "string" ? searchParams.tags.split(",") : undefined
  const photosOnly = searchParams.photosOnly === "true"

  // Build count query to get total results (without fetching all data)
  let countQuery = supabase.from("pims_main").select("id", { count: "exact", head: true })

  // Apply the same filters as the main query
  if (query) {
    countQuery = countQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
  }

  if (organization && organization !== "all") {
    // Get organization_id for this organization name
    const { data: orgData } = await supabase
      .from("organizations")
      .select("organization_id")
      .eq("organization_name", organization)
      .single()

    if (orgData) {
      countQuery = countQuery.eq("organization_id", orgData.organization_id)
    }
  }

  if (location && location !== "all") {
    const [city, province] = location.split(",").map((part) => part.trim())

    if (province) {
      // Get location_id for this city and province
      const { data: locationData } = await supabase
        .from("locations")
        .select("location_id")
        .eq("city", city)
        .eq("province", province)
        .single()

      if (locationData) {
        countQuery = countQuery.eq("location_id", locationData.location_id)
      }
    }
  }

  if (decade && decade !== "all") {
    // Extract the decade start year
    const decadeStart = decade.replace("s", "")
    const decadeEnd = (Number.parseInt(decadeStart) + 9).toString()

    countQuery = countQuery.gte("date", `${decadeStart}-01-01`)
    countQuery = countQuery.lte("date", `${decadeEnd}-12-31`)
  }

  if (startDate) {
    countQuery = countQuery.gte("date", startDate)
  }

  if (endDate) {
    countQuery = countQuery.lte("date", endDate)
  }

  // Get total count for pagination
  const { count, error: countError } = await countQuery

  if (countError) {
    console.error("Error fetching result count:", countError)
    return (
      <div className="text-center py-12 border border-amber-900/30 rounded-lg bg-amber-950/30">
        <h3 className="text-xl font-medium mb-2 text-amber-300">Error loading results</h3>
        <p className="text-amber-200/70 mb-4">We encountered an error while counting results. Please try again.</p>
        <pre className="text-xs text-amber-400 bg-amber-950/50 p-4 rounded max-w-full overflow-auto mx-auto max-w-lg">
          {countError.message}
        </pre>
      </div>
    )
  }

  // Build query with pagination
  let dbQuery = supabase
    .from("pims_main")
    .select(`
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
    `)
    .range(offset, offset + pageSize - 1)

  // Apply filters
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
  }

  if (organization && organization !== "all") {
    // Get organization_id for this organization name
    const { data: orgData } = await supabase
      .from("organizations")
      .select("organization_id")
      .eq("organization_name", organization)
      .single()

    if (orgData) {
      dbQuery = dbQuery.eq("organization_id", orgData.organization_id)
    }
  }

  if (location && location !== "all") {
    const [city, province] = location.split(",").map((part) => part.trim())

    if (province) {
      // Get location_id for this city and province
      const { data: locationData } = await supabase
        .from("locations")
        .select("location_id")
        .eq("city", city)
        .eq("province", province)
        .single()

      if (locationData) {
        dbQuery = dbQuery.eq("location_id", locationData.location_id)
      }
    }
  }

  if (decade && decade !== "all") {
    // Extract the decade start year
    const decadeStart = decade.replace("s", "")
    const decadeEnd = (Number.parseInt(decadeStart) + 9).toString()

    dbQuery = dbQuery.gte("date", `${decadeStart}-01-01`)
    dbQuery = dbQuery.lte("date", `${decadeEnd}-12-31`)
  }

  if (startDate) {
    dbQuery = dbQuery.gte("date", startDate)
  }

  if (endDate) {
    dbQuery = dbQuery.lte("date", endDate)
  }

  // Add sorting
  dbQuery = dbQuery.order("date", { ascending: false })

  // Execute query
  const { data: events, error } = await dbQuery

  if (error) {
    console.error("Error fetching search results:", error)
    return (
      <div className="text-center py-12 border border-amber-900/30 rounded-lg bg-amber-950/30">
        <h3 className="text-xl font-medium mb-2 text-amber-300">Error loading results</h3>
        <p className="text-amber-200/70 mb-4">We encountered an error while searching. Please try again.</p>
        <pre className="text-xs text-amber-400 bg-amber-950/50 p-4 rounded max-w-full overflow-auto mx-auto max-w-lg">
          {error.message}
        </pre>
      </div>
    )
  }

  // Filter by tags if specified
  let filteredEvents = events || []

  if (tags && tags.length > 0) {
    // Get all events that have at least one of the specified tags
    const { data: eventIdsWithTags } = await supabase
      .from("pims_entry_topic")
      .select("pims_id, topic(topic_name)")
      .in("topic.topic_name", tags)
      .in(
        "pims_id",
        filteredEvents.map((e) => e.id),
      )

    if (eventIdsWithTags) {
      const eventIds = [...new Set(eventIdsWithTags.map((item) => item.pims_id))]
      filteredEvents = filteredEvents.filter((event) => eventIds.includes(event.id))
    }
  }

  // Apply photos only filter (this is a placeholder since we don't have actual photo data)
  if (photosOnly) {
    // This is just a simulation - in reality you would check for actual photos
    filteredEvents = filteredEvents.filter((event) => event.id % 2 === 0) // Just for demo
  }

  // Prepare initial data for client component
  const initialData = {
    events: filteredEvents,
    totalCount: count || 0,
    currentPage,
    pageSize,
  }

  return (
    <Suspense fallback={<ResultsCountSkeleton />}>
      <ClientSearchResults initialData={initialData} />
    </Suspense>
  )
}

function ResultsCountSkeleton() {
  return <Skeleton className="h-8 w-48 bg-amber-900/20 mb-4" />
}

