/** Mappa chiave campo -> messaggio d'errore (italiano) per la validazione inline. */
export type FieldErrors = Record<string, string>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type Consents = {
  consent_health: boolean;
  consent_nutrition: boolean;
  consent_photos: boolean;
  consent_share_medical: boolean;
  consent_marketing: boolean;
  consent_disclaimer: boolean;
};

export function consentsErrors(c: Consents): FieldErrors {
  const e: FieldErrors = {};
  if (!c.consent_health) e.consent_health = "Consenso obbligatorio per proseguire.";
  if (!c.consent_disclaimer) e.consent_disclaimer = "Consenso obbligatorio per proseguire.";
  return e;
}

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

export function personalErrors(p: Personal): FieldErrors {
  const e: FieldErrors = {};
  if (!p.full_name.trim()) e.full_name = "Inserisci nome e cognome.";
  if (!p.sex) e.sex = "Seleziona il sesso biologico.";
  if (!DATE_RE.test(p.birth_date)) e.birth_date = "Inserisci una data di nascita valida.";
  if (!p.phone.trim()) e.phone = "Inserisci un numero di telefono.";
  if (!EMAIL_RE.test(p.email.trim())) e.email = "Inserisci un'email valida.";
  return e;
}

export type YesNoNa = "si" | "no" | "na";
export type CycleStatus =
  "regolare" | "irregolare" | "assente_3m" | "menopausa" | "contraccezione_ormonale";

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

