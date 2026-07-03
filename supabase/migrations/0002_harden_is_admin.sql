-- =============================================================
-- Migrazione 0002 - hardening
-- is_admin() non deve essere una RPC pubblica: serve SOLO alle policy RLS
-- (ruolo authenticated = coach). Rimuoviamo l'esecuzione ad anon/public.
-- =============================================================
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
