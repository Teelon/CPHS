import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatDate, handleError } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface RelatedEventsProps {
  currentEventId: number
  organizationId?: number | null
  locationId?: number | null
  topics?: number[]
}

export default async function RelatedEvents({
  currentEventId,
  organizationId,
  locationId,
  topics = [],
}: RelatedEventsProps) {
  try {
    const supabase = createClient()

    // Build query to find related events with simplified joins
    let query = supabase
      .from("pims_main")
      .select(`
        id,
        title,
        date
      `)
      .neq("id", currentEventId) // Exclude current event
      .limit(5)

    // If we have organization, location, or topics, use them to find related events
    if (organizationId) {
      query = query.eq("organization_id", organizationId)
    } else if (locationId) {
      query = query.eq("location_id", locationId)
    } else if (topics.length > 0) {
      // Find events with at least one matching topic using a separate query
      const { data: relatedPimsIds, error: topicError } = await supabase
        .from("pims_entry_topic")
        .select("pims_id")
        .in("topic_id", topics)
        .neq("pims_id", currentEventId)

      if (topicError) throw topicError

      if (relatedPimsIds && relatedPimsIds.length > 0) {
        // Get unique pims_ids
        const uniquePimsIds = [...new Set(relatedPimsIds.map((item) => item.pims_id))]
        query = query.in("id", uniquePimsIds)
      } else {
        // No related events found
        return <div className="text-sm text-muted-foreground">No related events found</div>
      }
    }

    const { data: events, error } = await query

    if (error) throw error

    if (!events || events.length === 0) {
      return <div className="text-sm text-muted-foreground">No related events found</div>
    }

    return (
      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block p-3 rounded-md hover:bg-muted transition-colors"
          >
            <h3 className="font-medium line-clamp-2 mb-1">{event.title}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(event.date)}
            </div>
          </Link>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error fetching related events:", error)
    return <div className="text-sm text-destructive">Failed to load related events: {handleError(error)}</div>
  }
}

