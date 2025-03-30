"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface Translation {
  language_id: number
  title: string
  summary: string
  source_link?: string
}

// Create a new entry in pims_main - no auth check
export async function createArticle(formData: FormData) {
  try {
    const supabase = createClient()

    // Extract form data
    const title = formData.get("title") as string
    const summary = formData.get("summary") as string
    const date = formData.get("date") as string
    const organizationId = formData.get("organization_id") as string
    const locationId = formData.get("location_id") as string
    const sourceLink = (formData.get("source_link") as string) || null
    const hasPhotos = formData.get("has_photos") === "true"
    const type = (formData.get("type") as string) || null

    // Get topics and translations from JSON strings
    const topicsJson = formData.get("topics") as string
    const translationsJson = formData.get("translations") as string

    const topics = topicsJson && topicsJson !== "undefined" ? (JSON.parse(topicsJson) as number[]) : []
    const translations =
      translationsJson && translationsJson !== "undefined" ? (JSON.parse(translationsJson) as Translation[]) : []

    // Convert organization_id and location_id to numbers or null
    const orgId = organizationId && organizationId !== "" ? Number.parseInt(organizationId) : null
    const locId = locationId && locationId !== "" ? Number.parseInt(locationId) : null

    // Insert entry into pims_main
    const { data, error } = await supabase
      .from("pims_main")
      .insert({
        title,
        summary,
        date,
        organization_id: orgId,
        location_id: locId,
        source_link: sourceLink,
        has_photos: hasPhotos,
        type: type,
      })
      .select()

    if (error) {
      console.error("Supabase error creating article:", error)
      throw error
    }

    const articleId = data[0].id

    // Insert topics
    if (topics.length > 0) {
      const topicEntries = topics.map((topicId) => ({
        pims_id: articleId,
        topic_id: topicId,
      }))

      const { error: topicError } = await supabase.from("pims_entry_topic").insert(topicEntries)

      if (topicError) {
        console.error("Error adding topics:", topicError)
      }
    }

    // Insert translations
    if (translations.length > 0) {
      const translationEntries = translations
        .filter((t) => t.title.trim() !== "" || t.summary.trim() !== "") // Only save non-empty translations
        .map((t) => ({
          pims_id: articleId,
          language_id: t.language_id,
          title: t.title || null,
          summary: t.summary || null,
          source_link: t.source_link || null,
        }))

      if (translationEntries.length > 0) {
        const { error: translationError } = await supabase.from("pims_main_translations").insert(translationEntries)

        if (translationError) {
          console.error("Error adding translations:", translationError)
        }
      }
    }

    // Revalidate the articles page
    revalidatePath("/dashboard/articles")

    // Return success
    return { success: true }
  } catch (error) {
    console.error("Error creating article:", error)
    return { error: "Failed to create article. Please try again." }
  }
}

// Update an existing entry in pims_main - no auth check
export async function updateArticle(id: number, formData: FormData) {
  try {
    const supabase = createClient()

    // Extract form data
    const title = formData.get("title") as string
    const summary = formData.get("summary") as string
    const date = formData.get("date") as string
    const organizationId = formData.get("organization_id") as string
    const locationId = formData.get("location_id") as string
    const sourceLink = (formData.get("source_link") as string) || null
    const hasPhotos = formData.get("has_photos") === "true"
    const type = (formData.get("type") as string) || null

    // Get topics and translations from JSON strings
    const topicsJson = formData.get("topics") as string
    const translationsJson = formData.get("translations") as string

    const topics = topicsJson && topicsJson !== "undefined" ? (JSON.parse(topicsJson) as number[]) : []
    const translations =
      translationsJson && translationsJson !== "undefined" ? (JSON.parse(translationsJson) as Translation[]) : []

    // Convert organization_id and location_id to numbers or null
    const orgId = organizationId && organizationId !== "" ? Number.parseInt(organizationId) : null
    const locId = locationId && locationId !== "" ? Number.parseInt(locationId) : null

    // Update entry in pims_main
    const { data, error } = await supabase
      .from("pims_main")
      .update({
        title,
        summary,
        date,
        organization_id: orgId,
        location_id: locId,
        source_link: sourceLink,
        has_photos: hasPhotos,
        type: type,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Supabase error updating article:", error)
      throw error
    }

    // Update topics - first delete existing topics
    const { error: deleteTopicError } = await supabase.from("pims_entry_topic").delete().eq("pims_id", id)

    if (deleteTopicError) {
      console.error("Error deleting existing topics:", deleteTopicError)
    }

    // Then insert new topics
    if (topics.length > 0) {
      const topicEntries = topics.map((topicId) => ({
        pims_id: id,
        topic_id: topicId,
      }))

      const { error: topicError } = await supabase.from("pims_entry_topic").insert(topicEntries)

      if (topicError) {
        console.error("Error updating topics:", topicError)
      }
    }

    // Update translations - first delete existing translations
    const { error: deleteTranslationError } = await supabase.from("pims_main_translations").delete().eq("pims_id", id)

    if (deleteTranslationError) {
      console.error("Error deleting existing translations:", deleteTranslationError)
    }

    // Then insert new translations
    if (translations.length > 0) {
      const translationEntries = translations
        .filter((t) => t.title.trim() !== "" || t.summary.trim() !== "") // Only save non-empty translations
        .map((t) => ({
          pims_id: id,
          language_id: t.language_id,
          title: t.title || null,
          summary: t.summary || null,
          source_link: t.source_link || null,
        }))

      if (translationEntries.length > 0) {
        const { error: translationError } = await supabase.from("pims_main_translations").insert(translationEntries)

        if (translationError) {
          console.error("Error updating translations:", translationError)
        }
      }
    }

    // Revalidate the articles page and the specific article page
    revalidatePath("/dashboard/articles")
    revalidatePath(`/dashboard/articles/${id}`)

    // Return success
    return { success: true }
  } catch (error) {
    console.error("Error updating article:", error)
    return { error: "Failed to update article. Please try again." }
  }
}

// Delete an entry from pims_main - no auth check
export async function deleteArticle(id: number) {
  try {
    const supabase = createClient()

    // Delete related topics
    const { error: topicError } = await supabase.from("pims_entry_topic").delete().eq("pims_id", id)

    if (topicError) {
      console.error("Error deleting related topics:", topicError)
    }

    // Delete related translations
    const { error: translationError } = await supabase.from("pims_main_translations").delete().eq("pims_id", id)

    if (translationError) {
      console.error("Error deleting related translations:", translationError)
    }

    // Delete entry from pims_main
    const { error } = await supabase.from("pims_main").delete().eq("id", id)

    if (error) throw error

    // Revalidate the articles page
    revalidatePath("/dashboard/articles")

    // Return success
    return { success: true }
  } catch (error) {
    console.error("Error deleting article:", error)
    return { error: "Failed to delete article. Please try again." }
  }
}

