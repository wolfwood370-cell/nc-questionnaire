import { ENUM_LABELS } from "@/lib/intake-types";

export function fmtEnum(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const s = String(value);
  return ENUM_LABELS[field]?.[s] ?? s;
}

export function fmtText(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

export function fmtBool(v: unknown): string {
  if (v === true) return "Sì";
  if (v === false) return "No";
  return "—";
}

export function fmtNumber(v: unknown, suffix = ""): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!isFinite(n)) return "—";
  return `${n}${suffix ? " " + suffix : ""}`;
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function computeAge(birth: string | null | undefined): number | null {
  if (!birth) return null;
  const d = new Date(birth + (birth.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export type StatusValue = "new" | "reviewed" | "archived";
export const STATUS_LABEL: Record<StatusValue, string> = {
  new: "Nuovo",
  reviewed: "Visto",
  archived: "Archiviato",
};
