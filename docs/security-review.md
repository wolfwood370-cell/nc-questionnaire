# Security review — questionario d'ingresso

> Ultimo aggiornamento: Fase 3 (2026-07-03). Tutti i controlli sotto sono
> stati ESEGUITI sul progetto live `nc-questionario` (srrmauojpficdswmtjya,
> regione UE) con dati finti, poi eliminati.

## ⚠️ Swap obbligatori PRIMA del go-live

| Cosa                                          | Stato attuale (collaudo)                                                             | Al go-live                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `VITE_TURNSTILE_SITE_KEY` (client)            | Chiave di TEST Cloudflare `1x00000000000000000000AA` (always-pass, non blocca nulla) | Site key REALE del widget Turnstile                                                                |
| `TURNSTILE_SECRET_KEY` (secret Edge Function) | Secret di TEST Cloudflare (always-pass)                                              | Secret REALE (solo in Edge Functions → Secrets; MAI nel client, nel repo o nei secrets di Lovable) |
| `ALLOWED_ORIGINS` (secret Edge Function)      | `https://nc-questionnaire.lovable.app,http://localhost:8080`                         | Solo il dominio di produzione (togliere localhost)                                                 |
| Utente coach in `admins`                      | DA FARE: creare l'utente in Supabase Auth e inserire lo user-id in `public.admins`   | Fatto e verificato (login coach → legge le submission)                                             |

**Con le chiavi di test il CAPTCHA non ferma niente**: qualunque token passa.
Nessun dato reale finché gli swap non sono fatti.

## Architettura di sicurezza (stato attuale)

L'UNICO canale di scrittura per il pubblico è la Edge Function
`submit-intake` (verify_jwt attivo → serve la anon key come Bearer):

1. **CORS**: origin ammesse solo da `ALLOWED_ORIGINS`; origin estranea → 403.
2. **Rate-limit**: 5 richieste / 10 min per IP fidato (`cf-connecting-ip`),
   contatori in Postgres (`rate_limits` + `rate_limit_hit()`, migrazione 0005) perché ogni richiesta gira su un isolate nuovo e lo stato
   in-memory non conta. Nel DB va solo l'HASH SHA-256 dell'IP.
3. **Cap dimensione**: body oltre 200KB → 413.
4. **Turnstile server-side**: token verificato su siteverify con la secret
   (fail-closed: secret assente → 500, verifica negativa → 403, errore di
   rete verso Cloudflare → 502; in nessun caso si scrive).
5. **Validazione whitelist** del payload (enum/tipi/obbligatori dal
   contratto `docs/intake-contract.md`): tutto ciò che non combacia → 400
   generico. Serve anche all'art.9: un valore fuori CHECK non arriva mai a
   Postgres, quindi non può finire nei log del DB.
6. **RPC** `submit_intake` eseguita con service role.

## Controlli eseguiti (checklist go-live)

- [x] **Nessuna secret/service key nel bundle client**: build di produzione
      scansionato (`service_role`, `TURNSTILE_SECRET`, `SUPABASE_SERVICE`):
      nessun match. Nel client vivono solo URL progetto, anon key e site
      key Turnstile — tutti valori pubblici per progetto.
- [x] **Secret Turnstile solo server**: vive in Edge Functions → Secrets;
      rimossa la copia erroneamente creata nei secrets di Lovable.
- [x] **Nessun dato salute in log/analytics** (art.9 GDPR): - client: nessun `console.*` del payload; errori di submit → toast
      generico in italiano; error-reporting Lovable attivo solo in
      preview e senza stato del form; plugin Lovable esclusi dal build
      di produzione (`apply: "serve"`). - Edge Function: mai loggato il payload né l'errore Postgres. - Postgres: `submit_intake` (0004) intercetta ogni eccezione e
      rilancia un messaggio fisso — niente `Failing row contains (...)`
      nei log del DB. - rate-limit: hash dell'IP, mai IP in chiaro.
- [x] **CORS ristretto**: verificato sul live (lovable.app ammessa,
      `evil.example.com` → 403 / ACAO `null`).
- [x] **RLS deny-by-default provata sul live** (con riga di test poi
      eliminata): - `anon`: `select` su `submissions` → `permission denied` (via SQL e
      via PostgREST, 401); - `anon`: `submit_intake` diretto → `permission denied` (0006) — il
      CAPTCHA non è aggirabile; - `authenticated` NON in `admins`: 0 righe visibili; - submit via Edge Function con token valido → 200, riga completa; - `is_admin` non più esposta via API (404): vive in `private.`
      (0007), schema non servito da PostgREST.
- [x] **Migrazioni versionate allineate al live**: 7 migrazioni nel repo
      (0001–0007) = 7 applicate sul progetto (verificato con la lista
      migrazioni remota).
- [ ] **Coach legge in-app**: da completare quando l'utente coach esiste
      (creazione in Supabase Auth + insert in `admins` + login di prova).
      La 0007 ha già aggiunto i GRANT `select/update` che mancavano al
      ruolo `authenticated` (senza i quali le policy admin non potevano
      produrre righe).

## Lint degli advisor accettati (intenzionali)

Gli advisor di sicurezza Supabase riportano solo 2 INFO, entrambi voluti:

- `public.admins`: RLS attiva senza policy → **bloccata di proposito**;
  si gestisce solo da dashboard/service_role, il client non deve mai
  leggerla o scriverla (la verifica di appartenenza passa da
  `private.is_admin()`, SECURITY DEFINER).
- `public.rate_limits`: RLS attiva senza policy → **bloccata di
  proposito**; l'unico accesso è `rate_limit_hit()` (SECURITY DEFINER,
  EXECUTE al solo `service_role`).

## Nota sul rate-limit (limite noto)

Il freno è volutamente semplice: 5/10min per IP, tabella condivisa. Un
attaccante distribuito su molti IP lo supera, ma ogni submission valida
richiede comunque un token Turnstile verificato server-side: il
rate-limit serve a contenere il volume, non è la difesa primaria.