export function goalsErrors(g: Goals): FieldErrors {
  const e: FieldErrors = {};
  if (!(parseFloat(g.height_cm) > 0)) e.height_cm = "Inserisci un'altezza valida in cm.";
  if (!(parseFloat(g.weight_kg) > 0)) e.weight_kg = "Inserisci un peso valido in kg.";
  if (!g.main_goal.trim()) e.main_goal = "Descrivi il tuo obiettivo principale.";
  return e;
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

export function lifestyleErrors(l: Lifestyle): FieldErrors {
  const e: FieldErrors = {};
  if (!l.stress_level) e.stress_level = "Seleziona il livello di stress.";
  if (!l.sleep_quality) e.sleep_quality = "Seleziona la qualità del sonno.";
  if (!l.neat_steps) e.neat_steps = "Seleziona una fascia.";
  return e;
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

export function trainingErrors(t: Training): FieldErrors {
  const e: FieldErrors = {};
  if (!t.experience_level) e.experience_level = "Seleziona il livello.";
  if (!t.workload) e.workload = "Seleziona il carico di lavoro.";
  if (!t.recovery_capacity) e.recovery_capacity = "Seleziona la capacità di recupero.";
  if (!t.max_days_week) e.max_days_week = "Seleziona i giorni.";
  if (!t.equipment.trim()) e.equipment = "Indica dove ti alleni e con quale attrezzatura.";
  return e;
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

export function nutritionErrors(n: Nutrition): FieldErrors {
  const e: FieldErrors = {};
  if (!n.diet_assessment) e.diet_assessment = "Seleziona una risposta.";
  return e;
}

export type WorkMode = "presenza" | "remoto" | "ibrido" | "app";

export type Logistics = {
  work_mode: WorkMode | "";
  availability: string;
  why_now: string;
  past_coaching: string;
  foreseen_obstacles: string;
  success_definition: string;
  support_network: string;
};

export const emptyLogistics: Logistics = {
  work_mode: "",
  availability: "",
  why_now: "",
  past_coaching: "",
  foreseen_obstacles: "",
  success_definition: "",
  support_network: "",
};

export function logisticsErrors(l: Logistics): FieldErrors {
  const e: FieldErrors = {};
  if (!l.work_mode) e.work_mode = "Seleziona come preferisci lavorare.";
  return e;
}

export const PARQ_KEYS = [
  "parq_heart",
  "parq_chest_pain",
  "parq_balance",
  "parq_other_chronic",
  "parq_meds",
  "parq_msk",
  "parq_supervised",
] as const;

export function anyParqYes(h: Health): boolean {
  return PARQ_KEYS.some((k) => h[k] === true);
}

export function healthErrors(h: Health, sex: Sex | ""): FieldErrors {
  const e: FieldErrors = {};
  for (const k of PARQ_KEYS) {
    if (h[k] === null) e[k] = "Rispondi Sì o No.";
  }
  if (h.pain_now === null) e.pain_now = "Rispondi Sì o No.";
  if (h.pain_now === true && !h.pain_where.trim()) e.pain_where = "Indica dove hai dolore.";
  if (!h.pregnancy) e.pregnancy = "Seleziona una risposta.";
  if (sex === "femmina") {
    if (!h.cycle_status) e.cycle_status = "Seleziona lo stato del ciclo.";
    if (
      (h.cycle_status === "irregolare" || h.cycle_status === "assente_3m") &&
      !h.cycle_since.trim()
    ) {
      e.cycle_since = "Indica da quando.";
    }
  }
  if (h.safety_allergy === null) e.safety_allergy = "Rispondi Sì o No.";
  if (h.safety_allergy === true && !h.safety_allergy_detail.trim()) {
    e.safety_allergy_detail = "Descrivi le allergie/reazioni.";
  }
  return e;
}

export const NEURO_LETTERS = ["A", "B", "C", "D", "E"] as const;
export const NEURO_TOTAL = 30;
export const NEURO_PER_PAGE = 6;
export const NEURO_PAGES = Math.ceil(NEURO_TOTAL / NEURO_PER_PAGE);

export function neuroKey(i: number): string {
  return `q${String(i).padStart(2, "0")}`;
}

export function neurotypeErrors(n: Neurotype): FieldErrors {
  const e: FieldErrors = {};
  for (let i = 1; i <= NEURO_TOTAL; i++) {
    const v = n[neuroKey(i)];
    if (!v || !(NEURO_LETTERS as readonly string[]).includes(v)) {
      e[neuroKey(i)] = "Scegli una risposta.";
    }
  }
  return e;
}

export function neurotypePageErrors(n: Neurotype, page: number): FieldErrors {
  const e: FieldErrors = {};
  const start = page * NEURO_PER_PAGE;
  for (let i = start + 1; i <= Math.min(start + NEURO_PER_PAGE, NEURO_TOTAL); i++) {
    const v = n[neuroKey(i)];
    if (!v || !(NEURO_LETTERS as readonly string[]).includes(v)) {
      e[neuroKey(i)] = "Scegli una risposta.";
    }
  }
  return e;
}

/** Etichette leggibili per i valori enum (riepilogo pre-invio). */
export const ENUM_LABELS: Record<string, Record<string, string>> = {
  sex: { maschio: "Maschio", femmina: "Femmina" },
  pronoun: { tu_lei: "Tu/Lei", tu_lui: "Tu/Lui", voi_loro: "Voi/Loro" },
  pregnancy: { si: "Sì", no: "No", na: "Non applicabile" },
  cycle_status: {
    regolare: "Regolare",
    irregolare: "Irregolare",
    assente_3m: "Assente da +3 mesi",
    menopausa: "Menopausa",
    contraccezione_ormonale: "Contraccezione ormonale",
  },
  stress_level: {
    molto_alto: "Molto alto",
    alto: "Alto",
    medio: "Medio",
    basso: "Basso",
    molto_basso: "Molto basso",
  },
  sleep_quality: {
    ottima: "Ottima",
    buona: "Buona",
    media: "Media",
    scarsa: "Scarsa",
    pessima: "Pessima",
  },
  neat_steps: {
    "<5000": "< 5.000 passi",
    "5000-7500": "5.000–7.500",
    "7500-10000": "7.500–10.000",
    "10000-12500": "10.000–12.500",
    ">12500": "> 12.500",
  },
  experience_level: {
    novizio: "Novizio",
    principiante: "Principiante",
    intermedio: "Intermedio",
    avanzato: "Avanzato",
    master: "Master",
  },
  workload: {
    molto_basso: "Molto basso",
    basso: "Basso",
    medio: "Medio",
    alto: "Alto",
    molto_alto: "Molto alto",
  },
  recovery_capacity: {
    ottima: "Ottima",
    buona: "Buona",
    media: "Media",
    scarsa: "Scarsa",
    pessima: "Pessima",
  },
  diet_assessment: {
    iper: "Ipercalorica",
    iso: "Isocalorica",
    ipo: "Ipocalorica",
    non_so: "Non saprei",
  },
  work_mode: {
    presenza: "In presenza",
    remoto: "Da remoto",
    ibrido: "Ibrido",
    app: "Solo tramite app",
  },
};

/**
 * Normalizza il blocco health per il payload: i campi condizionali ("se sì",
 * ciclo solo se femmina) vengono svuotati quando il ramo che li mostra non è
 * attivo, così non restano valori orfani se l'utente cambia risposta dopo
 * averli compilati.
 */
export function buildHealthPayload(h: Health, sex: Sex | ""): Record<string, unknown> {
  const isFemale = sex === "femmina";
  const cycleNeedsSince =
    isFemale && (h.cycle_status === "irregolare" || h.cycle_status === "assente_3m");
  return {
    parq_heart: h.parq_heart,
    parq_chest_pain: h.parq_chest_pain,
    parq_balance: h.parq_balance,
    parq_other_chronic: h.parq_other_chronic,
    parq_meds: h.parq_meds,
    parq_msk: h.parq_msk,
    parq_supervised: h.parq_supervised,
    conditions_meds: anyParqYes(h) ? h.conditions_meds : "",
    pain_now: h.pain_now,
    pain_where: h.pain_now === true ? h.pain_where : "",
    past_injuries: h.past_injuries,
    pregnancy: h.pregnancy,
    cycle_status: isFemale ? h.cycle_status : "",
    cycle_since: cycleNeedsSince ? h.cycle_since : "",
    safety_allergy: h.safety_allergy,
    safety_allergy_detail: h.safety_allergy === true ? h.safety_allergy_detail : "",
  };
}

export type Submission = Record<string, unknown>;
export type Neurotype = Record<string, string>;

export type IntakePayload = {
  submission: Record<string, unknown>;
  health: Record<string, unknown>;
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
