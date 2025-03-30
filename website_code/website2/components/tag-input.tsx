"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, TagIcon, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TagInputProps {
  availableTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  maxHeight?: number
}

export function TagInput({
  availableTags,
  selectedTags,
  onTagsChange,
  placeholder = "Select tags...",
  maxHeight = 200,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Filter tags based on input value
  const filteredTags = inputValue
    ? availableTags.filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag))
    : availableTags.filter((tag) => !selectedTags.includes(tag))

  // Check if current input is a new tag (not in available tags and not empty)
  const isNewTag =
    inputValue &&
    !availableTags.some((tag) => tag.toLowerCase() === inputValue.toLowerCase()) &&
    !selectedTags.includes(inputValue)

  // Add a tag (existing or new)
  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
      setInputValue("")
    }
  }

  // Remove a tag
  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          // Only update if we're opening or explicitly closing from outside
          // Don't close when selecting items inside
          if (isOpen || !open) {
            setOpen(isOpen)
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && open && inputValue) {
                e.preventDefault()
                // Add the current input value as a tag if it's not empty
                if (isNewTag) {
                  addTag(inputValue)
                }
              }
            }}
          >
            <div className="flex items-center gap-1 mr-2">
              <TagIcon className="h-4 w-4 shrink-0 opacity-50" />
              {selectedTags.length > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""} selected
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  // If there's a highlighted item, it will be handled by CommandItem's onSelect
                  // If there's no highlighted item but there's input text, handle as new tag
                  if (isNewTag) {
                    addTag(inputValue)
                  }
                }
              }}
            />
            <CommandList>
              <CommandEmpty>
                {isNewTag ? (
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start w-full px-2 py-1.5 text-sm"
                    onClick={() => {
                      addTag(inputValue)
                      setInputValue("") // Clear input after adding
                      // Don't close the popover
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{inputValue}"
                  </Button>
                ) : (
                  <p className="p-2 text-sm text-center">No tags found.</p>
                )}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[var(--cmdk-list-height)] max-h-[300px]">
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => {
                        addTag(tag)
                        // Don't close the popover
                        setInputValue("") // Clear input after selection
                      }}
                      className="cursor-pointer" // Add cursor-pointer class to make it clear it's clickable
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedTags.includes(tag) ? "opacity-100" : "opacity-0")} />
                      {tag}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="px-2 py-1 text-xs flex items-center gap-1 bg-amber-900/20 text-amber-300 hover:bg-amber-900/30"
            >
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 text-amber-300 hover:text-amber-200 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

