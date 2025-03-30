"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type React from "react"
import { useState } from "react"
import { Check, Tag, ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Mock data - in a real app, this would come from an API
const recordToValidate = {
  id: "R-4567",
  title: "Two-Spirit Identities",
  description:
    "Historical exploration of Two-Spirit identities in Indigenous communities across Canada, focusing on cultural traditions and contemporary expressions.",
  aiGeneratedTags: [
    { id: "1", tag: "Two-Spirit", confidence: 0.95, language: "en" },
    { id: "2", tag: "Indigenous", confidence: 0.92, language: "en" },
    { id: "3", tag: "LGBTQ+", confidence: 0.88, language: "en" },
    { id: "4", tag: "Cultural Heritage", confidence: 0.85, language: "en" },
    { id: "5", tag: "Identity", confidence: 0.82, language: "en" },
    { id: "6", tag: "Bispirituel", confidence: 0.94, language: "fr" },
    { id: "7", tag: "Autochtone", confidence: 0.91, language: "fr" },
    { id: "8", tag: "Patrimoine culturel", confidence: 0.84, language: "fr" },
  ],
}

export function MetadataValidationForm() {
  const [validatedTags, setValidatedTags] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Detect language and translate search query when it changes
  const handleTagValidation = (tagId: string, isValid: boolean) => {
    setValidatedTags((prev) => ({
      ...prev,
      [tagId]: isValid,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least one tag has been validated
    if (Object.keys(validatedTags).length === 0) {
      alert("Please validate at least one tag")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)

      // Reset form state
      setValidatedTags({})
      setFeedback("")
    }, 1500)
  }

  const validationProgress = (Object.keys(validatedTags).length / recordToValidate.aiGeneratedTags.length) * 100

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">Validation Complete</h3>
        <p className="mt-2 text-muted-foreground">Thank you for helping improve our metadata quality!</p>
        <Button
          className="mt-6"
          onClick={() => {
            setIsSubmitted(false)
            setValidatedTags({})
            setFeedback("")
          }}
        >
          Validate Another Record
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md bg-muted p-4">
        <h3 className="text-lg font-medium">{recordToValidate.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{recordToValidate.description}</p>
      </div>

      <div>
        <h4 className="mb-2 font-medium">AI-Generated Tags</h4>
        <p className="mb-4 text-sm text-muted-foreground">
          Please validate the following tags by marking them as accurate or inaccurate:
        </p>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h5 className="mb-2 font-medium">English Tags</h5>
              <div className="flex flex-wrap gap-2">
                {recordToValidate.aiGeneratedTags
                  .filter((tag) => tag.language === "en")
                  .map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag.tag}
                        <span className="ml-1 text-xs text-muted-foreground">{(tag.confidence * 100).toFixed(0)}%</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6", validatedTags[tag.id] === true && "text-green-500")}
                        onClick={() => handleTagValidation(tag.id, true)}
                        type="button"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6", validatedTags[tag.id] === false && "text-red-500")}
                        onClick={() => handleTagValidation(tag.id, false)}
                        type="button"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h5 className="mb-2 font-medium">French Tags</h5>
              <div className="flex flex-wrap gap-2">
                {recordToValidate.aiGeneratedTags
                  .filter((tag) => tag.language === "fr")
                  .map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag.tag}
                        <span className="ml-1 text-xs text-muted-foreground">{(tag.confidence * 100).toFixed(0)}%</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6", validatedTags[tag.id] === true && "text-green-500")}
                        onClick={() => handleTagValidation(tag.id, true)}
                        type="button"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-6 w-6", validatedTags[tag.id] === false && "text-red-500")}
                        onClick={() => handleTagValidation(tag.id, false)}
                        type="button"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Validation Progress</span>
          <span className="text-sm text-muted-foreground">
            {Object.keys(validatedTags).length} of {recordToValidate.aiGeneratedTags.length} tags
          </span>
        </div>
        <Progress value={validationProgress} className="h-2" />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
        <Textarea
          id="feedback"
          placeholder="Provide any additional feedback about the AI-generated tags or suggest new tags"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || Object.keys(validatedTags).length === 0}>
          {isSubmitting ? "Submitting..." : "Submit Validation"}
        </Button>
      </div>
    </form>
  )
}

