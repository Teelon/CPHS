"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Event } from "@/lib/types"

interface FeaturedEventsProps {
  events: Event[]
}

export default function FeaturedEvents({ events }: FeaturedEventsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="flex flex-col h-full border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {event.organizations?.organization_name || "Community Event"}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(event.date)}
              </div>
            </div>
            <h3 className="text-xl font-bold mt-2">{event.title}</h3>
          </CardHeader>
          <CardContent className="flex-grow">
            {event.locations && (
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {event.locations.city}, {event.locations.province}
              </div>
            )}
            <p className={`text-muted-foreground ${expandedId === event.id ? "" : "line-clamp-3"}`}>{event.summary}</p>
            {event.summary && event.summary.length > 150 && (
              <Button variant="link" className="p-0 h-auto mt-1 text-primary" onClick={() => toggleExpand(event.id)}>
                {expandedId === event.id ? "Show less" : "Read more"}
              </Button>
            )}
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
  )
}

