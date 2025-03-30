"use client"

import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"

// Create a single Supabase client for the entire application
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Define types based on the actual database schema
export type PIMSRecord = {
  id: number
  title: string
  organization_id?: number
  organization_name?: string
  location_id?: number
  city?: string
  province?: string
  date?: string
  summary?: string
  source_link?: string
  has_photos?: boolean
  type?: string
  created_at?: string
}

export type PrideRecord = {
  id: number
  title: string
  organization_name?: string
  city?: string
  province?: string
  date?: string
  summary?: string
  source_link?: string
  has_photos?: boolean
  type?: string
  is_processed?: boolean
  created_at?: string
  pims_id?: number
}

export type Topic = {
  topic_id: number
  topic_name: string
}

export type TopicTranslation = {
  id: number
  topic_id: number
  language_id: number
  translated_topic: string
}

export type Language = {
  language_id: number
  language_name: string
}

export type Organization = {
  organization_id: number
  organization_name: string
}

export type Location = {
  location_id: number
  city: string
  province: string
}

// OIMSRecord type definition
export type OIMSRecord = {
  id: number
  title: string
  organization?: string
  city?: string
  province?: string
  date?: string
  summary?: string
  source_link?: string
  has_photos?: boolean
  type?: string
  image_url?: string
  topics?: string
}

// Database connection utility
export function useDatabase() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsInitialization, setNeedsInitialization] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true)
      try {
        // Try to query the pims_main table
        const { data, error: tableError } = await supabase.from("pims_main").select("*").limit(1)

        if (tableError) {
          // If this fails, the table might not exist yet
          if (tableError.message.includes("does not exist")) {
            setNeedsInitialization(true)
            setIsConnected(false)
            setError("Table pims_main does not exist")
            return
          }
          throw tableError
        }

        // If we get here, we're connected and the table exists
        setIsConnected(true)
        setNeedsInitialization(false)
        setError(null)
      } catch (err: any) {
        console.error("Database connection error:", err)
        setIsConnected(false)

        // Check if this is an initialization issue
        if (
          err.message &&
          (err.message.includes("does not exist") || err.message.includes("column") || err.message.includes("relation"))
        ) {
          setNeedsInitialization(true)
          setError("Database needs to be initialized")
        } else {
          setError(err.message || "Failed to connect to database")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  return {
    isConnected,
    isLoading,
    error,
    needsInitialization,
  }
}

// Fetch all records from pims_main
export async function fetchPIMSRecords(): Promise<PIMSRecord[]> {
  try {
    const { data, error } = await supabase
      .from("pims_main")
      .select(`
        id,
        title,
        organization_id,
        organizations(organization_name),
        location_id,
        locations(city, province),
        date,
        summary,
        source_link,
        has_photos,
        type
      `)
      .order("date", { ascending: false })

    if (error) throw error

    // Transform the data to match the PIMSRecord type
    const transformedData = data.map((record) => ({
      id: record.id,
      title: record.title,
      organization_id: record.organization_id,
      organization_name: record.organizations?.organization_name,
      location_id: record.location_id,
      city: record.locations?.city,
      province: record.locations?.province,
      date: record.date,
      summary: record.summary,
      source_link: record.source_link,
      has_photos: record.has_photos,
      type: record.type,
    }))

    return transformedData || []
  } catch (error) {
    console.error("Error fetching PIMS records:", error)
    return []
  }
}

// Fetch all pride records
export async function fetchPrideRecords(): Promise<PrideRecord[]> {
  try {
    const { data, error } = await supabase.from("pride_records").select("*").order("date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching Pride records:", error)
    return []
  }
}

// Count events by province
export async function countEventsByProvince(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("pims_main")
      .select(`
        locations(province)
      `)
      .not("locations.province", "is", null)

    if (error) throw error

    const provinceCounts: Record<string, number> = {}
    data.forEach((record) => {
      if (record.locations?.province) {
        const province = record.locations.province
        provinceCounts[province] = (provinceCounts[province] || 0) + 1
      }
    })

    return provinceCounts
  } catch (error) {
    console.error("Error counting events by province:", error)
    return {}
  }
}

// Count events by year
export async function countEventsByYear(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from("pims_main").select("date").not("date", "is", null)

    if (error) throw error

    const yearCounts: Record<string, number> = {}
    data.forEach((record) => {
      if (record.date) {
        // Extract year from date string or date object
        const date = new Date(record.date)
        const year = date.getFullYear().toString()
        yearCounts[year] = (yearCounts[year] || 0) + 1
      }
    })

    return yearCounts
  } catch (error) {
    console.error("Error counting events by year:", error)
    return {}
  }
}

// Count events by topic
export async function countEventsByTopic(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from("pims_entry_topic").select(`
        topic_id,
        topic(topic_name)
      `)

    if (error) throw error

    const topicCounts: Record<string, number> = {}
    data.forEach((record) => {
      if (record.topic?.topic_name) {
        const topicName = record.topic.topic_name
        topicCounts[topicName] = (topicCounts[topicName] || 0) + 1
      }
    })

    return topicCounts
  } catch (error) {
    console.error("Error counting events by topic:", error)
    return {}
  }
}

