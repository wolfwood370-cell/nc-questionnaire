import { useMemo, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProgressBar } from "./ProgressBar";
import { Step0Consents } from "./steps/Step0Consents";
import { Step1Personal, isPersonalValid } from "./steps/Step1Personal";
import { Step2Health, isHealthValid } from "./steps/Step2Health";
import { Step3Goals } from "./steps/Step3Goals";
import { Step4Lifestyle } from "./steps/Step4Lifestyle";
import { Step5Training } from "./steps/Step5Training";
import { PlaceholderStep } from "./steps/PlaceholderStep";
import {
  emptyConsents,
  emptyGoals,
  emptyHealth,
  emptyLifestyle,
  emptyPersonal,
  emptyTraining,
  type Consents,
  type Goals,
  type Health,
  type IntakePayload,
  type Lifestyle,
  type Personal,
  type Training,
} from "@/lib/intake-types";
import { isGoalsValid, isLifestyleValid, isTrainingValid } from "@/lib/intake-types";
import { supabase } from "@/lib/supabase";

type StepDef = {
  key: string;
  title: string;
  render: () => ReactElement;
  isValid: () => boolean;
  invalidMessage?: string;
};

export function IntakeForm() {
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [personal, setPersonal] = useState<Personal>(emptyPersonal);
  const [health, setHealth] = useState<Health>(emptyHealth);
  const [goals, setGoals] = useState<Goals>(emptyGoals);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(emptyLifestyle);
  const [training, setTraining] = useState<Training>(emptyTraining);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const showNutrition = consents.consent_nutrition;

  const steps: StepDef[] = useMemo(() => {
    const list: StepDef[] = [
      {
        key: "consents",
        title: "Consensi",
        render: () => <Step0Consents value={consents} onChange={setConsents} />,
        isValid: () => consents.consent_health && consents.consent_disclaimer,
        invalidMessage:
          "Devi accettare i due consensi obbligatori per proseguire (trattamento dati salute e presa d'atto).",
      },
      {
        key: "anagrafica",
        title: "Anagrafica e contatti",
        render: () => <Step1Personal value={personal} onChange={setPersonal} />,
        isValid: () => isPersonalValid(personal).ok,
        invalidMessage: isPersonalValid(personal).message,
      },
      {
        key: "salute",
        title: "Salute e sicurezza (PAR-Q+)",
        render: () => (
          <Step2Health value={health} sex={personal.sex} onChange={setHealth} />
        ),
        isValid: () => isHealthValid(health, personal.sex).ok,
        invalidMessage: isHealthValid(health, personal.sex).message,
      },
      {
        key: "corpo",
        title: "Corpo e obiettivo",
        render: () => <Step3Goals value={goals} onChange={setGoals} />,
        isValid: () => isGoalsValid(goals).ok,
        invalidMessage: isGoalsValid(goals).message,
      },
      {
        key: "stile",
        title: "Stile di vita",
        render: () => <Step4Lifestyle value={lifestyle} onChange={setLifestyle} />,
        isValid: () => isLifestyleValid(lifestyle).ok,
        invalidMessage: isLifestyleValid(lifestyle).message,
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
  }, [consents, personal, health, goals, lifestyle, showNutrition]);

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
    if (!consents.consent_health || !consents.consent_disclaimer) {
      toast.error("Consensi obbligatori mancanti: non è possibile inviare il questionario.");
      setStepIndex(0);
      return;
    }
    setSubmitting(true);
    try {
      const payload: IntakePayload = {
        submission: { ...personal, consents },
        health: { ...health },
        goals: { ...goals },
        lifestyle: { ...lifestyle },
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
