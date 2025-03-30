"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface OrganizationsTableProps {
  startYear?: number
  endYear?: number
  province?: string
  organization?: string
  topic?: string
}

export default function OrganizationsTable({
  startYear,
  endYear,
  province,
  organization,
  topic,
}: OrganizationsTableProps) {
  const supabase = createClient()
  const [organizationsData, setOrganizationsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Build base query to get events matching filters
        let eventsQuery = supabase.from("pims_main").select("id, organization_id")

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
              eventsQuery = eventsQuery.in("id", ids)
            }
          }
        }

        // Execute query to get filtered events
        const { data: events, error: eventsError } = await eventsQuery

        if (eventsError) throw eventsError

        if (events && events.length > 0) {
          // Count events by organization
          const orgCounts: Record<number, number> = {}

          events.forEach((event) => {
            if (event.organization_id) {
              orgCounts[event.organization_id] = (orgCounts[event.organization_id] || 0) + 1
            }
          })

          // Get organization details
          const orgIds = Object.keys(orgCounts)
            .map(Number)
            .filter((id) => id > 0)

          if (orgIds.length > 0) {
            const { data: orgs, error: orgsError } = await supabase
              .from("organizations")
              .select("organization_id, organization_name")
              .in("organization_id", orgIds)

            if (orgsError) throw orgsError

            if (orgs) {
              // Combine with counts
              const orgsWithCounts = orgs
                .map((org) => ({
                  id: org.organization_id,
                  name: org.organization_name,
                  count: orgCounts[org.organization_id] || 0,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10) // Top 10 organizations

              setOrganizationsData(orgsWithCounts)
            }
          } else {
            setOrganizationsData([])
          }
        } else {
          setOrganizationsData([])
        }
      } catch (error) {
        console.error("Error fetching organizations data:", error)
        setOrganizationsData([])
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

  if (organizationsData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No organization data available for the selected filters
      </div>
    )
  }

  return (
    <div className="h-[300px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead className="text-right">Events</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizationsData.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium">{org.name}</TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{org.count}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/events?organization=${encodeURIComponent(org.name)}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Events
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

