import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Filter, Maximize2, Share2, Sliders } from "lucide-react"

export const metadata = {
  title: "Dashboard Help | Pride History Archive",
  description: "Learn how to use the Pride History Archive dashboard",
}

export default function DashboardHelpPage() {
  return (
    <div className="container py-8 px-4">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/dashboard" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard Help</h1>
        <p className="text-muted-foreground mb-8">
          Learn how to use the Pride History Archive dashboard to explore data and trends
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>Understanding the dashboard layout and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Pride History Archive dashboard provides an interactive way to explore and visualize data about
                  Pride events across Canada. The dashboard is divided into several sections:
                </p>

                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Archive Metrics</h3>
                    <p className="text-muted-foreground">
                      Key statistics about the archive, including total events, organizations, locations, and topics.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Events Timeline</h3>
                    <p className="text-muted-foreground">
                      A chronological visualization of events over time, showing the distribution and frequency of
                      documented Pride events.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Events by Decade & Province</h3>
                    <p className="text-muted-foreground">
                      Charts showing the distribution of events by decade and geographical location.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Topics, Organizations & Recent Events</h3>
                    <p className="text-muted-foreground">
                      Tabbed section showing popular topics, organizations with the most events, and recently added
                      events.
                    </p>
                  </div>
                </div>

                <p>
                  All sections of the dashboard are interactive and respond to the filters applied on the left sidebar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Using Filters</CardTitle>
                <CardDescription>How to refine the dashboard data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The dashboard includes a powerful filtering system that allows you to focus on specific aspects of the
                  data:
                </p>

                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Filter className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Date Range</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Filter events by start and end years to focus on specific time periods.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Filter className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Province</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Filter events by Canadian province to focus on specific geographical areas.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Filter className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Organization</h3>
                    </div>
                    <p className="text-muted-foreground">Filter events by the organizing group or institution.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Filter className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Topic</h3>
                    </div>
                    <p className="text-muted-foreground">Filter events by specific topics or themes.</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Tips for Using Filters</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Filters are applied immediately when selected</li>
                    <li>Multiple filters can be combined for more specific results</li>
                    <li>Use the "Reset Filters" button to clear all applied filters</li>
                    <li>
                      The URL updates with your filter selections, allowing you to bookmark or share specific views
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Working with Charts</CardTitle>
                <CardDescription>How to interact with visualizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The dashboard includes several interactive charts and visualizations that help you explore the data:
                </p>

                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Hovering & Tooltips</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Hover over any chart element to see detailed information in a tooltip.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Sliders className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Legends & Toggles</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Click on legend items to show/hide specific data series in charts.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Maximize2 className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Zooming & Panning</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Some charts support zooming and panning to explore detailed areas.
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Chart Types</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      <strong>Timeline:</strong> Shows events distribution over time
                    </li>
                    <li>
                      <strong>Bar Charts:</strong> Compare quantities across categories
                    </li>
                    <li>
                      <strong>Pie/Donut Charts:</strong> Show proportional distribution
                    </li>
                    <li>
                      <strong>Topic Cloud:</strong> Visualize popular topics with size indicating frequency
                    </li>
                    <li>
                      <strong>Tables:</strong> Provide detailed data in a structured format
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sharing & Exporting</CardTitle>
                <CardDescription>How to share and export dashboard data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The dashboard provides several ways to share and export data:</p>

                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Share2 className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Share Link</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Use the "Share" button to copy a link to the current dashboard view, including all applied
                      filters.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Share2 className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Social Media Sharing</h3>
                    </div>
                    <p className="text-muted-foreground">Share the dashboard directly to social media platforms.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Share2 className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Embedding</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Get embed code to include the dashboard or specific charts in other websites.
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Accessibility Features</h3>
                  <p className="text-muted-foreground mb-2">The dashboard is designed to be accessible to all users:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Keyboard navigation for all interactive elements</li>
                    <li>Screen reader compatibility with ARIA labels</li>
                    <li>Color schemes designed for color blindness compatibility</li>
                    <li>Text alternatives for all visual data representations</li>
                    <li>Responsive design that works on all devices and screen sizes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

