"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OpenAccessNotice() {
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Open Access System</AlertTitle>
      <AlertDescription>
        This is an open access system with no authentication. All actions are publicly accessible.
      </AlertDescription>
    </Alert>
  )
}

