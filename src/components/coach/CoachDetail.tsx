import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ENUM_LABELS } from "@/lib/intake-types";
import {
  ageFrom,
  bmiOf,
  fmtDate,
  healthFlags,
  parqYesCount,
  type CoachClient,
  type HealthFlag,
} from "@/lib/coach-data";
import { Avatar, Monogram, Pill, RiskText, TRAINER_NAME } from "./coach-atoms";
import { NeurotypeCard } from "./NeurotypeCard";

// Dettaglio cliente dell'area coach: tutte le risposte del questionario,
// rischi di salute in evidenza, neurotipo, appunti privati e stampa/PDF.

type Props = {
  client: CoachClient;
  note: string;
  noteSaved: boolean;
  onNote: (val: string) => void;
  onBack: () => void;
};

type Row = [string, ReactNode];

/** Etichetta leggibile di un valore (enum → label; si/no/na → testo). */
function show(d: Record<string, string>, key: string): string | null {
  const v = d[key];
  if (v === undefined || v === "") return null;
  if (ENUM_LABELS[key]) return ENUM_LABELS[key][v] ?? v;
  if (v === "si") return "Sì";
  if (v === "no") return "No";
  if (v === "na") return "Non applicabile";
  return v;
}

function rowsOf(d: Record<string, string>, pairs: [string, string][]): Row[] {
  return pairs
    .map(([label, key]) => {
      const val = show(d, key);
      return val ? ([label, val] as Row) : null;
    })
    .filter((r): r is Row => r !== null);
}

