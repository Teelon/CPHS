import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-8 px-4 mx-auto">
      {/* Search form skeleton */}
      <div className="border border-amber-900/30 bg-amber-950/10 rounded-lg p-6">
        <Skeleton className="h-8 w-48 bg-amber-900/20 mb-6" />
        <Skeleton className="h-12 w-full bg-amber-900/20 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-amber-900/20" />
            <Skeleton className="h-10 w-full bg-amber-900/20" />
            <Skeleton className="h-10 w-full bg-amber-900/20" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-amber-900/20" />
            <Skeleton className="h-10 w-full bg-amber-900/20" />
            <Skeleton className="h-10 w-full bg-amber-900/20" />
          </div>
        </div>
        <Skeleton className="h-12 w-full bg-amber-900/20" />
      </div>

      {/* Results skeleton */}
      <div className="mt-8 space-y-4">
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
    </div>
  )
}

