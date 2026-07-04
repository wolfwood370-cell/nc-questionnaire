import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// Primitivi UI del questionario (design system NC Studio, handoff
// Claude Design): pillole, segment radiogroup, card domanda/consenso.
// Solo presentazione: la validazione vive in src/lib/intake-types.ts.

export function ErrMsg({ text, id }: { text: string; id?: string }) {
  return (
    <p
      id={id}
      className="m-0 flex items-center gap-1.5 text-[12.5px] font-medium text-danger motion-safe:animate-nc-fade"
    >
      <span aria-hidden="true">⚠</span>
      {text}
    </p>
  );
}

/** Prop iniettate da Field nel controllo figlio (id per label, errore). */
export type FieldControlProps = {
  id?: string;
  labelledBy?: string;
  describedBy?: string;
};

type FieldProps = {
  label?: string;
  help?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

/**
 * Campo con label + help + errore. Genera gli id e li inietta nel controllo
 * figlio (TextInput/TextArea/Seg) così label ed errore sono associati
 * programmaticamente (htmlFor / aria-labelledby / aria-describedby).
 */
export function Field({ label, help, required, error, children }: FieldProps) {
  const uid = useId();
  const controlId = `${uid}-c`;
  const labelId = `${uid}-l`;
  const errorId = `${uid}-e`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<FieldControlProps>, {
        id: controlId,
        labelledBy: label ? labelId : undefined,
        describedBy: error ? errorId : undefined,
      })
    : children;
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          id={labelId}
          htmlFor={controlId}
          className="text-sm font-semibold leading-[1.35] text-ink"
        >
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      {help ? <p className="-mt-0.5 text-[12.5px] leading-[1.4] text-faint">{help}</p> : null}
      {control}
      {error ? <ErrMsg id={errorId} text={error} /> : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 " +
  "focus:border-brand focus:shadow-[0_0_0_3px_var(--brand-ring)]";

type TextInputProps = FieldControlProps & {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email";
  placeholder?: string;
  autoComplete?: string;
};

export function TextInput({
  id,
  describedBy,
  value,
  onChange,
  error,
  type,
  inputMode,
  placeholder,
  autoComplete,
}: TextInputProps) {
  const tabular = type === "number" || inputMode === "numeric" || inputMode === "tel";
  return (
    <input
      id={id}
      value={value}
      type={type ?? "text"}
      inputMode={inputMode}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        inputBase,
        tabular && "tabular-nums",
        error ? "border-danger" : "border-line-input",
      )}
    />
  );
}

type TextAreaProps = FieldControlProps & {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  rows?: number;
  placeholder?: string;
};

export function TextArea({
  id,
  describedBy,
  value,
  onChange,
  error,
  rows = 3,
  placeholder,
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      placeholder={placeholder}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        inputBase,
        "resize-y leading-normal",
        error ? "border-danger" : "border-line-input",
      )}
    />
  );
}

export type SegOption<T extends string> = { v: T; l: string; sub?: string; aria?: string };

type SegProps<T extends string> = FieldControlProps & {
  value: T | "";
  onChange: (v: T) => void;
  options: readonly SegOption<T>[];
  error?: string;
  /** larghezza minima delle celle della griglia auto-fit */
  min?: string;
  /** numero fisso di colonne (in alternativa ad auto-fit) */
  columns?: number;
  compact?: boolean;
  ariaLabel?: string;
};

/**
 * Radiogroup a pillole. Tastiera come i radio nativi: frecce per spostare
 * la selezione, roving tabindex (un solo stop di Tab per gruppo).
 */
