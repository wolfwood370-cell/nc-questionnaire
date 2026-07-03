import { Field, Row, Seg, TextArea, TextInput } from "../controls";
import type {
  ExperienceLevel,
  FieldErrors,
  MaxDaysWeek,
  RecoveryCapacity,
  Training,
  Workload,
} from "@/lib/intake-types";

type Props = {
  value: Training;
  onChange: (v: Training) => void;
  errors: FieldErrors;
};

const EXPERIENCE_OPTIONS = [
  { v: "novizio", l: "Novizio" },
  { v: "principiante", l: "Principiante" },
  { v: "intermedio", l: "Intermedio" },
  { v: "avanzato", l: "Avanzato" },
  { v: "master", l: "Master" },
] as const;

const WORKLOAD_OPTIONS = [
  { v: "molto_basso", l: "Molto basso" },
  { v: "basso", l: "Basso" },
  { v: "medio", l: "Medio" },
  { v: "alto", l: "Alto" },
  { v: "molto_alto", l: "Molto alto" },
] as const;

const RECOVERY_OPTIONS = [
  { v: "ottima", l: "Ottima" },
  { v: "buona", l: "Buona" },
  { v: "media", l: "Media" },
  { v: "scarsa", l: "Scarsa" },
  { v: "pessima", l: "Pessima" },
] as const;

const DAYS_OPTIONS = [
  { v: "2", l: "2" },
  { v: "3", l: "3" },
  { v: "4", l: "4" },
  { v: "5", l: "5" },
  { v: "6", l: "6" },
] as const;

export function Step5Training({ value, onChange, errors }: Props) {
  const set = <K extends keyof Training>(k: K, v: Training[K]) => onChange({ ...value, [k]: v });

  return (
    <>
      <Field label="Sport praticati e per quanto tempo">
        <TextArea
          value={value.sports_history}
          onChange={(v) => set("sports_history", v)}
          placeholder="Es. calcio dai 10 ai 18 anni, nuoto per 3 anni…"
        />
      </Field>
      <Row>
        <Field label="Ultimo o attuale sport (da quando)">
          <TextInput
            value={value.current_sport}
            onChange={(v) => set("current_sport", v)}
            placeholder="Es. palestra da 2 anni"
          />
        </Field>
        <Field label="Attività fisica preferita">
          <TextInput
            value={value.favorite_activity}
            onChange={(v) => set("favorite_activity", v)}
            placeholder="Es. sollevamento pesi"
          />
        </Field>
      </Row>
      <Field label="Uso di bilanciere / attrezzi e per quanto">
        <TextArea
          value={value.barbell_experience}
          onChange={(v) => set("barbell_experience", v)}
          placeholder="Es. powerlifting da 3 anni, kettlebell saltuariamente."
        />
      </Field>
      <Field label="Livello di esperienza coi pesi" required error={errors.experience_level}>
        <Seg<ExperienceLevel>
          value={value.experience_level}
          onChange={(v) => set("experience_level", v)}
          options={EXPERIENCE_OPTIONS}
          error={errors.experience_level}
          min="110px"
          ariaLabel="Livello di esperienza coi pesi"
        />
      </Field>
      <Field label="Carico di lavoro abituale" required error={errors.workload}>
        <Seg<Workload>
          value={value.workload}
          onChange={(v) => set("workload", v)}
          options={WORKLOAD_OPTIONS}
          error={errors.workload}
          min="104px"
          ariaLabel="Carico di lavoro abituale"
        />
      </Field>
      <Field label="Capacità di recupero" required error={errors.recovery_capacity}>
        <Seg<RecoveryCapacity>
          value={value.recovery_capacity}
          onChange={(v) => set("recovery_capacity", v)}
          options={RECOVERY_OPTIONS}
          error={errors.recovery_capacity}
          min="84px"
          ariaLabel="Capacità di recupero"
        />
      </Field>
      <Field
        label="Giorni massimi di allenamento a settimana"
        required
        error={errors.max_days_week}
      >
        <Seg<MaxDaysWeek>
          value={value.max_days_week}
          onChange={(v) => set("max_days_week", v)}
          options={DAYS_OPTIONS}
          error={errors.max_days_week}
          min="44px"
          compact
          ariaLabel="Giorni massimi di allenamento a settimana"
        />
      </Field>
      <Field label="Minuti per sessione">
        <TextInput
          value={value.session_minutes}
          onChange={(v) => set("session_minutes", v)}
          type="number"
          inputMode="numeric"
          placeholder="Es. 60"
        />
      </Field>
      <Field label="Dove ti alleni e con quale attrezzatura" required error={errors.equipment}>
        <TextArea
          value={value.equipment}
          onChange={(v) => set("equipment", v)}
          placeholder="Es. palestra ben attrezzata: bilancieri, rack, manubri, macchinari."
          error={errors.equipment}
        />
      </Field>
      <Field label="1RM / 3RM / 5RM recenti con data (Squat, Panca, Stacco, Lento)">
        <TextArea
          value={value.recent_maxes}
          onChange={(v) => set("recent_maxes", v)}
          rows={5}
          placeholder={"Es.\nSquat 5RM 100 kg (03/2026)\nPanca 1RM 80 kg (05/2026)"}
        />
      </Field>
    </>
  );
}
