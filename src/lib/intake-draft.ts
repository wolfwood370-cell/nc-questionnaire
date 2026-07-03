import {
  emptyConsents,
  emptyGoals,
  emptyHealth,
  emptyLifestyle,
  emptyLogistics,
  emptyNutrition,
  emptyPersonal,
  emptyTraining,
  type Consents,
  type Goals,
  type Health,
  type Lifestyle,
  type Logistics,
  type Neurotype,
  type Nutrition,
  type Personal,
  type Training,
} from "./intake-types";

// Bozza salvata SOLO su localStorage del dispositivo dell'utente (mai
// inviata a terzi): permette di riprendere una compilazione interrotta.
// Viene eliminata all'invio riuscito e con "Ricomincia da capo".
// Il token Turnstile NON viene mai salvato (è monouso e a scadenza).
const KEY = "nc-intake-v1";

export type IntakeDraft = {
  consents: Consents;
  personal: Personal;
  health: Health;
  goals: Goals;
  lifestyle: Lifestyle;
  training: Training;
  nutrition: Nutrition;
  logistics: Logistics;
  neurotype: Neurotype;
  step: number;
  neuroPage: number;
  screen: "form" | "review";
};

export function loadDraft(): IntakeDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<IntakeDraft> | null;
    if (!s || typeof s !== "object") return null;
    // merge sui default: robusto rispetto a bozze di versioni precedenti
    const draft: IntakeDraft = {
      consents: { ...emptyConsents, ...(s.consents ?? {}) },
      personal: { ...emptyPersonal, ...(s.personal ?? {}) },
      health: { ...emptyHealth, ...(s.health ?? {}) },
      goals: { ...emptyGoals, ...(s.goals ?? {}) },
      lifestyle: { ...emptyLifestyle, ...(s.lifestyle ?? {}) },
      training: { ...emptyTraining, ...(s.training ?? {}) },
      nutrition: { ...emptyNutrition, ...(s.nutrition ?? {}) },
      logistics: { ...emptyLogistics, ...(s.logistics ?? {}) },
      neurotype: s.neurotype && typeof s.neurotype === "object" ? s.neurotype : {},
      step: typeof s.step === "number" && s.step >= 0 ? s.step : 0,
      neuroPage: typeof s.neuroPage === "number" && s.neuroPage >= 0 ? s.neuroPage : 0,
      screen: s.screen === "review" ? "review" : "form",
    };
    if (isDraftEmpty(draft)) return null;
    return draft;
  } catch {
    return null;
  }
}

function isDraftEmpty(d: IntakeDraft): boolean {
  return (
    JSON.stringify(d.consents) === JSON.stringify(emptyConsents) &&
    JSON.stringify(d.personal) === JSON.stringify(emptyPersonal) &&
    JSON.stringify(d.health) === JSON.stringify(emptyHealth) &&
    Object.keys(d.neurotype).length === 0
  );
}

export function saveDraft(draft: IntakeDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage pieno o negato: l'autosave è best-effort, il form resta usabile
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // idem: best-effort
  }
}
