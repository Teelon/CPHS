import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ArticleForm from "@/components/dashboard/article-form"
import { createClient } from "@/lib/supabase/server"
import { OpenAccessNotice } from "@/components/dashboard/open-access-notice"

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const supabase = createClient()

  // Fetch the article
  const { data: article, error } = await supabase
    .from("pims_main")
    .select(`
      *,
      organizations:organization_id (organization_name),
      locations:location_id (city, province)
    `)
    .eq("id", params.id)
    .single()

  if (error || !article) {
    notFound()
  }

  // Fetch topics for this article
  const { data: topicEntries, error: topicsError } = await supabase
    .from("pims_entry_topic")
    .select(`
      *,
      topic:topic_id (topic_id, topic_name)
    `)
    .eq("pims_id", params.id)

  if (topicsError) {
    console.error("Error fetching topics:", topicsError)
  }

  // Fetch translations for this article
  const { data: translations, error: translationsError } = await supabase
    .from("pims_main_translations")
    .select(`
      *,
      language:language_id (language_id, language_name)
    `)
    .eq("pims_id", params.id)

  if (translationsError) {
    console.error("Error fetching translations:", translationsError)
  }

  // Add topics and translations to the article object
  const articleWithRelations = {
    ...article,
    topics: topicEntries || [],
    translations: translations || [],
  }

  return (
    <div>
      <OpenAccessNotice />

      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/articles">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-muted-foreground">Update article information</p>
        </div>
      </div>

      <ArticleForm article={articleWithRelations} />
    </div>
  )
}

