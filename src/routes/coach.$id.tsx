import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeAge,
  fmtBool,
  fmtDate,
  fmtDateTime,
  fmtEnum,
  fmtNumber,
  fmtText,
  STATUS_LABEL,
  type StatusValue,
} from "@/lib/coach-labels";
import { NEURO_QUESTIONS } from "@/components/intake/steps/Step8Neurotype";
import { PARQ_QUESTIONS } from "@/components/intake/steps/Step2Health";
import { PARQ_KEYS, neuroKey, NEURO_TOTAL } from "@/lib/intake-types";

export const Route = createFileRoute("/coach/$id")({
  ssr: false,
  component: CoachDetailPage,
});

type Detail = {
  id: string;
  created_at: string;
  status: StatusValue;
  // anagrafica
  full_name: string | null;
  email: string | null;
  phone: string | null;
  sex: string | null;
  pronoun: string | null;
  birth_date: string | null;
  // consensi
  consent_health: boolean | null;
  consent_disclaimer: boolean | null;
  consent_nutrition: boolean | null;
  consent_photos: boolean | null;
  consent_share_medical: boolean | null;
  consent_marketing: boolean | null;
  consent_version: string | null;
  consented_at: string | null;
  // sez.3
  height_cm: number | null;
  weight_kg: number | null;
  weight_history: string | null;
  weight_target: string | null;
  main_goal: string | null;
  aesthetic_goal: string | null;
  deadline_event: string | null;
  movement_goal: string | null;
  // sez.4
  work_desc: string | null;
  stress_level: string | null;
  sleep_hours: string | null;
  sleep_quality: string | null;
  neat_steps: string | null;
  water_liters: string | null;
  alcohol_week: string | null;
  smoking: string | null;
  lifestyle_goal: string | null;
  // sez.5
  sports_history: string | null;
  current_sport: string | null;
  favorite_activity: string | null;
  barbell_experience: string | null;
  experience_level: string | null;
  workload: string | null;
  recovery_capacity: string | null;
  max_days_week: string | null;
  session_minutes: string | null;
  equipment: string | null;
  recent_maxes: string | null;
  // sez.7
  work_mode: string | null;
  availability: string | null;
  why_now: string | null;
  past_coaching: string | null;
  foreseen_obstacles: string | null;
  success_definition: string | null;
  support_network: string | null;
  // relazioni
  health_screening: HealthRow | HealthRow[] | null;
  nutrition: NutritionRow | NutritionRow[] | null;
  neurotype_answers: NeuroAnswersRow | NeuroAnswersRow[] | null;
  neurotype_result: NeuroResultRow | NeuroResultRow[] | null;
};

type HealthRow = {
  parq_heart: boolean | null;
  parq_chest_pain: boolean | null;
  parq_balance: boolean | null;
  parq_other_chronic: boolean | null;
  parq_meds: boolean | null;
  parq_msk: boolean | null;
  parq_supervised: boolean | null;
  conditions_meds: string | null;
  pain_now: boolean | null;
  pain_where: string | null;
  past_injuries: string | null;
  pregnancy: string | null;
  cycle_status: string | null;
  cycle_since: string | null;
  safety_allergy: boolean | null;
  safety_allergy_detail: string | null;
};

type NutritionRow = {
  diet_assessment: string | null;
  meals_desc: string | null;
  diet_history: string | null;
  foods_love_avoid: string | null;
  intolerances: string | null;
  who_cooks: string | null;
  supplements: string | null;
};

type NeuroAnswersRow = Record<string, string | null>;

type NeuroResultRow = {
  score_1a: number | null;
  score_1b: number | null;
  score_2a: number | null;
  score_2b: number | null;
  score_3: number | null;
  primary_type: string | null;
  secondary_type: string | null;
  margin: number | null;
  scored_at: string | null;
  notes: string | null;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b py-2 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>{children}</dl>
      </CardContent>
    </Card>
  );
}

const NEURO_BLOCKS: { label: string; from: number; to: number }[] = [
  { label: "Tipo 1A", from: 1, to: 6 },
  { label: "Tipo 1B", from: 7, to: 12 },
  { label: "Tipo 2A", from: 13, to: 18 },
  { label: "Tipo 2B", from: 19, to: 24 },
  { label: "Tipo 3", from: 25, to: 30 },
];

