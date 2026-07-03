-- =============================================================
-- Migrazione 0004 - errori di submit_intake sanificati (art.9 GDPR)
-- Problema: senza handler, una violazione di CHECK/NOT NULL o un cast
-- fallito dentro submit_intake produce un errore Postgres il cui
-- DETAIL ("Failing row contains (...)") o messaggio contiene i VALORI
-- della riga: nome, email, telefono e dati salute finirebbero nei log
-- del database. La Edge Function valida il payload a monte, ma questa
-- è la difesa in profondità: il blocco EXCEPTION intercetta qualunque
-- errore e rilancia un messaggio fisso senza dati; l'errore originale,
-- una volta catturato in plpgsql, non viene scritto nel log del server.
-- Corpo identico alla 0001, cambia solo l'handler finale.
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
exception
  when others then
    -- NON rilanciare SQLERRM/DETAIL: possono contenere i valori della
    -- riga (dati salute). Messaggio fisso, senza alcun dato.
    raise exception 'submit_intake: payload non valido';
end;
$$;
