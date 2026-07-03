export type Consents = {
  consent_health: boolean; // OBBLIGATORIO true
  consent_nutrition: boolean; // Si/No -> abilita sezione 6
  consent_photos: boolean; // Si/No
  consent_share_medical: boolean; // Si/No
  consent_marketing: boolean; // Si/No
  consent_disclaimer: boolean; // OBBLIGATORIO true
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
  consent_health: false,
  consent_nutrition: false,
  consent_photos: false,
  consent_share_medical: false,
  consent_marketing: false,
  consent_disclaimer: false,
};
