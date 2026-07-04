import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/coach")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Area coach" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CoachLayout,
});

function CoachLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        navigate({ to: "/login", replace: true });
        return;
      }
      setEmail(data.session.user.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        navigate({ to: "/login", replace: true });
      } else {
        setEmail(session.user.email ?? null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function onLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Caricamento…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/coach" className="text-base font-semibold">
            Area coach
          </Link>
          <div className="flex items-center gap-3">
            {email ? (
              <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            ) : null}
            <Button variant="outline" size="sm" onClick={onLogout}>
              Esci
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
