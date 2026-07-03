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

export type Submission = Record<string, unknown>;
export type Nutrition = Record<string, unknown>;
export type Neurotype = Record<string, string>;

export type IntakePayload = {
  submission: Submission & { consents: Consents };
  health: Record<string, unknown>;
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
