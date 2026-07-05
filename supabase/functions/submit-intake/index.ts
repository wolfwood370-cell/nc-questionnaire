// =============================================================
// Edge Function `submit-intake` — UNICO ingresso pubblico del form.
//
// Flusso: { payload, turnstileToken } dal client
//   1. CORS ristretto alle origin in ALLOWED_ORIGINS (secret/env)
//   2. rate-limit per IP fidato (contatori in Postgres, rpc rate_limit_hit)
//   3. cap dimensione body (413 oltre MAX_BODY_BYTES)
//   4. verifica Turnstile server-side (TURNSTILE_SECRET_KEY, fail-closed)
//   5. validazione whitelist del payload (enum/tipi dal contratto)
//   6. rpc submit_intake(payload) con service role -> ritorna { id }
//
// ATTENZIONE art.9 GDPR: il payload contiene dati salute. NON loggarlo
// mai. La validazione al punto 5 non è solo igiene: un valore fuori
// enum/tipo farebbe fallire un CHECK o un cast in Postgres, e il log
// del database registrerebbe i valori della riga (dati salute). Qui
// blocchiamo PRIMA che l'errore possa nascere lato DB.
// =============================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Il questionario reale sta ampiamente sotto questa soglia.
const MAX_BODY_BYTES = 200_000;

// Rate limit: massimo RATE_MAX richieste per IP in RATE_WINDOW_SECONDS.
// I contatori vivono in Postgres (rpc rate_limit_hit, migrazione 0005):
// il collaudo ha mostrato che ogni richiesta gira su un isolate nuovo,
// quindi qualsiasi stato in-memory non conterebbe mai oltre 1.
const RATE_MAX = 5;
const RATE_WINDOW_SECONDS = 600;

// IP fidato: cf-connecting-ip è impostato dall'edge Cloudflare e non è
// falsificabile dal client; x-forwarded-for può contenere valori dichiarati
// dal client a sinistra, quindi come fallback si usa l'ULTIMO hop (aggiunto
// dal proxy fidato), mai il primo.
function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown"
  );
}

// Privacy: nel DB finisce solo l'hash dell'IP, mai l'IP in chiaro.
async function ipBucket(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type SupabaseServerClient = ReturnType<typeof createClient>;

async function rateLimited(supabase: SupabaseServerClient, ip: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("rate_limit_hit", {
    bucket_key: await ipBucket(ip),
    max_hits: RATE_MAX,
    window_seconds: RATE_WINDOW_SECONDS,
  });
  if (error) {
    // fail-open SOLO sul rate-limit: il CAPTCHA resta la difesa primaria
    return false;
  }
  return data !== true;
}

function allowedOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? "http://localhost:8080")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string, reqHeaders?: string | null): Record<string, string> {
  const ok = allowedOrigins().includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // Riflette gli header richiesti dal preflight invece di una lista fissa:
    // supabase-js aggiunge nuovi header tra le versioni (es.
    // x-supabase-api-version) e una lista fissa fa fallire il preflight quando
    // il client si aggiorna. Non indebolisce la sicurezza: la difesa è
    // l'allowlist di Origin, non gli header ammessi.
    "Access-Control-Allow-Headers":
      reqHeaders || "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(status: number, body: unknown, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

// ------------------------------------------------------------------
// Validazione whitelist del payload (fonte: docs/intake-contract.md +
// CHECK di 0001_intake_schema.sql). Tutto ciò che non combacia viene
// rifiutato con 400 generico, senza mai riportare i valori.
// ------------------------------------------------------------------
const ENUMS: Record<string, readonly string[]> = {
  sex: ["maschio", "femmina"],
  pronoun: ["tu_lei", "tu_lui", "voi_loro"],
  stress_level: ["molto_alto", "alto", "medio", "basso", "molto_basso"],
  sleep_quality: ["ottima", "buona", "media", "scarsa", "pessima"],
  neat_steps: ["<5000", "5000-7500", "7500-10000", "10000-12500", ">12500"],
  experience_level: ["novizio", "principiante", "intermedio", "avanzato", "master"],
  workload: ["molto_basso", "basso", "medio", "alto", "molto_alto"],
  recovery_capacity: ["ottima", "buona", "media", "scarsa", "pessima"],
  max_days_week: ["2", "3", "4", "5", "6"],
  work_mode: ["presenza", "remoto", "ibrido", "app"],
  pregnancy: ["si", "no", "na"],
  cycle_status: ["regolare", "irregolare", "assente_3m", "menopausa", "contraccezione_ormonale"],
  diet_assessment: ["iper", "iso", "ipo", "non_so"],
};
const LETTERS = ["A", "B", "C", "D", "E"] as const;
const MAX_TEXT = 5_000;
const MAX_SHORT = 300;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Rec = Record<string, unknown>;

const isBool = (v: unknown) => typeof v === "boolean";
const isOptBool = (v: unknown) => v === undefined || v === null || typeof v === "boolean";
const isReqStr = (v: unknown, max: number) =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const isOptStr = (v: unknown, max: number) =>
  v === undefined || v === null || (typeof v === "string" && v.length <= max);
const isReqEnum = (v: unknown, key: string) => typeof v === "string" && ENUMS[key].includes(v);
const isOptEnum = (v: unknown, key: string) =>
  v === undefined || v === null || v === "" || (typeof v === "string" && ENUMS[key].includes(v));
const isOptNum = (v: unknown, max: number) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max);

