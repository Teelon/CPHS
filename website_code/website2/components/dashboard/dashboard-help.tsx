import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle, MousePointer, Filter, Share2 } from "lucide-react"

export default function DashboardHelp() {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-2">
        <MousePointer className="h-4 w-4 mt-0.5 text-primary" />
        <div>
          <p className="text-sm font-medium">Interactive Charts</p>
          <p className="text-xs text-muted-foreground">
            Hover over chart elements to see detailed information and interact with visualizations.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Filter className="h-4 w-4 mt-0.5 text-primary" />
        <div>
          <p className="text-sm font-medium">Filtering Data</p>
          <p className="text-xs text-muted-foreground">
            Use the filters above to refine the dashboard data by time period, location, and more.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Share2 className="h-4 w-4 mt-0.5 text-primary" />
        <div>
          <p className="text-sm font-medium">Sharing Insights</p>
          <p className="text-xs text-muted-foreground">
            Share specific dashboard views by copying the URL after applying filters.
          </p>
        </div>
      </div>

      <Button asChild variant="link" size="sm" className="w-full mt-2">
        <Link href="/dashboard/help">
          <HelpCircle className="h-4 w-4 mr-1" />
          View Full Help Guide
        </Link>
      </Button>
    </div>
  )
}

