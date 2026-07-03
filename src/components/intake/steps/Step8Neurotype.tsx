import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Neurotype } from "@/lib/intake-types";

type Props = {
  value: Neurotype;
  onChange: (v: Neurotype) => void;
};

const QUESTIONS: { id: string; text: string }[] = [
  { id: "q01", text: "Quando sono in gruppo voglio esserne il leader." },
  { id: "q02", text: "Se il servizio al ristorante è cattivo, non ho problemi a farlo notare apertamente." },
  { id: "q03", text: "Se so che qualcuno ha diffuso voci su di me, sento il bisogno di affrontarlo." },
  { id: "q04", text: "Sento il bisogno di essere il migliore in ogni cosa; anche un gioco banale diventa una sfida." },
  { id: "q05", text: "Se vedo un'opportunità la colgo sempre, anche oltre le mie capacità; preferisco rischiare." },
  { id: "q06", text: "Se non riesco al primo colpo, significa solo che devo lavorare più duramente: ce la farò." },
  { id: "q07", text: "Sono sempre stato agile e veloce, fin da piccolo." },
  { id: "q08", text: "Nel traffico preferisco una deviazione piuttosto che stare in coda, anche se ci metto di più." },
  { id: "q09", text: "In attesa di un appuntamento devo tenermi impegnato: non riesco a stare fermo a far nulla." },
  { id: "q10", text: "Riesco a leggere con musica in sottofondo e trattenere le informazioni." },
  { id: "q11", text: "Quando parlo, spesso cambio argomento a metà conversazione." },
  { id: "q12", text: "Ho bisogno di nuove esperienze o attività spesso, altrimenti mi annoio." },
  { id: "q13", text: "In una conversazione dico spesso \"anch'io\", \"la penso uguale\", \"so cosa intendi\"." },
  { id: "q14", text: "Odio prendere decisioni: preferisco che altri scelgano film o ristorante." },
  { id: "q15", text: "In situazioni adrenaliniche divento la versione \"alfa\" di me: più sicuro e carismatico." },
  { id: "q16", text: "Rimando le cose fino all'ultimo (procrastino) ed è così che lavoro meglio." },
  { id: "q17", text: "Senza fretta o pressione sono pigro, ma quando le cose si muovono divento molto produttivo." },
  { id: "q18", text: "Sto attento a non ferire i sentimenti degli altri, anche quando la parte offesa sono io." },
  { id: "q19", text: "Sono una persona emotiva: le mie reazioni sono facili e intense (positive o negative)." },
  { id: "q20", text: "Preferisco attività che conosco e mi piacciono piuttosto che provare cose nuove." },
  { id: "q21", text: "Ho un cibo preferito che potrei mangiare tutto il giorno." },
  { id: "q22", text: "Ho bisogno di sentirmi desiderato, amato e apprezzato per stare bene." },
  { id: "q23", text: "Ho spesso conversazioni negative con me stesso (\"non sono bravo\", \"non valgo\")." },
  { id: "q24", text: "Do molto peso a ciò che gli altri pensano di me." },
  { id: "q25", text: "Prendo decisioni basate sui fatti, non su emozioni e istinto." },
  { id: "q26", text: "Non amo attività con fattori di rischio troppo alti." },
  { id: "q27", text: "Mi preoccupo molto per cose che potrebbero andare male in futuro." },
  { id: "q28", text: "Preferisco passare il tempo libero da solo (leggere, tv, gaming) piuttosto che uscire." },
  { id: "q29", text: "Se il successo non arriva subito, mi sta bene un percorso più graduale e lento." },
  { id: "q30", text: "Faccio fatica ad addormentarmi perché non riesco a \"spegnere\" il cervello." },
];

const OPTIONS: { letter: "A" | "B" | "C" | "D" | "E"; label: string }[] = [
  { letter: "A", label: "Mi descrive molto bene (quasi sempre)" },
  { letter: "B", label: "Mi descrive bene (la maggior parte delle volte)" },
  { letter: "C", label: "In parte (poco più della metà)" },
  { letter: "D", label: "Non molto (meno della metà)" },
  { letter: "E", label: "Non mi descrive affatto" },
];

export const NEUROTYPE_IDS = QUESTIONS.map((q) => q.id);

export function isNeurotypeValid(n: Neurotype): { ok: boolean; message: string } {
  for (const q of QUESTIONS) {
    if (!n[q.id]) {
      return {
        ok: false,
        message: `Rispondi a tutte le 30 affermazioni (mancante: ${q.id.replace("q", "n. ")}).`,
      };
    }
  }
  return { ok: true, message: "" };
}

export function Step8Neurotype({ value, onChange }: Props) {
  const set = (id: string, letter: string) => onChange({ ...value, [id]: letter });

  return (
    <div className="space-y-6">
      <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        Leggi ogni affermazione e scegli quanto ti descrive. Non ci sono risposte
        giuste o sbagliate: rispondi d'istinto.
      </p>

      <ol className="space-y-6">
        {QUESTIONS.map((q, idx) => (
          <li key={q.id} className="space-y-3 rounded-lg border border-border p-4">
            <Label className="block text-sm font-medium leading-snug text-foreground">
              <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
              {q.text}
            </Label>
            <RadioGroup
              value={value[q.id] ?? ""}
              onValueChange={(v) => set(q.id, v)}
              className="grid gap-2"
            >
              {OPTIONS.map((opt) => {
                const inputId = `${q.id}_${opt.letter}`;
                return (
                  <div key={opt.letter} className="flex items-start gap-2">
                    <RadioGroupItem id={inputId} value={opt.letter} className="mt-0.5" />
                    <Label
                      htmlFor={inputId}
                      className="text-sm font-normal leading-snug text-foreground"
                    >
                      <span className="mr-1 font-semibold">{opt.letter}.</span>
                      {opt.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </li>
        ))}
      </ol>
    </div>
  );
}
