import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { ErrMsg, PillButton } from "./controls";
import { TurnstileWidget } from "./TurnstileWidget";
import { Step0Consents } from "./steps/Step0Consents";
import { Step1Personal } from "./steps/Step1Personal";
import { Step2Health, PARQ_QUESTIONS } from "./steps/Step2Health";
import { Step3Goals } from "./steps/Step3Goals";
import { Step4Lifestyle } from "./steps/Step4Lifestyle";
import { Step5Training } from "./steps/Step5Training";
import { Step6Nutrition } from "./steps/Step6Nutrition";
import { Step7Logistics } from "./steps/Step7Logistics";
import { Step8Neurotype } from "./steps/Step8Neurotype";
import { clearDraft, loadDraft, saveDraft, type IntakeDraft } from "@/lib/intake-draft";
import {
  buildHealthPayload,
  consentsErrors,
  emptyConsents,
  emptyGoals,
  emptyHealth,
  emptyLifestyle,
  emptyLogistics,
  emptyNutrition,
  emptyPersonal,
  emptyTraining,
  ENUM_LABELS,
  goalsErrors,
  healthErrors,
  lifestyleErrors,
  logisticsErrors,
  NEURO_PAGES,
  NEURO_TOTAL,
  neuroKey,
  neurotypeErrors,
  neurotypePageErrors,
  nutritionErrors,
  PARQ_KEYS,
  personalErrors,
  trainingErrors,
  type Consents,
  type FieldErrors,
  type Goals,
  type Health,
  type IntakePayload,
  type Lifestyle,
  type Logistics,
  type Neurotype,
  type Nutrition,
  type Personal,
  type Training,
} from "@/lib/intake-types";
import { supabase } from "@/lib/supabase";

const TRAINER_NAME = "Nicolò";

type Screen = "welcome" | "form" | "review" | "done";

type StepDef = {
  key: string;
  chip: string;
  title: string;
  eyebrow: string;
  desc: string;
  render: () => ReactElement;
  errors: () => FieldErrors;
};

function scrollTop() {
  try {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  } catch {
    /* vecchi browser: nessuno scroll animato */
  }
}

