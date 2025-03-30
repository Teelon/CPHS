"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"

export type PIMSRecord = {
  ID: string
  Title: string
  "Organization Name": string
  City: string
  Province: string
  "Date(s)": string
  Topics: string
  Summary: string
  "Source Link": string
  Image: string
  "Image Source Link": string
}

export async function fetchPIMSData(): Promise<PIMSRecord[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PIMS-SRo46xJCNmscJE5Q2qHOA834rCYjwP.csv",
    )
    const csvText = await response.text()

    const result = Papa.parse<PIMSRecord>(csvText, {
      header: true,
      skipEmptyLines: true,
    })

    return result.data
  } catch (error) {
    console.error("Error fetching PIMS data:", error)
    return []
  }
}

// Helper function to extract year from date string
export function extractYear(dateString: string): number | null {
  // Try to match a year pattern (4 digits)
  const yearMatch = dateString.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    return Number.parseInt(yearMatch[0])
  }
  return null
}

// Helper function to count events by province
export function countEventsByProvince(data: PIMSRecord[]): Record<string, number> {
  const provinceCounts: Record<string, number> = {}

  data.forEach((record) => {
    if (record.Province) {
      provinceCounts[record.Province] = (provinceCounts[record.Province] || 0) + 1
    }
  })

  return provinceCounts
}

// Helper function to count events by year
export function countEventsByYear(data: PIMSRecord[]): Record<string, number> {
  const yearCounts: Record<string, number> = {}

  data.forEach((record) => {
    const year = extractYear(record["Date(s)"])
    if (year) {
      yearCounts[year.toString()] = (yearCounts[year.toString()] || 0) + 1
    }
  })

  return yearCounts
}

// Helper function to extract topics from the dataset
export function extractTopics(data: PIMSRecord[]): Record<string, number> {
  const topicCounts: Record<string, number> = {}

  data.forEach((record) => {
    if (record.Topics) {
      // Topics are comma-separated and may have quotes
      const topics = record.Topics.split(",")
        .map((t) => t.trim().replace(/"/g, ""))
        .filter((t) => t.length > 0)

      topics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      })
    }
  })

  return topicCounts
}

// Helper function to count events by organization
export function countEventsByOrganization(data: PIMSRecord[]): Record<string, number> {
  const orgCounts: Record<string, number> = {}

  data.forEach((record) => {
    if (record["Organization Name"]) {
      orgCounts[record["Organization Name"]] = (orgCounts[record["Organization Name"]] || 0) + 1
    }
  })

  return orgCounts
}

// Helper function to count events by month
export function countEventsByMonth(data: PIMSRecord[]): Record<string, number> {
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

  const monthPatterns = [
    { pattern: /January|Jan/i, month: "January" },
    { pattern: /February|Feb/i, month: "February" },
    { pattern: /March|Mar/i, month: "March" },
    { pattern: /April|Apr/i, month: "April" },
    { pattern: /May/i, month: "May" },
    { pattern: /June|Jun/i, month: "June" },
    { pattern: /July|Jul/i, month: "July" },
    { pattern: /August|Aug/i, month: "August" },
    { pattern: /September|Sept?/i, month: "September" },
    { pattern: /October|Oct/i, month: "October" },
    { pattern: /November|Nov/i, month: "November" },
    { pattern: /December|Dec/i, month: "December" },
  ]

  data.forEach((record) => {
    const dateStr = record["Date(s)"]

    for (const { pattern, month } of monthPatterns) {
      if (pattern.test(dateStr)) {
        monthCounts[month] += 1
        break
      }
    }
  })

  return monthCounts
}

// Helper function to count events by city
export function countEventsByCity(data: PIMSRecord[]): Record<string, number> {
  const cityCounts: Record<string, number> = {}

  data.forEach((record) => {
    if (record.City) {
      cityCounts[record.City] = (cityCounts[record.City] || 0) + 1
    }
  })

  return cityCounts
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
        const pimsData = await fetchPIMSData()
        setData(pimsData)
      } catch (err) {
        console.error("Error loading PIMS data:", err)
        setError("Failed to load PIMS data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return { data, isLoading, error }
}

