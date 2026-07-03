# Security review — questionario d'ingresso

> Stato: BOZZA (Fase 2). La checklist completa di go-live viene compilata
> in Fase 3. Questo file esiste già per non perdere gli swap obbligatori.

## ⚠️ Swap obbligatori PRIMA del go-live

| Cosa                                          | Stato attuale (collaudo)                                                             | Al go-live                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `VITE_TURNSTILE_SITE_KEY` (client)            | Chiave di TEST Cloudflare `1x00000000000000000000AA` (always-pass, non blocca nulla) | Site key REALE del widget Turnstile                                                           |
| `TURNSTILE_SECRET_KEY` (secret Edge Function) | Secret di TEST Cloudflare (always-pass)                                              | Secret REALE (mai nel client, mai nel repo)                                                   |
| `ALLOWED_ORIGINS` (secret Edge Function)      | Da impostare: `https://nc-questionnaire.lovable.app,http://localhost:8080`           | Solo il dominio di produzione (togliere localhost)                                            |
| Grant `submit_intake` ad `anon`               | Ancora attivo (0001): la RPC è chiamabile direttamente con la anon key               | Fase 3: `revoke execute ... from anon, authenticated` — l'unico canale resta la Edge Function |

**Con le chiavi di test il CAPTCHA non ferma niente**: qualunque token passa.
Nessun dato reale finché gli swap non sono fatti.

## Decisioni prese (Fase 2, da verificare in Fase 3)

- L'ingresso pubblico è la Edge Function `submit-intake`: CORS allowlist,
  rate-limit per IP fidato (`cf-connecting-ip`), cap body 200KB, verifica
  Turnstile fail-closed, validazione whitelist del payload, poi RPC con
  service role.
- Art.9: nessun dato del payload in log/analytics/risposte. La RPC
  `submit_intake` (0004) intercetta ogni errore e rilancia un messaggio
  fisso: le violazioni CHECK non scrivono più i valori della riga nei log
  Postgres. La Edge Function non logga mai il payload; il client non logga
  né mostra errori grezzi.
- `verify_jwt` attivo sulla function: le chiamate richiedono la anon key
  (pubblica) come Bearer — non è un confine di sicurezza, solo igiene.
