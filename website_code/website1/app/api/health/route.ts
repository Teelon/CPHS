import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()

  try {
    // Simple query to check if we can connect to Supabase
    const { data, error } = await supabase.from("_rpc").select("*").limit(1)

    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}

