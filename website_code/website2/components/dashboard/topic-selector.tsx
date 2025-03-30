"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Topic {
  topic_id: number
  topic_name: string | null
}

interface TopicSelectorProps {
  selectedTopics: number[]
  onChange: (topicIds: number[]) => void
}

export function TopicSelector({ selectedTopics = [], onChange }: TopicSelectorProps) {
  const [open, setOpen] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.from("topic").select("topic_id, topic_name").order("topic_name")

      if (error) {
        console.error("Error fetching topics:", error)
      } else {
        setTopics(data || [])
      }
      setLoading(false)
    }

    fetchTopics()
  }, [])

  const handleSelect = (topicId: number) => {
    const newSelectedTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter((id) => id !== topicId)
      : [...selectedTopics, topicId]

    onChange(newSelectedTopics)
  }

  const handleRemove = (topicId: number) => {
    onChange(selectedTopics.filter((id) => id !== topicId))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedTopics.length > 0
              ? `${selectedTopics.length} topic${selectedTopics.length > 1 ? "s" : ""} selected`
              : "Select topics..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search topics..." />
            <CommandList>
              <CommandEmpty>{loading ? "Loading topics..." : "No topics found."}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {topics.map((topic) => (
                  <CommandItem
                    key={topic.topic_id}
                    value={topic.topic_name || ""}
                    onSelect={() => handleSelect(topic.topic_id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTopics.includes(topic.topic_id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {topic.topic_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTopics.map((topicId) => {
            const topic = topics.find((t) => t.topic_id === topicId)
            return (
              <Badge key={topicId} variant="secondary" className="flex items-center gap-1">
                {topic?.topic_name || `Topic ${topicId}`}
                <button type="button" onClick={() => handleRemove(topicId)} className="rounded-full hover:bg-muted">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

