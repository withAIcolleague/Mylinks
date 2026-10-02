import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvslunqtnsliayhotagz.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2c2x1bnF0bnNsaWF5aG90YWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjU2MzEsImV4cCI6MjA4NzEwMTYzMX0.HIeiMdxV3cvi_7NPk6vKdo-DTi_oKSJsedFFf41EV0w"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
