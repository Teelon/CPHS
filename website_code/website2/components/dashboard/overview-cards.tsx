import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { BarChart3, Calendar, MapPin, Users, TrendingUp, TrendingDown } from "lucide-react"

export default async function OverviewCards() {
  const supabase = createClient()

  // Fetch total events count
  const { count: eventsCount } = await supabase.from("pims_main").select("*", { count: "exact", head: true })

  // Fetch total organizations count
  const { count: organizationsCount } = await supabase.from("organizations").select("*", { count: "exact", head: true })

  // Fetch total locations count
  const { count: locationsCount } = await supabase.from("locations").select("*", { count: "exact", head: true })

  // Fetch total topics count
  const { count: topicsCount } = await supabase.from("topic").select("*", { count: "exact", head: true })

  // Calculate growth percentages (mock data for demonstration)
  const eventsGrowth = 12.5
  const organizationsGrowth = 8.2
  const locationsGrowth = 5.7
  const topicsGrowth = 15.3

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventsCount || 0}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {eventsGrowth > 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">{eventsGrowth}% increase</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-500">{Math.abs(eventsGrowth)}% decrease</span>
              </>
            )}
            <span>from last period</span>
          </div>
          <CardDescription className="pt-4">Historical pride events documented in the archive</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{organizationsCount || 0}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {organizationsGrowth > 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">{organizationsGrowth}% increase</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-500">{Math.abs(organizationsGrowth)}% decrease</span>
              </>
            )}
            <span>from last period</span>
          </div>
          <CardDescription className="pt-4">Organizations involved in pride events</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{locationsCount || 0}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {locationsGrowth > 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">{locationsGrowth}% increase</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-500">{Math.abs(locationsGrowth)}% decrease</span>
              </>
            )}
            <span>from last period</span>
          </div>
          <CardDescription className="pt-4">Cities and provinces with documented events</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Topics</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topicsCount || 0}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {topicsGrowth > 0 ? (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">{topicsGrowth}% increase</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-500">{Math.abs(topicsGrowth)}% decrease</span>
              </>
            )}
            <span>from last period</span>
          </div>
          <CardDescription className="pt-4">Unique topics and themes across events</CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}

