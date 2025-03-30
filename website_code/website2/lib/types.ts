export interface Event {
  id: number
  title: string | null
  date: string | null
  summary: string | null
  source_link: string | null
  organization_id: number | null
  location_id: number | null
  has_photos?: boolean
  type?: string | null
  organizations?: Organization
  locations?: Location
  pims_entry_topic?: TopicEntry[]
}

export interface Organization {
  organization_id: number
  organization_name: string
}

export interface Location {
  location_id: number
  city: string | null
  province: string | null
}

export interface Topic {
  topic_id: number
  topic_name: string | null
}

export interface TopicEntry {
  pims_id: number
  topic_id: number
  topic?: Topic
}

export interface Article {
  id: number
  title: string
  content: string
  author: string
  published: boolean
  created_at: string
  updated_at: string
  featured_image_url: string | null
  slug: string
}

