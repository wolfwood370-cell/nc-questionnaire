import { Field, Row, Seg, TextArea, TextInput } from "../controls";
import type {
  FieldErrors,
  Lifestyle,
  NeatSteps,
  SleepQuality,
  StressLevel,
} from "@/lib/intake-types";

type Props = {
  value: Lifestyle;
  onChange: (v: Lifestyle) => void;
  errors: FieldErrors;
};

const STRESS_OPTIONS = [
  { v: "molto_alto", l: "Molto alto" },
  { v: "alto", l: "Alto" },
  { v: "medio", l: "Medio" },
  { v: "basso", l: "Basso" },
  { v: "molto_basso", l: "Molto basso" },
] as const;

const SLEEP_OPTIONS = [
  { v: "ottima", l: "Ottima" },
  { v: "buona", l: "Buona" },
  { v: "media", l: "Media" },
  { v: "scarsa", l: "Scarsa" },
  { v: "pessima", l: "Pessima" },
] as const;

const NEAT_OPTIONS = [
  { v: "<5000", l: "< 5.000" },
  { v: "5000-7500", l: "5–7,5k" },
  { v: "7500-10000", l: "7,5–10k" },
  { v: "10000-12500", l: "10–12,5k" },
  { v: ">12500", l: "> 12.500" },
] as const;

export function Step4Lifestyle({ value, onChange, errors }: Props) {
  const set = <K extends keyof Lifestyle>(k: K, v: Lifestyle[K]) => onChange({ ...value, [k]: v });

  return (
    <>
      <Field label="Lavoro, ore/settimana, sedentario o in movimento, orari" required>
        <TextArea
          value={value.work_desc}
          onChange={(v) => set("work_desc", v)}
          rows={4}
          placeholder="Es. ufficio 40h/sett, sedentario, orari fissi 9–18."
        />
      </Field>
      <Field label="Stress quotidiano" required error={errors.stress_level}>
        <Seg<StressLevel>
          value={value.stress_level}
          onChange={(v) => set("stress_level", v)}
          options={STRESS_OPTIONS}
          error={errors.stress_level}
          min="104px"
          ariaLabel="Stress quotidiano"
        />
      </Field>
      <Row>
        <Field label="Ore di sonno a notte">
          <TextInput
            value={value.sleep_hours}
            onChange={(v) => set("sleep_hours", v)}
            placeholder="Es. 6–7"
          />
        </Field>
        <Field label="Qualità del sonno" required error={errors.sleep_quality}>
          <Seg<SleepQuality>
            value={value.sleep_quality}
            onChange={(v) => set("sleep_quality", v)}
            options={SLEEP_OPTIONS}
            error={errors.sleep_quality}
            min="84px"
            ariaLabel="Qualità del sonno"
          />
        </Field>
      </Row>
      <Field
        label="Attività quotidiana non sportiva (passi / NEAT)"
        required
        error={errors.neat_steps}
      >
        <Seg<NeatSteps>
          value={value.neat_steps}
          onChange={(v) => set("neat_steps", v)}
          options={NEAT_OPTIONS}
          error={errors.neat_steps}
          min="88px"
          compact
          ariaLabel="Attività quotidiana non sportiva (passi al giorno)"
        />
      </Field>
      <Row>
        <Field label="Acqua/giorno (L)">
          <TextInput
            value={value.water_liters}
            onChange={(v) => set("water_liters", v)}
            inputMode="numeric"
            placeholder="Es. 1.5"
          />
        </Field>
        <Field label="Alcol/settimana">
          <TextInput
            value={value.alcohol_week}
            onChange={(v) => set("alcohol_week", v)}
            placeholder="Es. 2 bicchieri"
          />
        </Field>
        <Field label="Fumo (al giorno)">
          <TextInput
            value={value.smoking}
            onChange={(v) => set("smoking", v)}
            placeholder="Es. 5, o 'Non fumo'"
          />
        </Field>
      </Row>
      <Field label="Nello stile di vita, cosa vuoi migliorare">
        <TextArea
          value={value.lifestyle_goal}
          onChange={(v) => set("lifestyle_goal", v)}
          placeholder="Es. dormire di più, ridurre lo stress, camminare di più."
        />
      </Field>
    </>
  );
}
