-- =============================================================
-- Migrazione 0007 - is_admin fuori dalla superficie API + lettura coach
--
-- 1) is_admin si sposta in uno schema `private` NON esposto da
--    PostgREST (che serve solo `public`): la funzione resta usabile
--    dalle policy RLS ma sparisce dalle RPC chiamabili via API.
-- 2) Le 8 policy admin vengono ricreate su private.is_admin() e la
--    vecchia public.is_admin() viene eliminata.
-- 3) Fix di un buco funzionale della 0001: le policy admin esistono
--    ma authenticated non aveva ALCUN privilegio sulle tabelle (revoke
--    all), quindi il coach non avrebbe potuto leggere in-app nemmeno
--    da admin. Si aggiungono i GRANT minimi; resta la RLS a garantire
--    che SOLO chi è in admins veda le righe (chi non lo è riceve
--    result-set vuoto / update a zero righe).
-- =============================================================

-- 1) schema privato
create schema if not exists private;
revoke all on schema private from public, anon;
-- le policy girano nel contesto del ruolo authenticated: serve USAGE
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- 2) policy ricreate sulla nuova funzione
drop policy "admin select submissions" on public.submissions;
drop policy "admin update submissions" on public.submissions;
drop policy "admin select health" on public.health_screening;
drop policy "admin select nutrition" on public.nutrition;
drop policy "admin select neurotype_answers" on public.neurotype_answers;
drop policy "admin select neurotype_result" on public.neurotype_result;
drop policy "admin insert neurotype_result" on public.neurotype_result;
drop policy "admin update neurotype_result" on public.neurotype_result;

create policy "admin select submissions" on public.submissions
  for select to authenticated using (private.is_admin());
create policy "admin update submissions" on public.submissions
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admin select health" on public.health_screening
  for select to authenticated using (private.is_admin());
create policy "admin select nutrition" on public.nutrition
  for select to authenticated using (private.is_admin());
create policy "admin select neurotype_answers" on public.neurotype_answers
  for select to authenticated using (private.is_admin());
create policy "admin select neurotype_result" on public.neurotype_result
  for select to authenticated using (private.is_admin());
create policy "admin insert neurotype_result" on public.neurotype_result
  for insert to authenticated with check (private.is_admin());
create policy "admin update neurotype_result" on public.neurotype_result
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

drop function public.is_admin();

-- 3) GRANT minimi per la lettura/gestione in-app del coach
--    (la RLS sopra decide CHI vede le righe; questi decidono COSA il
--    ruolo può tentare. admins e rate_limits restano senza grant.)
grant select on public.submissions,
                public.health_screening,
                public.nutrition,
                public.neurotype_answers,
                public.neurotype_result
  to authenticated;
grant update on public.submissions to authenticated;
grant insert, update on public.neurotype_result to authenticated;
