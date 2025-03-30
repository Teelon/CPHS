import Link from "next/link"
import { Search, Info } from "lucide-react"
import { OpenAccessNotice } from "@/components/dashboard/open-access-notice"

export const metadata = {
  title: "Dashboard | Pride History Archive",
  description: "Interactive dashboard for the Canadian Pride History Archive",
}

export default function DashboardPage() {
  return (
    <div className="container py-8 px-4">
      <OpenAccessNotice />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Pride History Archive admin dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/search" className="group">
          <div className="border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">Advanced Search</h2>
                <p className="text-muted-foreground">Search and filter archive content</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/about" className="group">
          <div className="border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">About</h2>
                <p className="text-muted-foreground">Learn about the Canadian Pride History Society</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 p-6 border rounded-lg bg-muted/20">
        <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
        <p className="text-muted-foreground mb-4">
          This dashboard provides access to the core functionalities of the Pride History Archive. Use the links above
          to navigate to different sections of the application.
        </p>
        <p className="text-muted-foreground">
          For more information about the Canadian Pride History Society and our mission, visit the About page.
        </p>
      </div>
    </div>
  )
}

