import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (has full access via service role key)
// Only use this in API routes / server components — never expose to browser
const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const isValidConfiguredUrl =
  typeof configuredUrl === "string" &&
  (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://"));
const supabaseUrl = isValidConfiguredUrl
  ? configuredUrl
  : "http://127.0.0.1:54321";
const supabaseServerKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "supabase-dev-fallback-key";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServerKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
