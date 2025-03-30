import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Card key={i} className="flex flex-col h-full">
                <Skeleton className="w-full h-48" />
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-28" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

