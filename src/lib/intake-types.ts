export type Consents = {
  consent_health: boolean;
  consent_nutrition: boolean;
  consent_photos: boolean;
  consent_share_medical: boolean;
  consent_marketing: boolean;
  consent_disclaimer: boolean;
};

export type Sex = "maschio" | "femmina";
export type Pronoun = "tu_lei" | "tu_lui" | "voi_loro";

export type Personal = {
  full_name: string;
  sex: Sex | "";
  pronoun: Pronoun | "";
  birth_date: string;
  phone: string;
  email: string;
};

export const emptyPersonal: Personal = {
  full_name: "",
  sex: "",
  pronoun: "",
  birth_date: "",
  phone: "",
  email: "",
};

export type YesNoNa = "si" | "no" | "na";
export type CycleStatus =
  | "regolare"
  | "irregolare"
  | "assente_3m"
  | "menopausa"
  | "contraccezione_ormonale";

export type Health = {
  parq_heart: boolean | null;
  parq_chest_pain: boolean | null;
  parq_balance: boolean | null;
  parq_other_chronic: boolean | null;
  parq_meds: boolean | null;
  parq_msk: boolean | null;
  parq_supervised: boolean | null;
  conditions_meds: string;
  pain_now: boolean | null;
  pain_where: string;
  past_injuries: string;
  pregnancy: YesNoNa | "";
  cycle_status: CycleStatus | "";
  cycle_since: string;
  safety_allergy: boolean | null;
  safety_allergy_detail: string;
};

export const emptyHealth: Health = {
  parq_heart: null,
  parq_chest_pain: null,
  parq_balance: null,
  parq_other_chronic: null,
  parq_meds: null,
  parq_msk: null,
  parq_supervised: null,
  conditions_meds: "",
  pain_now: null,
  pain_where: "",
  past_injuries: "",
  pregnancy: "",
  cycle_status: "",
  cycle_since: "",
  safety_allergy: null,
  safety_allergy_detail: "",
};

export type Goals = {
  height_cm: string;
  weight_kg: string;
  weight_history: string;
  weight_target: string;
  main_goal: string;
  aesthetic_goal: string;
  deadline_event: string;
  movement_goal: string;
};

export const emptyGoals: Goals = {
  height_cm: "",
  weight_kg: "",
  weight_history: "",
  weight_target: "",
  main_goal: "",
  aesthetic_goal: "",
  deadline_event: "",
  movement_goal: "",
};

export function isGoalsValid(g: Goals): { ok: boolean; message: string } {
  const h = parseFloat(g.height_cm);
  const w = parseFloat(g.weight_kg);
  if (Number.isNaN(h) || h <= 0) {
    return { ok: false, message: "Inserisci un'altezza valida in cm." };
  }
  if (Number.isNaN(w) || w <= 0) {
    return { ok: false, message: "Inserisci un peso valido in kg." };
  }
  if (!g.main_goal.trim()) {
    return { ok: false, message: "Descrivi il tuo obiettivo principale." };
  }
  return { ok: true, message: "" };
}

export type StressLevel = "molto_alto" | "alto" | "medio" | "basso" | "molto_basso";
export type SleepQuality = "ottima" | "buona" | "media" | "scarsa" | "pessima";
export type NeatSteps = "<5000" | "5000-7500" | "7500-10000" | "10000-12500" | ">12500";

export type Lifestyle = {
  work_desc: string;
  stress_level: StressLevel | "";
  sleep_hours: string;
  sleep_quality: SleepQuality | "";
  neat_steps: NeatSteps | "";
  water_liters: string;
  alcohol_week: string;
  smoking: string;
  lifestyle_goal: string;
};

export const emptyLifestyle: Lifestyle = {
  work_desc: "",
  stress_level: "",
  sleep_hours: "",
  sleep_quality: "",
  neat_steps: "",
  water_liters: "",
  alcohol_week: "",
  smoking: "",
  lifestyle_goal: "",
};

export function isLifestyleValid(l: Lifestyle): { ok: boolean; message: string } {
  if (!l.stress_level) {
    return { ok: false, message: "Seleziona il tuo livello di stress quotidiano." };
  }
  if (!l.sleep_quality) {
    return { ok: false, message: "Seleziona la qualità del tuo sonno." };
  }
  if (!l.neat_steps) {
    return { ok: false, message: "Seleziona la tua attività quotidiana non sportiva." };
  }
  return { ok: true, message: "" };
}

export type Submission = Record<string, unknown>;
export type Nutrition = Record<string, unknown>;
export type Neurotype = Record<string, string>;

export type IntakePayload = {
  submission: Submission & { consents: Consents };
  health: Record<string, unknown>;
  goals: Record<string, unknown>;
  nutrition: Nutrition;
  neurotype: Neurotype;
};

export const emptyConsents: Consents = {
  consent_health: false,
  consent_nutrition: false,
  consent_photos: false,
  consent_share_medical: false,
  consent_marketing: false,
  consent_disclaimer: false,
};
