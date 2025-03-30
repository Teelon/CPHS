"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Location } from "@/lib/types"

interface LocationWithEventCount extends Location {
  eventCount: number
}

// This is a placeholder for a real map component
// In a real implementation, you would use a library like Leaflet, MapBox, or Google Maps
export default function MapView({ initialLocations }: { initialLocations: LocationWithEventCount[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [locations, setLocations] = useState<LocationWithEventCount[]>(initialLocations)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithEventCount | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch events for selected location
  useEffect(() => {
    if (!selectedLocation) return

    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("pims_main")
          .select(`
            id,
            title,
            date,
            organizations!pims_main_organization_id_fkey (organization_name)
          `)
          .eq("location_id", selectedLocation.location_id)
          .order("date", { ascending: false })

        if (error) throw error
        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        setError("Failed to load events for this location")
      }
    }

    fetchEvents()
  }, [selectedLocation, supabase])

  return (
    <div className="flex flex-col md:flex-row h-[70vh]">
      {/* Sidebar with locations list */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <h2 className="font-bold">Locations</h2>
          <p className="text-sm text-muted-foreground">{locations.length} locations found</p>
        </div>
        <div>
          {locations.map((location) => (
            <button
              key={location.location_id}
              className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors flex justify-between items-center ${
                selectedLocation?.location_id === location.location_id
                  ? "bg-primary/10 border-l-4 border-l-primary"
                  : ""
              }`}
              onClick={() => setSelectedLocation(location)}
            >
              <div>
                <div className="font-medium">{location.city}</div>
                <div className="text-sm text-muted-foreground">{location.province}</div>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-1">
                {location.eventCount} {location.eventCount === 1 ? "event" : "events"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map and event details */}
      <div className="flex-1 flex flex-col">
        {/* Map placeholder */}
        <div className="relative flex-1 bg-muted/30 flex items-center justify-center">
          <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-2">Interactive Map</h3>
            <p className="text-muted-foreground mb-4">
              This is a placeholder for an interactive map. In a real implementation, this would be a map showing all
              event locations across Canada.
            </p>
            <div className="inline-block p-3 bg-primary/10 rounded-lg text-primary font-medium">
              {selectedLocation
                ? `Selected: ${selectedLocation.city}, ${selectedLocation.province}`
                : "No location selected"}
            </div>
          </div>
        </div>

        {/* Events for selected location */}
        {selectedLocation && (
          <div className="h-1/3 border-t overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <h2 className="font-bold">
                Events in {selectedLocation.city}, {selectedLocation.province}
              </h2>
              <p className="text-sm text-muted-foreground">{events.length} events found</p>
            </div>

            {error && <div className="p-4 text-center text-destructive">{error}</div>}

            {!error && events.length > 0 ? (
              <div className="divide-y">
                {events.map((event) => (
                  <div key={event.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="text-xs text-muted-foreground">{formatDate(event.date)}</div>
                    </div>
                    {event.organizations && (
                      <div className="text-sm text-muted-foreground mb-2">{event.organizations.organization_name}</div>
                    )}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No events found for this location</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

