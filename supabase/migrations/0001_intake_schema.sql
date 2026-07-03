-- =============================================================
-- NC Questionario - Intake schema + RLS
-- Modello: LINK PUBBLICO ANONIMO (submit via funzione, lettura solo coach)
-- Progetto Supabase: nc-questionario (ref srrmauojpficdswmtjya, eu-west-1)
-- Migrazione 0001 - schema, RLS deny-by-default, RPC di submit, lettura coach
-- Include: neurotipo (30 risposte A-E) + tabella risultato scoring (coach-side)
-- =============================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- =============================================================
-- 1. TABELLE
-- =============================================================

-- 1.1 submissions - testata: consensi (Sez.0) + anagrafica (Sez.1) + intake generale (Sez.3/4/5/7)
create table public.submissions (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  status                text not null default 'new' check (status in ('new','reviewed','archived')),

  -- Sez.0 CONSENSI (0.1 e 0.6 obbligatori)
  consent_health        boolean not null,                 -- 0.1 necessario per iniziare
  consent_disclaimer    boolean not null,                 -- 0.6 presa d'atto (non medico)
  consent_nutrition     boolean not null default false,   -- 0.2 -> interruttore Sez.6
  consent_photos        boolean not null default false,   -- 0.3
  consent_share_medical boolean not null default false,   -- 0.4
  consent_marketing     boolean not null default false,   -- 0.5
  consent_version       text    not null default 'v2.1',
  consented_at          timestamptz not null default now(),

  -- Sez.1 ANAGRAFICA E CONTATTI
  full_name             text not null,
  sex                   text not null check (sex in ('maschio','femmina')),
  pronoun               text check (pronoun in ('tu_lei','tu_lui','voi_loro')),
  birth_date            date not null,
  phone                 text not null,
  email                 text not null,

  -- Sez.3 CORPO E OBIETTIVO
  height_cm             numeric,
  weight_kg             numeric,
  weight_history        text,
  weight_target         text,
  main_goal             text,
  aesthetic_goal        text,
  deadline_event        text,
  movement_goal         text,

  -- Sez.4 STILE DI VITA
  work_desc             text,
  stress_level          text check (stress_level in ('molto_alto','alto','medio','basso','molto_basso')),
  sleep_hours           text,
  sleep_quality         text check (sleep_quality in ('ottima','buona','media','scarsa','pessima')),
  neat_steps            text check (neat_steps in ('<5000','5000-7500','7500-10000','10000-12500','>12500')),
  water_liters          text,
  alcohol_week          text,
  smoking               text,
  lifestyle_goal        text,

  -- Sez.5 ALLENAMENTO
  sports_history        text,
  current_sport         text,
  favorite_activity     text,
  barbell_experience    text,
  experience_level      text check (experience_level in ('novizio','principiante','intermedio','avanzato','master')),
  workload              text check (workload in ('molto_basso','basso','medio','alto','molto_alto')),
  recovery_capacity     text check (recovery_capacity in ('ottima','buona','media','scarsa','pessima')),
  max_days_week         text check (max_days_week in ('2','3','4','5','6')),
  session_minutes       text,
  equipment             text not null,                    -- 5.10 obbligatorio
  recent_maxes          text,

  -- Sez.7 GESTIONE E LOGISTICA (fase7)
  work_mode             text check (work_mode in ('presenza','remoto','ibrido','app')),
  availability          text,
  why_now               text,
  past_coaching         text,
  foreseen_obstacles    text,
  success_definition    text,
  support_network       text,

  -- i due consensi obbligatori devono essere veri
  constraint consents_required check (consent_health = true and consent_disclaimer = true)
);

-- 1.2 health_screening - Sez.2 PAR-Q+ e sicurezza (ART.9, tabella isolata)
create table public.health_screening (
  submission_id         uuid primary key references public.submissions(id) on delete cascade,
  parq_heart            boolean not null,   -- 2.1
  parq_chest_pain       boolean not null,   -- 2.2
  parq_balance          boolean not null,   -- 2.3
  parq_other_chronic    boolean not null,   -- 2.4
  parq_meds             boolean not null,   -- 2.5
  parq_msk              boolean not null,   -- 2.6
  parq_supervised       boolean not null,   -- 2.7
  conditions_meds       text,               -- 2.8
  pain_now              boolean,            -- 2.9
  pain_where            text,               -- 2.9b
  past_injuries         text,               -- 2.10
  pregnancy             text check (pregnancy in ('si','no','na')),        -- 2.11
  cycle_status          text check (cycle_status in ('regolare','irregolare','assente_3m','menopausa','contraccezione_ormonale')), -- 2.12
  cycle_since           text,               -- 2.12b
  safety_allergy        boolean,            -- 2.13
  safety_allergy_detail text                -- 2.13b
);

