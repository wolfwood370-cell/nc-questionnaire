-- =============================================================
-- Migrazione 0003 - submit_intake eseguibile dal ruolo server
-- La Edge Function `submit-intake` (gateway pubblico con Turnstile)
-- chiama la RPC con la service key. La 0001 aveva revocato EXECUTE
-- a public e concesso solo anon/authenticated: service_role ne era
-- rimasto fuori. Questo grant prepara la revoca ad anon (Fase 3),
-- dopo la quale l'UNICO canale di scrittura sarà la Edge Function.
-- =============================================================
grant execute on function public.submit_intake(jsonb) to service_role;
