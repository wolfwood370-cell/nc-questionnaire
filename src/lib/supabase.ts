import { createClient } from "@supabase/supabase-js";

// URL del progetto e anon key sono valori PUBBLICI del client (l'anon key è
// progettata per stare nel browser: l'accesso ai dati è protetto da RLS e
// dalla Edge Function con Turnstile). Vengono cablati come default perché
// l'hosting (Lovable) non inietta le variabili VITE_* nel build pubblicato;
// l'env resta come override per lo sviluppo locale. La service_role key, che
// è segreta, non compare MAI qui: vive solo nei secret della Edge Function.
const SUPABASE_URL = "https://srrmauojpficdswmtjya.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycm1hdW9qcGZpY2Rzd210anlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTk5MDMsImV4cCI6MjA5ODU5NTkwM30.zPaBX6GAQIOycb7NJIsdyY3E49LCr6ajVYyeYRTGz94";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || SUPABASE_ANON_KEY;

// Client del FORM PUBBLICO: nessuna sessione, superficie minima (il form non
// fa login). L'area riservata /coach usa il client dedicato con sessione
// persistente in src/lib/supabase-coach.ts (storageKey separata).
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
