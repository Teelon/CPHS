"use server"

import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Initialize Supabase client with server-side credentials
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
    },
  },
)

export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), "database-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabaseAdmin.rpc("exec_sql", { sql: statement + ";" })

      if (error) {
        console.error(`Error executing SQL statement: ${error.message}`)
        throw error
      }
    }

    console.log("Database initialization completed successfully")
    return { success: true }
  } catch (error: any) {
    console.error("Database initialization failed:", error)
    return { success: false, error: error.message }
  }
}

// Create a route handler to initialize the database
export async function POST() {
  const result = await initializeDatabase()
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
    status: result.success ? 200 : 500,
  })
}

