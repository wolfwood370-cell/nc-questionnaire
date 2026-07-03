import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProgressBar } from "./ProgressBar";
import { Step0Consents } from "./steps/Step0Consents";
import { PlaceholderStep } from "./steps/PlaceholderStep";
import { emptyConsents, type Consents, type IntakePayload } from "@/lib/intake-types";
import { supabase } from "@/lib/supabase";

type StepDef = {
  key: string;
  title: string;
  render: () => JSX.Element;
  isValid: () => boolean;
  invalidMessage?: string;
};

export function IntakeForm() {
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const showNutrition = consents.nutrition_advice;

  const steps: StepDef[] = useMemo(() => {
    const list: StepDef[] = [
      {
        key: "consents",
        title: "Consensi",
        render: () => <Step0Consents value={consents} onChange={setConsents} />,
        isValid: () => consents.data_processing && consents.not_a_doctor,
        invalidMessage:
          "Devi accettare i due consensi obbligatori per proseguire (trattamento dati salute e presa d'atto).",
      },
      {
        key: "anagrafica",
        title: "Anagrafica e contatti",
        render: () => <PlaceholderStep title="Anagrafica e contatti" />,
        isValid: () => true,
      },
      {
        key: "salute",
        title: "Salute e sicurezza (PAR-Q+)",
        render: () => <PlaceholderStep title="Salute e sicurezza (PAR-Q+)" />,
        isValid: () => true,
      },
      {
        key: "corpo",
        title: "Corpo e obiettivo",
        render: () => <PlaceholderStep title="Corpo e obiettivo" />,
        isValid: () => true,
      },
      {
        key: "stile",
        title: "Stile di vita",
        render: () => <PlaceholderStep title="Stile di vita" />,
        isValid: () => true,
      },
      {
        key: "allenamento",
        title: "Allenamento",
        render: () => <PlaceholderStep title="Allenamento" />,
        isValid: () => true,
      },
    ];
    if (showNutrition) {
      list.push({
        key: "nutrizione",
        title: "Nutrizione",
        render: () => (
          <PlaceholderStep
            title="Nutrizione"
            note="Sezione visibile perché hai dato il consenso ai consigli alimentari."
          />
        ),
        isValid: () => true,
      });
    }
    list.push({
      key: "logistica",
      title: "Gestione e logistica",
      render: () => <PlaceholderStep title="Gestione e logistica" />,
      isValid: () => true,
    });
    list.push({
      key: "neurotipo",
      title: "Neurotipo",
      render: () => (
        <PlaceholderStep
          title="Neurotipo"
          note="30 affermazioni con scala A–E: in arrivo."
        />
      ),
      isValid: () => true,
    });
    return list;
  }, [consents, showNutrition]);

  const total = steps.length;
  const safeIndex = Math.min(stepIndex, total - 1);
  const current = steps[safeIndex];
  const isLast = safeIndex === total - 1;

  const goNext = () => {
    if (!current.isValid()) {
      toast.error(current.invalidMessage ?? "Completa i campi richiesti prima di proseguire.");
      return;
    }
    setStepIndex((i) => Math.min(i + 1, total - 1));
  };
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    if (!consents.data_processing || !consents.not_a_doctor) {
      toast.error("Consensi obbligatori mancanti: non è possibile inviare il questionario.");
      setStepIndex(0);
      return;
    }
    setSubmitting(true);
    try {
      const payload: IntakePayload = {
        submission: { consents },
        health: {},
        nutrition: showNutrition ? {} : {},
        neurotype: {},
      };
      const { error } = await supabase.rpc("submit_intake", { payload });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? `Invio non riuscito: ${err.message}`
          : "Invio non riuscito. Riprova più tardi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Grazie!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ho ricevuto le tue risposte. Ti ricontatterò al più presto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Questionario d'ingresso
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
          {current.title}
        </h1>
      </header>

      <ProgressBar current={safeIndex} total={total} />

      <main className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
        {current.render()}
      </main>

      <nav className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={safeIndex === 0 || submitting}
        >
          Indietro
        </Button>
        {isLast ? (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Invio in corso…" : "Invia questionario"}
          </Button>
        ) : (
          <Button type="button" onClick={goNext} disabled={submitting}>
            Avanti
          </Button>
        )}
      </nav>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        I tuoi dati vengono trattati secondo le finalità indicate nei consensi.
      </p>
    </div>
  );
}
