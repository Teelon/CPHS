"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function EventsChart() {
  const supabase = createClient()
  const [eventsByDecade, setEventsByDecade] = useState<any[]>([])
  const [eventsByProvince, setEventsByProvince] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch events by decade
        const { data: events } = await supabase.from("pims_main").select("date").not("date", "is", null)

        if (events) {
          // Group events by decade
          const decadeGroups: Record<string, number> = {}

          events.forEach((event) => {
            if (event.date) {
              const year = new Date(event.date).getFullYear()
              const decade = `${Math.floor(year / 10) * 10}s`

              decadeGroups[decade] = (decadeGroups[decade] || 0) + 1
            }
          })

          // Convert to array for chart
          const decadeData = Object.entries(decadeGroups)
            .map(([decade, count]) => ({
              decade,
              count,
            }))
            .sort((a, b) => a.decade.localeCompare(b.decade))

          setEventsByDecade(decadeData)
        }

        // Fetch events by province
        const { data: locationEvents } = await supabase
          .from("pims_main")
          .select(`
            locations (
              province
            )
          `)
          .not("location_id", "is", null)

        if (locationEvents) {
          // Group events by province
          const provinceGroups: Record<string, number> = {}

          locationEvents.forEach((event) => {
            if (event.locations && event.locations.province) {
              const province = event.locations.province
              provinceGroups[province] = (provinceGroups[province] || 0) + 1
            }
          })

          // Convert to array for chart
          const provinceData = Object.entries(provinceGroups)
            .map(([province, count]) => ({
              province,
              count,
            }))
            .sort((a, b) => b.count - a.count)

          setEventsByProvince(provinceData)
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Events Distribution</CardTitle>
        <CardDescription>Breakdown of events by decade and province</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="decade">
          <TabsList className="mb-4">
            <TabsTrigger value="decade">By Decade</TabsTrigger>
            <TabsTrigger value="province">By Province</TabsTrigger>
          </TabsList>

          <TabsContent value="decade" className="h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsByDecade} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="decade" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} events`, "Count"]}
                    labelFormatter={(label) => `Decade: ${label}`}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="province" className="h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventsByProvince}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="province"
                    label={({ province, count, percent }) => `${province}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {eventsByProvince.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} events`, "Count"]}
                    labelFormatter={(label) => `Province: ${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

