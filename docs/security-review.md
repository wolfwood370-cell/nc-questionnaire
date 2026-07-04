# Security review — questionario d'ingresso

> Ultimo aggiornamento: **go-live (2026-07-04)**. Il questionario è **LIVE**
> su https://nc-questionnaire.lovable.app e funziona end-to-end: un invio
> reale con dati finti è andato a buon fine (`200`) ed è poi stato eliminato.
> Tutti i controlli sotto sono stati ESEGUITI sul progetto live
> `nc-questionario` (srrmauojpficdswmtjya, regione UE).

## Configurazione go-live (COMPLETATA)

| Cosa                                          | Stato                                                                                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site key Turnstile (client)                   | REALE (`0x4AAAAAADvNtp_28hHdboCJ`), cablata in `src/components/intake/TurnstileWidget.tsx`; hostname `nc-questionnaire.lovable.app` autorizzato nel widget Cloudflare |
| `TURNSTILE_SECRET_KEY` (secret Edge Function) | REALE, solo in Edge Functions → Secrets. Verificato: un token non valido → `captcha_failed`                                                                           |
| `ALLOWED_ORIGINS` (secret Edge Function)      | Solo il dominio di produzione `https://nc-questionnaire.lovable.app` (localhost rimosso). Verificato: origin estranea/localhost → `null`                              |
| URL + anon key Supabase (client)              | Cablati in `src/lib/supabase.ts` (vedi sezione sotto)                                                                                                                 |
| Utente coach in `admins`                      | Fatto e verificato; resta solo la prova di login quando esisterà una UI coach                                                                                         |

## Valori pubblici del client: cablati nel codice, non come env

L'hosting (Lovable) **non inietta le variabili `VITE_*`** nel build
pubblicato e le **rifiuta nei secret** (sono valori browser, non segreti).
Per questo i tre valori PUBBLICI del client sono cablati come default nel
codice, con l'env come override per lo sviluppo locale:

- **URL progetto** e **anon key** Supabase → `src/lib/supabase.ts`
- **site key** Turnstile → `src/components/intake/TurnstileWidget.tsx`

Sono pubblici per costruzione: finiscono comunque nel bundle servito al
browser. La loro presenza nel repo **non è una falla** — l'accesso ai dati
è protetto da RLS + dal gateway Edge Function con Turnstile.

**La `service_role` key (segreta) NON compare mai nel client né nel repo**:
vive solo nei secret della Edge Function. Verificato: il bundle di
produzione non contiene `service_role` né la secret Turnstile.

> **Operativo**: un fix al **client** (es. i valori cablati sopra, la UI)
> richiede un **re-publish da Lovable**, che ricompila il bundle dal repo;
> un fix alla **Edge Function** si deploya direttamente su Supabase, senza
> passare da Lovable.

## Architettura di sicurezza

L'UNICO canale di scrittura per il pubblico è la Edge Function
`submit-intake` (verify_jwt attivo → serve la anon key come Bearer):

1. **CORS**: origin ammesse solo da `ALLOWED_ORIGINS`; origin estranea → 403.
   L'header `Access-Control-Allow-Headers` riflette gli header del preflight
   (le versioni recenti di supabase-js ne aggiungono di nuovi, es.
   `x-supabase-api-version`): una lista fissa farebbe fallire il preflight.
2. **Rate-limit**: 5 richieste / 10 min per IP fidato (`cf-connecting-ip`),
   contatori in Postgres (`rate_limits` + `rate_limit_hit()`, migrazione 0005) perché ogni richiesta gira su un isolate nuovo e lo stato in-memory
   non conta. Nel DB va solo l'HASH SHA-256 dell'IP.
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

- [x] **Invio reale end-to-end**: dal sito pubblicato, con chiavi reali,
      compilazione completa + captcha risolto → `200`, riga completa nelle
      tabelle; riga di collaudo poi eliminata (DB a zero su tutte le tabelle).
- [x] **Nessuna secret/service key nel bundle client**: build di produzione
      scansionato (`service_role`, `TURNSTILE_SECRET`, `SUPABASE_SERVICE`):
      nessun match. Nel client vivono solo URL progetto, anon key e site key
      Turnstile — tutti valori pubblici per progetto (cablati, vedi sopra).
- [x] **Secret Turnstile solo server**: vive in Edge Functions → Secrets;
      rimossa la copia erroneamente creata nei secrets di Lovable.
- [x] **Nessun dato salute in log/analytics** (art.9 GDPR): - client: nessun `console.*` del payload; errori di submit → messaggio
      generico in italiano; font self-hosted (nessuna richiesta a Google
      Fonts, quindi nessun IP a terzi pre-consenso). - Edge Function: mai loggato il payload né l'errore Postgres. - Postgres: `submit_intake` (0004) intercetta ogni eccezione e rilancia
      un messaggio fisso — niente `Failing row contains (...)` nei log. - rate-limit: hash dell'IP, mai IP in chiaro.
- [x] **CORS ristretto**: verificato sul live (lovable.app ammessa,
      `evil.example.com` e domini di anteprima → 403 / ACAO `null`).
- [x] **RLS deny-by-default provata sul live** (con riga di test poi
      eliminata): - `anon`: `select` su `submissions` → `permission denied` (via SQL e
      via PostgREST, 401); - `anon`: `submit_intake` diretto → `permission denied` (0006) — il
      CAPTCHA non è aggirabile; - `authenticated` NON in `admins`: 0 righe visibili; - submit via Edge Function con token valido → 200, riga completa; - `is_admin` non più esposta via API (404): vive in `private.` (0007),
      schema non servito da PostgREST.
- [x] **Migrazioni versionate allineate al live**: 7 migrazioni nel repo
      (0001–0007) = 7 applicate sul progetto (verificato con la lista
      migrazioni remota).
- [x] **Coach legge**: utente Auth del coach inserito in `public.admins`;
      simulando il suo JWT (`request.jwt.claims` con il suo `sub`) vede le
      righe di submissions e health_screening, mentre un `authenticated` con
      uid diverso ne vede 0. La 0007 ha aggiunto i GRANT `select/update` che
      mancavano al ruolo `authenticated`. Resta solo la prova di login
      dall'app quando esisterà una UI coach.

## Lint degli advisor accettati (intenzionali)

Gli advisor di sicurezza Supabase riportano solo 2 INFO, entrambi voluti:

- `public.admins`: RLS attiva senza policy → **bloccata di proposito**; si
  gestisce solo da dashboard/service_role, il client non deve mai leggerla o
  scriverla (la verifica di appartenenza passa da `private.is_admin()`,
  SECURITY DEFINER).
- `public.rate_limits`: RLS attiva senza policy → **bloccata di proposito**;
  l'unico accesso è `rate_limit_hit()` (SECURITY DEFINER, EXECUTE al solo
  `service_role`).

## Nota sul rate-limit (limite noto)

Il freno è volutamente semplice: 5/10min per IP, tabella condivisa. Un
attaccante distribuito su molti IP lo supera, ma ogni submission valida
richiede comunque un token Turnstile verificato server-side: il rate-limit
serve a contenere il volume, non è la difesa primaria.
