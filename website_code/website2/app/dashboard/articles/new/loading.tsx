import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="w-full h-10 bg-yellow-100 rounded-md animate-pulse" />

      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" disabled>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

