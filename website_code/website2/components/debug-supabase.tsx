"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function DebugSupabase() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const [envVars, setEnvVars] = useState<{
    url: string | null
    key: string | null
  }>({
    url: null,
    key: null,
  })

  const testConnection = async () => {
    try {
      setStatus("loading")
      setMessage("Testing connection to Supabase...")

      // Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setEnvVars({
        url: url ? "Set" : "Missing",
        key: key ? "Set" : "Missing",
      })

      if (!url || !key) {
        throw new Error("Missing Supabase environment variables")
      }

      // Create client
      const supabase = createClient()

      // Test a simple query
      const { data, error } = await supabase.from("topic").select("topic_id, topic_name").limit(1)

      if (error) throw error

      setStatus("success")
      setMessage(`Connection successful! Retrieved data: ${JSON.stringify(data)}`)
    } catch (error) {
      setStatus("error")
      setMessage(`Connection failed: ${error instanceof Error ? error.message : String(error)}`)
      console.error("Supabase connection error:", error)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-medium">Supabase Connection Debugger</h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>NEXT_PUBLIC_SUPABASE_URL:</div>
        <div>{envVars.url || "Not checked"}</div>

        <div>NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
        <div>{envVars.key || "Not checked"}</div>
      </div>

      <Button onClick={testConnection} disabled={status === "loading"} variant="outline">
        {status === "loading" ? "Testing..." : "Test Supabase Connection"}
      </Button>

      {status === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700 text-sm">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

