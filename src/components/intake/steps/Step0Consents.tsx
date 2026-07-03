import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepShell } from "../StepShell";
import type { Consents } from "@/lib/intake-types";

type Props = {
  value: Consents;
  onChange: (next: Consents) => void;
};

export function Step0Consents({ value, onChange }: Props) {
  const setBool = (k: keyof Consents, v: boolean) => onChange({ ...value, [k]: v });

  return (
    <StepShell
      title="Consensi"
      description="Leggi e conferma ciascuna voce singolarmente. Le voci contrassegnate come obbligatorie devono essere accettate per poter inviare il questionario."
    >
      <RequiredConsent
        id="c_health"
        checked={value.consent_health}
        onCheckedChange={(v) => setBool("consent_health", v === true)}
        title="Trattamento dei dati sulla salute (obbligatorio)"
        description="Acconsento al trattamento dei miei dati relativi alla salute per la preparazione sportiva (necessario per iniziare)."
      />

      <YesNoConsent
        name="consent_nutrition"
        value={value.consent_nutrition}
        onChange={(v) => setBool("consent_nutrition", v)}
        title="Suggerimenti alimentari"
        description="Desidero ricevere suggerimenti alimentari a supporto dell'allenamento e mi impegno a sottoporli al mio medico."
      />

      <YesNoConsent
        name="consent_photos"
        value={value.consent_photos}
        onChange={(v) => setBool("consent_photos", v)}
        title="Foto e misurazioni corporee"
        description="Autorizzo foto e misurazioni corporee per monitorare i progressi."
      />

      <YesNoConsent
        name="consent_share_medical"
        value={value.consent_share_medical}
        onChange={(v) => setBool("consent_share_medical", v)}
        title="Condivisione dati con professionisti sanitari"
        description="Autorizzo la condivisione dei dati col mio medico o altri professionisti."
      />

      <YesNoConsent
        name="consent_marketing"
        value={value.consent_marketing}
        onChange={(v) => setBool("consent_marketing", v)}
        title="Comunicazioni non essenziali"
        description="Desidero ricevere comunicazioni e materiale informativo non essenziali."
      />

      <RequiredConsent
        id="c_disclaimer"
        checked={value.consent_disclaimer}
        onCheckedChange={(v) => setBool("consent_disclaimer", v === true)}
        title="Presa d'atto (obbligatorio)"
        description="Il servizio ha finalità di benessere fisico, non mediche; Nicolò è un personal trainer, non un medico/nutrizionista, e non li sostituisce."
      />
    </StepShell>
  );
}

function RequiredConsent({
  id,
  checked,
  onCheckedChange,
  title,
  description,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean | "indeterminate") => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-required
        className="mt-1"
      />
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium leading-snug">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function YesNoConsent({
  name,
  value,
  onChange,
  title,
  description,
}: {
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-snug text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <RadioGroup
        className="mt-3 flex gap-6"
        value={value ? "yes" : "no"}
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
