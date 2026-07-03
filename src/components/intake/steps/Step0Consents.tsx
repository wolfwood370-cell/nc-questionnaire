import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StepShell } from "../StepShell";
import type { Consents } from "@/lib/intake-types";

type Props = {
  value: Consents;
  onChange: (next: Consents) => void;
};

export function Step0Consents({ value, onChange }: Props) {
  const set = (k: keyof Consents) => (checked: boolean | "indeterminate") =>
    onChange({ ...value, [k]: checked === true });

  return (
    <StepShell
      title="Consensi"
      description="Prima di iniziare, leggi e conferma i consensi. I primi due sono obbligatori per poter inviare il questionario."
    >
      <ConsentRow
        id="c_data"
        checked={value.data_processing}
        onCheckedChange={set("data_processing")}
        required
        title="Trattamento dei dati, inclusi dati sulla salute (obbligatorio)"
        description="Acconsento al trattamento dei miei dati personali, incluse informazioni sulla salute, per la finalità di valutazione e programmazione dell'allenamento personale, ai sensi del Reg. UE 2016/679 (GDPR)."
      />
      <ConsentRow
        id="c_notdoc"
        checked={value.not_a_doctor}
        onCheckedChange={set("not_a_doctor")}
        required
        title="Presa d'atto: il personal trainer non è un medico (obbligatorio)"
        description="Dichiaro di aver compreso che il personal trainer non è un medico e non fornisce diagnosi né terapie. In presenza di patologie o dubbi mi rivolgerò a un professionista sanitario."
      />
      <ConsentRow
        id="c_nutr"
        checked={value.nutrition_advice}
        onCheckedChange={set("nutrition_advice")}
        title="Consigli alimentari generali (facoltativo)"
        description="Desidero ricevere indicazioni alimentari generali di tipo educativo, non sostitutive di un piano nutrizionale redatto da un professionista abilitato."
      />
      <ConsentRow
        id="c_mkt"
        checked={value.marketing}
        onCheckedChange={set("marketing")}
        title="Comunicazioni informative e promozionali (facoltativo)"
        description="Acconsento a ricevere comunicazioni relative a servizi, novità e iniziative del personal trainer."
      />
    </StepShell>
  );
}

function ConsentRow({
  id,
  checked,
  onCheckedChange,
  title,
  description,
  required,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean | "indeterminate") => void;
  title: string;
  description: string;
  required?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-required={required}
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
