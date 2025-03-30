"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRouter, useSearchParams } from "next/navigation"

type SearchSuggestion = {
  id: string
  title: string
  type: string
  year?: string
}

export function PredictiveSearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for query parameter and set it as the initial query
  useEffect(() => {
    const urlQuery = searchParams.get("query")
    if (urlQuery) {
      setQuery(urlQuery)
    }
  }, [searchParams])

  // Mock suggestions - in a real app, this would come from an API
  useEffect(() => {
    if (query.length > 1) {
      // Simulate API call delay
      const timer = setTimeout(() => {
        const mockSuggestions: SearchSuggestion[] = [
          { id: "1", title: "Toronto Pride Parade", type: "Event", year: "1981" },
          { id: "2", title: "The Body Politic", type: "Publication", year: "1971-1987" },
          { id: "3", title: "Transgender Rights Movement", type: "Topic" },
          { id: "4", title: "Two-Spirit Identities", type: "Topic" },
          { id: "5", title: "Montreal LGBTQ+ Community Center", type: "Organization" },
        ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))

        setSuggestions(mockSuggestions)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [query])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (id: string) => {
    setOpen(false)
    router.push(`/records/${id}`)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search archives, events, organizations..."
          className="pl-10 pr-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
        >
          ⌘K
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search archives, events, organizations..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion) => (
              <CommandItem key={suggestion.id} onSelect={() => handleSelect(suggestion.id)}>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span>{suggestion.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{suggestion.year}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{suggestion.type}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

