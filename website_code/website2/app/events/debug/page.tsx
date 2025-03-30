import { Suspense } from "react"
import DebugSupabase from "@/components/debug-supabase"
import { Skeleton } from "@/components/ui/skeleton"

export default function DebugPage() {
  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Debug Supabase Connection</h1>
      <p className="text-muted-foreground mb-8">
        Use this page to troubleshoot issues with the Supabase connection in the deployed environment.
      </p>

      <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
        <DebugSupabase />
      </Suspense>
    </div>
  )
}

