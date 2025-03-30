"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EventsByDecadeProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function EventsByDecade({ startYear, endYear, province, organization, topic }: EventsByDecadeProps) {
  const supabase = createClient()
  const [decadeData, setDecadeData] = useState<any[]>([])
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
          // Group events by decade
          const decadeCounts: Record<string, number> = {}

          events.forEach((event) => {
            if (event.date) {
              const year = new Date(event.date).getFullYear()
              const decade = `${Math.floor(year / 10) * 10}s`
              decadeCounts[decade] = (decadeCounts[decade] || 0) + 1
            }
          })

          // Convert to array for chart
          const data = Object.entries(decadeCounts)
            .map(([decade, count]) => ({
              decade,
              count,
            }))
            .sort((a, b) => a.decade.localeCompare(b.decade))

          setDecadeData(data)
        } else {
          setDecadeData([])
        }
      } catch (error) {
        console.error("Error fetching decade data:", error)
        setDecadeData([])
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

  if (decadeData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available for the selected filters
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={decadeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="decade" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} events`, "Count"]} labelFormatter={(label) => `Decade: ${label}`} />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