export function Seg<T extends string>({
  id,
  labelledBy,
  describedBy,
  value,
  onChange,
  options,
  error,
  min,
  columns,
  compact,
  ariaLabel,
}: SegProps<T>) {
  const minWidth = min ?? (compact ? "44px" : "120px");
  const groupRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((o) => o.v === value);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const backward = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!forward && !backward) return;
    e.preventDefault();
    const cur = selectedIndex >= 0 ? selectedIndex : 0;
    const next = (cur + (forward ? 1 : -1) + options.length) % options.length;
    onChange(options[next].v);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  };

  return (
    <div
      ref={groupRef}
      id={id}
      role="radiogroup"
      aria-label={labelledBy ? undefined : ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={error ? "true" : undefined}
      onKeyDown={onKeyDown}
      className="grid gap-2"
      style={
        columns
          ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
          : { gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))` }
      }
    >
      {options.map((o, i) => {
        const sel = value === o.v;
        const tabbable = sel || (selectedIndex < 0 && i === 0);
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={sel}
            aria-label={o.aria}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(o.v)}
            className={cn(
              "cursor-pointer appearance-none rounded-xl border leading-[1.25] transition-all duration-150",
              compact
                ? "px-1.5 py-2.5 text-center text-[15px]"
                : "px-3.5 py-[11px] text-left text-[14.5px]",
              sel
                ? "border-brand bg-brand font-bold text-white shadow-[0_1px_3px_var(--brand-sh)]"
                : cn(
                    "bg-white font-medium text-ink shadow-[0_1px_1px_rgba(0,0,0,.02)] hover:border-brand-bd",
                    error ? "border-danger" : "border-line-input",
                  ),
            )}
          >
            {o.l}
            {o.sub ? (
              <span
                className={cn(
                  "mt-0.5 block text-[11.5px] font-normal",
                  sel ? "opacity-85" : "opacity-60",
                )}
              >
                {o.sub}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

const YESNO_OPTIONS = [
  { v: "si", l: "Sì" },
  { v: "no", l: "No" },
] as const;

type YesNoSegProps = FieldControlProps & {
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: string;
  ariaLabel?: string;
};

/** Seg Sì/No che lavora direttamente sui boolean del modello dati. */
export function YesNoSeg({
  id,
  labelledBy,
  describedBy,
  value,
  onChange,
  error,
  ariaLabel,
}: YesNoSegProps) {
  return (
    <Seg
      id={id}
      labelledBy={labelledBy}
      describedBy={describedBy}
      value={value === null ? "" : value ? "si" : "no"}
      onChange={(v) => onChange(v === "si")}
      options={YESNO_OPTIONS}
      error={error}
      min="88px"
      ariaLabel={ariaLabel}
    />
  );
}

type QuestionCardProps = {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: string;
};

/** Card con domanda + Sì/No (PAR-Q, dolore, allergie). */
export function QuestionCard({ label, value, onChange, error }: QuestionCardProps) {
  const uid = useId();
  return (
    <div
      className={cn(
        "rounded-[20px] border px-[18px] py-4",
        error ? "border-danger bg-danger-soft" : "border-line-2 bg-white",
      )}
    >
      <p id={`${uid}-q`} className="mb-3 mt-0 text-sm font-semibold leading-[1.45] text-ink">
        {label}
      </p>
      <YesNoSeg
        value={value}
        onChange={onChange}
        error={error}
        labelledBy={`${uid}-q`}
        describedBy={error ? `${uid}-e` : undefined}
      />
      {error ? (
        <div className="mt-2">
          <ErrMsg id={`${uid}-e`} text={error} />
        </div>
      ) : null}
    </div>
  );
}

type ConsentRequiredProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
  error?: string;
};

/** Consenso obbligatorio: card-checkbox con badge "Obbligatorio". */
export function ConsentCardRequired({
  checked,
  onChange,
  title,
  desc,
  error,
}: ConsentRequiredProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-start gap-[13px] rounded-[20px] border px-[18px] py-4 text-left transition-all duration-150",
        checked
          ? "border-brand-bd bg-brand-soft"
          : error
            ? "border-danger bg-danger-soft"
            : "border-line-2 bg-white",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-px flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] border-[1.5px] text-sm text-white transition-all duration-150",
          checked
            ? "border-brand bg-brand"
            : error
              ? "border-danger bg-white"
              : "border-line-input bg-white",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      <span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-ink">{title}</span>
          <span className="rounded-full border border-brand-bd bg-brand-soft px-[7px] py-0.5 text-[10.5px] font-bold uppercase tracking-[.04em] text-brand">
            Obbligatorio
          </span>
        </span>
        <span className="mt-[5px] block text-[13px] leading-normal text-sub">{desc}</span>
        {error ? (
          <span className="mt-2 block text-[12.5px] font-medium text-danger">⚠ {error}</span>
        ) : null}
      </span>
    </button>
  );
}

type ConsentOptionalProps = {
  value: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
  hint?: string;
};

/** Consenso facoltativo: card con Seg Sì/No. */
export function ConsentCardOptional({ value, onChange, title, desc, hint }: ConsentOptionalProps) {
  const uid = useId();
  return (
    <div className="rounded-[20px] border border-line-2 bg-white px-[18px] py-4">
      <p id={`${uid}-t`} className="m-0 text-sm font-bold text-ink">
        {title}
      </p>
      <p className="mb-3 mt-[5px] text-[13px] leading-normal text-sub">{desc}</p>
      <YesNoSeg value={value} onChange={onChange} labelledBy={`${uid}-t`} />
      {hint ? (
        <p className="mb-0 mt-[11px] text-[12.5px] font-medium leading-[1.45] text-brand">{hint}</p>
      ) : null}
    </div>
  );
}

export function Note({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[14px] border border-brand-bd bg-brand-soft px-3.5 py-3">
      <span aria-hidden="true" className="mt-px flex-none text-sm text-brand">
        ⓘ
      </span>
      <p className="m-0 text-[12.5px] leading-[1.55] text-brand-deep">{text}</p>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
    >
      {children}
    </div>
  );
}

type PillButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline";
  size?: "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  children: ReactNode;
};

export function PillButton({
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
}: PillButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "appearance-none rounded-full font-semibold transition-all duration-150",
        size === "lg" ? "px-[30px] py-[15px] text-base" : "px-[22px] py-3 text-[15px]",
        variant === "primary"
          ? cn(
              "border-none bg-brand text-white shadow-[0_6px_16px_var(--brand-sh)]",
              !disabled && "hover:bg-brand-deep",
            )
          : "border border-line-2 bg-white text-ink",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      {children}
    </button>
  );
}
