"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { formatDate } from "@/lib/utils"
import type { Event } from "@/lib/types"

interface EventsListProps {
  events: Event[]
  count: number
  page: number
  pageSize: number
  topic?: string
  location?: string
  organization?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
}

export default function EventsList({
  events,
  count,
  page = 1,
  pageSize = 12,
  topic,
  location,
  organization,
  startDate,
  endDate,
  search,
  sortBy = "date_desc",
}: EventsListProps) {
  // Calculate total pages
  const totalPages = count ? Math.ceil(count / pageSize) : 0

  // Build query string for pagination links
  const buildQueryString = (newPage: number) => {
    const params = new URLSearchParams()
    params.set("page", newPage.toString())
    if (topic) params.set("topic", topic)
    if (location) params.set("location", location)
    if (organization) params.set("organization", organization)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (search) params.set("search", search)
    if (sortBy) params.set("sort", sortBy)
    return params.toString()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Showing {events?.length || 0} of {count || 0} events
        </p>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            className="border rounded px-2 py-1 text-sm bg-background"
            defaultValue={sortBy}
            onChange={(e) => {
              const url = new URL(window.location.href)
              url.searchParams.set("sort", e.target.value)
              window.location.href = url.toString()
            }}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col h-full border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader className="pb-2 space-y-2">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 whitespace-nowrap">
                    {event.organizations?.organization_name || "Community Event"}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground shrink-0">
                    <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    {formatDate(event.date)}
                  </div>
                </div>
                <h3 className="text-xl font-bold mt-1 line-clamp-2">{event.title}</h3>
              </CardHeader>
              <CardContent className="flex-grow">
                {event.locations && (
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {event.locations.city}, {event.locations.province}
                  </div>
                )}
                <p className="text-muted-foreground line-clamp-3">{event.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t border-border/30">
                <Button asChild variant="default" size="sm">
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
                {event.source_link && (
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <a href={event.source_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Source
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-xl font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
          <Button asChild variant="outline">
            <Link href="/events">Clear Filters</Link>
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/events?${buildQueryString(page - 1)}`} />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number

              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (page <= 3) {
                pageNumber = i + 1
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = page - 2 + i
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink href={`/events?${buildQueryString(pageNumber)}`} isActive={pageNumber === page}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`/events?${buildQueryString(page + 1)}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

