import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, LayoutDashboard, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  try {
    const supabase = createClient()

    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background z-10" />
            <div className="relative bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center h-[60vh]">
              <div className="absolute inset-0 bg-black/40" />
              <div className="container relative z-20 flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
                <div className="inline-block px-6 py-2 border border-primary/30 bg-background/80 backdrop-blur-sm rounded-md">
                  <h2 className="text-sm font-medium tracking-widest uppercase text-primary">
                    Canadian Pride History Society
                  </h2>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl leading-tight">
                  Preserving Our Pride History
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                  Explore the rich history of Pride events across Canada through our digital archive
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button asChild size="lg" className="font-medium">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-background/30 backdrop-blur-sm border-white/30 text-white hover:bg-background/50"
                  >
                    <Link href="/search">Advanced Search</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Access Section */}
          <section className="py-12 bg-muted/50 border-y border-border/50">
            <div className="container px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                  <LayoutDashboard className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    Access the admin dashboard to manage content and view analytics
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                  <Search className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
                  <p className="text-muted-foreground mb-4">
                    Filter events by organization, topic, and other criteria to find specific events
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/search">Search Now</Link>
                  </Button>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border border-border/50 hover:border-primary/50 transition-colors">
                  <Info className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground mb-4">Learn more about the Canadian Pride History Society</p>
                  <Button asChild variant="outline">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* About Section Preview */}
          <section className="py-16 container px-4">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">About Our Mission</h2>
                <p className="text-muted-foreground max-w-2xl">
                  The Canadian Pride History Society is dedicated to preserving and showcasing the rich history of Pride
                  events across Canada
                </p>
              </div>
              <Button asChild variant="link" className="mt-2 md:mt-0">
                <Link href="/about">Read More</Link>
              </Button>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p>
                Our mission is to document, preserve, and make accessible the historical records of Pride events
                throughout Canada's history. By creating this digital archive, we aim to preserve the legacy of LGBTQ2S+
                activism and celebration in Canada, educate the public about the evolution of Pride events over time,
                and create a comprehensive resource for researchers, educators, and community members.
              </p>
            </div>
          </section>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error in Home page:", error)
    return (
      <div className="container py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">We're having trouble loading the homepage. Please try again later.</p>
        <Button asChild>
          <Link href="/">Refresh</Link>
        </Button>
      </div>
    )
  }
}

