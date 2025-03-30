import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ArticlesNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8">Sorry, we couldn't find the articles page you were looking for.</p>
      <Button asChild>
        <Link href="/dashboard/articles">Go to Articles Dashboard</Link>
      </Button>
    </div>
  )
}

