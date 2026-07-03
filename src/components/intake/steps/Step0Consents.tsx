import { useState } from "react";
import { ConsentCardOptional, ConsentCardRequired } from "../controls";
import type { Consents, FieldErrors } from "@/lib/intake-types";

type Props = {
  value: Consents;
  onChange: (v: Consents) => void;
  errors: FieldErrors;
  trainerName: string;
};

export function Step0Consents({ value, onChange, errors, trainerName }: Props) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const set = (k: keyof Consents, v: boolean) => onChange({ ...value, [k]: v });

  return (
    <>
      <div className="overflow-hidden rounded-[20px] border border-line-2 bg-white">
        <button
          type="button"
          aria-expanded={privacyOpen}
          onClick={() => setPrivacyOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-[18px] py-[15px] text-left"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg bg-brand-soft text-sm text-brand"
          >
            🔒
          </span>
          <span className="text-sm font-bold text-ink">Come tratto i tuoi dati</span>
          <span
            aria-hidden="true"
            className="ml-auto text-[13px] text-faint transition-transform duration-200"
            style={{ transform: privacyOpen ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </button>
        {privacyOpen ? (
          <div className="px-[18px] pb-4 text-[13px] leading-[1.6] text-sub">
            <p className="mb-2 mt-0">
              I dati che condividi (inclusi quelli sulla salute, art. 9 GDPR) sono usati
              esclusivamente per valutare l'idoneità e costruire il tuo programma di allenamento.
            </p>
            <p className="mb-2 mt-0">
              Non vengono ceduti a terzi senza il tuo consenso esplicito. Le voci facoltative qui
              sotto le puoi rifiutare senza conseguenze.
            </p>
            <p className="m-0">
              Puoi chiedere in ogni momento accesso, rettifica o cancellazione dei tuoi dati.
            </p>
          </div>
        ) : null}
      </div>

      <ConsentCardRequired
        checked={value.consent_health}
        onChange={(v) => set("consent_health", v)}
        title="Trattamento dei dati sulla salute"
        desc="Acconsento al trattamento dei miei dati relativi alla salute per la preparazione sportiva (necessario per iniziare)."
        error={errors.consent_health}
      />
      <ConsentCardOptional
        value={value.consent_nutrition}
        onChange={(v) => set("consent_nutrition", v)}
        title="Suggerimenti alimentari"
        desc="Desidero ricevere suggerimenti alimentari a supporto dell'allenamento e mi impegno a sottoporli al mio medico."
        hint="Se accetti, aggiungo una sezione dedicata all'alimentazione al questionario."
      />
      <ConsentCardOptional
        value={value.consent_photos}
        onChange={(v) => set("consent_photos", v)}
        title="Foto e misurazioni corporee"
        desc="Autorizzo foto e misurazioni corporee per monitorare i progressi."
      />
      <ConsentCardOptional
        value={value.consent_share_medical}
        onChange={(v) => set("consent_share_medical", v)}
        title="Condivisione con professionisti sanitari"
        desc="Autorizzo la condivisione dei dati col mio medico o altri professionisti."
      />
      <ConsentCardOptional
        value={value.consent_marketing}
        onChange={(v) => set("consent_marketing", v)}
        title="Comunicazioni non essenziali"
        desc="Desidero ricevere comunicazioni e materiale informativo non essenziali."
      />
      <ConsentCardRequired
        checked={value.consent_disclaimer}
        onChange={(v) => set("consent_disclaimer", v)}
        title="Presa d'atto"
        desc={`Il servizio ha finalità di benessere fisico, non mediche; ${trainerName} è un personal trainer, non un medico/nutrizionista, e non li sostituisce.`}
        error={errors.consent_disclaimer}
      />
    </>
  );
}
