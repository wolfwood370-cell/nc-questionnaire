import { Field, Row, Seg, TextInput } from "../controls";
import type { FieldErrors, Personal, Pronoun, Sex } from "@/lib/intake-types";

type Props = {
  value: Personal;
  onChange: (v: Personal) => void;
  errors: FieldErrors;
};

const SEX_OPTIONS = [
  { v: "maschio", l: "Maschio" },
  { v: "femmina", l: "Femmina" },
] as const;

const PRONOUN_OPTIONS = [
  { v: "tu_lei", l: "Tu/Lei" },
  { v: "tu_lui", l: "Tu/Lui" },
  { v: "voi_loro", l: "Voi/Loro" },
] as const;

export function Step1Personal({ value, onChange, errors }: Props) {
  const set = <K extends keyof Personal>(k: K, v: Personal[K]) => onChange({ ...value, [k]: v });

  return (
    <>
      <Field label="Nome e cognome" required error={errors.full_name}>
        <TextInput
          value={value.full_name}
          onChange={(v) => set("full_name", v)}
          error={errors.full_name}
          autoComplete="name"
        />
      </Field>
      <Row>
        <Field label="Sesso biologico" required error={errors.sex}>
          <Seg<Sex>
            value={value.sex}
            onChange={(v) => set("sex", v)}
            options={SEX_OPTIONS}
            error={errors.sex}
            min="100px"
            ariaLabel="Sesso biologico"
          />
        </Field>
        <Field label="Pronome preferito" help="Facoltativo">
          <Seg<Pronoun>
            value={value.pronoun}
            onChange={(v) => set("pronoun", v)}
            options={PRONOUN_OPTIONS}
            min="80px"
            ariaLabel="Pronome preferito"
          />
        </Field>
      </Row>
      <Field label="Data di nascita" required error={errors.birth_date}>
        <TextInput
          value={value.birth_date}
          onChange={(v) => set("birth_date", v)}
          type="date"
          error={errors.birth_date}
          autoComplete="bday"
        />
      </Field>
      <Row>
        <Field label="Telefono" required error={errors.phone}>
          <TextInput
            value={value.phone}
            onChange={(v) => set("phone", v)}
            type="tel"
            inputMode="tel"
            error={errors.phone}
            autoComplete="tel"
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <TextInput
            value={value.email}
            onChange={(v) => set("email", v)}
            type="email"
            inputMode="email"
            error={errors.email}
            autoComplete="email"
          />
        </Field>
      </Row>
      <Field label="Codice fiscale" required error={errors.tax_code}>
        <TextInput
          value={value.tax_code}
          onChange={(v) => set("tax_code", v.toUpperCase())}
          error={errors.tax_code}
          autoComplete="off"
        />
      </Field>
      <Field label="Indirizzo completo" required error={errors.address} help="Via/numero, CAP, città, provincia">
        <TextInput
          value={value.address}
          onChange={(v) => set("address", v)}
          error={errors.address}
          autoComplete="street-address"
        />
      </Field>
    </>
  );
}