-- 1.3 nutrition - Sez.6 (riga creata SOLO se consent_nutrition = true)
create table public.nutrition (
  submission_id         uuid primary key references public.submissions(id) on delete cascade,
  diet_assessment       text check (diet_assessment in ('iper','iso','ipo','non_so')),
  meals_desc            text,
  diet_history          text,
  foods_love_avoid      text,
  intolerances          text,
  who_cooks             text,
  supplements           text
);

-- 1.4 neurotype_answers - Sez.8, 30 risposte A-E, PER POSIZIONE
--     q01-06 = Tipo 1A · q07-12 = 1B · q13-18 = 2A · q19-24 = 2B · q25-30 = Tipo 3
--     (abbinamento per ordine, non per testo; scala A-E)
create table public.neurotype_answers (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  q01 text check (q01 in ('A','B','C','D','E')),  q02 text check (q02 in ('A','B','C','D','E')),
  q03 text check (q03 in ('A','B','C','D','E')),  q04 text check (q04 in ('A','B','C','D','E')),
  q05 text check (q05 in ('A','B','C','D','E')),  q06 text check (q06 in ('A','B','C','D','E')),
  q07 text check (q07 in ('A','B','C','D','E')),  q08 text check (q08 in ('A','B','C','D','E')),
  q09 text check (q09 in ('A','B','C','D','E')),  q10 text check (q10 in ('A','B','C','D','E')),
  q11 text check (q11 in ('A','B','C','D','E')),  q12 text check (q12 in ('A','B','C','D','E')),
  q13 text check (q13 in ('A','B','C','D','E')),  q14 text check (q14 in ('A','B','C','D','E')),
  q15 text check (q15 in ('A','B','C','D','E')),  q16 text check (q16 in ('A','B','C','D','E')),
  q17 text check (q17 in ('A','B','C','D','E')),  q18 text check (q18 in ('A','B','C','D','E')),
  q19 text check (q19 in ('A','B','C','D','E')),  q20 text check (q20 in ('A','B','C','D','E')),
  q21 text check (q21 in ('A','B','C','D','E')),  q22 text check (q22 in ('A','B','C','D','E')),
  q23 text check (q23 in ('A','B','C','D','E')),  q24 text check (q24 in ('A','B','C','D','E')),
  q25 text check (q25 in ('A','B','C','D','E')),  q26 text check (q26 in ('A','B','C','D','E')),
  q27 text check (q27 in ('A','B','C','D','E')),  q28 text check (q28 in ('A','B','C','D','E')),
  q29 text check (q29 in ('A','B','C','D','E')),  q30 text check (q30 in ('A','B','C','D','E'))
);

-- 1.5 neurotype_result - punteggi + tipo (COMPILATO DAL COACH / scoring-neurotipo.py, NON dal form)
create table public.neurotype_result (
  submission_id  uuid primary key references public.submissions(id) on delete cascade,
  score_1a       integer,
  score_1b       integer,
  score_2a       integer,
  score_2b       integer,
  score_3        integer,
  primary_type   text check (primary_type in ('1A','1B','2A','2B','3')),
  secondary_type text check (secondary_type in ('1A','1B','2A','2B','3')),
  margin         integer,
  scored_at      timestamptz,
  notes          text
);

-- 1.6 admins - chi e' coach (per la lettura). Gestita solo via dashboard/service_role.
create table public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

-- =============================================================
-- 2. RLS: deny-by-default su TUTTE le tabelle
--    (RLS ON + nessuna policy per anon = anonimo bloccato del tutto)
-- =============================================================
alter table public.submissions        enable row level security;
alter table public.health_screening   enable row level security;
alter table public.nutrition           enable row level security;
alter table public.neurotype_answers   enable row level security;
alter table public.neurotype_result    enable row level security;
alter table public.admins              enable row level security;