export function IntakeForm() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [neuroPage, setNeuroPage] = useState(0);
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [personal, setPersonal] = useState<Personal>(emptyPersonal);
  const [health, setHealth] = useState<Health>(emptyHealth);
  const [goals, setGoals] = useState<Goals>(emptyGoals);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(emptyLifestyle);
  const [training, setTraining] = useState<Training>(emptyTraining);
  const [nutrition, setNutrition] = useState<Nutrition>(emptyNutrition);
  const [logistics, setLogistics] = useState<Logistics>(emptyLogistics);
  const [neurotype, setNeurotype] = useState<Neurotype>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<IntakeDraft | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipFocus = useRef(true);

  const showNutrition = consents.consent_nutrition;
  const firstName = personal.full_name.trim().split(/\s+/)[0] ?? "";

  // ---------- bozza (solo localStorage del dispositivo) ----------
  useEffect(() => {
    setPendingDraft(loadDraft());
  }, []);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipPersist = useRef(true);
  useEffect(() => {
    // niente autosave su welcome/done; il primo giro dopo il mount/resume
    // non deve né salvare né lampeggiare "Salvato".
    if (screen !== "form" && screen !== "review") return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    saveDraft({
      consents,
      personal,
      health,
      goals,
      lifestyle,
      training,
      nutrition,
      logistics,
      neurotype,
      step: stepIndex,
      neuroPage,
      screen,
    });
    if (screen === "form") {
      setSavedFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setSavedFlash(false), 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consents, personal, health, goals, lifestyle, training, nutrition, logistics, neurotype]);

  useEffect(() => {
    if (screen !== "form" && screen !== "review") return;
    if (skipPersist.current) return;
    saveDraft({
      consents,
      personal,
      health,
      goals,
      lifestyle,
      training,
      nutrition,
      logistics,
      neurotype,
      step: stepIndex,
      neuroPage,
      screen,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, neuroPage, screen]);

  // ---------- validazione / errori inline ----------
  function updateSection<T extends Record<string, unknown>>(
    prev: T,
    setter: (v: T) => void,
  ): (next: T) => void {
    return (next) => {
      setter(next);
      setBannerError("");
      setFieldErrors((fe) => {
        const changed = Object.keys(next).filter((k) => next[k] !== prev[k]);
        if (!changed.length) return fe;
        const out = { ...fe };
        for (const k of changed) delete out[k];
        return out;
      });
    };
  }

  const steps: StepDef[] = useMemo(() => {
    const list: StepDef[] = [
      {
        key: "consensi",
        chip: "Consensi",
        title: "Consensi",
        eyebrow: "Prima di iniziare",
        desc: "Leggi e conferma ogni voce. Le due obbligatorie sono necessarie per inviare il questionario.",
        render: () => (
          <Step0Consents
            value={consents}
            onChange={updateSection(consents, setConsents)}
            errors={fieldErrors}
            trainerName={TRAINER_NAME}
          />
        ),
        errors: () => consentsErrors(consents),
      },
      {
        key: "anagrafica",
        chip: "Anagrafica",
        title: "Anagrafica e contatti",
        eyebrow: "Chi sei",
        desc: "I dati identificativi ci servono per gestire il tuo percorso.",
        render: () => (
          <Step1Personal
            value={personal}
            onChange={updateSection(personal, setPersonal)}
            errors={fieldErrors}
          />
        ),
        errors: () => personalErrors(personal),
      },
      {
        key: "salute",
        chip: "Salute",
        title: "Salute e sicurezza",
        eyebrow: "PAR-Q+",
        desc: "Rispondi con sincerità: servono per proporti un allenamento sicuro. Se hai dubbi, consulta il tuo medico.",
        render: () => (
          <Step2Health
            value={health}
            sex={personal.sex}
            onChange={updateSection(health, setHealth)}
            errors={fieldErrors}
          />
        ),
        errors: () => healthErrors(health, personal.sex),
      },
      {
        key: "obiettivo",
        chip: "Obiettivo",
        title: "Corpo e obiettivo",
        eyebrow: "Dove vuoi arrivare",
        desc: "Raccontami il punto di partenza e cosa vuoi ottenere.",
        render: () => (
          <Step3Goals
            value={goals}
            onChange={updateSection(goals, setGoals)}
            errors={fieldErrors}
          />
        ),
        errors: () => goalsErrors(goals),
      },
      {
        key: "stile",
        chip: "Stile di vita",
        title: "Stile di vita",
        eyebrow: "La tua giornata",
        desc: "Il contesto quotidiano incide molto sui risultati.",
        render: () => (
          <Step4Lifestyle
            value={lifestyle}
            onChange={updateSection(lifestyle, setLifestyle)}
            errors={fieldErrors}
          />
        ),
        errors: () => lifestyleErrors(lifestyle),
      },
      {
        key: "allenamento",
        chip: "Allenamento",
        title: "Allenamento",
        eyebrow: "La tua esperienza",
        desc: "Da dove parti con il movimento e i pesi.",
        render: () => (
          <Step5Training
            value={training}
            onChange={updateSection(training, setTraining)}
            errors={fieldErrors}
          />
        ),
        errors: () => trainingErrors(training),
      },
    ];
    if (showNutrition) {
      list.push({
        key: "nutrizione",
        chip: "Nutrizione",
        title: "Nutrizione",
        eyebrow: "A tavola",
        desc: "Visibile perché hai dato il consenso ai suggerimenti alimentari.",
        render: () => (
          <Step6Nutrition
            value={nutrition}
            onChange={updateSection(nutrition, setNutrition)}
            errors={fieldErrors}
          />
        ),
        errors: () => nutritionErrors(nutrition),
      });
    }
    list.push({
      key: "logistica",
      chip: "Logistica",
      title: "Gestione e logistica",
      eyebrow: "Come lavoriamo",
      desc: "Come organizzare al meglio il percorso insieme.",
      render: () => (
        <Step7Logistics
          value={logistics}
          onChange={updateSection(logistics, setLogistics)}
          errors={fieldErrors}
        />
      ),
      errors: () => logisticsErrors(logistics),
    });
    list.push({
      key: "neurotipo",
      chip: "Neurotipo",
      title: "Neurotipo",
      eyebrow: "Come funzioni",
      desc: "30 affermazioni in 5 brevi gruppi. Non ci sono risposte giuste o sbagliate: rispondi d'istinto.",
      render: () => (
        <Step8Neurotype
          value={neurotype}
          onChange={updateSection(neurotype, setNeurotype)}
          errors={fieldErrors}
          page={neuroPage}
        />
      ),
      errors: () => neurotypeErrors(neurotype),
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    consents,
    personal,
    health,
    goals,
    lifestyle,
    training,
    nutrition,
    logistics,
    neurotype,
    showNutrition,
    fieldErrors,
    neuroPage,
  ]);

  const total = steps.length;
  const safeIndex = Math.min(stepIndex, total - 1);
  const current = steps[safeIndex];
  const isNeuro = current.key === "neurotipo";

  // Sposta il focus sul titolo quando cambia schermata/sezione/gruppo:
  // chi usa screen reader o tastiera riparte dal contesto giusto.
  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, safeIndex, neuroPage]);

  // ---------- navigazione ----------
  const resume = () => {
    const d = pendingDraft;
    if (!d) return;
    setConsents(d.consents);
    setPersonal(d.personal);
    setHealth(d.health);
    setGoals(d.goals);
    setLifestyle(d.lifestyle);
    setTraining(d.training);
    setNutrition(d.nutrition);
    setLogistics(d.logistics);
    setNeurotype(d.neurotype);
    setStepIndex(d.step);
    setNeuroPage(d.neuroPage);
    setScreen(d.screen);
    setPendingDraft(null);
    setFieldErrors({});
    setBannerError("");
    skipPersist.current = true;
    scrollTop();
  };

  const resetAll = () => {
    setConsents(emptyConsents);
    setPersonal(emptyPersonal);
    setHealth(emptyHealth);
    setGoals(emptyGoals);
    setLifestyle(emptyLifestyle);
    setTraining(emptyTraining);
    setNutrition(emptyNutrition);
    setLogistics(emptyLogistics);
    setNeurotype({});
    setStepIndex(0);
    setNeuroPage(0);
    setFieldErrors({});
    setBannerError("");
    setTurnstileToken(null);
    setPendingDraft(null);
  };

  const startFresh = () => {
    clearDraft();
    resetAll();
    skipPersist.current = true;
    setScreen("form");
    scrollTop();
  };

  const restart = () => {
    clearDraft();
    resetAll();
    setScreen("welcome");
    scrollTop();
  };

  const goNext = () => {
    if (isNeuro) {
      const pe = neurotypePageErrors(neurotype, neuroPage);
      if (Object.keys(pe).length) {
        setFieldErrors(pe);
        setBannerError("Rispondi a tutte le affermazioni di questo gruppo.");
        return;
      }
      if (neuroPage < NEURO_PAGES - 1) {
        setNeuroPage((p) => p + 1);
        setFieldErrors({});
        setBannerError("");
        scrollTop();
        return;
      }
      setScreen("review");
      setFieldErrors({});
      setBannerError("");
      scrollTop();
      return;
    }
    const e = current.errors();
    if (Object.keys(e).length) {
      setFieldErrors(e);
      setBannerError("Controlla i campi evidenziati per proseguire.");
      return;
    }
    if (safeIndex >= total - 1) {
      setScreen("review");
    } else {
      if (steps[safeIndex + 1].key === "neurotipo") setNeuroPage(0);
      setStepIndex(safeIndex + 1);
    }
    setFieldErrors({});
    setBannerError("");
    scrollTop();
  };

  const goBack = () => {
    if (isNeuro && neuroPage > 0) {
      setNeuroPage((p) => p - 1);
    } else {
      setStepIndex((i) => Math.max(0, i - 1));
    }
    setFieldErrors({});
    setBannerError("");
    scrollTop();
  };

  const goto = (i: number) => {
    // i chip del rail saltano solo attraverso step già validi
    for (let j = 0; j < i; j++) {
      const e = steps[j].errors();
      if (Object.keys(e).length) {
        setStepIndex(j);
        setNeuroPage(0);
        setFieldErrors(e);
        setBannerError("Controlla i campi evidenziati per proseguire.");
        scrollTop();
        return;
      }
    }
    setStepIndex(i);
    if (steps[i].key === "neurotipo") setNeuroPage(0);
    setFieldErrors({});
    setBannerError("");
    scrollTop();
  };

  const editSection = (i: number) => {
    setScreen("form");
    setStepIndex(i);
    if (steps[i].key === "neurotipo") setNeuroPage(0);
    setFieldErrors({});
    setBannerError("");
    scrollTop();
  };

  const reviewBack = () => {
    setScreen("form");
    setStepIndex(total - 1);
    setNeuroPage(NEURO_PAGES - 1);
    setFieldErrors({});
    setBannerError("");
    scrollTop();
  };

  // ---------- submit (logica di sicurezza invariata) ----------
  const handleSubmit = async () => {
    // Rivalida TUTTI gli step prima dell'invio: senza questo controllo uno
    // step reso invalido tornando indietro verrebbe inviato lo stesso.
    for (let j = 0; j < steps.length; j++) {
      const e = steps[j].errors();
      if (Object.keys(e).length) {
        setScreen("form");
        setStepIndex(j);
        setNeuroPage(0);
        setFieldErrors(e);
        setBannerError("Controlla i campi evidenziati per proseguire.");
        scrollTop();
        return;
      }
    }
    if (!turnstileToken) {
      setBannerError("Completa la verifica anti-spam prima di inviare.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: IntakePayload = {
        submission: {
          ...consents,
          ...personal,
          ...goals,
          height_cm: parseFloat(goals.height_cm) || 0,
          weight_kg: parseFloat(goals.weight_kg) || 0,
          ...lifestyle,
          ...training,
          ...logistics,
        },
        health: buildHealthPayload(health, personal.sex),
        neurotype: { ...neurotype },
      };
      if (showNutrition) {
        payload.nutrition = { ...nutrition };
      }

      // L'unico ingresso pubblico è la Edge Function `submit-intake`, che
      // verifica il token Turnstile server-side prima di salvare.
      const { error } = await supabase.functions.invoke("submit-intake", {
        body: { payload, turnstileToken },
      });
      if (error) throw error;
      clearDraft();
      setScreen("done");
      setBannerError("");
      scrollTop();
    } catch (err) {
      // Non loggare né mostrare l'errore grezzo: può contenere dati salute
      // (art. 9 GDPR) provenienti dal payload (es. violazioni di CHECK).
      const status = err instanceof FunctionsHttpError ? err.context?.status : undefined;
      if (status === 403) {
        setBannerError("Verifica anti-spam non superata. Completa di nuovo la verifica e riprova.");
      } else if (status === 429) {
        setBannerError("Troppi tentativi ravvicinati. Attendi qualche minuto e riprova.");
      } else {
        setBannerError(
          "Invio non riuscito. Controlla la connessione e riprova; se il problema persiste, contattami direttamente.",
        );
      }
      // Il token Turnstile è monouso: dopo un tentativo fallito va rigenerato.
      setTurnstileToken(null);
      setTurnstileReset((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- riepilogo ----------
  const flat: Record<string, unknown> = {
    ...consents,
    ...personal,
    ...goals,
    ...lifestyle,
    ...training,
    ...nutrition,
    ...logistics,
  };

  const show = (key: string): string | null => {
    const v = flat[key];
    if (v === "" || v === null || v === undefined) return null;
    if (typeof v === "boolean") return v ? "Sì" : "No";
    const s = String(v);
    if (ENUM_LABELS[key]) return ENUM_LABELS[key][s] ?? s;
    return s;
  };

  const rows = (pairs: [string, string][]): [string, string][] =>
    pairs
      .map(([label, key]) => {
        const d = show(key);
        return d ? ([label, d] as [string, string]) : null;
      })
      .filter((r): r is [string, string] => r !== null);

  const summaryFor = (key: string): [string, string][] => {
    if (key === "consensi")
      return rows([
        ["Dati salute", "consent_health"],
        ["Suggerimenti alimentari", "consent_nutrition"],
        ["Foto/misurazioni", "consent_photos"],
        ["Condivisione sanitari", "consent_share_medical"],
        ["Comunicazioni", "consent_marketing"],
        ["Presa d'atto", "consent_disclaimer"],
      ]);
    if (key === "anagrafica")
      return rows([
        ["Nome", "full_name"],
        ["Sesso", "sex"],
        ["Pronome", "pronoun"],
        ["Data di nascita", "birth_date"],
        ["Telefono", "phone"],
        ["Email", "email"],
        ["Codice fiscale", "tax_code"],
        ["Indirizzo", "address"],
      ]);
    if (key === "salute") {
      const parqYes = PARQ_KEYS.filter((k) => health[k] === true).length;
      const r: [string, string][] = [["PAR-Q+ positive", `${parqYes} / 7`]];
      if (health.conditions_meds) r.push(["Condizioni/farmaci", health.conditions_meds]);
      if (health.pain_now !== null)
        r.push([
          "Dolore ora",
          health.pain_now ? `Sì${health.pain_where ? ` – ${health.pain_where}` : ""}` : "No",
        ]);
      if (health.past_injuries) r.push(["Infortuni passati", health.past_injuries]);
      if (health.pregnancy)
        r.push([
          "Gravidanza/post-partum",
          ENUM_LABELS.pregnancy[health.pregnancy] ?? health.pregnancy,
        ]);
      if (health.cycle_status)
        r.push([
          "Ciclo",
          `${ENUM_LABELS.cycle_status[health.cycle_status] ?? health.cycle_status}${
            health.cycle_since ? ` – ${health.cycle_since}` : ""
          }`,
        ]);
      if (health.safety_allergy !== null)
        r.push([
          "Allergie gravi",
          health.safety_allergy
            ? `Sì${health.safety_allergy_detail ? ` – ${health.safety_allergy_detail}` : ""}`
            : "No",
        ]);
      return r;
    }
    if (key === "obiettivo")
      return rows([
        ["Altezza", "height_cm"],
        ["Peso attuale", "weight_kg"],
        ["Storia del peso", "weight_history"],
        ["Target", "weight_target"],
        ["Obiettivo principale", "main_goal"],
        ["Estetica", "aesthetic_goal"],
        ["Scadenza/evento", "deadline_event"],
        ["Movimento", "movement_goal"],
      ]);
    if (key === "stile")
      return rows([
        ["Lavoro", "work_desc"],
        ["Stress", "stress_level"],
        ["Ore di sonno", "sleep_hours"],
        ["Qualità sonno", "sleep_quality"],
        ["Passi/NEAT", "neat_steps"],
        ["Acqua/giorno", "water_liters"],
        ["Alcol/sett", "alcohol_week"],
        ["Fumo", "smoking"],
        ["Da migliorare", "lifestyle_goal"],
      ]);
    if (key === "allenamento")
      return rows([
        ["Sport praticati", "sports_history"],
        ["Sport attuale", "current_sport"],
        ["Preferita", "favorite_activity"],
        ["Bilanciere/attrezzi", "barbell_experience"],
        ["Esperienza pesi", "experience_level"],
        ["Carico", "workload"],
        ["Recupero", "recovery_capacity"],
        ["Giorni max/sett", "max_days_week"],
        ["Minuti/sessione", "session_minutes"],
        ["Dove/attrezzatura", "equipment"],
        ["Massimali", "recent_maxes"],
      ]);
    if (key === "nutrizione")
      return rows([
        ["Dieta attuale", "diet_assessment"],
        ["Pasti", "meals_desc"],
        ["Diete passate", "diet_history"],
        ["Cibi ami/eviti", "foods_love_avoid"],
        ["Intolleranze", "intolerances"],
        ["Chi cucina", "who_cooks"],
        ["Integratori", "supplements"],
      ]);
    if (key === "logistica")
      return rows([
        ["Modalità", "work_mode"],
        ["Disponibilità", "availability"],
        ["Perché ora", "why_now"],
        ["Coaching passato", "past_coaching"],
        ["Ostacoli", "foreseen_obstacles"],
        ["Successo", "success_definition"],
        ["Supporto", "support_network"],
      ]);
    if (key === "neurotipo") {
      let answered = 0;
      for (let i = 1; i <= NEURO_TOTAL; i++) if (neurotype[neuroKey(i)]) answered++;
      return [["Affermazioni completate", `${answered} / 30`]];
    }
    return [];
  };

  // ---------- pezzi condivisi ----------
  const monogram = (size: number) => (
    <span
      aria-hidden="true"
      className="inline-flex flex-none items-center justify-center bg-brand font-display font-extrabold tracking-tight text-white shadow-[0_4px_14px_var(--brand-sh)]"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        fontSize: size * 0.4,
      }}
    >
      {TRAINER_NAME[0]?.toUpperCase() ?? "N"}
    </span>
  );

  const brandRow = (size: number) => (
    <div className="flex items-center gap-2.5">
      {monogram(size)}
      <div className="leading-[1.05]">
        <div className={cn("font-bold text-ink", size > 36 ? "text-[15px]" : "text-[13.5px]")}>
          {TRAINER_NAME}
        </div>
        <div className="text-[11.5px] text-faint">Personal Trainer</div>
      </div>
    </div>
  );

  const banner = bannerError ? (
    <div
      role="alert"
      className="mt-1 flex items-start gap-2.5 rounded-[14px] border border-danger bg-danger-soft px-3.5 py-3 motion-safe:animate-nc-fade"
    >
      <span aria-hidden="true" className="mt-px text-sm text-danger">
        ⚠
      </span>
      <p className="m-0 text-[13px] font-medium leading-[1.45] text-danger">{bannerError}</p>
    </div>
  ) : null;

  // ---------- schermate ----------
  if (screen === "welcome") {
    const bullets: [string, string][] = [
      ["≈ 10 minuti", "Il tempo medio per completarlo con calma."],
      ["Dati protetti", "Trattati secondo le finalità dei consensi (GDPR)."],
      ["Rispondi d'istinto", "Non ci sono risposte giuste o sbagliate."],
    ];
    return (
      <div className="flex w-full flex-col items-center">
        <div
          className="w-full max-w-[640px] pb-12 motion-safe:animate-nc-rise-slow"
          style={{ padding: "clamp(24px, 6vw, 56px) 20px 48px" }}
        >
          <div className="mb-10">{brandRow(44)}</div>

          {pendingDraft ? (
            <div className="mb-[26px] flex flex-col gap-3 rounded-[20px] border border-brand-bd bg-brand-soft px-5 py-[18px]">
              <div>
                <p className="mb-[3px] mt-0 text-sm font-bold text-brand-deep">
                  Hai una compilazione in sospeso
                </p>
                <p className="m-0 text-[13px] leading-normal text-sub">
                  Le tue risposte sono salvate su questo dispositivo. Vuoi riprendere da dove eri?
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <PillButton onClick={resume}>Riprendi</PillButton>
                <PillButton variant="outline" onClick={startFresh}>
                  Ricomincia da capo
                </PillButton>
              </div>
            </div>
          ) : null}

          <p className="mb-3.5 mt-0 text-[12.5px] font-bold uppercase tracking-[.12em] text-brand">
            Questionario d'ingresso
          </p>
          <h1
            className="mb-[18px] mt-0 font-display font-bold leading-[1.08] tracking-tight text-ink"
            style={{ fontSize: "clamp(32px, 7vw, 46px)" }}
          >
            Prepariamo il tuo percorso, insieme.
          </h1>
          <p className="mb-8 mt-0 max-w-[52ch] text-base leading-[1.6] text-sub">
            Queste domande mi permettono di conoscere il tuo punto di partenza — salute, obiettivi,
            abitudini — e di costruire un programma davvero su misura. Prenditi il tempo di
            rispondere con sincerità.
          </p>

          <div className="mb-[34px] grid gap-2.5">
            {bullets.map(([t, d]) => (
              <div
                key={t}
                className="flex items-start gap-[13px] rounded-[20px] border border-line bg-white px-[18px] py-4"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg border border-brand-bd bg-brand-soft text-[13px] font-bold text-brand"
                >
                  ✓
                </span>
                <div>
                  <div className="text-[14.5px] font-bold text-ink">{t}</div>
                  <div className="mt-0.5 text-[13px] leading-[1.45] text-sub">{d}</div>
                </div>
              </div>
            ))}
          </div>

          {pendingDraft ? null : (
            <PillButton size="lg" onClick={startFresh} className="w-full max-w-[280px]">
              Inizia il questionario &nbsp;→
            </PillButton>
          )}

          <p className="mb-0 mt-[22px] text-[12.5px] leading-normal text-faint">
            Le tue risposte vengono salvate automaticamente su questo dispositivo mentre compili. Il
            servizio ha finalità di benessere fisico, non mediche: {TRAINER_NAME} è un personal
            trainer e non sostituisce medico o nutrizionista.
          </p>
        </div>
      </div>
    );
  }

  if (screen === "done") {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="flex min-h-[80vh] w-full max-w-[520px] flex-col items-center justify-center px-6 py-10 text-center motion-safe:animate-nc-rise-slow">
          <div
            aria-hidden="true"
            className="mb-[26px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-brand text-[32px] text-white shadow-[0_10px_30px_var(--brand-sh)]"
          >
            ✓
          </div>
          <h1
            className="mb-3.5 mt-0 font-display font-bold tracking-tight text-ink"
            style={{ fontSize: "clamp(30px, 7vw, 40px)" }}
          >
            {firstName ? `Grazie, ${firstName}!` : "Grazie!"}
          </h1>
          <p className="mb-[30px] mt-0 max-w-[42ch] text-base leading-[1.6] text-sub">
            Ho ricevuto le tue risposte. Le leggerò con attenzione e ti ricontatterò al più presto
            per il prossimo passo insieme.
          </p>
          <PillButton variant="outline" onClick={restart}>
            Compila di nuovo
          </PillButton>
        </div>
      </div>
    );
  }

  if (screen === "review") {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="sticky top-0 z-[5] w-full border-b border-line bg-[var(--surface-blur-head)] backdrop-blur-[16px]">
          <div className="mx-auto flex w-full max-w-[660px] items-center gap-2.5 px-5 py-3">
            {brandRow(30)}
            <div className="ml-auto text-xs font-semibold text-faint">Riepilogo</div>
          </div>
        </div>

        <div className="w-full max-w-[660px] px-5 pb-[140px] pt-[26px] motion-safe:animate-nc-rise">
          <p className="mb-1.5 mt-0 text-xs font-bold uppercase tracking-[.1em] text-brand">
            Ultimo passo
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mb-2 mt-0 font-display font-bold leading-[1.12] tracking-tight text-ink outline-none"
            style={{ fontSize: "clamp(26px, 5.5vw, 34px)" }}
          >
            Rivedi le tue risposte
          </h2>
          <p className="mb-6 mt-0 max-w-[56ch] text-[14.5px] leading-[1.55] text-sub">
            Controlla che sia tutto corretto. Puoi modificare ogni sezione; quando sei pronto/a,
            invia il questionario.
          </p>

          <div className="mb-6 flex flex-col gap-3.5">
            {steps.map((s, i) => {
              const summary = summaryFor(s.key);
              return (
                <div
                  key={s.key}
                  className="rounded-[20px] border border-line bg-white px-5 py-[18px] shadow-[0_4px_20px_rgba(0,86,133,0.05)]"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between gap-2.5",
                      summary.length ? "mb-3" : "",
                    )}
                  >
                    <h3 className="m-0 font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
                      {s.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => editSection(i)}
                      className="cursor-pointer appearance-none rounded-full border border-line-2 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-brand"
                    >
                      Modifica
                    </button>
                  </div>
                  {summary.length ? (
                    <div className="flex flex-col gap-[9px]">
                      {summary.map(([label, val], ri) => (
                        <div
                          key={ri}
                          className="grid items-baseline gap-3"
                          style={{ gridTemplateColumns: "minmax(120px, 38%) 1fr" }}
                        >
                          <span className="text-[12.5px] font-semibold text-faint">{label}</span>
                          <span className="whitespace-pre-wrap break-words text-[13.5px] leading-normal text-ink">
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="m-0 text-[13px] text-faint">Nessuna risposta facoltativa.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-2">
              <p className="m-0 text-sm font-semibold text-ink">Verifica anti-spam</p>
              <TurnstileWidget onToken={setTurnstileToken} resetSignal={turnstileReset} />
            </div>
            {banner}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-[6] border-t border-line bg-[var(--surface-blur-foot)] backdrop-blur-[12px]">
          <div className="mx-auto flex w-full max-w-[660px] items-center gap-3 px-5 py-[13px]">
            <PillButton variant="outline" onClick={reviewBack} disabled={submitting}>
              Indietro
            </PillButton>
            <PillButton
              onClick={handleSubmit}
              disabled={submitting || !turnstileToken}
              className="ml-auto px-[30px]"
            >
              {submitting ? "Invio in corso…" : "Invia questionario"}
            </PillButton>
          </div>
        </div>
      </div>
    );
  }

  // ---------- screen === "form" ----------
  const unit = 100 / total;
  const pct = Math.round(
    isNeuro ? unit * safeIndex + unit * ((neuroPage + 1) / NEURO_PAGES) : unit * (safeIndex + 1),
  );
  const liveValid = Object.keys(current.errors()).length === 0;
  const remaining = total - (safeIndex + 1);
  const nextLabel = isNeuro
    ? neuroPage < NEURO_PAGES - 1
      ? "Avanti →"
      : "Rivedi le risposte →"
    : safeIndex === total - 1
      ? "Rivedi le risposte →"
      : "Avanti →";
  const showBack = !(safeIndex === 0 && !(isNeuro && neuroPage > 0));

  return (
    <div className="flex w-full flex-col items-center">
      <div className="sticky top-0 z-[5] w-full border-b border-line bg-[var(--surface-blur-head)] backdrop-blur-[16px]">
        <div className="mx-auto w-full max-w-[660px] px-5 pb-2.5 pt-3">
          <div className="mb-[11px] flex items-center gap-2.5">
            {brandRow(30)}
            <div className="ml-auto text-right leading-[1.25]">
              {firstName ? (
                <div className="text-[12.5px] font-bold text-brand">Ciao, {firstName}</div>
              ) : null}
              <div className="text-xs tabular-nums text-faint">
                Passo {safeIndex + 1} di {total}
              </div>
              <div className="text-[11px] text-faint" aria-live="polite">
                {savedFlash ? (
                  <span className="font-semibold text-ok">Salvato ✓</span>
                ) : remaining > 0 ? (
                  `Ancora ${remaining} ${remaining === 1 ? "sezione" : "sezioni"}`
                ) : (
                  "Ultima sezione"
                )}
              </div>
            </div>
          </div>
          <div className="mb-3 h-[5px] w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand motion-safe:transition-[width] motion-safe:duration-[350ms] motion-safe:ease-[cubic-bezier(.4,0,.2,1)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="nc-rail-scroll -mx-0.5 flex gap-[7px] overflow-x-auto pb-1 pt-0.5">
            {steps.map((s, i) => {
              const isDone = i < safeIndex;
              const here = i === safeIndex;
              return (
                <button
                  key={s.chip}
                  type="button"
                  onClick={() => goto(i)}
                  aria-current={here ? "step" : undefined}
                  className={cn(
                    "flex flex-none cursor-pointer appearance-none items-center gap-[7px] whitespace-nowrap rounded-full border py-[7px] pl-[9px] pr-3 text-[12.5px] transition-all duration-150",
                    here
                      ? "border-brand bg-brand font-bold text-white"
                      : isDone
                        ? "border-brand-bd bg-brand-soft font-medium text-brand-deep"
                        : "border-line-2 bg-white font-medium text-faint",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold",
                      here
                        ? "bg-white/20 text-white"
                        : isDone
                          ? "bg-brand text-white"
                          : "bg-line text-faint",
                    )}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  {s.chip}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        key={`step-${safeIndex}-${isNeuro ? neuroPage : 0}`}
        className="w-full max-w-[660px] px-5 pb-[130px] pt-[26px] motion-safe:animate-nc-rise"
      >
        <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
          <p className="m-0 text-xs font-bold uppercase tracking-[.1em] text-brand">
            {current.eyebrow}
          </p>
          {liveValid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ok-bg px-[9px] py-[3px] text-[11px] font-bold text-ok">
              ✓ Completo
            </span>
          ) : null}
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mb-2 mt-0 font-display font-bold leading-[1.12] tracking-tight text-ink outline-none"
          style={{ fontSize: "clamp(26px, 5.5vw, 34px)" }}
        >
          {current.title}
        </h2>
        <p className="mb-6 mt-0 max-w-[56ch] text-[14.5px] leading-[1.55] text-sub">
          {current.desc}
        </p>
        <div className="flex flex-col gap-4">{current.render()}</div>
        {banner}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[6] border-t border-line bg-[var(--surface-blur-foot)] backdrop-blur-[12px]">
        <div className="mx-auto flex w-full max-w-[660px] items-center gap-3 px-5 py-[13px]">
          <PillButton variant="outline" onClick={goBack} disabled={!showBack}>
            Indietro
          </PillButton>
          <div className="ml-auto text-[12.5px] font-semibold tabular-nums text-faint">{pct}%</div>
          <PillButton onClick={goNext} className="px-7">
            {nextLabel}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
