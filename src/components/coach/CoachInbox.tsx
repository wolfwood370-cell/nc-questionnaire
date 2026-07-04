import { cn } from "@/lib/utils";
import { ENUM_LABELS } from "@/lib/intake-types";
import { healthFlags, relDate, type CoachClient } from "@/lib/coach-data";
import { Avatar, BrandRow, Pill } from "./coach-atoms";

export type InboxFilter = "all" | "new" | "flag";

type Props = {
  clients: CoachClient[];
  read: Record<string, boolean>;
  query: string;
  filter: InboxFilter;
  onQuery: (q: string) => void;
  onFilter: (f: InboxFilter) => void;
  onOpen: (id: string) => void;
  onLogout: () => void;
};

export function CoachInbox({
  clients,
  read,
  query,
  filter,
  onQuery,
  onFilter,
  onOpen,
  onLogout,
}: Props) {
  const q = query.trim().toLowerCase();
  const list = clients.filter((c) => {
    if (filter === "new" && read[c.id]) return false;
    if (filter === "flag" && healthFlags(c.data).length === 0) return false;
    if (
      q &&
      !(c.name.toLowerCase().includes(q) || (c.data.main_goal || "").toLowerCase().includes(q))
    )
      return false;
    return true;
  });
  const newCount = clients.filter((c) => !read[c.id]).length;
  const flagCount = clients.filter((c) => healthFlags(c.data).length > 0).length;

  const filterBtn = (key: InboxFilter, label: string, count: number) => {
    const on = filter === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => onFilter(key)}
        aria-pressed={on}
        className={cn(
          "inline-flex cursor-pointer appearance-none items-center gap-[7px] rounded-full border px-[15px] py-2 text-[13px] font-semibold transition-all duration-150",
          on
            ? "border-brand bg-brand text-white"
            : "border-line-2 bg-white text-sub hover:border-brand-bd",
        )}
      >
        {label}
        <span
          className={cn(
            "rounded-full px-[7px] py-px text-[11px] font-bold tabular-nums",
            on ? "bg-white/20 text-white" : "bg-brand-soft text-brand-deep",
          )}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="sticky top-0 z-[5] w-full border-b border-line bg-[var(--surface-blur-head)] backdrop-blur-[16px]">
        <div className="mx-auto flex w-full max-w-[860px] items-center gap-3 px-5 py-[13px]">
          <BrandRow size={32} />
          <div className="ml-auto flex items-center gap-2.5">
            <span
              title="Dati reali collegati (Supabase)"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[rgba(5,150,105,0.3)] bg-ok-bg px-[9px] py-[3px] text-[11px] font-bold tracking-[.02em] text-ok"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
              Dati live
            </span>
            <span className="whitespace-nowrap text-[12.5px] font-semibold text-faint">
              {clients.length} questionari
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="cursor-pointer appearance-none rounded-full border border-line-2 bg-white px-3 py-[5px] text-[12px] font-semibold text-sub transition-colors hover:border-brand-bd"
            >
              Esci
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[860px] px-5 pb-20 pt-[30px] motion-safe:animate-nc-rise">
        <p className="mb-1.5 mt-0 text-[12.5px] font-bold uppercase tracking-[.1em] text-brand">
          Questionari d'ingresso
        </p>
        <h1
          className="mb-1.5 mt-0 font-display font-bold leading-[1.1] tracking-tight text-ink"
          style={{ fontSize: "clamp(28px, 5vw, 38px)" }}
        >
          I tuoi nuovi clienti
        </h1>
        <p className="mb-[22px] mt-0 max-w-[56ch] text-[15px] leading-[1.55] text-sub">
          Apri un questionario per leggere tutte le risposte, controllare le note di salute e
          prendere appunti prima del primo incontro.
        </p>

        <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-[1_1_240px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-faint"
            >
              ⌕
            </span>
            <input
              value={query}
              placeholder="Cerca per nome o obiettivo…"
              aria-label="Cerca per nome o obiettivo"
              onChange={(e) => onQuery(e.target.value)}
              className="w-full rounded-full border border-line-input bg-white py-[11px] pl-[38px] pr-3.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:shadow-[0_0_0_3px_var(--brand-ring)]"
            />
          </div>
          {filterBtn("all", "Tutti", clients.length)}
          {filterBtn("new", "Nuovi", newCount)}
          {filterBtn("flag", "Con note salute", flagCount)}
        </div>

        {list.length ? (
          <div className="flex flex-col gap-[11px]">
            {list.map((c) => {
              const d = c.data;
              const fl = healthFlags(d);
              const isNew = !read[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpen(c.id)}
                  className="flex w-full cursor-pointer appearance-none items-center gap-[15px] rounded-[18px] border border-line bg-white px-[18px] py-[15px] text-left shadow-[0_1px_2px_rgba(0,0,0,.02)] transition-all duration-150 hover:-translate-y-px hover:border-brand-bd hover:shadow-[0_6px_20px_rgba(0,86,133,0.08)]"
                >
                  <Avatar name={c.name} size={46} flagged={fl.length > 0} />
                  <div className="min-w-0 flex-[1_1_auto]">
                    <div className="mb-[3px] flex flex-wrap items-center gap-[9px]">
                      <span className="font-display text-[16.5px] font-bold tracking-[-0.01em] text-ink">
                        {c.name}
                      </span>
                      {isNew ? (
                        <span
                          aria-hidden="true"
                          className="h-[7px] w-[7px] flex-none rounded-full bg-brand"
                        />
                      ) : null}
                    </div>
                    <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] leading-[1.45] text-sub">
                      {d.main_goal || "—"}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {fl.length ? (
                        <Pill kind="flag">
                          ⚠ {fl.length} {fl.length === 1 ? "nota salute" : "note salute"}
                        </Pill>
                      ) : null}
                      <Pill>{ENUM_LABELS.experience_level[d.experience_level] ?? "—"}</Pill>
                      <Pill>{(d.max_days_week || "?") + "×/sett"}</Pill>
                    </div>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-2">
                    <Pill kind={isNew ? "new" : "read"}>{isNew ? "Nuovo" : "Letto"}</Pill>
                    <span className="text-xs tabular-nums text-faint">{relDate(c.submitted)}</span>
                    <span aria-hidden="true" className="text-base text-line-2">
                      ›
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-line-2 bg-white px-5 py-[60px] text-center text-sm text-faint">
            {clients.length === 0
              ? "Nessun questionario ricevuto finora."
              : "Nessun questionario corrisponde ai filtri."}
          </div>
        )}
      </div>
    </div>
  );
}