// Count events by organization
export async function countEventsByOrganization(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("pims_main")
      .select(`
        organization_id,
        organizations(organization_name)
      `)
      .not("organization_id", "is", null)

    if (error) throw error

    const orgCounts: Record<string, number> = {}
    data.forEach((record) => {
      if (record.organizations?.organization_name) {
        const orgName = record.organizations.organization_name
        orgCounts[orgName] = (orgCounts[orgName] || 0) + 1
      }
    })

    return orgCounts
  } catch (error) {
    console.error("Error counting events by organization:", error)
    return {}
  }
}

// Count events by month
export async function countEventsByMonth(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from("pims_main").select("date").not("date", "is", null)

    if (error) throw error

    const monthCounts: Record<string, number> = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    }

    data.forEach((record) => {
      if (record.date) {
        const date = new Date(record.date)
        const monthIndex = date.getMonth()
        const monthNames = [
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
        const month = monthNames[monthIndex]
        monthCounts[month] += 1
      }
    })

    return monthCounts
  } catch (error) {
    console.error("Error counting events by month:", error)
    return {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    }
  }
}

// Count events by city
export async function countEventsByCity(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("pims_main")
      .select(`
        locations(city)
      `)
      .not("locations.city", "is", null)

    if (error) throw error

    const cityCounts: Record<string, number> = {}
    data.forEach((record) => {
      if (record.locations?.city) {
        const city = record.locations.city
        cityCounts[city] = (cityCounts[city] || 0) + 1
      }
    })

    return cityCounts
  } catch (error) {
    console.error("Error counting events by city:", error)
    return {}
  }
}

// Get all topics
export async function fetchTopics(): Promise<Topic[]> {
  try {
    const { data, error } = await supabase.from("topic").select("*").order("topic_name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching topics:", error)
    return []
  }
}

// Get all organizations
export async function fetchOrganizations(): Promise<Organization[]> {
  try {
    const { data, error } = await supabase.from("organizations").select("*").order("organization_name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return []
  }
}

// Get all locations
export async function fetchLocations(): Promise<Location[]> {
  try {
    const { data, error } = await supabase.from("locations").select("*").order("province").order("city")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching locations:", error)
    return []
  }
}

// Get database statistics
export async function getDatabaseStats(): Promise<{
  totalRecords: number
  provinces: number
  cities: number
  organizations: number
  topics: number
}> {
  try {
    // Get total records count
    const { count: totalRecords, error: recordsError } = await supabase
      .from("pims_main")
      .select("*", { count: "exact", head: true })

    if (recordsError) throw recordsError

    // Get unique provinces count
    const { data: provincesData, error: provincesError } = await supabase
      .from("locations")
      .select("province")
      .not("province", "is", null)

    if (provincesError) throw provincesError
    const uniqueProvinces = new Set(provincesData.map((record) => record.province))

    // Get unique cities count
    const { data: citiesData, error: citiesError } = await supabase
      .from("locations")
      .select("city")
      .not("city", "is", null)

    if (citiesError) throw citiesError
    const uniqueCities = new Set(citiesData.map((record) => record.city))

    // Get unique organizations count
    const { data: orgsData, error: orgsError } = await supabase.from("organizations").select("organization_id")

    if (orgsError) throw orgsError

    // Get unique topics count
    const { data: topicsData, error: topicsError } = await supabase.from("topic").select("topic_id")

    if (topicsError) throw topicsError

    return {
      totalRecords: totalRecords || 0,
      provinces: uniqueProvinces.size,
      cities: uniqueCities.size,
      organizations: orgsData.length,
      topics: topicsData.length,
    }
  } catch (error) {
    console.error("Error getting database stats:", error)
    return {
      totalRecords: 0,
      provinces: 0,
      cities: 0,
      organizations: 0,
      topics: 0,
    }
  }
}

// Custom hook to load and use PIMS data
export function usePIMSData() {
  const [data, setData] = useState<PIMSRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const records = await fetchPIMSRecords()
        setData(records)
        setError(null)
      } catch (err: any) {
        console.error("Error loading PIMS data:", err)
        setError(err.message || "Failed to load PIMS data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return { data, isLoading, error }
}

// Function to count PIMS events by year
export async function countPIMSEventsByYear(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from("pims_main").select("date").not("date", "is", null)

    if (error) throw error

    const yearCounts: Record<string, number> = {}
    data.forEach((record) => {
      if (record.date) {
        // Extract year from date string or date object
        const date = new Date(record.date)
        const year = date.getFullYear().toString()
        yearCounts[year] = (yearCounts[year] || 0) + 1
      }
    })

    return yearCounts
  } catch (error) {
    console.error("Error counting events by year:", error)
    return {}
  }
}

