import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepShell } from "../StepShell";
import { anyParqYes } from "@/lib/intake-types";
import type { CycleStatus, Health, Sex, YesNoNa } from "@/lib/intake-types";

type Props = {
  value: Health;
  sex: Sex | "";
  onChange: (next: Health) => void;
};

const PARQ: Array<{ key: keyof Health; label: string }> = [
  { key: "parq_heart", label: "Hai una condizione cardiaca o pressione alta?" },
  { key: "parq_chest_pain", label: "Provi dolore al torace a riposo o durante l'attività?" },
  {
    key: "parq_balance",
    label: "Negli ultimi 12 mesi hai perso l'equilibrio a causa di capogiri o perso conoscenza?",
  },
  {
    key: "parq_other_chronic",
    label: "Hai un'altra condizione medica cronica diagnosticata?",
  },
  { key: "parq_meds", label: "Assumi farmaci prescritti per una condizione cronica?" },
  {
    key: "parq_msk",
    label:
      "Hai problemi a ossa, articolazioni o tessuti molli che potrebbero peggiorare con l'attività?",
  },
  {
    key: "parq_supervised",
    label: "Il medico ti ha detto di fare attività fisica solo sotto supervisione?",
  },
];

export function Step2Health({ value, sex, onChange }: Props) {
  const set = <K extends keyof Health>(k: K, v: Health[K]) => onChange({ ...value, [k]: v });

  const showCycle = sex === "femmina";

  return (
    <StepShell
      title="Salute e sicurezza (PAR-Q+)"
      description="Rispondi con sincerità: queste informazioni ci aiutano a proporti un allenamento sicuro. Se hai dubbi, consulta il tuo medico."
    >
      <div className="space-y-3">
        {PARQ.map((q) => (
          <YesNoBool
            key={q.key}
            name={q.key}
            label={q.label}
            value={value[q.key] as boolean | null}
            onChange={(v) => set(q.key, v as Health[typeof q.key])}
          />
        ))}
      </div>

      {anyParqYes(value) ? (
        <Field
          id="conditions_meds"
          label="Hai risposto Sì ad almeno una domanda: elenca condizioni e farmaci"
        >
          <Textarea
            id="conditions_meds"
            rows={3}
            value={value.conditions_meds}
            onChange={(e) => set("conditions_meds", e.target.value)}
            placeholder="Es. ipertensione, tiroide, farmaci in corso…"
          />
        </Field>
      ) : null}

      <YesNoBool
        name="pain_now"
        label="Hai dolore in questo momento?"
        value={value.pain_now}
        onChange={(v) => set("pain_now", v)}
      />
      {value.pain_now === true ? (
        <Field id="pain_where" label="Dove?" required>
          <Input
            id="pain_where"
            value={value.pain_where}
            onChange={(e) => set("pain_where", e.target.value)}
            placeholder="Es. spalla destra, zona lombare…"
          />
        </Field>
      ) : null}

      <Field
        id="past_injuries"
        label="Infortuni od operazioni passati (zona, quando, se limita ancora)"
      >
        <Textarea
          id="past_injuries"
          rows={3}
          value={value.past_injuries}
          onChange={(e) => set("past_injuries", e.target.value)}
        />
      </Field>

      <Field id="pregnancy" label="Sei in gravidanza o post-partum?" required>
        <Select value={value.pregnancy} onValueChange={(v) => set("pregnancy", v as YesNoNa)}>
          <SelectTrigger id="pregnancy">
            <SelectValue placeholder="Seleziona…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="si">Sì</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="na">Non applicabile</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {showCycle ? (
        <>
          <Field id="cycle_status" label="Il tuo ciclo mestruale è:" required>
            <Select
              value={value.cycle_status}
              onValueChange={(v) => set("cycle_status", v as CycleStatus)}
            >
              <SelectTrigger id="cycle_status">
                <SelectValue placeholder="Seleziona…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regolare">Regolare</SelectItem>
                <SelectItem value="irregolare">Irregolare</SelectItem>
                <SelectItem value="assente_3m">Assente da più di 3 mesi</SelectItem>
                <SelectItem value="menopausa">Menopausa</SelectItem>
                <SelectItem value="contraccezione_ormonale">Contraccezione ormonale</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {value.cycle_status === "irregolare" || value.cycle_status === "assente_3m" ? (
            <Field id="cycle_since" label="Da quando?" required>
              <Input
                id="cycle_since"
                value={value.cycle_since}
                onChange={(e) => set("cycle_since", e.target.value)}
                placeholder="Es. da 4 mesi, da gennaio 2026…"
              />
            </Field>
          ) : null}
        </>
      ) : null}

      <YesNoBool
        name="safety_allergy"
        label="Hai allergie o reazioni gravi rilevanti per la sicurezza (anafilassi, lattice, farmaci, punture)?"
        value={value.safety_allergy}
        onChange={(v) => set("safety_allergy", v)}
      />
      {value.safety_allergy === true ? (
        <Field id="safety_allergy_detail" label="Dettagli allergie/reazioni" required>
          <Textarea
            id="safety_allergy_detail"
            rows={2}
            value={value.safety_allergy_detail}
            onChange={(e) => set("safety_allergy_detail", e.target.value)}
          />
        </Field>
      ) : null}
    </StepShell>
  );
}

function YesNoBool({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium leading-snug text-foreground">
        {label} <span className="ml-0.5 text-destructive">*</span>
      </p>
      <RadioGroup
        className="mt-3 flex gap-6"
        value={value === null ? "" : value ? "yes" : "no"}
        onValueChange={(v) => onChange(v === "yes")}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem id={`${name}_yes`} value="yes" />
          <Label htmlFor={`${name}_yes`} className="text-sm font-normal">
            Sì
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id={`${name}_no`} value="no" />
          <Label htmlFor={`${name}_no`} className="text-sm font-normal">
            No
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

export function isHealthValid(v: Health, sex: Sex | ""): { ok: boolean; message?: string } {
  for (const q of PARQ) {
    if (typeof v[q.key] !== "boolean")
      return { ok: false, message: `Rispondi Sì o No a: "${q.label}"` };
  }
  if (v.pain_now === null) return { ok: false, message: "Indica se hai dolore in questo momento." };
  if (v.pain_now === true && !v.pain_where.trim())
    return { ok: false, message: "Indica dove hai dolore." };
  if (!v.pregnancy)
    return { ok: false, message: "Rispondi alla domanda su gravidanza/post-partum." };
  if (sex === "femmina") {
    if (!v.cycle_status) return { ok: false, message: "Seleziona lo stato del ciclo mestruale." };
    if (
      (v.cycle_status === "irregolare" || v.cycle_status === "assente_3m") &&
      !v.cycle_since.trim()
    )
      return { ok: false, message: "Indica da quando il ciclo è irregolare/assente." };
  }
  if (v.safety_allergy === null)
    return { ok: false, message: "Rispondi alla domanda su allergie/reazioni gravi." };
  if (v.safety_allergy === true && !v.safety_allergy_detail.trim())
    return { ok: false, message: "Descrivi le allergie/reazioni gravi." };
  return { ok: true };
}
