import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepShell } from "../StepShell";
import type { Personal, Pronoun, Sex } from "@/lib/intake-types";

type Props = {
  value: Personal;
  onChange: (next: Personal) => void;
};

export function Step1Personal({ value, onChange }: Props) {
  const set = <K extends keyof Personal>(k: K, v: Personal[K]) => onChange({ ...value, [k]: v });

  return (
    <StepShell
      title="Anagrafica e contatti"
      description="I dati identificativi ci servono per gestire il tuo percorso."
    >
      <Field id="full_name" label="Nome e cognome" required>
        <Input
          id="full_name"
          value={value.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          autoComplete="name"
          required
        />
      </Field>

      <Field id="sex" label="Sesso biologico" required>
        <Select value={value.sex} onValueChange={(v) => set("sex", v as Sex)}>
          <SelectTrigger id="sex">
            <SelectValue placeholder="Seleziona…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="maschio">Maschio</SelectItem>
            <SelectItem value="femmina">Femmina</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field id="pronoun" label="Pronome preferito (facoltativo)">
        <Select value={value.pronoun} onValueChange={(v) => set("pronoun", v as Pronoun)}>
          <SelectTrigger id="pronoun">
            <SelectValue placeholder="Seleziona…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tu_lei">Tu/Lei</SelectItem>
            <SelectItem value="tu_lui">Tu/Lui</SelectItem>
            <SelectItem value="voi_loro">Voi/Loro</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field id="birth_date" label="Data di nascita" required>
        <Input
          id="birth_date"
          type="date"
          value={value.birth_date}
          onChange={(e) => set("birth_date", e.target.value)}
          autoComplete="bday"
          required
        />
      </Field>

      <Field id="phone" label="Telefono" required>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          required
        />
      </Field>

      <Field id="email" label="Email" required>
        <Input
          id="email"
          type="email"
          inputMode="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
          required
        />
      </Field>
    </StepShell>
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isPersonalValid(v: Personal): { ok: boolean; message?: string } {
  if (!v.full_name.trim()) return { ok: false, message: "Inserisci nome e cognome." };
  if (!v.sex) return { ok: false, message: "Seleziona il sesso biologico." };
  if (!DATE_RE.test(v.birth_date))
    return { ok: false, message: "Inserisci una data di nascita valida (AAAA-MM-GG)." };
  if (!v.phone.trim()) return { ok: false, message: "Inserisci un numero di telefono." };
  if (!EMAIL_RE.test(v.email.trim())) return { ok: false, message: "Inserisci un'email valida." };
  return { ok: true };
}
