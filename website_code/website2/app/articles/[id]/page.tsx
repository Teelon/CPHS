import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, CalendarIcon, MapPin, Building } from "lucide-react"

interface ArticlePageProps {
  params: { id: string }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const supabase = createClient()

    // Fetch article by ID
    const { data: article, error } = await supabase
      .from("pims_main")
      .select(`
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
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error
    if (!article) notFound()

    return (
      <div className="container py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/articles" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>
          </Button>

          <article>
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

            <div className="flex flex-wrap gap-4 text-muted-foreground mb-8">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(article.date || "")}
              </div>

              {article.locations && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {article.locations.city}, {article.locations.province}
                </div>
              )}

              {article.organizations && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {article.organizations.organization_name}
                </div>
              )}
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>{article.summary}</p>
            </div>

            {article.source_link && (
              <div className="mt-6">
                <Button asChild variant="outline">
                  <a href={article.source_link} target="_blank" rel="noopener noreferrer">
                    View Source
                  </a>
                </Button>
              </div>
            )}
          </article>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching article:", error)
    return (
      <div className="container py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/articles" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-4">Error loading article</h1>
          <p className="text-muted-foreground mb-6">
            We're having trouble loading this article. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}