-- niente GRANT diretti ad anon/authenticated sulle tabelle:
revoke all on public.submissions        from anon, authenticated;
revoke all on public.health_screening   from anon, authenticated;
revoke all on public.nutrition           from anon, authenticated;
revoke all on public.neurotype_answers   from anon, authenticated;
revoke all on public.neurotype_result    from anon, authenticated;
revoke all on public.admins              from anon, authenticated;

-- =============================================================
-- 3. COACH / ADMIN
-- =============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- il coach (authenticated + presente in admins) LEGGE tutto e aggiorna lo stato
create policy "admin select submissions" on public.submissions
  for select to authenticated using (public.is_admin());
create policy "admin update submissions" on public.submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin select health" on public.health_screening
  for select to authenticated using (public.is_admin());
create policy "admin select nutrition" on public.nutrition
  for select to authenticated using (public.is_admin());
create policy "admin select neurotype_answers" on public.neurotype_answers
  for select to authenticated using (public.is_admin());
-- neurotype_result: il coach lo legge, lo crea e lo aggiorna (scoring)
create policy "admin select neurotype_result" on public.neurotype_result
  for select to authenticated using (public.is_admin());
create policy "admin insert neurotype_result" on public.neurotype_result
  for insert to authenticated with check (public.is_admin());