function SectionCard({
  id,
  title,
  badge,
  badgeKind,
  pre,
  rows,
}: {
  id: string;
  title: string;
  badge?: string;
  badgeKind?: "soft" | "flag";
  pre?: ReactNode;
  rows: Row[];
}) {
  const hasBody = rows.length > 0 || !!pre;
  return (
    <div
      id={id}
      className="scroll-mt-[110px] rounded-[20px] border border-line bg-white px-5 py-[18px] shadow-[0_4px_20px_rgba(0,86,133,0.05)]"
    >
      <div className={cn("flex items-center gap-[9px]", hasBody ? "mb-[13px]" : "")}>
        <h3 className="m-0 font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
          {title}
        </h3>
        {badge ? <Pill kind={badgeKind ?? "soft"}>{badge}</Pill> : null}
      </div>
      {pre}
      {rows.length ? (
        <div className={cn("flex flex-col gap-2.5", pre ? "mt-3.5" : "")}>
          {rows.map(([label, val], i) => (
            <div
              key={i}
              className="grid items-baseline gap-3.5"
              style={{ gridTemplateColumns: "minmax(110px, 34%) 1fr" }}
            >
              <span className="text-[12.5px] font-semibold leading-[1.4] text-faint">{label}</span>
              <span className="whitespace-pre-wrap break-words text-sm leading-[1.55] text-ink">
                {val}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[13px] text-faint">Nessuna risposta.</p>
      )}
    </div>
  );
}

function FlagBanner({ flags }: { flags: HealthFlag[] }) {
  if (!flags.length) {
    return (
      <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(5,150,105,0.25)] bg-ok-bg px-[18px] py-[15px]">
        <span
          aria-hidden="true"
          className="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border border-[rgba(5,150,105,0.3)] bg-white text-[15px] font-bold text-ok"
        >
          ✓
        </span>
        <div>
          <p className="m-0 text-sm font-bold text-[#065f46]">Nessuna nota di salute segnalata</p>
          <p className="mb-0 mt-0.5 text-[12.5px] leading-[1.45] text-[#047857]">
            PAR-Q+ negativo, nessun dolore o allergia grave dichiarati. Valuta comunque il quadro
            completo.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] border border-danger bg-danger-soft px-5 py-[17px]">
      <div className="mb-[13px] flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] border border-danger-bd bg-white text-base text-danger"
        >
          ⚠
        </span>
        <div>
          <p className="m-0 font-display text-base font-bold tracking-[-0.01em] text-danger">
            Da valutare prima di programmare
          </p>
          <p className="mb-0 mt-px text-[12.5px] text-[#b91c1c]">
            {flags.length} {flags.length === 1 ? "elemento" : "elementi"} · rispondi con prudenza
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-[9px]">
        {flags.map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 h-2 w-2 flex-none rounded-full",
                f.level === "high" ? "bg-danger" : "bg-brand-deep",
              )}
            />
            <span
              className={cn(
                "text-[13.5px] leading-normal text-ink",
                f.level === "high" && "font-semibold",
              )}
            >
              {f.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeightViz({ d }: { d: Record<string, string> }) {
  const cur = parseFloat(d.weight_kg);
  const tm = (d.weight_target || "").match(/\d+(?:[.,]\d+)?/);
  const tgt = tm ? parseFloat(tm[0].replace(",", ".")) : null;
  if (!(cur > 0) || !(tgt !== null && tgt > 0)) return null;
  const lo = Math.min(cur, tgt);
  const hi = Math.max(cur, tgt);
  const pad = Math.max(4, (hi - lo) * 0.7);
  const min = lo - pad;
  const span = hi + pad - min || 1;
  const posC = ((cur - min) / span) * 100;
  const posT = ((tgt - min) / span) * 100;
  const delta = +(cur - tgt).toFixed(1);
  const label =
    delta > 0
      ? `−${Math.abs(delta)} kg da perdere`
      : delta < 0
        ? `+${Math.abs(delta)} kg da mettere`
        : "Già al target";

  const marker = (pos: number, val: number, kind: "attuale" | "target") => (
    <span
      key={kind}
      className="absolute top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos}%` }}
    >
      <span
        className={cn(
          "block h-[15px] w-[15px] rounded-full border-[2.5px] border-brand shadow-[0_1px_3px_var(--brand-sh)]",
          kind === "attuale" ? "bg-brand" : "bg-white",
        )}
      />
      <span
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold tabular-nums text-brand-deep"
        style={kind === "attuale" ? { top: 19 } : { bottom: 19 }}
      >
        {kind === "attuale" ? "Attuale" : "Target"} {val} kg
      </span>
    </span>
  );

  return (
    <div className="rounded-[14px] border border-brand-bd bg-brand-soft px-5 pb-[30px] pt-4">
      <div className="mb-[26px] flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-[.04em] text-brand-deep">
          Peso: attuale → target
        </span>
        <span
          className={cn(
            "text-[12.5px] font-bold tabular-nums",
            delta === 0 ? "text-ok" : "text-brand",
          )}
        >
          {label}
        </span>
      </div>
      <div className="relative mx-2 h-1.5 rounded-full border border-brand-bd bg-white">
        <span
          className="absolute top-0 h-1 rounded-full bg-brand opacity-[0.22]"
          style={{ left: `${Math.min(posC, posT)}%`, width: `${Math.abs(posC - posT)}%` }}
        />
        {marker(posT, tgt, "target")}
        {marker(posC, cur, "attuale")}
      </div>
    </div>
  );
}

/** Scroll robusto alle ancore con offset per la top bar sticky. */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - 110;
  try {
    window.scrollTo({ top: y, behavior: "smooth" });
  } catch {
    /* vecchi browser */
  }
  if (Math.abs(window.pageYOffset - y) > 4) window.scrollTo(0, y);
}

export function CoachDetail({ client, note, noteSaved, onNote, onBack }: Props) {
  const d = client.data;
  const flags = healthFlags(d);
  const age = ageFrom(d.birth_date);
  const bmi = bmiOf(d);
  const hasNutrition = d.consent_nutrition === "si";
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [client.id]);

  const anchors: [string, string][] = [
    ["s-salute", "Salute"],
    ["s-obiettivo", "Obiettivo"],
    ["s-stile", "Stile di vita"],
    ["s-allenamento", "Allenamento"],
    ...(hasNutrition ? ([["s-nutrizione", "Nutrizione"]] as [string, string][]) : []),
    ["s-logistica", "Logistica"],
    ["s-neuro", "Neurotipo"],
    ["s-anagrafica", "Anagrafica"],
  ];

  const healthRows: Row[] = (() => {
    const r: Row[] = [["PAR-Q+ positive", `${parqYesCount(d)} / 7`]];
    if (d.conditions_meds)
      r.push(["Condizioni / farmaci", <RiskText key="cm" text={d.conditions_meds} />]);
    r.push([
      "Dolore ora",
      d.pain_now === "si" ? (
        <RiskText key="pn" text={"Sì" + (d.pain_where ? " — " + d.pain_where : "")} />
      ) : (
        "No"
      ),
    ]);
    if (d.past_injuries)
      r.push(["Infortuni passati", <RiskText key="pi" text={d.past_injuries} />]);
    const pg = show(d, "pregnancy");
    if (pg) r.push(["Gravidanza / post-partum", pg]);
    const cy = show(d, "cycle_status");
    if (cy) r.push(["Ciclo mestruale", cy + (d.cycle_since ? " — " + d.cycle_since : "")]);
    r.push([
      "Allergie gravi",
      d.safety_allergy === "si" ? (
        <RiskText
          key="sa"
          text={"Sì" + (d.safety_allergy_detail ? " — " + d.safety_allergy_detail : "")}
        />
      ) : (
        "No"
      ),
    ]);
    return r;
  })();

  const highFlags = flags.filter((f) => f.level === "high").length;

  const factRow = (label: string, val: string | null) =>
    val ? (
      <div
        key={label}
        className="flex justify-between gap-3 border-t border-line py-[7px] text-[13px]"
      >
        <span className="font-semibold text-faint">{label}</span>
        <span className="text-right font-semibold text-ink">{val}</span>
      </div>
    ) : null;

  return (
    <div className="flex w-full flex-col items-center">
      {/* top bar */}
      <div className="coach-noprint sticky top-0 z-[5] w-full border-b border-line bg-[var(--surface-blur-head)] backdrop-blur-[16px]">
        <div className="mx-auto flex w-full max-w-[1080px] items-center gap-3 px-5 pb-2 pt-[11px]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer appearance-none items-center gap-[7px] rounded-full border border-line-2 bg-white px-[15px] py-2 text-[13.5px] font-semibold text-ink transition-colors duration-150 hover:bg-brand-soft"
          >
            <span aria-hidden="true">‹</span> Tutti i questionari
          </button>
          <div className="ml-auto flex items-center gap-[9px]">
            <Pill>Letto ✓</Pill>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer appearance-none items-center gap-[7px] rounded-full border-none bg-brand px-[17px] py-[9px] text-[13.5px] font-semibold text-white shadow-[0_4px_12px_var(--brand-sh)] transition-colors duration-150 hover:bg-brand-deep"
            >
              ⬇ Stampa / PDF
            </button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1080px] px-5 pb-[9px]">
          <div className="nc-rail-scroll flex items-center gap-[7px] overflow-x-auto pb-[3px] pt-px">
            <span className="mr-0.5 flex-none text-[11.5px] font-bold uppercase tracking-[.05em] text-faint">
              Vai a
            </span>
            {anchors.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="flex-none cursor-pointer appearance-none whitespace-nowrap rounded-full border border-line-2 bg-white px-[13px] py-1.5 text-[12.5px] font-semibold text-sub transition-all duration-150 hover:border-brand-bd hover:text-brand-deep"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1080px] px-5 pb-[90px] pt-[26px] motion-safe:animate-nc-rise">
        {/* header di stampa brandizzato */}
        <div className="coach-printonly mb-[18px] items-center justify-between border-b-2 border-brand pb-3">
          <div className="flex items-center gap-2.5">
            <Monogram size={34} />
            <div>
              <div className="font-display text-[15px] font-bold text-ink">{TRAINER_NAME}</div>
              <div className="text-[11px] text-faint">
                Personal Trainer · Questionario d'ingresso
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-ink">{client.name}</div>
            <div className="text-[11px] text-faint">Inviato il {fmtDate(client.submitted)}</div>
          </div>
        </div>

        {/* header cliente */}
        <div className="mb-[22px] flex flex-wrap items-start gap-4">
          <Avatar name={client.name} size={60} flagged={flags.length > 0} />
          <div className="min-w-0 flex-[1_1_auto]">
            <p className="mb-[3px] mt-0 text-xs font-bold uppercase tracking-[.1em] text-brand">
              Questionario d'ingresso
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mb-2 mt-0 font-display font-bold leading-[1.08] tracking-tight text-ink outline-none"
              style={{ fontSize: "clamp(26px, 4.5vw, 34px)" }}
            >
              {client.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-sub">
              {age !== null ? <span>{age} anni</span> : null}
              <span aria-hidden="true" className="text-line-2">
                ·
              </span>
              <span>{ENUM_LABELS.sex[d.sex] ?? "—"}</span>
              <span aria-hidden="true" className="text-line-2">
                ·
              </span>
              <span>Inviato il {fmtDate(client.submitted)}</span>
            </div>
          </div>
        </div>

        <div className="coach-grid">
          {/* colonna principale */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* colpo d'occhio */}
            <div className="rounded-[20px] border border-line bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,86,133,0.05)]">
              <p className="mb-[13px] mt-0 text-xs font-bold uppercase tracking-[.08em] text-brand">
                Colpo d'occhio
              </p>
              <div className="flex flex-wrap gap-x-[22px] gap-y-[18px]">
                <div className="min-w-[140px] flex-[2_1_240px]">
                  <p className="mb-1 mt-0 text-[11px] font-bold uppercase tracking-[.06em] text-faint">
                    Obiettivo
                  </p>
                  <div className="line-clamp-2 text-sm font-semibold leading-[1.4] text-ink">
                    {d.main_goal || "—"}
                  </div>
                </div>
                <div className="min-w-[140px] flex-[1_1_150px]">
                  <p className="mb-1 mt-0 text-[11px] font-bold uppercase tracking-[.06em] text-faint">
                    Livello
                  </p>
                  <div className="text-sm font-semibold leading-[1.4] text-ink">
                    {(ENUM_LABELS.experience_level[d.experience_level] ?? "—") +
                      " · " +
                      (d.max_days_week || "?") +
                      "×/sett" +
                      (d.session_minutes ? ` · ${d.session_minutes}'` : "")}
                  </div>
                </div>
                <div className="min-w-[140px] flex-[1_1_150px]">
                  <p className="mb-1 mt-0 text-[11px] font-bold uppercase tracking-[.06em] text-faint">
                    Salute
                  </p>
                  <div className="text-sm font-semibold leading-[1.4]">
                    {flags.length ? (
                      <span className="text-danger">
                        ⚠ {flags.length} {flags.length === 1 ? "nota" : "note"}
                        {highFlags ? ` · ${highFlags} critic${highFlags === 1 ? "a" : "he"}` : ""}
                      </span>
                    ) : (
                      <span className="text-ok">✓ Nessuna nota</span>
                    )}
                  </div>
                </div>
                <div className="min-w-[140px] flex-[1_1_150px]">
                  <p className="mb-1 mt-0 text-[11px] font-bold uppercase tracking-[.06em] text-faint">
                    Modalità
                  </p>
                  <div className="text-sm font-semibold leading-[1.4] text-ink">
                    {ENUM_LABELS.work_mode[d.work_mode] ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            <FlagBanner flags={flags} />

            <SectionCard
              id="s-salute"
              title="Salute e sicurezza (PAR-Q+)"
              badge={flags.length ? `⚠ ${flags.length}` : undefined}
              badgeKind="flag"
              rows={healthRows}
            />
            <SectionCard
              id="s-obiettivo"
              title="Corpo e obiettivo"
              pre={<WeightViz d={d} />}
              rows={rowsOf(d, [
                ["Altezza", "height_cm"],
                ["Peso attuale", "weight_kg"],
                ["Storia del peso", "weight_history"],
                ["Target", "weight_target"],
                ["Obiettivo principale", "main_goal"],
                ["Estetica", "aesthetic_goal"],
                ["Scadenza / evento", "deadline_event"],
                ["Movimento", "movement_goal"],
              ])}
            />
            <SectionCard
              id="s-stile"
              title="Stile di vita"
              rows={rowsOf(d, [
                ["Lavoro", "work_desc"],
                ["Stress", "stress_level"],
                ["Ore di sonno", "sleep_hours"],
                ["Qualità sonno", "sleep_quality"],
                ["Passi / NEAT", "neat_steps"],
                ["Acqua/giorno", "water_liters"],
                ["Alcol/sett", "alcohol_week"],
                ["Fumo", "smoking"],
                ["Da migliorare", "lifestyle_goal"],
              ])}
            />
            <SectionCard
              id="s-allenamento"
              title="Allenamento"
              rows={rowsOf(d, [
                ["Sport praticati", "sports_history"],
                ["Sport attuale", "current_sport"],
                ["Preferita", "favorite_activity"],
                ["Bilanciere / attrezzi", "barbell_experience"],
                ["Esperienza pesi", "experience_level"],
                ["Carico di lavoro", "workload"],
                ["Recupero", "recovery_capacity"],
                ["Giorni max/sett", "max_days_week"],
                ["Minuti/sessione", "session_minutes"],
                ["Dove / attrezzatura", "equipment"],
                ["Massimali", "recent_maxes"],
              ])}
            />
            {hasNutrition ? (
              <SectionCard
                id="s-nutrizione"
                title="Nutrizione"
                badge="consenso dato"
                rows={rowsOf(d, [
                  ["Dieta attuale", "diet_assessment"],
                  ["Pasti", "meals_desc"],
                  ["Diete passate", "diet_history"],
                  ["Cibi ama / evita", "foods_love_avoid"],
                  ["Intolleranze", "intolerances"],
                  ["Chi cucina", "who_cooks"],
                  ["Integratori", "supplements"],
                ])}
              />
            ) : null}
            <SectionCard
              id="s-logistica"
              title="Gestione e logistica"
              rows={rowsOf(d, [
                ["Modalità", "work_mode"],
                ["Disponibilità", "availability"],
                ["Perché ora", "why_now"],
                ["Coaching passato", "past_coaching"],
                ["Ostacoli previsti", "foreseen_obstacles"],
                ["Definizione di successo", "success_definition"],
                ["Supporto", "support_network"],
              ])}
            />
            <NeurotypeCard client={client} />
            <SectionCard
              id="s-anagrafica"
              title="Anagrafica e consensi"
              rows={rowsOf(d, [
                ["Nome", "full_name"],
                ["Data di nascita", "birth_date"],
                ["Pronome", "pronoun"],
                ["Consenso salute", "consent_health"],
                ["Suggerimenti alimentari", "consent_nutrition"],
                ["Foto / misurazioni", "consent_photos"],
                ["Condivisione sanitari", "consent_share_medical"],
                ["Comunicazioni", "consent_marketing"],
                ["Presa d'atto", "consent_disclaimer"],
              ]).map(([l, v]) =>
                l === "Data di nascita" ? ([l, fmtDate(d.birth_date)] as Row) : ([l, v] as Row),
              )}
            />
          </div>

          {/* sidebar */}
          <div className="coach-side flex flex-col gap-4">
            <div className="rounded-[20px] border border-line bg-white px-[18px] py-4">
              <p className="mb-[11px] mt-0 font-display text-[15px] font-bold text-ink">
                Contatti e dati
              </p>
              <div className="mb-3 flex flex-col gap-2">
                {d.email ? (
                  <a
                    href={`mailto:${d.email}`}
                    className="coach-noprint flex items-center gap-[9px] break-all text-[13.5px] font-semibold text-brand-deep no-underline"
                  >
                    <span aria-hidden="true" className="flex-none text-faint">
                      ✉
                    </span>
                    {d.email}
                  </a>
                ) : null}
                {d.phone ? (
                  <a
                    href={`tel:${d.phone.replace(/\s/g, "")}`}
                    className="coach-noprint flex items-center gap-[9px] text-[13.5px] font-semibold text-brand-deep no-underline"
                  >
                    <span aria-hidden="true" className="flex-none text-faint">
                      ☎
                    </span>
                    {d.phone}
                  </a>
                ) : null}
              </div>
              {factRow("Età", age !== null ? `${age} anni` : null)}
              {factRow("Altezza", d.height_cm ? `${d.height_cm} cm` : null)}
              {factRow("Peso", d.weight_kg ? `${d.weight_kg} kg` : null)}
              {factRow("BMI", bmi)}
              {factRow("Esperienza", ENUM_LABELS.experience_level[d.experience_level] ?? null)}
              {factRow("Giorni/sett", d.max_days_week || null)}
              {factRow("Modalità", ENUM_LABELS.work_mode[d.work_mode] ?? null)}
            </div>

            {flags.length ? (
              <div className="rounded-[20px] border border-danger-bd bg-danger-soft px-[18px] py-[15px]">
                <p className="mb-[9px] mt-0 text-xs font-bold uppercase tracking-[.06em] text-danger">
                  ⚠ Note di salute ({flags.length})
                </p>
                <div className="flex flex-col gap-[7px]">
                  {flags.map((f, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-[12.5px] leading-[1.45] text-ink",
                        f.level === "high" && "font-semibold",
                      )}
                    >
                      • {f.text}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[20px] border border-line bg-white px-[18px] py-4">
              <div className="mb-2.5 flex items-center gap-2">
                <p className="m-0 font-display text-[15px] font-bold text-ink">Appunti privati</p>
                {noteSaved ? (
                  <span className="coach-noprint rounded-full bg-ok-bg px-2 py-0.5 text-[11.5px] font-bold text-ok">
                    Salvato ✓
                  </span>
                ) : null}
              </div>
              <textarea
                value={note}
                rows={5}
                placeholder="Note visibili solo a te: impressioni, ipotesi di programma, cosa chiedere al primo incontro…"
                aria-label="Appunti privati"
                onChange={(e) => onNote(e.target.value)}
                className="w-full resize-y rounded-xl border border-line-input bg-white px-[13px] py-[11px] text-[13.5px] leading-normal text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:shadow-[0_0_0_3px_var(--brand-ring)]"
              />
              <p className="mb-0 mt-[9px] text-[11.5px] leading-[1.45] text-faint">
                Salvati su questo dispositivo, non inviati al cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
