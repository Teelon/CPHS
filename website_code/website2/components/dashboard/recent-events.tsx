"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface RecentEventsProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function RecentEvents({ startYear, endYear, province, organization, topic }: RecentEventsProps) {
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Build base query
        let query = supabase.from("pims_main").select(`
          id,
          title,
          date,
          locations (
            city,
            province
          )
        `)

        // Apply filters
        if (startYear) {
          const startDate = `${startYear}-01-01`
          query = query.gte("date", startDate)
        }

        if (endYear) {
          const endDate = `${endYear}-12-31`
          query = query.lte("date", endDate)
        }

        if (province) {
          // Get location IDs for this province
          const { data: locationIds } = await supabase.from("locations").select("location_id").eq("province", province)

          if (locationIds && locationIds.length > 0) {
            const ids = locationIds.map((loc) => loc.location_id)
            query = query.in("location_id", ids)
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
            query = query.eq("organization_id", orgData.organization_id)
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
              query = query.in("id", ids)
            }
          }
        }

        // Order by ID (most recent first) and limit to 5
        query = query.order("id", { ascending: false }).limit(5)

        // Execute query
        const { data, error } = await query

        if (error) throw error

        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching recent events:", error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, startYear, endYear, province, organization, topic])

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No events available for the selected filters
      </div>
    )
  }

  return (
    <div className="h-[300px] overflow-auto">
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border-b pb-4 last:border-0">
            <h3 className="font-medium line-clamp-1">{event.title}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(event.date)}
              </div>
              {event.locations && (
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {event.locations.city}, {event.locations.province}
                </div>
              )}
            </div>
            <div className="mt-2">
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link href={`/events/${event.id}`}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

