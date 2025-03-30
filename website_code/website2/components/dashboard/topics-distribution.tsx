"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function TopicsDistribution() {
  const supabase = createClient()
  const [topicsData, setTopicsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // First, get all topic IDs and their counts from the junction table
        const { data: topicCounts, error: countError } = await supabase
          .from("pims_entry_topic")
          .select("topic_id, count(*)")
          .group("topic_id")

        if (countError) throw countError

        if (topicCounts && topicCounts.length > 0) {
          // Get the topic names for each ID
          const topicIds = topicCounts.map((t) => t.topic_id)

          const { data: topics, error: topicsError } = await supabase
            .from("topic")
            .select("topic_id, topic_name")
            .in("topic_id", topicIds)

          if (topicsError) throw topicsError

          if (topics) {
            // Combine the counts with the topic names
            const topicsWithCounts = topicCounts.map((count) => {
              const topic = topics.find((t) => t.topic_id === count.topic_id)
              return {
                name: topic?.topic_name || `Topic ${count.topic_id}`,
                value: count.count,
              }
            })

            // Sort by count and take top 8
            const sortedTopics = topicsWithCounts.sort((a, b) => b.value - a.value).slice(0, 8)

            setTopicsData(sortedTopics)
          }
        }
      } catch (error) {
        console.error("Error fetching topics data:", error)
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
        <CardTitle>Topics Distribution</CardTitle>
        <CardDescription>Most common topics across all events</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : topicsData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topicsData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {topicsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} events`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No topic data available</div>
        )}
      </CardContent>
    </Card>
  )
}

