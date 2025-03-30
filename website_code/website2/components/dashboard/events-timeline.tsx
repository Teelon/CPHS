"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EventsTimelineProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function EventsTimeline({ startYear, endYear, province, organization, topic }: EventsTimelineProps) {
  const supabase = createClient()
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Build base query
        let query = supabase.from("pims_main").select("date")

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

        // Execute query
        const { data: events, error } = await query.not("date", "is", null)

        if (error) throw error

        if (events && events.length > 0) {
          // Group events by year
          const yearCounts: Record<number, number> = {}

          events.forEach((event) => {
            if (event.date) {
              const year = new Date(event.date).getFullYear()
              yearCounts[year] = (yearCounts[year] || 0) + 1
            }
          })

          // Find min and max years
          const years = Object.keys(yearCounts).map(Number)
          const minYear = Math.min(...years)
          const maxYear = Math.max(...years)

          // Create data array with all years in range
          const data = []
          for (let year = minYear; year <= maxYear; year++) {
            data.push({
              year,
              count: yearCounts[year] || 0,
            })
          }

          setTimelineData(data)
        } else {
          setTimelineData([])
        }
      } catch (error) {
        console.error("Error fetching timeline data:", error)
        setTimelineData([])
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

  if (timelineData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available for the selected filters
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      {timelineData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300} debounce={50}>
          <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={(year) => `${year}`} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => (value === 0 ? "0" : value)} />
            <Tooltip
              formatter={(value) => [`${value} events`, "Count"]}
              labelFormatter={(year) => `Year: ${year}`}
              contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorCount)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      )}
    </div>
  )
}