create policy "admin update neurotype_result" on public.neurotype_result
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============================================================
-- 4. RPC DI SUBMIT - unico canale di scrittura per l'anonimo
--    payload = { "submission": {...}, "health": {...}, "nutrition": {...}, "neurotype": {q01..q30} }
-- =============================================================
create or replace function public.submit_intake(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s  jsonb := payload->'submission';
  h  jsonb := payload->'health';
  n  jsonb := payload->'nutrition';
  nt jsonb := payload->'neurotype';
  new_id uuid;
begin
  -- validazione: i consensi obbligatori devono essere veri
  if coalesce((s->>'consent_health')::boolean,false) is not true
     or coalesce((s->>'consent_disclaimer')::boolean,false) is not true then
    raise exception 'Consensi obbligatori (salute + presa d''atto) mancanti';
  end if;

  insert into public.submissions (
    consent_health, consent_disclaimer, consent_nutrition, consent_photos, consent_share_medical, consent_marketing, consent_version,
    full_name, sex, pronoun, birth_date, phone, email,
    height_cm, weight_kg, weight_history, weight_target, main_goal, aesthetic_goal, deadline_event, movement_goal,
    work_desc, stress_level, sleep_hours, sleep_quality, neat_steps, water_liters, alcohol_week, smoking, lifestyle_goal,
    sports_history, current_sport, favorite_activity, barbell_experience, experience_level, workload, recovery_capacity, max_days_week, session_minutes, equipment, recent_maxes,
    work_mode, availability, why_now, past_coaching, foreseen_obstacles, success_definition, support_network
  ) values (
    (s->>'consent_health')::boolean, (s->>'consent_disclaimer')::boolean,
    coalesce((s->>'consent_nutrition')::boolean,false), coalesce((s->>'consent_photos')::boolean,false),
    coalesce((s->>'consent_share_medical')::boolean,false), coalesce((s->>'consent_marketing')::boolean,false),
    coalesce(nullif(s->>'consent_version',''),'v2.1'),
    s->>'full_name', nullif(s->>'sex',''), nullif(s->>'pronoun',''), (s->>'birth_date')::date, s->>'phone', s->>'email',
    nullif(s->>'height_cm','')::numeric, nullif(s->>'weight_kg','')::numeric, s->>'weight_history', s->>'weight_target', s->>'main_goal', s->>'aesthetic_goal', s->>'deadline_event', s->>'movement_goal',
    s->>'work_desc', nullif(s->>'stress_level',''), s->>'sleep_hours', nullif(s->>'sleep_quality',''), nullif(s->>'neat_steps',''), s->>'water_liters', s->>'alcohol_week', s->>'smoking', s->>'lifestyle_goal',
    s->>'sports_history', s->>'current_sport', s->>'favorite_activity', s->>'barbell_experience', nullif(s->>'experience_level',''), nullif(s->>'workload',''), nullif(s->>'recovery_capacity',''), nullif(s->>'max_days_week',''), s->>'session_minutes', s->>'equipment', s->>'recent_maxes',
    nullif(s->>'work_mode',''), s->>'availability', s->>'why_now', s->>'past_coaching', s->>'foreseen_obstacles', s->>'success_definition', s->>'support_network'
  ) returning id into new_id;

  -- health_screening (obbligatorio)
  insert into public.health_screening (
    submission_id, parq_heart, parq_chest_pain, parq_balance, parq_other_chronic, parq_meds, parq_msk, parq_supervised,
    conditions_meds, pain_now, pain_where, past_injuries, pregnancy, cycle_status, cycle_since, safety_allergy, safety_allergy_detail
  ) values (
    new_id,
    (h->>'parq_heart')::boolean,(h->>'parq_chest_pain')::boolean,(h->>'parq_balance')::boolean,(h->>'parq_other_chronic')::boolean,(h->>'parq_meds')::boolean,(h->>'parq_msk')::boolean,(h->>'parq_supervised')::boolean,
    h->>'conditions_meds', nullif(h->>'pain_now','')::boolean, h->>'pain_where', h->>'past_injuries',
    nullif(h->>'pregnancy',''), nullif(h->>'cycle_status',''), h->>'cycle_since', nullif(h->>'safety_allergy','')::boolean, h->>'safety_allergy_detail'
  );

  -- nutrition (solo se consenso 0.2 = true e blocco presente)
  if coalesce((s->>'consent_nutrition')::boolean,false) is true and n is not null then
    insert into public.nutrition (submission_id, diet_assessment, meals_desc, diet_history, foods_love_avoid, intolerances, who_cooks, supplements)
    values (new_id, nullif(n->>'diet_assessment',''), n->>'meals_desc', n->>'diet_history', n->>'foods_love_avoid', n->>'intolerances', n->>'who_cooks', n->>'supplements');
  end if;

  -- neurotype_answers (se il blocco e' presente)
  if nt is not null then
    insert into public.neurotype_answers (
      submission_id, q01,q02,q03,q04,q05,q06,q07,q08,q09,q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,q21,q22,q23,q24,q25,q26,q27,q28,q29,q30
    ) values (
      new_id,
      nullif(nt->>'q01',''),nullif(nt->>'q02',''),nullif(nt->>'q03',''),nullif(nt->>'q04',''),nullif(nt->>'q05',''),nullif(nt->>'q06',''),
      nullif(nt->>'q07',''),nullif(nt->>'q08',''),nullif(nt->>'q09',''),nullif(nt->>'q10',''),nullif(nt->>'q11',''),nullif(nt->>'q12',''),
      nullif(nt->>'q13',''),nullif(nt->>'q14',''),nullif(nt->>'q15',''),nullif(nt->>'q16',''),nullif(nt->>'q17',''),nullif(nt->>'q18',''),
      nullif(nt->>'q19',''),nullif(nt->>'q20',''),nullif(nt->>'q21',''),nullif(nt->>'q22',''),nullif(nt->>'q23',''),nullif(nt->>'q24',''),
      nullif(nt->>'q25',''),nullif(nt->>'q26',''),nullif(nt->>'q27',''),nullif(nt->>'q28',''),nullif(nt->>'q29',''),nullif(nt->>'q30','')
    );
  end if;

  return new_id;
end;
$$;

-- permessi: l'anonimo puo' SOLO eseguire la funzione, non toccare le tabelle
revoke all on function public.submit_intake(jsonb) from public;
grant execute on function public.submit_intake(jsonb) to anon, authenticated;

-- =============================================================
-- 5. NOTE POST-MIGRAZIONE (fuori SQL)
--   - Aggiungere il proprio utente ad admins per leggere in-app:
--       insert into public.admins(user_id) values ('<auth-user-id-di-Nicolo>');
--     (per ora: lettura via dashboard Supabase / Table Editor)
--   - Scoring neurotipo = scoring-neurotipo.py (coach-side) -> scrive neurotype_result
--   - CAPTCHA (Cloudflare Turnstile) + rate-limit sul submit pubblico = pre go-live
--   - Nessun dato reale finche' la RLS non e' testata (anon = 0 letture)
-- =============================================================
