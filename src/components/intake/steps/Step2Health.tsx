import { Field, QuestionCard, Seg, TextArea, TextInput } from "../controls";
import { anyParqYes, PARQ_KEYS } from "@/lib/intake-types";
import type { CycleStatus, FieldErrors, Health, Sex, YesNoNa } from "@/lib/intake-types";

type Props = {
  value: Health;
  sex: Sex | "";
  onChange: (v: Health) => void;
  errors: FieldErrors;
};

export const PARQ_QUESTIONS: Record<(typeof PARQ_KEYS)[number], string> = {
  parq_heart: "Hai una condizione cardiaca o pressione alta?",
  parq_chest_pain: "Provi dolore al torace a riposo o durante l'attività?",
  parq_balance: "Negli ultimi 12 mesi hai perso l'equilibrio per capogiri o perso conoscenza?",
  parq_other_chronic: "Hai un'altra condizione medica cronica diagnosticata?",
  parq_meds: "Assumi farmaci prescritti per una condizione cronica?",
  parq_msk:
    "Hai problemi a ossa, articolazioni o tessuti molli che potrebbero peggiorare con l'attività?",
  parq_supervised: "Il medico ti ha detto di fare attività fisica solo sotto supervisione?",
};

const PREGNANCY_OPTIONS = [
  { v: "si", l: "Sì" },
  { v: "no", l: "No" },
  { v: "na", l: "Non applicabile" },
] as const;

const CYCLE_OPTIONS = [
  { v: "regolare", l: "Regolare" },
  { v: "irregolare", l: "Irregolare" },
  { v: "assente_3m", l: "Assente da +3 mesi" },
  { v: "menopausa", l: "Menopausa" },
  { v: "contraccezione_ormonale", l: "Contraccezione ormonale" },
] as const;

export function Step2Health({ value, sex, onChange, errors }: Props) {
  const set = <K extends keyof Health>(k: K, v: Health[K]) => onChange({ ...value, [k]: v });
  const showCycleSince =
    sex === "femmina" &&
    (value.cycle_status === "irregolare" || value.cycle_status === "assente_3m");

  return (
    <>
      {PARQ_KEYS.map((k) => (
        <QuestionCard
          key={k}
          label={PARQ_QUESTIONS[k]}
          value={value[k]}
          onChange={(v) => set(k, v)}
          error={errors[k]}
        />
      ))}

      {anyParqYes(value) ? (
        <Field
          label="Hai risposto Sì ad almeno una domanda: elenca condizioni e farmaci"
          error={errors.conditions_meds}
        >
          <TextArea
            value={value.conditions_meds}
            onChange={(v) => set("conditions_meds", v)}
            placeholder="Es. ipertensione, tiroide, farmaci in corso…"
            error={errors.conditions_meds}
          />
        </Field>
      ) : null}

      <QuestionCard
        label="Hai dolore in questo momento?"
        value={value.pain_now}
        onChange={(v) => set("pain_now", v)}
        error={errors.pain_now}
      />
      {value.pain_now === true ? (
        <Field label="Dove?" required error={errors.pain_where}>
          <TextInput
            value={value.pain_where}
            onChange={(v) => set("pain_where", v)}
            placeholder="Es. spalla destra, zona lombare…"
            error={errors.pain_where}
          />
        </Field>
      ) : null}

      <Field
        label="Infortuni od operazioni passati (zona, quando, se limita ancora)"
        error={errors.past_injuries}
      >
        <TextArea
          value={value.past_injuries}
          onChange={(v) => set("past_injuries", v)}
          error={errors.past_injuries}
        />
      </Field>

      <Field label="Sei in gravidanza o post-partum?" required error={errors.pregnancy}>
        <Seg<YesNoNa>
          value={value.pregnancy}
          onChange={(v) => set("pregnancy", v)}
          options={PREGNANCY_OPTIONS}
          error={errors.pregnancy}
          min="100px"
          ariaLabel="Sei in gravidanza o post-partum?"
        />
      </Field>

      {sex === "femmina" ? (
        <>
          <Field label="Il tuo ciclo mestruale è:" required error={errors.cycle_status}>
            <Seg<CycleStatus>
              value={value.cycle_status}
              onChange={(v) => set("cycle_status", v)}
              options={CYCLE_OPTIONS}
              error={errors.cycle_status}
              min="150px"
              ariaLabel="Il tuo ciclo mestruale è"
            />
          </Field>
          {showCycleSince ? (
            <Field label="Da quando?" required error={errors.cycle_since}>
              <TextInput
                value={value.cycle_since}
                onChange={(v) => set("cycle_since", v)}
                placeholder="Es. da 4 mesi, da gennaio 2026…"
                error={errors.cycle_since}
              />
            </Field>
          ) : null}
        </>
      ) : null}

      <QuestionCard
        label="Hai allergie o reazioni gravi rilevanti per la sicurezza (anafilassi, lattice, farmaci, punture)?"
        value={value.safety_allergy}
        onChange={(v) => set("safety_allergy", v)}
        error={errors.safety_allergy}
      />
      {value.safety_allergy === true ? (
        <Field label="Dettagli allergie/reazioni" required error={errors.safety_allergy_detail}>
          <TextArea
            value={value.safety_allergy_detail}
            onChange={(v) => set("safety_allergy_detail", v)}
            rows={2}
            error={errors.safety_allergy_detail}
          />
        </Field>
      ) : null}
    </>
  );
}
