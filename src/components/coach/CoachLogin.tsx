import { useState } from "react";
import { supabaseCoach } from "@/lib/supabase-coach";
import { Field, PillButton, TextInput } from "@/components/intake/controls";
import { Monogram, TRAINER_NAME } from "./coach-atoms";

// Login dell'area coach: Supabase Auth (email + password). Anche dopo il
// login, i dati restano protetti da RLS: un utente autenticato che non è
// in public.admins non vede alcuna submission.

export function CoachLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const { error: err } = await supabaseCoach.auth.signInWithPassword({ email, password });
      if (err) {
        // Messaggio generico: non rivelare se l'email esiste.
        setError("Credenziali non valide. Controlla email e password.");
      }
      // In caso di successo onAuthStateChange (in CoachPage) fa il resto.
    } catch {
      setError("Accesso non riuscito. Controlla la connessione e riprova.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-[420px] px-5 pb-12 pt-[clamp(40px,12vh,120px)] motion-safe:animate-nc-rise">
        <div className="mb-8 flex items-center gap-3">
          <Monogram size={44} />
          <div className="leading-[1.1]">
            <div className="text-[15px] font-bold text-ink">{TRAINER_NAME}</div>
            <div className="text-[11.5px] text-faint">Area coach</div>
          </div>
        </div>
        <h1 className="mb-2 mt-0 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-ink">
          Accedi
        </h1>
        <p className="mb-7 mt-0 text-sm leading-[1.55] text-sub">
          Area riservata: qui leggi i questionari d'ingresso dei tuoi clienti.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="flex flex-col gap-4"
        >
          <Field label="Email">
            <TextInput
              value={email}
              onChange={setEmail}
              type="email"
              inputMode="email"
              autoComplete="email"
              error={error || undefined}
            />
          </Field>
          <Field label="Password">
            <TextInput
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete="current-password"
              error={error || undefined}
            />
          </Field>
          {error ? (
            <p
              role="alert"
              className="m-0 flex items-center gap-1.5 text-[12.5px] font-medium text-danger"
            >
              <span aria-hidden="true">⚠</span>
              {error}
            </p>
          ) : null}
          <PillButton disabled={busy || !email || !password} className="mt-1" type="submit">
            {busy ? "Accesso in corso…" : "Entra"}
          </PillButton>
        </form>
      </div>
    </div>
  );
}
