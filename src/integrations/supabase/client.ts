// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sejevxbjafoajtgrrnfh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlamV2eGJqYWZvYWp0Z3JybmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzQ4MDksImV4cCI6MjA2NTE1MDgwOX0.jhfHE-uWdspR9e0BpAnRMpEFk88RZqpXo3Tqn4lGvmY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);