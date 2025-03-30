import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { formatDate, truncateText } from "@/lib/utils"
import ArticleActions from "@/components/dashboard/article-actions"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { OpenAccessNotice } from "@/components/dashboard/open-access-notice"

interface ArticlesPageProps {
  searchParams: { q?: string; page?: string }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  return (
    <div>
      <OpenAccessNotice />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">Manage your articles and blog posts</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search articles..." className="pl-8" defaultValue={searchParams.q} />
        </div>
      </div>

      <Suspense fallback={<ArticlesTableSkeleton />}>
        <ArticlesTable page={searchParams.page ? Number.parseInt(searchParams.page) : 1} query={searchParams.q} />
      </Suspense>
    </div>
  )
}

async function ArticlesTable({ page = 1, query }: { page: number; query?: string }) {
  const pageSize = 10
  const offset = (page - 1) * pageSize

  const supabase = createClient()

  // Build query to fetch from pims_main with organization and location joins
  let dbQuery = supabase.from("pims_main").select(
    `
    id,
    title,
    date,
    summary,
    source_link,
    organization_id,
    organizations (
      organization_id,
      organization_name
    ),
    location_id,
    locations (
      location_id,
      city,
      province
    )
  `,
    { count: "exact" },
  )

  // Apply search filter if provided
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
  }

  // Apply pagination
  const {
    data: articles,
    count,
    error,
  } = await dbQuery.order("date", { ascending: false }).range(offset, offset + pageSize - 1)

  if (error) {
    console.error("Error fetching articles:", error)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles && articles.length > 0 ? (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{truncateText(article.title || "", 50)}</TableCell>
                <TableCell>
                  {article.organizations ? (
                    <Badge variant="outline">{article.organizations.organization_name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {article.locations ? (
                    <span>
                      {article.locations.city}, {article.locations.province}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(article.date || "")}</TableCell>
                <TableCell className="text-right">
                  <ArticleActions article={article} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No articles found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ArticlesTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-full max-w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

