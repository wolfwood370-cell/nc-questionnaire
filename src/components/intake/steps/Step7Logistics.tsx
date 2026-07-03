import { Field, Seg, TextArea, TextInput } from "../controls";
import type { FieldErrors, Logistics, WorkMode } from "@/lib/intake-types";

type Props = {
  value: Logistics;
  onChange: (v: Logistics) => void;
  errors: FieldErrors;
};

const WORK_MODE_OPTIONS = [
  { v: "presenza", l: "In presenza" },
  { v: "remoto", l: "Da remoto" },
  { v: "ibrido", l: "Ibrido" },
  { v: "app", l: "Solo tramite app" },
] as const;

export function Step7Logistics({ value, onChange, errors }: Props) {
  const set = <K extends keyof Logistics>(k: K, v: Logistics[K]) => onChange({ ...value, [k]: v });

  return (
    <>
      <Field label="Come preferisci lavorare" required error={errors.work_mode}>
        <Seg<WorkMode>
          value={value.work_mode}
          onChange={(v) => set("work_mode", v)}
          options={WORK_MODE_OPTIONS}
          error={errors.work_mode}
          min="120px"
          ariaLabel="Come preferisci lavorare"
        />
      </Field>
      <Field label="Disponibilità (giorni e fasce orarie)">
        <TextArea
          value={value.availability}
          onChange={(v) => set("availability", v)}
          placeholder="Es. Lun–Ven dopo le 18, sabato mattina."
        />
      </Field>
      <Field label="Perché proprio ora">
        <TextArea
          value={value.why_now}
          onChange={(v) => set("why_now", v)}
          placeholder="Es. ho un evento fra 6 mesi, ho deciso di prendermi cura di me."
        />
      </Field>
      <Field label="Coaching o palestra: cosa ha funzionato e cosa no">
        <TextArea
          value={value.past_coaching}
          onChange={(v) => set("past_coaching", v)}
          rows={4}
          placeholder="Es. andavo bene coi pesi ma non seguivo la dieta."
        />
      </Field>
      <Field label="Ostacoli che prevedi">
        <TextArea
          value={value.foreseen_obstacles}
          onChange={(v) => set("foreseen_obstacles", v)}
          placeholder="Es. trasferte, poco tempo la sera, cene fuori frequenti."
        />
      </Field>
      <Field label="Fra qualche mese, cosa dovrà essere successo per sentirti soddisfatto/a">
        <TextArea
          value={value.success_definition}
          onChange={(v) => set("success_definition", v)}
          rows={4}
          placeholder="Es. rientrare in una taglia, sollevare X kg, sentirmi in forma."
        />
      </Field>
      <Field label="Supporto attorno a te (famiglia, amici, partner)">
        <TextInput
          value={value.support_network}
          onChange={(v) => set("support_network", v)}
          placeholder="Es. partner di supporto, famiglia scettica."
        />
      </Field>
    </>
  );
}
