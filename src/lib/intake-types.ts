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
  birth_date: string; // AAAA-MM-GG
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

export type Submission = Record<string, unknown>;
export type Health = Record<string, unknown>;
export type Nutrition = Record<string, unknown>;
export type Neurotype = Record<string, string>;

export type IntakePayload = {
  submission: Submission & { consents: Consents };
  health: Health;
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
