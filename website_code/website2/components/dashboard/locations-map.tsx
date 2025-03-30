"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export default function LocationsMap() {
  const supabase = createClient()
  const [locationData, setLocationData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch locations with event counts
        const { data: locations } = await supabase
          .from("locations")
          .select(`
            location_id,
            city,
            province,
            pims_main(id)
          `)
          .not("city", "is", null)
          .not("province", "is", null)
          .order("province")
          .order("city")

        if (locations) {
          // Process data to include event counts
          const processedLocations = locations.map((location) => ({
            ...location,
            eventCount: location.pims_main ? location.pims_main.length : 0,
          }))

          setLocationData(processedLocations)
        }
      } catch (error) {
        console.error("Error fetching location data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Group locations by province
  const locationsByProvince = locationData.reduce(
    (acc, location) => {
      if (!location.province) return acc

      if (!acc[location.province]) {
        acc[location.province] = []
      }

      acc[location.province].push(location)

      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Event Locations</CardTitle>
        <CardDescription>Distribution of events across Canadian provinces and cities</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-[400px] bg-muted/30 rounded-lg border overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-center p-4">
                  Interactive map visualization would be displayed here.
                  <br />
                  This is a placeholder for a real map component.
                </p>
              </div>
            </div>

            <div className="h-[400px] overflow-auto">
              {Object.entries(locationsByProvince).map(([province, locations]) => (
                <div key={province} className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {locations.reduce((sum, loc) => sum + loc.eventCount, 0)} events
                    </Badge>
                    {province}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {locations
                      .filter((loc) => loc.eventCount > 0)
                      .sort((a, b) => b.eventCount - a.eventCount)
                      .map((location) => (
                        <div
                          key={location.location_id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span>{location.city}</span>
                          </div>
                          <Badge variant="secondary">
                            {location.eventCount} {location.eventCount === 1 ? "event" : "events"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

