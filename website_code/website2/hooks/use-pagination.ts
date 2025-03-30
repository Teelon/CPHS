"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

interface UsePaginationProps {
  totalPages: number
  initialPage?: number
}

export function usePagination({ totalPages, initialPage = 1 }: UsePaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname() // Get the current path
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isPending, startTransition] = useTransition()

  // Update currentPage when URL changes
  useEffect(() => {
    const page = searchParams.get("page")
    if (page) {
      const pageNum = Number.parseInt(page, 10)
      if (!isNaN(pageNum) && pageNum !== currentPage) {
        setCurrentPage(pageNum)
      }
    } else if (currentPage !== 1) {
      // Reset to page 1 if no page param
      setCurrentPage(1)
    }
  }, [searchParams, currentPage])

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return

      startTransition(() => {
        // Create a new URLSearchParams instance from the current params
        const params = new URLSearchParams(searchParams.toString())

        // Update the page parameter
        params.set("page", page.toString())

        // Update the URL without a full page reload, preserving the current path
        router.push(`${pathname}?${params.toString()}`, { scroll: false })

        // Update the local state
        setCurrentPage(page)
      })
    },
    [currentPage, router, searchParams, totalPages, pathname],
  )

  return {
    currentPage,
    isPending,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}

