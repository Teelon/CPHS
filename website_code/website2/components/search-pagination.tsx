"use client"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { usePagination } from "@/hooks/use-pagination"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SearchPaginationProps {
  currentPage: number
  totalPages: number
  searchParams: { [key: string]: string | string[] | undefined }
  onPageChange?: (page: number) => void
}

export default function SearchPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  const { goToPage, isPending, hasNextPage, hasPrevPage } = usePagination({
    totalPages,
    initialPage: currentPage,
  })

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else if (currentPage <= 3) {
      // Show first 5 pages
      for (let i = 1; i <= 5; i++) {
        pageNumbers.push(i)
      }
    } else if (currentPage >= totalPages - 2) {
      // Show last 5 pages
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Show current page and 2 pages before and after
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pageNumbers.push(i)
      }
    }

    return pageNumbers
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page === currentPage) return

    goToPage(page)

    if (onPageChange) {
      onPageChange(page)
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        {hasPrevPage && (
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage - 1)
              }}
              disabled={isPending}
              className="cursor-pointer"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
        )}

        {getPageNumbers().map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <Button
              variant={pageNumber === currentPage ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(pageNumber)
              }}
              disabled={isPending || pageNumber === currentPage}
              className={`cursor-pointer ${pageNumber === currentPage ? "bg-amber-600 text-amber-50" : ""}`}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={pageNumber === currentPage ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          </PaginationItem>
        ))}

        {hasNextPage && (
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage + 1)
              }}
              disabled={isPending}
              className="cursor-pointer"
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}

