import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY non impostate. L'invio del questionario fallirà finché non vengono configurate.",
  );
}

export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon", {
  auth: { persistSession: false, autoRefreshToken: false },
});
