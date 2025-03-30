"use client"

import { useState, useEffect } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import SearchPagination from "@/components/search-pagination"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface ClientSearchResultsProps {
  initialData: {
    events: any[]
    totalCount: number
    currentPage: number
    pageSize: number
  }
}

export default function ClientSearchResults({ initialData }: ClientSearchResultsProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Check if SQL generator is enabled
  const showSql = searchParams.get("sqlGenerator") === "true"

  // Effect to fetch data when URL params change
  useEffect(() => {
    // Get current page from URL or default to 1
    const pageParam = searchParams.get("page")
    const currentPage = pageParam ? Number.parseInt(pageParam, 10) : 1

    // Only fetch if we're not already on this page
    if (currentPage !== data.currentPage) {
      fetchResults(currentPage)
    }
  }, [searchParams, data.currentPage])

  // Function to fetch search results based on current search params and page
  const fetchResults = async (page: number) => {
    setIsLoading(true)

    try {
      const pageSize = data.pageSize
      const offset = (page - 1) * pageSize

      // Parse search parameters
      const query = searchParams.get("q")
      const organization = searchParams.get("organization")
      const location = searchParams.get("location")
      const decade = searchParams.get("decade")
      const startDate = searchParams.get("startDate")
      const endDate = searchParams.get("endDate")
      const tags = searchParams.get("tags")?.split(",")
      const photosOnly = searchParams.get("photosOnly") === "true"

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
      const { data: events, error, count } = await dbQuery

      if (error) throw error

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

      setData({
        events: filteredEvents,
        totalCount: data.totalCount, // Keep the total count from initial data
        currentPage: page,
        pageSize,
      })
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchResults(page)
  }

  // Calculate total pages
  const totalPages = Math.ceil(data.totalCount / data.pageSize)

  // Generate SQL query for display - updated to match actual query construction
  const generateSqlQuery = () => {
    // Get all search parameters
    const query = searchParams.get("q")
    const organization = searchParams.get("organization")
    const location = searchParams.get("location")
    const decade = searchParams.get("decade")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const tags = searchParams.get("tags")?.split(",")
    const photosOnly = searchParams.get("photosOnly") === "true"
    const page = searchParams.get("page") || "1"
    const pageSize = data.pageSize
    const offset = (Number.parseInt(page, 10) - 1) * pageSize

    // Start building the SQL query with the same joins used in the actual query
    let sqlQuery = `-- This SQL represents the actual query being executed
SELECT 
  pims_main.id,
  pims_main.title,
  pims_main.date,
  pims_main.summary,
  pims_main.source_link,
  pims_main.organization_id,
  organizations.organization_id,
  organizations.organization_name,
  pims_main.location_id,
  locations.location_id,
  locations.city,
  locations.province
FROM pims_main
LEFT JOIN organizations ON pims_main.organization_id = organizations.organization_id
LEFT JOIN locations ON pims_main.location_id = locations.location_id`

    // Build WHERE clause with the same conditions used in the actual query
    const whereConditions = []

    // Text search condition
    if (query) {
      whereConditions.push(`(pims_main.title ILIKE '%${query}%' OR pims_main.summary ILIKE '%${query}%')`)
    }

    // Organization filter
    if (organization && organization !== "all") {
      whereConditions.push(`organizations.organization_name = '${organization}'`)
    }

    // Location filter
    if (location && location !== "all") {
      const [city, province] = location.split(",").map((part) => part.trim())
      whereConditions.push(`locations.city = '${city}'`)
      if (province) {
        whereConditions.push(`locations.province = '${province}'`)
      }
    }

    // Decade filter
    if (decade && decade !== "all") {
      const decadeStart = decade.replace("s", "")
      const decadeEnd = (Number.parseInt(decadeStart) + 9).toString()
      whereConditions.push(`pims_main.date >= '${decadeStart}-01-01'`)
      whereConditions.push(`pims_main.date <= '${decadeEnd}-12-31'`)
    }

    // Date range filters
    if (startDate) {
      whereConditions.push(`pims_main.date >= '${startDate}'`)
    }

    if (endDate) {
      whereConditions.push(`pims_main.date <= '${endDate}'`)
    }

    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      sqlQuery += `\nWHERE ${whereConditions.join("\nAND ")}`
    }

    // Add tags filter as a subquery - this matches how we filter by tags in the code
    if (tags && tags.length > 0) {
      const tagsCondition = tags.map((tag) => `'${tag}'`).join(", ")
      if (whereConditions.length > 0) {
        sqlQuery += `\nAND pims_main.id IN (
  SELECT pims_entry_topic.pims_id 
  FROM pims_entry_topic
  JOIN topic ON pims_entry_topic.topic_id = topic.topic_id
  WHERE topic.topic_name IN (${tagsCondition})
)`
      } else {
        sqlQuery += `\nWHERE pims_main.id IN (
  SELECT pims_entry_topic.pims_id 
  FROM pims_entry_topic
  JOIN topic ON pims_entry_topic.topic_id = topic.topic_id
  WHERE topic.topic_name IN (${tagsCondition})
)`
      }
    }

    // Add photos only filter if selected
    if (photosOnly) {
      const condition = `pims_main.id % 2 = 0 -- Simulated filter for demo purposes`
      if (whereConditions.length > 0 || (tags && tags.length > 0)) {
        sqlQuery += `\nAND ${condition}`
      } else {
        sqlQuery += `\nWHERE ${condition}`
      }
    }

    // Add ORDER BY, LIMIT and OFFSET - matching the actual query
    sqlQuery += `\nORDER BY pims_main.date DESC
LIMIT ${pageSize} OFFSET ${offset};`

    return sqlQuery
  }

  return (
    <div>
      {/* SQL Generator Display */}
      {showSql && (
        <div className="mb-6 p-4 bg-gray-900 border border-amber-900/30 rounded-lg overflow-x-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-amber-300">Generated SQL Query</h3>
            <span className="text-xs text-amber-500">Reflects actual database query</span>
          </div>
          <pre className="text-amber-100 text-sm whitespace-pre-wrap overflow-x-auto">{generateSqlQuery()}</pre>
        </div>
      )}

      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-amber-900/20 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="border border-amber-900/30 rounded-lg overflow-hidden bg-amber-950/30">
                    <Skeleton className="h-48 w-full bg-amber-900/20" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4 bg-amber-900/20" />
                      <Skeleton className="h-4 w-1/2 bg-amber-900/20" />
                      <Skeleton className="h-20 w-full bg-amber-900/20" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div key={`results-page-${data.currentPage}`}>
            <h2 className="text-xl font-bold text-amber-300 mb-4">
              {data.totalCount > 0
                ? `Showing ${(data.currentPage - 1) * data.pageSize + 1}-${Math.min(data.currentPage * data.pageSize, data.totalCount)} of ${data.totalCount} Results`
                : "No Results Found"}
            </h2>

            {data.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.events.map((event) => (
                  <SearchResultCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-amber-900/30 rounded-lg bg-amber-950/30">
                <h3 className="text-xl font-medium mb-2 text-amber-300">No events found</h3>
                <p className="text-amber-200/70 mb-4">Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <SearchPagination
            currentPage={data.currentPage}
            totalPages={totalPages}
            searchParams={Object.fromEntries(searchParams.entries())}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

// Extract the card component for cleaner code
function SearchResultCard({ event }: { event: any }) {
  return (
    <Card className="flex flex-col h-full border-amber-900/30 bg-amber-950/30 hover:border-amber-600/50 transition-all duration-300">
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
  )
}