function validSubmission(s: Rec): boolean {
  for (const k of [
    "consent_health",
    "consent_disclaimer",
    "consent_nutrition",
    "consent_photos",
    "consent_share_medical",
    "consent_marketing",
  ]) {
    if (!isBool(s[k])) return false;
  }
  if (s.consent_health !== true || s.consent_disclaimer !== true) return false;
  if (!isReqStr(s.full_name, MAX_SHORT)) return false;
  if (!isReqEnum(s.sex, "sex")) return false;
  if (!isOptEnum(s.pronoun, "pronoun")) return false;
  if (typeof s.birth_date !== "string" || !DATE_RE.test(s.birth_date)) return false;
  if (Number.isNaN(Date.parse(s.birth_date))) return false;
  if (!isReqStr(s.phone, MAX_SHORT)) return false;
  if (!isReqStr(s.email, MAX_SHORT)) return false;
  if (!isOptStr(s.tax_code, MAX_SHORT)) return false;
  if (!isOptStr(s.address, MAX_TEXT)) return false;
  if (!isReqStr(s.equipment, MAX_TEXT)) return false;
  if (!isOptNum(s.height_cm, 300) || !isOptNum(s.weight_kg, 500)) return false;
  for (const k of [
    "stress_level",
    "sleep_quality",
    "neat_steps",
    "experience_level",
    "workload",
    "recovery_capacity",
    "max_days_week",
    "work_mode",
  ]) {
    if (!isOptEnum(s[k], k)) return false;
  }
  for (const k of [
    "weight_history",
    "weight_target",
    "main_goal",
    "aesthetic_goal",
    "deadline_event",
    "movement_goal",
    "work_desc",
    "sleep_hours",
    "water_liters",
    "alcohol_week",
    "smoking",
    "lifestyle_goal",
    "sports_history",
    "current_sport",
    "favorite_activity",
    "barbell_experience",
    "session_minutes",
    "recent_maxes",
    "availability",
    "why_now",
    "past_coaching",
    "foreseen_obstacles",
    "success_definition",
    "support_network",
    "consent_version",
  ]) {
    if (!isOptStr(s[k], MAX_TEXT)) return false;
  }
  return true;
}

