import { cn } from "@/lib/utils";
import { ErrMsg, Seg } from "../controls";
import {
  NEURO_LETTERS,
  NEURO_PAGES,
  NEURO_PER_PAGE,
  NEURO_TOTAL,
  neuroKey,
} from "@/lib/intake-types";
import type { FieldErrors, Neurotype } from "@/lib/intake-types";

type Props = {
  value: Neurotype;
  onChange: (v: Neurotype) => void;
  errors: FieldErrors;
  /** pagina corrente (0–4): 30 affermazioni in 5 gruppi da 6 */
  page: number;
};

export const NEURO_QUESTIONS: string[] = [
  "Quando sono in gruppo voglio esserne il leader.",
  "Se il servizio al ristorante è cattivo, non ho problemi a farlo notare apertamente.",
  "Se so che qualcuno ha diffuso voci su di me, sento il bisogno di affrontarlo.",
  "Sento il bisogno di essere il migliore in ogni cosa; anche un gioco banale diventa una sfida.",
  "Se vedo un'opportunità la colgo sempre, anche oltre le mie capacità; preferisco rischiare.",
  "Se non riesco al primo colpo, significa solo che devo lavorare più duramente: ce la farò.",
  "Sono sempre stato agile e veloce, fin da piccolo.",
  "Nel traffico preferisco una deviazione piuttosto che stare in coda, anche se ci metto di più.",
  "In attesa di un appuntamento devo tenermi impegnato: non riesco a stare fermo a far nulla.",
  "Riesco a leggere con musica in sottofondo e trattenere le informazioni.",
  "Quando parlo, spesso cambio argomento a metà conversazione.",
  "Ho bisogno di nuove esperienze o attività spesso, altrimenti mi annoio.",
  'In una conversazione dico spesso "anch\'io", "la penso uguale", "so cosa intendi".',
  "Odio prendere decisioni: preferisco che altri scelgano film o ristorante.",
  'In situazioni adrenaliniche divento la versione "alfa" di me: più sicuro e carismatico.',
  "Rimando le cose fino all'ultimo (procrastino) ed è così che lavoro meglio.",
  "Senza fretta o pressione sono pigro, ma quando le cose si muovono divento molto produttivo.",
  "Sto attento a non ferire i sentimenti degli altri, anche quando la parte offesa sono io.",
  "Sono una persona emotiva: le mie reazioni sono facili e intense (positive o negative).",
  "Preferisco attività che conosco e mi piacciono piuttosto che provare cose nuove.",
  "Ho un cibo preferito che potrei mangiare tutto il giorno.",
  "Ho bisogno di sentirmi desiderato, amato e apprezzato per stare bene.",
  'Ho spesso conversazioni negative con me stesso ("non sono bravo", "non valgo").',
  "Do molto peso a ciò che gli altri pensano di me.",
  "Prendo decisioni basate sui fatti, non su emozioni e istinto.",
  "Non amo attività con fattori di rischio troppo alti.",
  "Mi preoccupo molto per cose che potrebbero andare male in futuro.",
  "Preferisco passare il tempo libero da solo (leggere, tv, gaming) piuttosto che uscire.",
  "Se il successo non arriva subito, mi sta bene un percorso più graduale e lento.",
  'Faccio fatica ad addormentarmi perché non riesco a "spegnere" il cervello.',
];

export const NEURO_LEGEND: [string, string][] = [
  ["A", "Mi descrive molto bene (quasi sempre)"],
  ["B", "Mi descrive bene (la maggior parte delle volte)"],
  ["C", "In parte (poco più della metà)"],
  ["D", "Non molto (meno della metà)"],
  ["E", "Non mi descrive affatto"],
];

export function Step8Neurotype({ value, onChange, errors, page }: Props) {
  const set = (k: string, letter: string) => onChange({ ...value, [k]: letter });
  const start = page * NEURO_PER_PAGE;
  const end = Math.min(start + NEURO_PER_PAGE, NEURO_TOTAL);
  const answered = NEURO_QUESTIONS.filter((_, i) => value[neuroKey(i + 1)]).length;

  return (
    <>
      <div className="rounded-[20px] border border-line-2 bg-white px-[18px] py-4">
        <div className="mb-3 flex items-center justify-between gap-2.5">
          <p className="m-0 text-[12.5px] font-bold uppercase tracking-[.05em] text-sub">
            Gruppo {page + 1} di {NEURO_PAGES}
          </p>
          <p className="m-0 text-[12.5px] font-bold tabular-nums text-brand">{answered} / 30</p>
        </div>
        <div className="grid gap-1.5">
          {NEURO_LEGEND.map(([ltr, txt]) => (
            <div key={ltr} className="flex items-baseline gap-2">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-md border border-brand-bd bg-brand-soft text-xs font-bold text-brand-deep">
                {ltr}
              </span>
              <span className="text-[13px] leading-[1.4] text-sub">{txt}</span>
            </div>
          ))}
        </div>
      </div>

      {NEURO_QUESTIONS.slice(start, end).map((text, offset) => {
        const i = start + offset;
        const k = neuroKey(i + 1);
        const error = errors[k];
        return (
          <div
            key={k}
            className={cn(
              "rounded-[20px] border px-[18px] py-4",
              error ? "border-danger bg-danger-soft" : "border-line-2 bg-white",
            )}
          >
            <p className="mb-3 mt-0 text-sm font-medium leading-[1.45] text-ink">
              <span className="mr-2 font-bold text-faint">{i + 1}.</span>
              {text}
            </p>
            <Seg
              value={value[k] ?? ""}
              onChange={(v) => set(k, v)}
              options={NEURO_LEGEND.map(([ltr, txt]) => ({
                v: ltr,
                l: ltr,
                aria: `${ltr} – ${txt}`,
              }))}
              error={error}
              columns={5}
              compact
              ariaLabel={`Affermazione ${i + 1}: ${text}`}
            />
            {error ? (
              <div className="mt-2">
                <ErrMsg text={error} />
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export { NEURO_LETTERS };
