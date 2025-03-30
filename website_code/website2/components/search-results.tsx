import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

interface SearchResultsProps {
  searchParams: { [key: string]: string | string[] | undefined }
  pageSize: number
  offset: number
  totalCount: number
}

export default async function SearchResults({ searchParams, pageSize, offset, totalCount }: SearchResultsProps) {
  const supabase = createClient()

  // Parse search parameters
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined
  const organization = typeof searchParams.organization === "string" ? searchParams.organization : undefined
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined
  const decade = typeof searchParams.decade === "string" ? searchParams.decade : undefined
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined
  const tags = typeof searchParams.tags === "string" ? searchParams.tags.split(",") : undefined
  const photosOnly = searchParams.photosOnly === "true"

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

  // Show SQL if requested
  const showSql = searchParams.sqlGenerator === "true"

  // Calculate the current range of results being displayed
  const start = offset + 1
  const end = Math.min(offset + filteredEvents.length, totalCount)

  return (
    <div>
      {showSql && (
        <div className="mb-6 p-4 bg-gray-900 border border-amber-900/30 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">Generated SQL Query</h3>
          <pre className="text-amber-100 text-sm">
            {`SELECT pims_main.*, organizations.organization_name, locations.city, locations.province
FROM pims_main
LEFT JOIN organizations ON pims_main.organization_id = organizations.organization_id
LEFT JOIN locations ON pims_main.location_id = locations.location_id
${query ? `WHERE (pims_main.title ILIKE '%${query}%' OR pims_main.summary ILIKE '%${query}%')` : ""}
${organization && organization !== "all" ? `${query ? "AND" : "WHERE"} organizations.organization_name = '${organization}'` : ""}
${location && location !== "all" ? `${query || organization ? "AND" : "WHERE"} locations.city = '${location.split(",")[0].trim()}'` : ""}
${startDate ? `${query || organization || location ? "AND" : "WHERE"} pims_main.date >= '${startDate}'` : ""}
${endDate ? `${query || organization || location || startDate ? "AND" : "WHERE"} pims_main.date <= '${endDate}'` : ""}
ORDER BY pims_main.date DESC
LIMIT ${pageSize} OFFSET ${offset};`}
          </pre>
        </div>
      )}

      <h2 className="text-xl font-bold text-amber-300 mb-4">
        {totalCount > 0 ? `Showing ${start}-${end} of ${totalCount} Results` : "No Results Found"}
      </h2>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col h-full border-amber-900/30 bg-amber-950/30 hover:border-amber-600/50 transition-all duration-300"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge
                    variant="outline"
                    className="bg-amber-900/20 text-amber-300 border-amber-700/50 max-w-[150px] overflow-hidden group"
                  >
                    <span className="group-hover:animate-marquee whitespace-nowrap">
                      {event.organizations?.organization_name || "Community Event"}
                    </span>
                  </Badge>
                  <div className="flex items-center text-sm text-amber-400/70">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(event.date)}
                  </div>
                </div>
                <h3 className="text-xl font-bold mt-2 text-amber-50">{event.title}</h3>
              </CardHeader>
              <CardContent className="flex-grow">
                {event.locations && (
                  <div className="flex items-center text-sm text-amber-400/70 mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {event.locations.city}, {event.locations.province}
                  </div>
                )}
                <p className="text-amber-200/70 line-clamp-3">{event.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t border-amber-900/30">
                <Button asChild variant="default" size="sm" className="bg-amber-700 hover:bg-amber-800 text-amber-50">
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
                {event.source_link && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
                  >
                    <a href={event.source_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Source
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-amber-900/30 rounded-lg bg-amber-950/30">
          <h3 className="text-xl font-medium mb-2 text-amber-300">No events found</h3>
          <p className="text-amber-200/70 mb-4">Try adjusting your filters or search criteria</p>
          <Button
            asChild
            variant="outline"
            className="border-amber-600 text-amber-300 hover:bg-amber-900/20 hover:text-amber-50"
          >
            <Link href="/search">Clear Filters</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