function CoachDetailPage() {
  const { id } = useParams({ from: "/coach/$id" });
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["coach", "submission", id],
    queryFn: async (): Promise<Detail | null> => {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "*, health_screening(*), nutrition(*), neurotype_answers(*), neurotype_result(*)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Detail | null;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: StatusValue) => {
      const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      toast.success(`Stato aggiornato: ${STATUS_LABEL[status]}`);
      qc.invalidateQueries({ queryKey: ["coach", "submission", id] });
      qc.invalidateQueries({ queryKey: ["coach", "submissions"] });
    },
    onError: () => {
      toast.error("Aggiornamento non riuscito. Riprova.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/coach">← Torna all'elenco</Link>
        </Button>
        <Alert>
          <AlertTitle>Questionario non trovato</AlertTitle>
          <AlertDescription>
            Il questionario richiesto non esiste o non è accessibile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const health = one(data.health_screening);
  const nutrition = one(data.nutrition);
  const neuroAns = one(data.neurotype_answers);
  const neuroRes = one(data.neurotype_result);
  const age = computeAge(data.birth_date);
  const painGate = health?.pain_now === true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link to="/coach">← Torna all'elenco</Link>
        </Button>
      </div>

      {painGate ? (
        <Alert variant="destructive">
          <AlertTitle>Attenzione: dolore riferito</AlertTitle>
          <AlertDescription>
            La persona ha indicato dolore in corso. Valuta questo aspetto prima di procedere.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{data.full_name || "—"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl>
            <Row label="Email" value={fmtText(data.email)} />
            <Row label="Telefono" value={fmtText(data.phone)} />
            <Row label="Data invio" value={fmtDateTime(data.created_at)} />
            <Row label="Sesso biologico" value={fmtEnum("sex", data.sex)} />
            <Row label="Pronome" value={fmtEnum("pronoun", data.pronoun)} />
            <Row
              label="Data di nascita"
              value={
                <>
                  {fmtDate(data.birth_date)}
                  {age !== null ? <span className="text-muted-foreground"> ({age} anni)</span> : null}
                </>
              }
            />
          </dl>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <span className="text-sm font-medium">Stato:</span>
            <Badge variant="outline">{STATUS_LABEL[data.status]}</Badge>
            <Select
              value={data.status}
              onValueChange={(v) => statusMutation.mutate(v as StatusValue)}
              disabled={statusMutation.isPending}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nuovo</SelectItem>
                <SelectItem value="reviewed">Visto</SelectItem>
                <SelectItem value="archived">Archiviato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Section title="Consensi (Sez. 0)">
        <Row label="Trattamento dati salute" value={fmtBool(data.consent_health)} />
        <Row label="Presa d'atto (disclaimer)" value={fmtBool(data.consent_disclaimer)} />
        <Row label="Suggerimenti alimentari" value={fmtBool(data.consent_nutrition)} />
        <Row label="Foto e misurazioni" value={fmtBool(data.consent_photos)} />
        <Row
          label="Condivisione con professionisti sanitari"
          value={fmtBool(data.consent_share_medical)}
        />
        <Row label="Comunicazioni non essenziali" value={fmtBool(data.consent_marketing)} />
        <Row label="Versione consenso" value={fmtText(data.consent_version)} />
        <Row label="Data consenso" value={fmtDateTime(data.consented_at)} />
      </Section>

      <Section title="Corpo e obiettivo (Sez. 3)">
        <Row label="Altezza" value={fmtNumber(data.height_cm, "cm")} />
        <Row label="Peso" value={fmtNumber(data.weight_kg, "kg")} />
        <Row label="Storia del peso" value={fmtText(data.weight_history)} />
        <Row label="Peso obiettivo" value={fmtText(data.weight_target)} />
        <Row label="Obiettivo principale" value={fmtText(data.main_goal)} />
        <Row label="Obiettivo estetico" value={fmtText(data.aesthetic_goal)} />
        <Row label="Scadenza / evento" value={fmtText(data.deadline_event)} />
        <Row label="Obiettivo di movimento" value={fmtText(data.movement_goal)} />
      </Section>

      <Section title="Stile di vita (Sez. 4)">
        <Row label="Lavoro" value={fmtText(data.work_desc)} />
        <Row label="Livello di stress" value={fmtEnum("stress_level", data.stress_level)} />
        <Row label="Ore di sonno" value={fmtText(data.sleep_hours)} />
        <Row label="Qualità del sonno" value={fmtEnum("sleep_quality", data.sleep_quality)} />
        <Row label="Passi quotidiani (NEAT)" value={fmtEnum("neat_steps", data.neat_steps)} />
        <Row label="Acqua (litri/giorno)" value={fmtText(data.water_liters)} />
        <Row label="Alcol (settimana)" value={fmtText(data.alcohol_week)} />
        <Row label="Fumo" value={fmtText(data.smoking)} />
        <Row label="Obiettivo di stile di vita" value={fmtText(data.lifestyle_goal)} />
      </Section>

      <Section title="Allenamento (Sez. 5)">
        <Row label="Storia sportiva" value={fmtText(data.sports_history)} />
        <Row label="Sport attuale" value={fmtText(data.current_sport)} />
        <Row label="Attività preferita" value={fmtText(data.favorite_activity)} />
        <Row label="Esperienza con bilanciere" value={fmtText(data.barbell_experience)} />
        <Row label="Livello di esperienza" value={fmtEnum("experience_level", data.experience_level)} />
        <Row label="Carico di lavoro" value={fmtEnum("workload", data.workload)} />
        <Row
          label="Capacità di recupero"
          value={fmtEnum("recovery_capacity", data.recovery_capacity)}
        />
        <Row label="Giorni max / settimana" value={fmtText(data.max_days_week)} />
        <Row label="Durata sessione (min)" value={fmtText(data.session_minutes)} />
        <Row label="Dove si allena / attrezzatura" value={fmtText(data.equipment)} />
        <Row label="Massimali recenti" value={fmtText(data.recent_maxes)} />
      </Section>

      <Section title="Gestione e logistica (Sez. 7)">
        <Row label="Modalità di lavoro" value={fmtEnum("work_mode", data.work_mode)} />
        <Row label="Disponibilità" value={fmtText(data.availability)} />
        <Row label="Perché ora" value={fmtText(data.why_now)} />
        <Row label="Coaching passati" value={fmtText(data.past_coaching)} />
        <Row label="Ostacoli previsti" value={fmtText(data.foreseen_obstacles)} />
        <Row label="Definizione di successo" value={fmtText(data.success_definition)} />
        <Row label="Rete di supporto" value={fmtText(data.support_network)} />
      </Section>

      <Card className="border-amber-300 bg-amber-50/40">
        <CardHeader>
          <CardTitle className="text-base">
            Salute e sicurezza — PAR-Q+ (Sez. 2)
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Dati sensibili — art. 9 GDPR
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {health ? (
            <dl>
              {PARQ_KEYS.map((k) => (
                <Row key={k} label={PARQ_QUESTIONS[k]} value={fmtBool(health[k])} />
              ))}
              <Row label="Condizioni / farmaci" value={fmtText(health.conditions_meds)} />
              <Row label="Dolore in questo momento?" value={fmtBool(health.pain_now)} />
              <Row label="Dove" value={fmtText(health.pain_where)} />
              <Row label="Infortuni / operazioni passati" value={fmtText(health.past_injuries)} />
              <Row label="Gravidanza / post-partum" value={fmtEnum("pregnancy", health.pregnancy)} />
              <Row label="Ciclo mestruale" value={fmtEnum("cycle_status", health.cycle_status)} />
              <Row label="Ciclo — da quando" value={fmtText(health.cycle_since)} />
              <Row label="Allergie / reazioni gravi" value={fmtBool(health.safety_allergy)} />
              <Row label="Dettagli allergie" value={fmtText(health.safety_allergy_detail)} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Nessun dato di screening disponibile.</p>
          )}
        </CardContent>
      </Card>

      {nutrition ? (
        <Section title="Nutrizione (Sez. 6)">
          <Row
            label="Autovalutazione dieta"
            value={fmtEnum("diet_assessment", nutrition.diet_assessment)}
          />
          <Row label="Pasti tipici" value={fmtText(nutrition.meals_desc)} />
          <Row label="Storia dietetica" value={fmtText(nutrition.diet_history)} />
          <Row label="Cibi amati / da evitare" value={fmtText(nutrition.foods_love_avoid)} />
          <Row label="Intolleranze" value={fmtText(nutrition.intolerances)} />
          <Row label="Chi cucina" value={fmtText(nutrition.who_cooks)} />
          <Row label="Integratori" value={fmtText(nutrition.supplements)} />
        </Section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neurotipo (Sez. 8)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Risultato</h3>
            {neuroRes ? (
              <dl>
                <Row label="Tipo primario" value={fmtText(neuroRes.primary_type)} />
                <Row label="Tipo secondario" value={fmtText(neuroRes.secondary_type)} />
                <Row label="Margine" value={fmtText(neuroRes.margin)} />
                <Row label="Score 1A" value={fmtText(neuroRes.score_1a)} />
                <Row label="Score 1B" value={fmtText(neuroRes.score_1b)} />
                <Row label="Score 2A" value={fmtText(neuroRes.score_2a)} />
                <Row label="Score 2B" value={fmtText(neuroRes.score_2b)} />
                <Row label="Score 3" value={fmtText(neuroRes.score_3)} />
                <Row label="Calcolato il" value={fmtDateTime(neuroRes.scored_at)} />
                <Row label="Note" value={fmtText(neuroRes.notes)} />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Non ancora calcolato.</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Risposte grezze (scala A–E)</h3>
            {neuroAns ? (
              <div className="space-y-4">
                {NEURO_BLOCKS.map((b) => (
                  <div key={b.label}>
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {b.label} — domande {b.from}–{b.to}
                    </h4>
                    <dl>
                      {Array.from({ length: b.to - b.from + 1 }, (_, i) => {
                        const n = b.from + i;
                        const k = neuroKey(n);
                        return (
                          <Row
                            key={k}
                            label={`${String(n).padStart(2, "0")}. ${NEURO_QUESTIONS[n - 1]}`}
                            value={fmtText(neuroAns[k])}
                          />
                        );
                      })}
                    </dl>
                  </div>
                ))}
                {/* safety: se cambia il totale, mostra comunque le extra */}
                {NEURO_TOTAL !== 30 ? (
                  <p className="text-xs text-muted-foreground">
                    Attenzione: il totale domande atteso è cambiato ({NEURO_TOTAL}).
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nessuna risposta registrata.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
