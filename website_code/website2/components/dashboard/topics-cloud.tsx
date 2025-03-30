"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

interface TopicsCloudProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function TopicsCloud({ startYear, endYear, province, organization, topic }: TopicsCloudProps) {
  const supabase = createClient()
  const [topicsData, setTopicsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Build base query to get events matching filters
        let eventsQuery = supabase.from("pims_main").select("id")

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

        // Execute query to get filtered event IDs
        const { data: events, error: eventsError } = await eventsQuery

        if (eventsError) throw eventsError

        if (events && events.length > 0) {
          const eventIds = events.map((e) => e.id)

          // Limit the number of event IDs to avoid query size limits
          const limitedEventIds = eventIds.slice(0, 100)

          // If a specific topic is selected, just get that topic
          if (topic) {
            const { data: topicData } = await supabase
              .from("topic")
              .select("topic_id, topic_name")
              .eq("topic_name", topic)
              .single()

            if (topicData) {
              // Count events with this topic
              const { data: topicEvents } = await supabase
                .from("pims_entry_topic")
                .select("pims_id")
                .eq("topic_id", topicData.topic_id)
                .in("pims_id", limitedEventIds)

              setTopicsData([
                {
                  id: topicData.topic_id,
                  name: topicData.topic_name,
                  count: topicEvents?.length || 0,
                },
              ])
            } else {
              setTopicsData([])
            }
          } else {
            // Get topic counts for these events - use a more efficient approach
            try {
              const { data: topicEntries, error: topicError } = await supabase
                .from("pims_entry_topic")
                .select("topic_id")
                .in("pims_id", limitedEventIds)

              if (topicError) throw topicError

              if (topicEntries && topicEntries.length > 0) {
                // Count occurrences
                const topicCounts: Record<number, number> = {}

                topicEntries.forEach((entry) => {
                  topicCounts[entry.topic_id] = (topicCounts[entry.topic_id] || 0) + 1
                })

                // Get topic names
                const topicIds = Object.keys(topicCounts).map(Number)

                // Add a small delay before the next request
                await new Promise((resolve) => setTimeout(resolve, 300))

                const { data: topics, error: namesError } = await supabase
                  .from("topic")
                  .select("topic_id, topic_name")
                  .in("topic_id", topicIds)

                if (namesError) throw namesError

                if (topics) {
                  // Combine counts with names
                  const topicsWithCounts = topics
                    .map((topic) => ({
                      id: topic.topic_id,
                      name: topic.topic_name,
                      count: topicCounts[topic.topic_id] || 0,
                    }))
                    .filter((t) => t.name) // Filter out null names
                    .sort((a, b) => b.count - a.count)

                  setTopicsData(topicsWithCounts)
                }
              } else {
                setTopicsData([])
              }
            } catch (error) {
              console.error("Error processing topic data:", error)
              setTopicsData([])
            }
          }
        } else {
          setTopicsData([])
        }
      } catch (error) {
        console.error("Error fetching topics data:", error)
        setTopicsData([])
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

  if (topicsData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No topic data available for the selected filters
      </div>
    )
  }

  // Calculate font sizes based on count
  const maxCount = Math.max(...topicsData.map((t) => t.count))
  const minCount = Math.min(...topicsData.map((t) => t.count))
  const fontSizeRange = [1, 2.5] // rem

  const calculateFontSize = (count: number) => {
    if (maxCount === minCount) return fontSizeRange[1]
    const normalized = (count - minCount) / (maxCount - minCount)
    return fontSizeRange[0] + normalized * (fontSizeRange[1] - fontSizeRange[0])
  }

  return (
    <div className="h-[300px] overflow-auto p-4">
      <div className="flex flex-wrap gap-3 justify-center">
        {topicsData.map((topic) => (
          <Badge
            key={topic.id}
            variant="outline"
            className="py-1 px-3 cursor-pointer hover:bg-primary/10"
            style={{ fontSize: `${calculateFontSize(topic.count)}rem` }}
          >
            {topic.name} ({topic.count})
          </Badge>
        ))}
      </div>
    </div>
  )
}

