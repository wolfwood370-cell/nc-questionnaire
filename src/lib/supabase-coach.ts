import { createClient } from "@supabase/supabase-js";

// Client Supabase dell'AREA COACH: a differenza del client del form
// pubblico (src/lib/supabase.ts, senza sessione), qui serve una sessione
// persistente per il login del coach. storageKey dedicata per non
// confliggere con altre istanze GoTrue sulla stessa origin.
// URL e anon key sono valori pubblici (vedi src/lib/supabase.ts); la
// lettura dei dati è protetta da RLS: solo gli utenti in public.admins
// vedono le submission.
const SUPABASE_URL = "https://srrmauojpficdswmtjya.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycm1hdW9qcGZpY2Rzd210anlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTk5MDMsImV4cCI6MjA5ODU5NTkwM30.zPaBX6GAQIOycb7NJIsdyY3E49LCr6ajVYyeYRTGz94";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || SUPABASE_ANON_KEY;

export const supabaseCoach = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "nc-coach-auth",
  },
});
