import { Field, Note, Seg, TextArea, TextInput } from "../controls";
import type { DietAssessment, FieldErrors, Nutrition } from "@/lib/intake-types";

type Props = {
  value: Nutrition;
  onChange: (v: Nutrition) => void;
  errors: FieldErrors;
};

const DIET_OPTIONS = [
  { v: "iper", l: "Ipercalorica" },
  { v: "iso", l: "Isocalorica" },
  { v: "ipo", l: "Ipocalorica" },
  { v: "non_so", l: "Non saprei" },
] as const;

export function Step6Nutrition({ value, onChange, errors }: Props) {
  const set = <K extends keyof Nutrition>(k: K, v: Nutrition[K]) => onChange({ ...value, [k]: v });

  return (
    <>
      <Note text="Sezione visibile perché hai dato il consenso ai suggerimenti alimentari. I consigli sono a supporto dell'allenamento e vanno sottoposti al tuo medico." />
      <Field label="Come valuteresti la tua dieta attuale?" required error={errors.diet_assessment}>
        <Seg<DietAssessment>
          value={value.diet_assessment}
          onChange={(v) => set("diet_assessment", v)}
          options={DIET_OPTIONS}
          error={errors.diet_assessment}
          min="120px"
          ariaLabel="Come valuteresti la tua dieta attuale?"
        />
      </Field>
      <Field label="Quanti pasti al giorno e con quali orari">
        <TextArea
          value={value.meals_desc}
          onChange={(v) => set("meals_desc", v)}
          placeholder="Es. 4 pasti: colazione 7:30, pranzo 13, spuntino 17, cena 20:30."
        />
      </Field>
      <Field label="Diete passate, risultati, oscillazioni yo-yo">
        <TextArea
          value={value.diet_history}
          onChange={(v) => set("diet_history", v)}
          placeholder="Es. chetogenica 6 mesi, -8 kg poi ripresi…"
        />
      </Field>
      <Field label="Cibi che ami / che eviti">
        <TextArea
          value={value.foods_love_avoid}
          onChange={(v) => set("foods_love_avoid", v)}
          placeholder="Es. amo pasta e pesce. Evito verdure crude."
        />
      </Field>
      <Field label="Intolleranze, allergie o esclusioni (mediche, religiose, etiche)">
        <TextArea
          value={value.intolerances}
          onChange={(v) => set("intolerances", v)}
          placeholder="Es. intolleranza al lattosio, vegetariano/a…"
        />
      </Field>
      <Field label="Chi cucina e dove mangi di solito">
        <TextInput
          value={value.who_cooks}
          onChange={(v) => set("who_cooks", v)}
          placeholder="Es. cucino io a casa, pranzo in mensa."
        />
      </Field>
      <Field label="Integratori che assumi ora">
        <TextArea
          value={value.supplements}
          onChange={(v) => set("supplements", v)}
          placeholder="Es. creatina 5 g/die, vitamina D, whey post-workout."
        />
      </Field>
    </>
  );
}
