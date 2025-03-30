import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { OpenAccessNotice } from "@/components/dashboard/open-access-notice"
import ArticleEntryForm from "@/components/dashboard/article-entry-form"

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <OpenAccessNotice />

      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/articles">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Article</h1>
          <p className="text-muted-foreground">Create a new article or blog post</p>
        </div>
      </div>

      <ArticleEntryForm />
    </div>
  )
}

