import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import MapView from "@/components/map-view"
import { Skeleton } from "@/components/ui/skeleton"
import { handleError } from "@/lib/utils"

export default async function MapPage() {
  try {
    // Fetch locations server-side
    const supabase = createClient()

    const { data, error } = await supabase
      .from("locations")
      .select(`
        location_id,
        city,
        province,
        pims_main(id)
      `)
      .order("province")
      .order("city")

    if (error) throw error

    // Process data to include event counts
    const locations = data.map((location) => ({
      ...location,
      eventCount: location.pims_main ? location.pims_main.length : 0,
    }))

    return (
      <div className="container py-8 px-4">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Pride Events Map</h1>
          <p className="text-muted-foreground">Explore historical pride events across Canada</p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <Suspense fallback={<MapSkeleton />}>
            <MapView initialLocations={locations} />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching locations:", error)
    return (
      <div className="container py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Error loading map</h1>
        <p className="text-muted-foreground mb-6">We're having trouble loading the map. Please try again later.</p>
        <p className="text-sm text-destructive mb-6">{handleError(error)}</p>
      </div>
    )
  }
}

function MapSkeleton() {
  return (
    <div className="w-full h-[70vh] bg-muted/30 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  )
}

