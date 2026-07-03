-- =============================================================
-- Migrazione 0005 - store condiviso per il rate-limit del gateway
-- Il collaudo ha mostrato che ogni richiesta alla Edge Function gira
-- su un isolate NUOVO (instanceId diverso a ogni hit): una mappa
-- in-memory non supera mai 1 e non frena nulla. I contatori vivono
-- quindi in Postgres: tabella bloccata (RLS senza policy, nessun
-- privilegio ad anon/authenticated) e accesso SOLO via la funzione
-- rate_limit_hit, concessa al solo service_role (la Edge Function).
-- Privacy: la chiave e' un HASH dell'IP (mai IP in chiaro) e le
-- finestre scadute vengono eliminate a ogni chiamata.
-- =============================================================
create table public.rate_limits (
  bucket text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 1
);

alter table public.rate_limits enable row level security;
-- nessuna policy: deny-by-default; service_role bypassa RLS
revoke all on table public.rate_limits from public, anon, authenticated;

create or replace function public.rate_limit_hit(
  bucket_key text,
  max_hits int,
  window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  -- pulizia opportunistica: elimina le finestre scadute
  delete from public.rate_limits
   where window_start < now() - make_interval(secs => window_seconds);

  insert into public.rate_limits as r (bucket, window_start, hits)
  values (bucket_key, now(), 1)
  on conflict (bucket) do update
    set hits = case
          when r.window_start < now() - make_interval(secs => window_seconds)
          then 1 else r.hits + 1 end,
        window_start = case
          when r.window_start < now() - make_interval(secs => window_seconds)
          then now() else r.window_start end
  returning hits <= max_hits into allowed;

  return allowed;
end;
$$;

revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;
