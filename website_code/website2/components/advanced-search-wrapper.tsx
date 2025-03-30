"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the AdvancedSearch component with SSR disabled
// This prevents hydration issues and reduces initial bundle size
const AdvancedSearch = dynamic(() => import("@/components/advanced-search"), {
  ssr: false,
  loading: () => (
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
  ),
})

interface AdvancedSearchWrapperProps {
  topics: { topic_id: number; topic_name: string | null }[]
  locations: { location_id: number; city: string | null; province: string | null }[]
  organizations: { organization_id: number; organization_name: string }[]
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function AdvancedSearchWrapper({
  topics,
  locations,
  organizations,
  searchParams,
}: AdvancedSearchWrapperProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Function to update URL with new search params
  const updateSearchParams = (newParams: Record<string, string | null>) => {
    startTransition(() => {
      const params = new URLSearchParams(currentSearchParams.toString())

      // Reset page when filters change
      params.delete("page")

      // Update params
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      router.push(`/search?${params.toString()}`)
    })
  }

  return (
    <AdvancedSearch
      topics={topics}
      locations={locations}
      organizations={organizations}
      searchParams={searchParams}
      updateSearchParams={updateSearchParams}
      isPending={isPending}
    />
  )
}

