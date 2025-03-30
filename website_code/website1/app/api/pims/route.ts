import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")

  try {
    const supabase = createServerSupabaseClient()

    // Handle different data requests based on type parameter
    switch (type) {
      case "stats":
        return await getStats(supabase)
      case "events-by-year":
        return await getEventsByYear(supabase)
      case "events-by-month":
        return await getEventsByMonth(supabase)
      case "events-by-topic":
        return await getEventsByTopic(supabase)
      case "events-by-province":
        return await getEventsByProvince(supabase)
      case "entries":
        return await getEntries(supabase)
      default:
        return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

async function getStats(supabase: any) {
  try {
    // Get total records count
    const { count: totalRecords, error: recordsError } = await supabase
      .from("pims_main")
      .select("*", { count: "exact", head: true })

    if (recordsError) throw recordsError

    // Get unique organizations count
    const { data: organizations, error: orgsError } = await supabase.from("organizations").select("organization_id")

    if (orgsError) throw orgsError

    // Get unique cities count
    const { data: locations, error: locationsError } = await supabase
      .from("locations")
      .select("city")
      .not("city", "is", null)

    if (locationsError) throw locationsError

    // Get unique provinces count
    const { data: provinces, error: provincesError } = await supabase
      .from("locations")
      .select("province")
      .not("province", "is", null)

    if (provincesError) throw provincesError

    // Get unique topics count
    const { data: topics, error: topicsError } = await supabase.from("topic").select("topic_id")

    if (topicsError) throw topicsError

    // Get unique cities
    const uniqueCities = new Set(locations.map((loc: any) => loc.city))

    // Get unique provinces
    const uniqueProvinces = new Set(provinces.map((prov: any) => prov.province))

    return NextResponse.json({
      totalRecords: totalRecords || 0,
      organizations: organizations?.length || 0,
      cities: uniqueCities.size || 0,
      provinces: uniqueProvinces.size || 0,
      topics: topics?.length || 0,
    })
  } catch (error: any) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: error.message || "Error fetching stats" }, { status: 500 })
  }
}

async function getEventsByYear(supabase: any) {
  try {
    // Extract year from date and count events by year
    const { data, error } = await supabase.from("pims_main").select("date").not("date", "is", null)

    if (error) throw error

    // Process data to count by year
    const yearCounts: Record<string, number> = {}

    data.forEach((item: any) => {
      if (item.date) {
        try {
          const date = new Date(item.date)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear().toString()
            yearCounts[year] = (yearCounts[year] || 0) + 1
          }
        } catch (e) {
          console.warn("Invalid date format:", item.date)
        }
      }
    })

    return NextResponse.json(yearCounts)
  } catch (error: any) {
    console.error("Events by year error:", error)
    return NextResponse.json({ error: error.message || "Error fetching events by year" }, { status: 500 })
  }
}

// Update the getEventsByMonth function to ensure proper month ordering
async function getEventsByMonth(supabase: any) {
  try {
    // Extract month from date and count events by month
    const { data, error } = await supabase.from("pims_main").select("date").not("date", "is", null)

    if (error) throw error

    // Process data to count by month
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const monthCounts: Record<string, number> = {}

    // Initialize all months with 0
    months.forEach((month) => {
      monthCounts[month] = 0
    })

    // Count events by month
    data.forEach((item: any) => {
      if (item.date) {
        try {
          const date = new Date(item.date)
          if (!isNaN(date.getTime())) {
            const month = months[date.getMonth()]
            monthCounts[month] += 1
          }
        } catch (e) {
          console.warn("Invalid date format:", item.date)
        }
      }
    })

    // Convert to array format for chart
    const result = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Events by month error:", error)
    return NextResponse.json({ error: error.message || "Error fetching events by month" }, { status: 500 })
  }
}

async function getEventsByTopic(supabase: any) {
  try {
    // Get topics and their counts
    const { data, error } = await supabase.from("pims_entry_topic").select(`
        topic_id,
        topic (
          topic_name
        )
      `)

    if (error) throw error

    // Count occurrences of each topic
    const topicCounts: Record<string, number> = {}

    data.forEach((item: any) => {
      if (item.topic && item.topic.topic_name) {
        const topicName = item.topic.topic_name
        topicCounts[topicName] = (topicCounts[topicName] || 0) + 1
      }
    })

    // Convert to array and sort by count
    const result = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Events by topic error:", error)
    return NextResponse.json({ error: error.message || "Error fetching events by topic" }, { status: 500 })
  }
}

async function getEventsByProvince(supabase: any) {
  try {
    // Get events by province
    const { data, error } = await supabase
      .from("pims_main")
      .select(`
        location_id,
        locations (
          province
        )
      `)
      .not("locations.province", "is", null)

    if (error) throw error

    // Count occurrences of each province
    const provinceCounts: Record<string, number> = {}

    data.forEach((item: any) => {
      if (item.locations && item.locations.province) {
        const province = item.locations.province
        provinceCounts[province] = (provinceCounts[province] || 0) + 1
      }
    })

    // Convert to array format for chart
    const result = Object.entries(provinceCounts)
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Events by province error:", error)
    return NextResponse.json({ error: error.message || "Error fetching events by province" }, { status: 500 })
  }
}

async function getEntries(supabase: any) {
  try {
    // Get all entries with location and organization data
    const { data, error } = await supabase
      .from("pims_main")
      .select(`
        id,
        title,
        date,
        summary,
        source_link,
        has_photos,
        type,
        location_id,
        locations (
          city,
          province
        ),
        organization_id,
        organizations (
          organization_name
        )
      `)
      .order("date", { ascending: false })

    if (error) throw error

    // Format the data for easier consumption
    const formattedData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      summary: item.summary,
      source_link: item.source_link,
      has_photos: item.has_photos,
      type: item.type,
      city: item.locations?.city || null,
      province: item.locations?.province || null,
      organization_name: item.organizations?.organization_name || null,
    }))

    return NextResponse.json(formattedData)
  } catch (error: any) {
    console.error("Entries error:", error)
    return NextResponse.json({ error: error.message || "Error fetching entries" }, { status: 500 })
  }
}

