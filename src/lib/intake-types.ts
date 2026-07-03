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

export type ExperienceLevel = "novizio" | "principiante" | "intermedio" | "avanzato" | "master";
export type Workload = "molto_basso" | "basso" | "medio" | "alto" | "molto_alto";
export type RecoveryCapacity = "ottima" | "buona" | "media" | "scarsa" | "pessima";
export type MaxDaysWeek = "2" | "3" | "4" | "5" | "6";

export type Training = {
  sports_history: string;
  current_sport: string;
  favorite_activity: string;
  barbell_experience: string;
  experience_level: ExperienceLevel | "";
  workload: Workload | "";
  recovery_capacity: RecoveryCapacity | "";
  max_days_week: MaxDaysWeek | "";
  session_minutes: string;
  equipment: string;
  recent_maxes: string;
};

export const emptyTraining: Training = {
  sports_history: "",
  current_sport: "",
  favorite_activity: "",
  barbell_experience: "",
  experience_level: "",
  workload: "",
  recovery_capacity: "",
  max_days_week: "",
  session_minutes: "",
  equipment: "",
  recent_maxes: "",
};

export function isTrainingValid(t: Training): { ok: boolean; message: string } {
  if (!t.experience_level) return { ok: false, message: "Seleziona il livello di esperienza coi pesi." };
  if (!t.workload) return { ok: false, message: "Seleziona il carico di lavoro abituale." };
  if (!t.recovery_capacity) return { ok: false, message: "Seleziona la tua capacità di recupero." };
  if (!t.max_days_week) return { ok: false, message: "Seleziona i giorni massimi di allenamento a settimana." };
  if (!t.equipment.trim()) return { ok: false, message: "Indica dove ti alleni e con quale attrezzatura." };
  return { ok: true, message: "" };
}

export type DietAssessment = "iper" | "iso" | "ipo" | "non_so";

export type Nutrition = {
  diet_assessment: DietAssessment | "";
  meals_desc: string;
  diet_history: string;
  foods_love_avoid: string;
  intolerances: string;
  who_cooks: string;
  supplements: string;
};

export const emptyNutrition: Nutrition = {
  diet_assessment: "",
  meals_desc: "",
  diet_history: "",
  foods_love_avoid: "",
  intolerances: "",
  who_cooks: "",
  supplements: "",
};

export function isNutritionValid(n: Nutrition): { ok: boolean; message: string } {
  if (!n.diet_assessment) return { ok: false, message: "Seleziona come valuteresti la tua dieta attuale." };
  return { ok: true, message: "" };
}

export type Submission = Record<string, unknown>;
export type Neurotype = Record<string, string>;

export type IntakePayload = {
  submission: Submission & { consents: Consents };
  health: Record<string, unknown>;
  goals: Record<string, unknown>;
  lifestyle: Record<string, unknown>;
  training: Record<string, unknown>;
  nutrition?: Record<string, unknown>;
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
