import { Field, Row, TextArea, TextInput } from "../controls";
import type { FieldErrors, Goals } from "@/lib/intake-types";

type Props = {
  value: Goals;
  onChange: (v: Goals) => void;
  errors: FieldErrors;
};

export function Step3Goals({ value, onChange, errors }: Props) {
  const set = <K extends keyof Goals>(k: K, v: Goals[K]) => onChange({ ...value, [k]: v });

  return (
    <>
      <Row>
        <Field label="Altezza (cm)" required error={errors.height_cm}>
          <TextInput
            value={value.height_cm}
            onChange={(v) => set("height_cm", v)}
            type="number"
            inputMode="numeric"
            placeholder="Es. 175"
            error={errors.height_cm}
          />
        </Field>
        <Field label="Peso attuale (kg)" required error={errors.weight_kg}>
          <TextInput
            value={value.weight_kg}
            onChange={(v) => set("weight_kg", v)}
            type="number"
            inputMode="numeric"
            placeholder="Es. 70"
            error={errors.weight_kg}
          />
        </Field>
      </Row>
      <Field label="Storia del peso (max e min da adulto)">
        <TextArea
          value={value.weight_history}
          onChange={(v) => set("weight_history", v)}
          placeholder="Es. 85 kg nel 2019, minimo 68 kg nel 2021."
        />
      </Field>
      <Field label="Peso obiettivo / target">
        <TextInput
          value={value.weight_target}
          onChange={(v) => set("weight_target", v)}
          placeholder="Es. tornare intorno ai 72 kg"
        />
      </Field>
      <Field label="Obiettivo principale lavorando con me" required error={errors.main_goal}>
        <TextArea
          value={value.main_goal}
          onChange={(v) => set("main_goal", v)}
          rows={4}
          placeholder="Cosa vuoi ottenere, perché ora e cosa significherebbe per te."
          error={errors.main_goal}
        />
      </Field>
      <Field label="Aspetto fisico che vuoi migliorare">
        <TextArea
          value={value.aesthetic_goal}
          onChange={(v) => set("aesthetic_goal", v)}
          placeholder="Es. tonificare braccia e addome, migliorare la postura."
        />
      </Field>
      <Field label="Scadenza o evento di riferimento">
        <TextInput
          value={value.deadline_event}
          onChange={(v) => set("deadline_event", v)}
          placeholder="Es. matrimonio a giugno, oppure nessuna scadenza"
        />
      </Field>
      <Field label="Nel modo di muoverti, cosa vuoi migliorare">
        <TextArea
          value={value.movement_goal}
          onChange={(v) => set("movement_goal", v)}
          placeholder="Es. correre 5 km, sentirmi più stabile su una gamba."
        />
      </Field>
    </>
  );
}
