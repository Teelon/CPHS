import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import AdvancedSearchWrapper from "@/components/advanced-search-wrapper"
import SearchResultsWrapper from "@/components/search-results-wrapper"
import { createClient } from "@/lib/supabase/server"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Prefetch data on the server
  const supabase = createClient()

  // Fetch filter options in parallel for better performance
  const [topicsPromise, locationsPromise, organizationsPromise] = await Promise.all([
    supabase.from("topic").select("topic_id, topic_name").order("topic_name"),
    supabase.from("locations").select("location_id, city, province").order("province").order("city"),
    supabase.from("organizations").select("organization_id, organization_name").order("organization_name"),
  ])

  const topics = topicsPromise.data || []
  const locations = locationsPromise.data || []
  const organizations = organizationsPromise.data || []

  // Extract current page from search params for pagination
  const currentPage = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
        <p className="text-muted-foreground mb-8">Search the Pride History Archive using multiple criteria</p>

        {/* Wrap the search form in a client component */}
        <AdvancedSearchWrapper
          topics={topics}
          locations={locations}
          organizations={organizations}
          searchParams={searchParams}
        />

        <div className="mt-8">
          <Suspense fallback={<SearchResultsSkeleton />}>
            {/* Wrap search results in a component that can handle server-side data fetching */}
            <SearchResultsWrapper searchParams={searchParams} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 bg-amber-900/20" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border border-amber-900/30 rounded-lg overflow-hidden bg-amber-950/30">
              <Skeleton className="h-48 w-full bg-amber-900/20" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4 bg-amber-900/20" />
                <Skeleton className="h-4 w-1/2 bg-amber-900/20" />
                <Skeleton className="h-20 w-full bg-amber-900/20" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

