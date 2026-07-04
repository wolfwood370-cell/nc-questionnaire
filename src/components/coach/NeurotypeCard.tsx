import { useState } from "react";
import { cn } from "@/lib/utils";
import { NT_MAX, NT_MIN, NT_ORDER, NT_TYPES, scoreNeurotype } from "@/lib/neurotype-scoring";
import { NEURO_LEGEND, NEURO_QUESTIONS } from "@/components/intake/steps/Step8Neurotype";
import { Pill } from "./coach-atoms";
import type { CoachClient } from "@/lib/coach-data";

// Card Neurotipo del dettaglio cliente: lettura del punteggio (scoring
// 1:1 da neurotipo-scoring.json), cues per il coach, barre per tipo e
// pannello a scomparsa con distribuzione A–E e le 30 risposte.

export function NeurotypeCard({ client }: { client: CoachClient }) {
  const [open, setOpen] = useState(false);
  const answers = client.neuro;
  const answered = answers.filter(Boolean).length;
  const score = scoreNeurotype(answers);
  const P = score.primary;
  const S = score.secondary;
  const stress = client.data.stress_level === "alto" || client.data.stress_level === "molto_alto";
  const barW = (total: number) =>
    Math.max(2, Math.round(((total - NT_MIN) / (NT_MAX - NT_MIN)) * 100));

  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const l of answers) if (counts[l] !== undefined) counts[l]++;

  const cueRow = (label: string, val: string) => (
    <div
      key={label}
      className="grid items-baseline gap-3 border-t border-[rgba(0,62,98,0.10)] py-[9px]"
      style={{ gridTemplateColumns: "minmax(96px, 24%) 1fr" }}
    >
      <span className="text-[11px] font-bold uppercase tracking-[.05em] text-brand-deep">
        {label}
      </span>
      <span className="text-[13px] leading-normal text-ink">{val}</span>
    </div>
  );

  return (
    <div
      id="s-neuro"
      className="scroll-mt-[110px] rounded-[20px] border border-line bg-white px-5 py-[18px] shadow-[0_4px_20px_rgba(0,86,133,0.05)]"
    >
      <div className="mb-1.5 flex items-center gap-[9px]">
        <h3 className="m-0 font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
          Neurotipo
        </h3>
        <Pill>{answered} / 30 completate</Pill>
      </div>
      <p className="mb-4 mt-0 text-[12.5px] leading-normal text-faint">
        Modello Thibaudeau (5 tipi, pesi per fascia). A = molto d'accordo → E = per niente. Lettura
        orientativa, non una diagnosi: usala per calibrare comunicazione e allenamento.
      </p>

      {/* Tipo dominante */}
      <div className="mb-3.5 rounded-2xl border border-brand-bd bg-brand-soft px-[18px] py-4">
        <div className="mb-1 flex flex-wrap items-center gap-[11px]">
          <span className="inline-flex h-8 min-w-10 flex-none items-center justify-center rounded-[9px] bg-brand px-2.5 font-display text-base font-extrabold text-white shadow-[0_3px_10px_var(--brand-sh)]">
            {P.code}
          </span>
          <div className="min-w-0 leading-[1.15]">
            <div className="mb-[3px] text-[10.5px] font-bold uppercase tracking-[.08em] text-brand-deep">
              Tipo dominante
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-lg font-bold tracking-[-0.01em] text-ink">
                {P.label}
              </span>
              <span className="text-[13px] font-semibold italic text-brand-deep">
                «{P.keyword}»
              </span>
            </div>
            <div className="mt-[3px] text-xs text-faint">{P.profilo}</div>
          </div>
        </div>
        <p className="mb-0 mt-[9px] text-[12.5px] text-sub">
          Secondario{" "}
          <strong className="text-ink">
            {S.code} · {S.label}
          </strong>
          <span className="text-faint">
            {" "}
            — totali {P.total} vs {S.total}, margine {score.margin}
          </span>
        </p>
        {score.closeCall ? (
          <p className="mb-0 mt-2.5 rounded-[10px] border border-brand-bd bg-white px-3 py-[9px] text-[12.5px] leading-[1.45] text-ink">
            <strong className="text-brand-deep">Testa a testa (margine {score.margin}).</strong> È
            un indizio, non una diagnosi: conferma con i test di fibra e il tuo giudizio.
          </p>
        ) : null}
      </div>

      {/* Cues */}
      <div className="mb-3.5 rounded-[14px] border border-line bg-white px-4 pb-3 pt-1.5">
        {cueRow("Comunicazione", P.cues.comunicazione)}
        {cueRow("Motivazione", P.cues.motivazione)}
        {cueRow("Allenamento", P.cues.allenamento)}
      </div>

      {stress ? (
        <p className="mb-3.5 mt-0 rounded-xl border border-[rgba(217,119,6,0.28)] bg-[#fff7ed] px-3.5 py-[11px] text-[12.5px] leading-normal text-[#9a3412]">
          <strong>Stress elevato dichiarato.</strong> Sotto stress il profilo tende a spostarsi
          verso 2B / 3: leggilo come spostato in quella direzione (regolazione d'allenamento, non
          giudizio clinico).
        </p>
      ) : null}

      {/* Barre punteggio */}
      <p className="mb-[9px] mt-0 text-[11px] font-bold uppercase tracking-[.05em] text-faint">
        Punteggi per tipo (range {NT_MIN} → {NT_MAX})
      </p>
      <div className="flex flex-col gap-[9px]">
        {score.ranked.map((r) => {
          const isTop = r.code === P.code;
          const isSec = r.code === S.code;
          return (
            <div key={r.code} className="flex items-center gap-[11px]">
              <span className="inline-flex w-[176px] flex-none items-center gap-[7px]">
                <span
                  className={cn(
                    "inline-flex h-5 w-[26px] flex-none items-center justify-center rounded-md border text-[11px] font-bold tabular-nums",
                    isTop
                      ? "border-brand bg-brand text-white"
                      : "border-brand-bd bg-brand-soft text-brand-deep",
                  )}
                >
                  {r.code}
                </span>
                <span
                  className={cn(
                    "text-[12.5px]",
                    isTop ? "font-bold text-ink" : "font-semibold text-sub",
                  )}
                >
                  {r.label.split(" — ")[0]}
                </span>
              </span>
              <span className="h-[9px] flex-[1_1_auto] overflow-hidden rounded-full bg-line">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    isTop ? "bg-brand" : isSec ? "bg-brand-deep" : "bg-brand-bd",
                  )}
                  style={{ width: `${barW(r.total)}%` }}
                />
              </span>
              <span
                className={cn(
                  "w-[34px] flex-none text-right text-xs font-bold tabular-nums",
                  isTop ? "text-brand-deep" : "text-faint",
                )}
              >
                {r.total}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pannello risposte */}
      <button
        type="button"
        className="coach-noprint mt-4 flex w-full cursor-pointer appearance-none items-center gap-2 rounded-xl border border-line-2 bg-white px-3.5 py-2.5 text-left text-[12.5px] font-bold text-sub transition-colors duration-150 hover:border-brand-bd"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          aria-hidden="true"
          className="inline-block text-brand-deep transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          ›
        </span>
        {open
          ? "Nascondi risposte e distribuzione"
          : "Mostra tutte le 30 risposte e la distribuzione"}
      </button>

      {open ? (
        <div className="mt-[18px]">
          <div className="mb-[18px] flex flex-col gap-2 border-b border-line pb-[18px]">
            {NEURO_LEGEND.map(([l, t]) => {
              const pct = Math.round((counts[l] / 30) * 100);
              return (
                <div key={l} className="flex items-center gap-[11px]">
                  <span className="inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border border-brand-bd bg-brand-soft text-xs font-bold text-brand-deep">
                    {l}
                  </span>
                  <span className="w-32 flex-none text-[12.5px] text-sub">{t}</span>
                  <span className="h-2 flex-[1_1_auto] overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-[26px] flex-none text-right text-[12.5px] font-bold tabular-nums text-faint">
                    {counts[l]}
                  </span>
                </div>
              );
            })}
          </div>
          {NT_ORDER.map((code, g) => (
            <div key={code} className={g === 0 ? "" : "mt-4"}>
              <p className="mb-0.5 mt-0 text-[11.5px] font-bold uppercase tracking-[.05em] text-faint">
                {code} · {NT_TYPES[code].label.split(" — ")[0]} · aff. {g * 6 + 1}–{g * 6 + 6}
              </p>
              {NEURO_QUESTIONS.slice(g * 6, g * 6 + 6).map((text, offset) => {
                const i = g * 6 + offset;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 py-[11px]",
                      offset === 0 ? "" : "border-t border-line",
                    )}
                  >
                    <span className="mt-px w-[22px] flex-none text-xs font-bold tabular-nums text-faint">
                      {i + 1}.
                    </span>
                    <span className="flex-[1_1_auto] text-[13.5px] leading-normal text-ink">
                      {text}
                    </span>
                    <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-[7px] bg-brand text-[12.5px] font-bold text-white">
                      {answers[i] || "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
