import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ArticleNotFound() {
  return (
    <div className="container py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The article you're looking for doesn't exist or may have been removed.
        </p>
        <Button asChild>
          <Link href="/articles">Browse All Articles</Link>
        </Button>
      </div>
    </div>
  )
}

