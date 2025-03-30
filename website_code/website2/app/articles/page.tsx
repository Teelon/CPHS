import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { CalendarIcon, MapPin } from "lucide-react"

export default async function ArticlesPage() {
  const supabase = createClient()

  // Fetch articles from pims_main
  const { data: articles, error } = await supabase
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
    .order("date", { ascending: false })
    .limit(12)

  if (error) {
    console.error("Error fetching articles:", error)
  }

  return (
    <div className="container py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Articles</h1>
        <p className="text-muted-foreground mb-8">News, stories, and insights from the Pride History Archive</p>

        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="flex flex-col h-full">
                <CardHeader>
                  <h2 className="text-2xl font-bold">{article.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      {formatDate(article.date || "")}
                    </div>
                    {article.locations && (
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {article.locations.city}, {article.locations.province}
                      </div>
                    )}
                    {article.organizations && (
                      <div className="flex items-center">{article.organizations.organization_name}</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-muted-foreground line-clamp-3">{article.summary}</div>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href={`/articles/${article.id}`}>Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-xl font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-4">Check back soon for new content</p>
          </div>
        )}
      </div>
    </div>
  )
}

