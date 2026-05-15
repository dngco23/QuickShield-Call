import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hhwjfjsbsopcdfobjyez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhod2pmanNic29wY2Rmb2JqeWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDg2MzYsImV4cCI6MjA5NDM4NDYzNn0.Ve9eQPyN2MSMvyeJUkGBgyM-AkqKVS_KJoxOMNpBjqg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
