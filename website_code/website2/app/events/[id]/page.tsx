import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Building, ArrowLeft, ExternalLink } from "lucide-react"
import { formatDate, handleError } from "@/lib/utils"
import RelatedEvents from "@/components/related-events"

export default async function EventPage({ params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // Fetch event details with simplified joins
    const { data: event, error } = await supabase
      .from("pims_main")
      .select(`
        id,
        title,
        date,
        summary,
        source_link,
        organization_id,
        organizations (
          organization_id, 
          organization_name
        ),
        location_id,
        locations (
          location_id, 
          city, 
          province
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error
    if (!event) notFound()

    // Fetch topics in two steps to avoid relationship issues
    // Step 1: Get topic IDs for this event
    const { data: topicEntries, error: topicError } = await supabase
      .from("pims_entry_topic")
      .select("topic_id")
      .eq("pims_id", event.id)

    if (topicError) throw topicError

    // Step 2: Get topic details for these IDs
    let topics: string[] = []
    if (topicEntries && topicEntries.length > 0) {
      const topicIds = topicEntries.map((entry) => entry.topic_id)
      const { data: topicData, error: topicDataError } = await supabase
        .from("topic")
        .select("topic_id, topic_name")
        .in("topic_id", topicIds)

      if (topicDataError) throw topicDataError
      topics = topicData?.map((t) => t.topic_name).filter(Boolean) || []
    }

    return (
      <div className="container py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/events" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {topics.map((topic: string) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  {formatDate(event.date)}
                </div>

                {event.locations && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    {event.locations.city}, {event.locations.province}
                  </div>
                )}

                {event.organizations && (
                  <div className="flex items-center text-muted-foreground">
                    <Building className="mr-2 h-4 w-4 text-primary" />
                    {event.organizations.organization_name}
                  </div>
                )}
              </div>

              <div className="prose max-w-none dark:prose-invert">
                <p>{event.summary}</p>
              </div>

              {event.source_link && (
                <div className="mt-6">
                  <Button asChild variant="outline">
                    <a href={event.source_link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original Source
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Image Gallery Placeholder */}
            <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Event Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square relative rounded-md overflow-hidden border">
                    <Image
                      src={`/placeholder.svg?height=300&width=300&text=Image+${i}`}
                      alt={`Event image ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {/* Map Placeholder */}
              <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
                <h2 className="text-lg font-bold mb-3">Location</h2>
                <div className="aspect-video relative rounded-md overflow-hidden border mb-3">
                  <Image
                    src="/placeholder.svg?height=200&width=400&text=Map"
                    alt="Event location map"
                    fill
                    className="object-cover"
                  />
                </div>
                {event.locations && (
                  <p className="text-sm text-muted-foreground">
                    {event.locations.city}, {event.locations.province}
                  </p>
                )}
              </div>

              {/* Related Topics */}
              <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
                <h2 className="text-lg font-bold mb-3">Related Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic: string) => (
                    <Link key={topic} href={`/events?topic=${encodeURIComponent(topic)}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                        {topic}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Related Events */}
              <div className="bg-card rounded-lg border shadow-sm p-4">
                <h2 className="text-lg font-bold mb-3">Related Events</h2>
                <RelatedEvents
                  currentEventId={event.id}
                  organizationId={event.organization_id}
                  locationId={event.location_id}
                  topics={topicEntries?.map((entry) => entry.topic_id) || []}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching event:", error)
    return (
      <div className="container py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/events" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-4">Error loading event</h1>
          <p className="text-muted-foreground mb-6">We're having trouble loading this event. Please try again later.</p>
          <p className="text-sm text-destructive mb-6">{handleError(error)}</p>
        </div>
      </div>
    )
  }
}

