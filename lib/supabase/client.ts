import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/lib/types/database";

export function createClient() {
  // Demo mode - use dummy values if Supabase is not configured
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
