"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function useSearchParamsState() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, setIsPending] = useState(false)

  // Create a debounced function to update URL params
  const debouncedUpdateParams = useDebouncedCallback((params: URLSearchParams) => {
    setIsPending(true)
    router.push(`/search?${params.toString()}`)
    // Reset pending state after navigation
    setTimeout(() => setIsPending(false), 100)
  }, 300)

  // Function to update search params
  const updateSearchParams = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

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

      debouncedUpdateParams(params)
    },
    [searchParams, debouncedUpdateParams],
  )

  return {
    searchParams,
    updateSearchParams,
    isPending,
  }
}

