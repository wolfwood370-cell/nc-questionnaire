import { supabaseCoach } from "./supabase-coach";
import { normalizeNeuroAnswers } from "./neurotype-scoring";

// Livello dati dell'area coach: legge le submission da Supabase (RLS:
// solo gli utenti in public.admins vedono le righe) e le adatta al
// modello usato dalla UI — la stessa forma "si"/"no"/stringhe del
// questionario/prototipo, così flags e visualizzazione restano 1:1
// con l'handoff di design.

/** Campi del questionario in forma testuale ("si"/"no", enum, stringhe). */
export type CoachData = Record<string, string>;

export type CoachClient = {
  id: string;
  /** data invio, YYYY-MM-DD */
  submitted: string;
  name: string;
  /** 30 risposte neurotipo normalizzate (lettere A–E, "" se mancante) */
  neuro: string[];
  data: CoachData;
};

export type HealthFlag = { level: "high" | "med"; text: string };

// ---------- adapter DB → CoachData ----------

function toSiNo(v: unknown): string {
  if (v === true) return "si";
  if (v === false) return "no";
  return "";
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

type DbChild = Record<string, unknown> | Record<string, unknown>[] | null | undefined;

/** L'embedding PostgREST su FK 1:1 ritorna un oggetto; per robustezza accetta anche array. */
function childOf(v: DbChild): Record<string, unknown> {
  if (Array.isArray(v)) return v[0] ?? {};
  return v ?? {};
}

const CONSENT_KEYS = [
  "consent_health",
  "consent_disclaimer",
  "consent_nutrition",
  "consent_photos",
  "consent_share_medical",
  "consent_marketing",
] as const;

const PARQ_BOOL_KEYS = [
  "parq_heart",
  "parq_chest_pain",
  "parq_balance",
  "parq_other_chronic",
  "parq_meds",
  "parq_msk",
  "parq_supervised",
] as const;

const SUBMISSION_TEXT_KEYS = [
  "full_name",
  "sex",
  "pronoun",
  "birth_date",
  "phone",
  "email",
  // numerici nel DB: toStr li rende stringhe come nel resto del modello
  "height_cm",
  "weight_kg",
  "weight_history",
  "weight_target",
  "main_goal",
  "aesthetic_goal",
  "deadline_event",
  "movement_goal",
  "work_desc",
  "stress_level",
  "sleep_hours",
  "sleep_quality",
  "neat_steps",
  "water_liters",
  "alcohol_week",
  "smoking",
  "lifestyle_goal",
  "sports_history",
  "current_sport",
  "favorite_activity",
  "barbell_experience",
  "experience_level",
  "workload",
  "recovery_capacity",
  "max_days_week",
  "session_minutes",
  "equipment",
  "recent_maxes",
  "work_mode",
  "availability",
  "why_now",
  "past_coaching",
  "foreseen_obstacles",
  "success_definition",
  "support_network",
] as const;

const HEALTH_TEXT_KEYS = [
  "conditions_meds",
  "pain_where",
  "past_injuries",
  "pregnancy",
  "cycle_status",
  "cycle_since",
  "safety_allergy_detail",
] as const;

const NUTRITION_TEXT_KEYS = [
  "diet_assessment",
  "meals_desc",
  "diet_history",
  "foods_love_avoid",
  "intolerances",
  "who_cooks",
  "supplements",
] as const;

/** Adatta una riga di `submissions` (con figli embedded) al modello della UI coach. */
export function adaptDbRow(row: Record<string, unknown>): CoachClient {
  const health = childOf(row.health_screening as DbChild);
  const nutrition = childOf(row.nutrition as DbChild);
  const neuroRow = childOf(row.neurotype_answers as DbChild);

  const data: CoachData = {};
  for (const k of SUBMISSION_TEXT_KEYS) data[k] = toStr(row[k]);
  for (const k of CONSENT_KEYS) data[k] = toSiNo(row[k]);
  for (const k of PARQ_BOOL_KEYS) data[k] = toSiNo(health[k]);
  for (const k of HEALTH_TEXT_KEYS) data[k] = toStr(health[k]);
  data.pain_now = toSiNo(health.pain_now);
  data.safety_allergy = toSiNo(health.safety_allergy);
  for (const k of NUTRITION_TEXT_KEYS) data[k] = toStr(nutrition[k]);

  const name = data.full_name || "Senza nome";
  return {
    id: toStr(row.id) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    submitted: toStr(row.created_at).slice(0, 10),
    name,
    neuro: normalizeNeuroAnswers(neuroRow),
    data,
  };
}

/**
 * Carica tutte le submission visibili al coach loggato (RLS filtra).
 * Ritorna [] se il DB è vuoto; lancia in caso di errore di rete/permessi.
 */
export async function fetchCoachClients(): Promise<CoachClient[]> {
  const { data, error } = await supabaseCoach
    .from("submissions")
    .select("*, health_screening(*), nutrition(*), neurotype_answers(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => adaptDbRow(row as Record<string, unknown>));
}

// ---------- bandierine di salute (port 1:1 dall'handoff) ----------

export const PARQ_FLAG_LABELS: Record<string, [string, "high" | "med"]> = {
  parq_heart: ["Condizione cardiaca o pressione alta", "high"],
  parq_chest_pain: ["Dolore al torace (riposo/attività)", "high"],
  parq_balance: ["Perdita di equilibrio o di conoscenza (12 mesi)", "med"],
  parq_other_chronic: ["Altra condizione cronica diagnosticata", "med"],
  parq_meds: ["Farmaci prescritti per condizione cronica", "med"],
  parq_msk: ["Problemi osseo-articolari peggiorabili col movimento", "med"],
  parq_supervised: ["Attività fisica solo sotto supervisione medica", "high"],
};

export function healthFlags(d: CoachData): HealthFlag[] {
  const out: HealthFlag[] = [];
  for (const k of Object.keys(PARQ_FLAG_LABELS)) {
    if (d[k] === "si") {
      const [text, level] = PARQ_FLAG_LABELS[k];
      out.push({ level, text });
    }
  }
  if (d.pain_now === "si")
    out.push({ level: "med", text: "Dolore attuale" + (d.pain_where ? " — " + d.pain_where : "") });
  if (d.safety_allergy === "si")
    out.push({
      level: "high",
      text:
        "Allergia/reazione grave" +
        (d.safety_allergy_detail ? " — " + d.safety_allergy_detail : ""),
    });
  if (d.pregnancy === "si") out.push({ level: "med", text: "Gravidanza o post-partum" });
  if (d.cycle_status === "assente_3m") out.push({ level: "med", text: "Ciclo assente da +3 mesi" });
  const rank = { high: 0, med: 1 };
  return out.sort((a, b) => rank[a.level] - rank[b.level]);
}

export function parqYesCount(d: CoachData): number {
  return Object.keys(PARQ_FLAG_LABELS).filter((k) => d[k] === "si").length;
}

// ---------- helper di presentazione ----------

export function ageFrom(birthDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || "")) return null;
  const t = new Date();
  const b = new Date(birthDate);
  let a = t.getFullYear() - b.getFullYear();
  const mo = t.getMonth() - b.getMonth();
  if (mo < 0 || (mo === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

export function bmiOf(d: CoachData): string | null {
  const h = parseFloat(d.height_cm);
  const w = parseFloat(d.weight_kg);
  if (!(h > 0) || !(w > 0)) return null;
  return (w / Math.pow(h / 100, 2)).toFixed(1);
}

export function initialsOf(name: string): string {
  const p = (name || "").trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

export function fmtDate(s: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return s || "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

const MONTHS_IT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

export function relDate(s: string): string {
  // "YYYY-MM-DD": confronta date di CALENDARIO locali, non differenze in ms
  // (new Date("YYYY-MM-DD") è mezzanotte UTC: col round una submission di
  // oggi diventerebbe "Ieri" già dal primo pomeriggio italiano).
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
  if (!m) return "";
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (days <= 0) return "Oggi";
  if (days === 1) return "Ieri";
  if (days < 7) return `${days} giorni fa`;
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}

// ---------- evidenziazione parole di rischio (port 1:1) ----------

export const RISK_RE =
  /(ipertension\w*|pressione alta|pressione|cardiac\w*|aritmi\w*|betabloccant\w*|anafilass\w*|adrenalina|autoiniettore|supervision\w*|farmac\w*|dolore|menisc\w*|artroscopia|condropati\w*|infortun\w*|allerg\w*|cortison\w*|diabet\w*|tiroid\w*|gravidanza|reazion\w*)/i;

// ---------- stato letto / appunti (localStorage, come da handoff) ----------

const READ_KEY = "nc-coach-read-v1";
const NOTES_KEY = "nc-coach-notes-v1";

export function loadReadMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw) return JSON.parse(raw) ?? {};
  } catch {
    /* storage non disponibile */
  }
  return {};
}

export function saveReadMap(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(map));
  } catch {
    /* best-effort */
  }
}

export function loadNotesMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw) ?? {};
  } catch {
    /* storage non disponibile */
  }
  return {};
}

export function saveNotesMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(map));
  } catch {
    /* best-effort */
  }
}