function validHealth(h: Rec): boolean {
  for (const k of [
    "parq_heart",
    "parq_chest_pain",
    "parq_balance",
    "parq_other_chronic",
    "parq_meds",
    "parq_msk",
    "parq_supervised",
  ]) {
    if (!isBool(h[k])) return false;
  }
  if (!isOptBool(h.pain_now) || !isOptBool(h.safety_allergy)) return false;
  if (!isOptEnum(h.pregnancy, "pregnancy")) return false;
  if (!isOptEnum(h.cycle_status, "cycle_status")) return false;
  for (const k of [
    "conditions_meds",
    "pain_where",
    "past_injuries",
    "cycle_since",
    "safety_allergy_detail",
  ]) {
    if (!isOptStr(h[k], MAX_TEXT)) return false;
  }
  return true;
}

function validNutrition(n: Rec): boolean {
  if (!isOptEnum(n.diet_assessment, "diet_assessment")) return false;
  for (const k of [
    "meals_desc",
    "diet_history",
    "foods_love_avoid",
    "intolerances",
    "who_cooks",
    "supplements",
  ]) {
    if (!isOptStr(n[k], MAX_TEXT)) return false;
  }
  return true;
}

function validNeurotype(nt: Rec): boolean {
  // Lo scoring è per posizione: il gateway pretende TUTTE e 30 le risposte.
  for (let i = 1; i <= 30; i++) {
    const v = nt[`q${String(i).padStart(2, "0")}`];
    if (typeof v !== "string" || !LETTERS.includes(v as (typeof LETTERS)[number])) return false;
  }
  return true;
}

function isPlainObject(v: unknown): v is Rec {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function validPayload(p: Rec): boolean {
  if (!isPlainObject(p.submission) || !validSubmission(p.submission)) return false;
  if (!isPlainObject(p.health) || !validHealth(p.health)) return false;
  if (!isPlainObject(p.neurotype) || !validNeurotype(p.neurotype)) return false;
  const wantsNutrition = p.submission.consent_nutrition === true;
  if (wantsNutrition) {
    if (p.nutrition !== undefined && (!isPlainObject(p.nutrition) || !validNutrition(p.nutrition)))
      return false;
  } else if (p.nutrition !== undefined) {
    // contratto: senza consenso il blocco nutrition va OMESSO
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin, req.headers.get("access-control-request-headers")),
    });
  }
  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" }, origin);
  }
  // Un browser manda sempre Origin: se presente e non in lista, rifiuta.
  // (Richieste non-browser senza Origin passano di qui: le ferma Turnstile.)
  if (origin && !allowedOrigins().includes(origin)) {
    return json(403, { error: "origin_not_allowed" }, origin);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const ip = clientIp(req);
  if (await rateLimited(supabase, ip)) {
    return json(429, { error: "rate_limited" }, origin);
  }

  // Cap dimensione: Content-Length se dichiarato, poi lunghezza reale
  // (con Transfer-Encoding: chunked l'header può mancare).
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) {
    return json(413, { error: "payload_too_large" }, origin);
  }
  let body: { payload?: unknown; turnstileToken?: unknown };
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { error: "payload_too_large" }, origin);
    }
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json" }, origin);
  }

  const token = body.turnstileToken;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return json(403, { error: "captcha_required" }, origin);
  }

  // Fail-closed: senza secret configurata non si accetta nulla.
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY non configurata: submit rifiutato (fail-closed)");
    return json(500, { error: "server_misconfigured" }, origin);
  }

  let verification: { success?: boolean };
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    verification = await res.json();
  } catch {
    // errore di rete verso Cloudflare: fail-closed, l'utente può riprovare
    return json(502, { error: "captcha_unavailable" }, origin);
  }
  if (verification.success !== true) {
    return json(403, { error: "captcha_failed" }, origin);
  }

  const payload = body.payload;
  if (!isPlainObject(payload) || !validPayload(payload)) {
    return json(400, { error: "invalid_payload" }, origin);
  }

  const { data, error } = await supabase.rpc("submit_intake", { payload });
  if (error) {
    // NON loggare né inoltrare error.message: le violazioni di vincolo
    // Postgres contengono i valori della riga (dati salute, art.9).
    return json(400, { error: "invalid_payload" }, origin);
  }

  return json(200, { id: data }, origin);
});
