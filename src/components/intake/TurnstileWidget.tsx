import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// Widget Cloudflare Turnstile (anti-spam). La site key è PUBBLICA e arriva
// da VITE_TURNSTILE_SITE_KEY; la verifica vera avviene server-side nella
// Edge Function con la secret (mai nel client).

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme?: "light" | "dark" | "auto";
      language?: string;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __onTurnstileLoad?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__onTurnstileLoad&render=explicit";

const loadWaiters: Array<{ onReady: () => void; onError: () => void }> = [];

function loadTurnstile(onReady: () => void, onError: () => void) {
  if (window.turnstile) {
    onReady();
    return;
  }
  loadWaiters.push({ onReady, onError });
  if (document.getElementById(SCRIPT_ID)) return;
  window.__onTurnstileLoad = () => {
    while (loadWaiters.length) loadWaiters.shift()?.onReady();
  };
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  script.onerror = () => {
    // Rimuovere il tag permette il retry: il guard su SCRIPT_ID non lo
    // troverà più e un nuovo tentativo re-inietterà lo script.
    script.remove();
    while (loadWaiters.length) loadWaiters.shift()?.onError();
  };
  document.head.appendChild(script);
}

type Props = {
  /** Chiamata con il token quando la sfida passa, con null quando scade/errore. */
  onToken: (token: string | null) => void;
  /** Incrementa per forzare un reset del widget (es. dopo un submit fallito). */
  resetSignal?: number;
};

export function TurnstileWidget({ onToken, resetSignal = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;
    const el = containerRef.current;

    loadTurnstile(
      () => {
        if (cancelled || !window.turnstile || widgetIdRef.current !== null) return;
        widgetIdRef.current = window.turnstile.render(el, {
          sitekey: siteKey,
          language: "it",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      },
      () => {
        if (!cancelled) setLoadError(true);
      },
    );

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      // Il token emesso da questo widget non è più utilizzabile una volta
      // smontato (es. navigando indietro): il parent deve ripartire da zero.
      onTokenRef.current(null);
    };
  }, [siteKey, retryCount]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenRef.current(null);
    }
  }, [resetSignal]);

  if (!siteKey) {
    // Fail-closed: senza site key niente token, quindi niente invio.
    return (
      <p className="text-sm text-destructive">
        Verifica anti-spam non configurata: l'invio non è disponibile.
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm text-destructive">
          Impossibile caricare la verifica anti-spam. Controlla la connessione o le estensioni del
          browser e riprova.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setLoadError(false);
            setRetryCount((n) => n + 1);
          }}
        >
          Riprova
        </Button>
      </div>
    );
  }

  return <div ref={containerRef} />;
}
