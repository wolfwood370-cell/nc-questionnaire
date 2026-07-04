import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ALLOWED_EMAIL = "nctrainingsystems@gmail.com";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Accesso coach" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        navigate({ to: "/coach" });
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/coach" });
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      if (normalizedEmail !== ALLOWED_EMAIL) {
        setError("Registrazione non consentita per questa email.");
        return;
      }
      if (password.length < 8) {
        setError("La password deve contenere almeno 8 caratteri.");
        return;
      }
      setLoading(true);
      const { data, error: err } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/coach` },
      });
      setLoading(false);
      if (err) {
        setError(err.message || "Registrazione non riuscita.");
        return;
      }
      if (data.session) {
        navigate({ to: "/coach" });
      } else {
        setInfo("Registrazione avvenuta. Controlla la tua email per confermare l'account, poi accedi.");
        setMode("signin");
      }
      return;
    }

    if (normalizedEmail !== ALLOWED_EMAIL) {
      setError("Accesso non consentito per questa email.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    setLoading(false);
    if (err) {
      setError("Email o password non corretti.");
      return;
    }
    navigate({ to: "/coach" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "signin" ? "Accesso coach" : "Registrazione coach"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-sm text-muted-foreground" role="status">
                {info}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mode === "signin"
                  ? "Accesso in corso…"
                  : "Registrazione in corso…"
                : mode === "signin"
                  ? "Accedi"
                  : "Registrati"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  Non hai ancora un account?{" "}
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    Registrati
                  </button>
                </>
              ) : (
                <>
                  Hai già un account?{" "}
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    Accedi
                  </button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
