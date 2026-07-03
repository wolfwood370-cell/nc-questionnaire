export type Consents = {
  data_processing: boolean; // obbligatorio (trattamento dati salute)
  not_a_doctor: boolean; // obbligatorio (presa d'atto)
  nutrition_advice: boolean; // opzionale — abilita la sezione Nutrizione
  marketing: boolean;
};

export type Submission = Record<string, unknown>;
export type Health = Record<string, unknown>;
export type Nutrition = Record<string, unknown>;
export type Neurotype = Record<string, string>; // q01..q30 -> "A".."E"

export type IntakePayload = {
  submission: Submission & { consents: Consents };
  health: Health;
  nutrition: Nutrition;
  neurotype: Neurotype;
};

export const emptyConsents: Consents = {
  data_processing: false,
  not_a_doctor: false,
  nutrition_advice: false,
  marketing: false,
};
