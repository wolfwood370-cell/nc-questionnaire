import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseCoach } from "@/lib/supabase-coach";
import {
  fetchCoachClients,
  loadNotesMap,
  loadReadMap,
  saveNotesMap,
  saveReadMap,
  type CoachClient,
} from "@/lib/coach-data";
import { PillButton } from "@/components/intake/controls";
import { CoachLogin } from "./CoachLogin";
import { CoachInbox, type InboxFilter } from "./CoachInbox";
import { CoachDetail } from "./CoachDetail";

// Area coach: login (Supabase Auth) → bacheca dei questionari → dettaglio.
// I dati arrivano dal DB via RLS: solo gli utenti in public.admins vedono
// le submission. Stato "letto" e appunti privati restano in localStorage
// del dispositivo del coach, come da handoff di design.

export function CoachPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [clients, setClients] = useState<CoachClient[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<"inbox" | "detail">("inbox");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteSaved, setNoteSaved] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // sessione: stato iniziale + cambi (login/logout/refresh token)
  useEffect(() => {
    void supabaseCoach.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabaseCoach.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setRead(loadReadMap());
    setNotes(loadNotesMap());
  }, []);

  // dati: caricati al login/cambio utente. Dipende dall'ID utente e non
  // dall'oggetto session: TOKEN_REFRESHED (~ogni ora) emette una sessione
  // nuova a utente invariato e non deve rifetchare nulla.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) {
      setClients(null);
      return;
    }
    let cancelled = false;
    setLoadError(false);
    fetchCoachClients()
      .then((list) => {
        if (!cancelled) setClients(list);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const open = (id: string) => {
    if (!read[id]) {
      const next = { ...read, [id]: true };
      setRead(next);
      saveReadMap(next);
    }
    setCurrentId(id);
    setView("detail");
    window.scrollTo(0, 0);
  };

  const back = () => {
    setView("inbox");
    window.scrollTo(0, 0);
  };

  const setNote = (id: string, val: string) => {
    const next = { ...notes, [id]: val };
    setNotes(next);
    saveNotesMap(next);
    setNoteSaved(true);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNoteSaved(false), 1400);
  };

  const logout = () => {
    void supabaseCoach.auth.signOut();
    setView("inbox");
    setCurrentId(null);
  };

  if (!authReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-faint">
        Caricamento…
      </div>
    );
  }

  if (!session) return <CoachLogin />;

  if (loadError && clients === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="m-0 max-w-[46ch] text-sm leading-relaxed text-sub">
          Non riesco a caricare i questionari. Controlla la connessione e riprova; se il problema
          persiste, verifica che il tuo utente sia abilitato come coach.
        </p>
        <div className="flex gap-3">
          <PillButton
            onClick={() => {
              setLoadError(false);
              setClients(null);
              fetchCoachClients()
                .then(setClients)
                .catch(() => setLoadError(true));
            }}
          >
            Riprova
          </PillButton>
          <PillButton variant="outline" onClick={logout}>
            Esci
          </PillButton>
        </div>
      </div>
    );
  }

  if (clients === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-faint">
        Carico i questionari…
      </div>
    );
  }

  const current = currentId ? clients.find((c) => c.id === currentId) : undefined;

  if (view === "detail" && current) {
    return (
      <CoachDetail
        client={current}
        note={notes[current.id] ?? ""}
        noteSaved={noteSaved}
        onNote={(val) => setNote(current.id, val)}
        onBack={back}
      />
    );
  }

  return (
    <CoachInbox
      clients={clients}
      read={read}
      query={query}
      filter={filter}
      onQuery={setQuery}
      onFilter={setFilter}
      onOpen={open}
      onLogout={logout}
    />
  );
}
