import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initialsOf, RISK_RE } from "@/lib/coach-data";

// Atomi UI dell'area coach (design system NC Studio, handoff Pagina Coach).

export const TRAINER_NAME = "Nicolò";

export function Monogram({ size }: { size: number }) {
  return (
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
}

export function BrandRow({ size }: { size: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Monogram size={size} />
      <div className="leading-[1.05]">
        <div className={cn("font-bold text-ink", size > 36 ? "text-[15px]" : "text-[13.5px]")}>
          {TRAINER_NAME}
        </div>
        <div className="text-[11.5px] text-faint">Area coach</div>
      </div>
    </div>
  );
}

export function Avatar({ name, size, flagged }: { name: string; size: number; flagged: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-full border font-display font-bold uppercase",
        flagged
          ? "border-danger-bd bg-danger-soft text-danger"
          : "border-brand-bd bg-brand-soft text-brand-deep",
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initialsOf(name) || "?"}
    </span>
  );
}

type PillKind = "new" | "read" | "flag" | "soft" | "ok";

export function Pill({ kind = "soft", children }: { kind?: PillKind; children: ReactNode }) {
  const styles: Record<PillKind, string> = {
    new: "border-brand bg-brand text-white",
    read: "border-line-2 bg-white text-faint",
    flag: "border-danger-bd bg-danger-soft text-danger",
    soft: "border-brand-bd bg-brand-soft text-brand-deep",
    ok: "border-[rgba(5,150,105,0.3)] bg-ok-bg text-ok",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[11.5px] font-bold tracking-[.01em]",
        styles[kind],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Evidenzia le parole-chiave di rischio nel testo (port 1:1 dell'handoff).
 * Usato SOLO nella card salute, sotto il controllo del coach loggato.
 */
export function RiskText({ text }: { text: string }) {
  if (!text) return null;
  const parts = String(text).split(RISK_RE);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-danger-soft px-[3px] font-semibold text-danger"
            style={{ WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
