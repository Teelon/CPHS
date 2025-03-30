"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

interface Language {
  language_id: number
  language_name: string
}

interface Translation {
  language_id: number
  title: string
  summary: string
}

interface TranslationFieldsProps {
  translations: Translation[]
  onChange: (translations: Translation[]) => void
}

export function TranslationFields({ translations, onChange }: TranslationFieldsProps) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<string>("en")

  useEffect(() => {
    const fetchLanguages = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("languages")
        .select("language_id, language_name")
        .order("language_name")

      if (error) {
        console.error("Error fetching languages:", error)
      } else {
        setLanguages(data || [])

        // Initialize translations for all languages if none exist
        if (translations.length === 0 && data) {
          const initialTranslations = data.map((lang) => ({
            language_id: lang.language_id,
            title: "",
            summary: "",
          }))
          onChange(initialTranslations)
        }
      }
    }

    fetchLanguages()
  }, [translations.length, onChange])

  const handleTranslationChange = (languageId: number, field: "title" | "summary", value: string) => {
    const updatedTranslations = [...translations]
    const index = updatedTranslations.findIndex((t) => t.language_id === languageId)

    if (index >= 0) {
      updatedTranslations[index] = {
        ...updatedTranslations[index],
        [field]: value,
      }
    } else {
      updatedTranslations.push({
        language_id: languageId,
        title: field === "title" ? value : "",
        summary: field === "summary" ? value : "",
      })
    }

    onChange(updatedTranslations)
  }

  if (languages.length === 0) {
    return <div>Loading languages...</div>
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${languages.length}, minmax(0, 1fr))` }}>
          {languages.map((lang) => (
            <TabsTrigger key={lang.language_id} value={lang.language_id.toString()}>
              {lang.language_name}
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((lang) => {
          const translation = translations.find((t) => t.language_id === lang.language_id) || {
            language_id: lang.language_id,
            title: "",
            summary: "",
          }

          return (
            <TabsContent key={lang.language_id} value={lang.language_id.toString()} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${lang.language_id}`}>Title ({lang.language_name})</Label>
                <Input
                  id={`title-${lang.language_id}`}
                  value={translation.title}
                  onChange={(e) => handleTranslationChange(lang.language_id, "title", e.target.value)}
                  placeholder={`Enter title in ${lang.language_name}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`summary-${lang.language_id}`}>Summary ({lang.language_name})</Label>
                <Textarea
                  id={`summary-${lang.language_id}`}
                  value={translation.summary}
                  onChange={(e) => handleTranslationChange(lang.language_id, "summary", e.target.value)}
                  placeholder={`Enter summary in ${lang.language_name}`}
                  rows={6}
                />
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

