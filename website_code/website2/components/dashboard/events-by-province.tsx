"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface EventsByProvinceProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function EventsByProvince({ startYear, endYear, province, organization, topic }: EventsByProvinceProps) {
  const supabase = createClient()
  const [provinceData, setProvinceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Build base query
        let query = supabase.from("pims_main").select(`
          id,
          locations (
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

        // Execute query
        const { data: events, error } = await query.not("location_id", "is", null)

        if (error) throw error

        if (events && events.length > 0) {
          // Group events by province
          const provinceCounts: Record<string, number> = {}

          events.forEach((event) => {
            if (event.locations && event.locations.province) {
              const province = event.locations.province
              provinceCounts[province] = (provinceCounts[province] || 0) + 1
            }
          })

          // Convert to array for chart
          const data = Object.entries(provinceCounts)
            .map(([province, count]) => ({
              name: province,
              value: count,
            }))
            .sort((a, b) => b.value - a.value)

          setProvinceData(data)
        } else {
          setProvinceData([])
        }
      } catch (error) {
        console.error("Error fetching province data:", error)
        setProvinceData([])
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

  if (provinceData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available for the selected filters
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={provinceData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          >
            {provinceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} events`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

