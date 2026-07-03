# Brief per Lovable — App Questionario NC

> **Cos'è.** Il materiale per costruire l'app in Lovable (Step 1). Non è un prompt unico: è un **prompt di avvio** (Parte A) + **follow-up sezione per sezione** (Parte B), più il **contratto tecnico** del submit (Parte C).
> **Perché così.** Gli AI-builder si incartano su un mega-prompt unico ed eterogeneo (lezione dal build Jotform). Meglio: avvio → scheletro, poi una sezione per volta, verificando dopo ognuna.

---

## PRIMA DI INCOLLARE — prerequisiti in Lovable

1. **Collega Supabase** (non Lovable Cloud): in Lovable → integrazione Supabase → autorizza → scegli il progetto **`nc-questionario`** (regione UE, quello che abbiamo appena creato). Lovable prende da solo URL + chiave anon.
2. **Non far creare tabelle a Lovable**: lo schema esiste già. L'app deve solo *chiamare* la funzione `submit_intake`.
3. Dopo lo scaffold: **crea la repo su GitHub** da Lovable (servirà per Claude Code allo Step 2).

---

## PARTE A — PROMPT DI AVVIO (incolla per primo)

```
Costruisci un'app web di questionario d'ingresso (intake) per un personal trainer, interamente in italiano.

È un form PUBBLICO multi-step: un cliente lo compila SENZA login/account. Una sezione per schermata, con barra di avanzamento, pulsanti Avanti/Indietro, mobile-first, UI pulita e accessibile.

Stack: React + Vite + Supabase JS (progetto Supabase già collegato).

REGOLE BACKEND (importante):
- NON creare tabelle, NON usare Lovable Cloud: lo schema esiste già nel progetto Supabase collegato.
- L'app NON deve leggere dalle tabelle né scrivere direttamente su di esse (l'utente anonimo non ha accesso: è previsto e corretto).
- L'UNICO modo di salvare è, al submit finale, chiamare la funzione RPC:
      supabase.rpc('submit_intake', { payload })
  dove payload è un JSON con questa forma:
      { "submission": {...}, "health": {...}, "nutrition": {...}, "neurotype": { "q01".."q30" } }
  (i campi esatti te li do nei messaggi successivi).
- Usa la chiave anon pubblica del progetto collegato.

STRUTTURA (ordine: 0 -> 7, poi neurotipo):
  0. Consensi (GDPR, granulari)
  1. Anagrafica e contatti
  2. Salute e sicurezza (PAR-Q+)
  3. Corpo e obiettivo
  4. Stile di vita
  5. Allenamento
  6. Nutrizione  (mostrala SOLO se, nella sez. 0, il consenso "consigli alimentari" e' su Si)
  7. Gestione e logistica
  8. Neurotipo (30 affermazioni, scala A-E)

PER ORA: crea lo scheletro multi-step con la navigazione, la barra di avanzamento, e una validazione di base. I due consensi obbligatori (trattamento dati salute + presa d'atto "non e' un medico") devono BLOCCARE l'invio se non spuntati. I campi di dettaglio di ogni sezione te li passo nei prossimi messaggi, una sezione alla volta.

Al submit riuscito: mostra una schermata di conferma ("Grazie, ho ricevuto le tue risposte") e NON mostrare i dati inseriti.

Non aggiungere ancora la sezione Nutrizione e le 30 domande neurotipo in dettaglio: lascia i placeholder, li riempiamo nei follow-up.
```

---

## PARTE B — FOLLOW-UP SEZIONE PER SEZIONE (incolla dopo lo scaffold, uno alla volta)

> Per ogni campo: **etichetta cliente** -> `chiave_payload` -> (tipo / valori ammessi). Le chiavi e i valori devono essere **esatti** (il database li valida).

### B0 — Sezione 0: Consensi (payload.submission)
```
Sezione 0 "Consensi". 6 voci separate (mai a pacchetto):
- "Acconsento al trattamento dei miei dati relativi alla salute per la preparazione sportiva (necessario per iniziare)" -> consent_health (checkbox, OBBLIGATORIO true per proseguire)
- "Desidero ricevere suggerimenti alimentari a supporto dell'allenamento e mi impegno a sottoporli al mio medico" -> consent_nutrition (Si/No) [questo abilita la sezione 6]
- "Autorizzo foto e misurazioni corporee per monitorare i progressi" -> consent_photos (Si/No)
- "Autorizzo la condivisione dei dati col mio medico o altri professionisti" -> consent_share_medical (Si/No)
- "Desidero ricevere comunicazioni e materiale informativo non essenziali" -> consent_marketing (Si/No)
- "Presa d'atto: il servizio ha finalita' di benessere fisico, non mediche; Nicolo' e' un personal trainer, non un medico/nutrizionista, e non li sostituisce" -> consent_disclaimer (checkbox, OBBLIGATORIO true)
I Si/No vanno inviati come booleani true/false. consent_health e consent_disclaimer = true obbligatori.
```

### B1 — Sezione 1: Anagrafica (payload.submission)
```
- Nome e cognome -> full_name (testo, obbligatorio)
- Sesso biologico -> sex (scelta: "maschio" | "femmina", obbligatorio)
- Pronome preferito -> pronoun (scelta: "tu_lei" | "tu_lui" | "voi_loro")   [etichette: Tu/Lei, Tu/Lui, Voi/Loro]
- Data di nascita -> birth_date (data, formato ISO AAAA-MM-GG, obbligatorio)
- Telefono -> phone (testo, obbligatorio)
- Email -> email (email, obbligatorio)
```

### B2 — Sezione 2: Salute / PAR-Q+ (payload.health)
```
7 domande Si/No obbligatorie (inviare booleani):
- Condizione cardiaca o pressione alta? -> parq_heart
- Dolore al torace a riposo o in attivita'? -> parq_chest_pain
- Perso equilibrio per capogiri o perso conoscenza negli ultimi 12 mesi? -> parq_balance
- Altra condizione medica cronica diagnosticata? -> parq_other_chronic
- Assumi farmaci prescritti per una condizione cronica? -> parq_meds
- Problemi a ossa/articolazioni/tessuti molli che potrebbero peggiorare? -> parq_msk
- Il medico ti ha detto di fare attivita' solo sotto supervisione? -> parq_supervised
Extra:
- "Se hai risposto Si sopra, elenca condizioni e farmaci" -> conditions_meds (testo lungo)
- "Hai dolore in questo momento?" -> pain_now (Si/No booleano); se Si mostra "Dove?" -> pain_where (testo)
- "Infortuni/operazioni passati: zona, quando, se limita ancora" -> past_injuries (testo lungo)
- "Sei in gravidanza o post-partum?" -> pregnancy (scelta: "si" | "no" | "na")   [na = non applicabile]
- (solo donne) "Il tuo ciclo mestruale e':" -> cycle_status (scelta: "regolare" | "irregolare" | "assente_3m" | "menopausa" | "contraccezione_ormonale"); se irregolare o assente mostra "Da quando?" -> cycle_since (testo)
- "Hai allergie/reazioni gravi rilevanti per la sicurezza (anafilassi, lattice, farmaci, punture)?" -> safety_allergy (Si/No booleano); se Si -> safety_allergy_detail (testo)
```

### B3 — Sezione 3: Corpo e obiettivo (payload.submission)
```
- Altezza (cm) -> height_cm (numero) | Peso attuale (kg) -> weight_kg (numero)  [entrambi obbligatori]
- Storia del peso (max e min da adulto) -> weight_history (testo)
- Peso obiettivo/target -> weight_target (testo)
- Obiettivo principale lavorando con me -> main_goal (testo lungo, obbligatorio)
- Qualcosa dell'aspetto fisico da migliorare -> aesthetic_goal (testo lungo)
- Scadenza/evento di riferimento -> deadline_event (testo)
- Qualcosa nel modo di muoverti da migliorare -> movement_goal (testo lungo)
```

### B4 — Sezione 4: Stile di vita (payload.submission)
```
- Lavoro, ore/sett, sedentario o in movimento, orari (fissi/turni/notturni) -> work_desc (testo lungo)
- Stress quotidiano -> stress_level (scelta: "molto_alto"|"alto"|"medio"|"basso"|"molto_basso")
- Ore di sonno a notte -> sleep_hours (testo)
- Qualita' del sonno -> sleep_quality (scelta: "ottima"|"buona"|"media"|"scarsa"|"pessima")
- Attivita' quotidiana non sportiva (passi/NEAT) -> neat_steps (scelta: "<5000"|"5000-7500"|"7500-10000"|"10000-12500"|">12500")
- Acqua al giorno (litri) -> water_liters (testo) | Alcol a settimana -> alcohol_week (testo) | Fumo (quante/die) -> smoking (testo)
- Qualcosa nello stile di vita da migliorare -> lifestyle_goal (testo lungo)
```

### B5 — Sezione 5: Allenamento (payload.submission)
```
- Sport praticati e per quanto -> sports_history (testo lungo)
- Ultimo/attuale sport, da quando -> current_sport (testo)
- Attivita' fisica preferita -> favorite_activity (testo)
- Uso di bilanciere/attrezzi (crossfit, powerlifting, pesistica, kettlebell) e per quanto -> barbell_experience (testo lungo)
- Livello di esperienza coi pesi -> experience_level (scelta: "novizio"|"principiante"|"intermedio"|"avanzato"|"master")
- Carico di lavoro abituale -> workload (scelta: "molto_basso"|"basso"|"medio"|"alto"|"molto_alto")
- Capacita' di recupero -> recovery_capacity (scelta: "ottima"|"buona"|"media"|"scarsa"|"pessima")
- Max giorni/sett di allenamento -> max_days_week (scelta: "2"|"3"|"4"|"5"|"6")
- Minuti per sessione -> session_minutes (testo)
- Dove ti alleni e con quale attrezzatura -> equipment (testo lungo, OBBLIGATORIO)
- 1RM/3RM/5RM recenti con data (Squat/Panca/Stacco/Lento) -> recent_maxes (testo lungo)
```

### B6 — Sezione 6: Nutrizione (payload.nutrition) — SOLO se consent_nutrition = true
```
Mostra questa sezione solo se in sez.0 consent_nutrition e' Si. Se No, salta e non inviare il blocco "nutrition".
- Come valuteresti la tua dieta attuale -> diet_assessment (scelta: "iper"|"iso"|"ipo"|"non_so")  [Ipercalorica/Isocalorica/Ipocalorica/Non saprei]
- Quanti pasti al giorno e orari -> meals_desc (testo lungo)
- Diete passate, risultati, oscillazioni yo-yo -> diet_history (testo lungo)
- Cibi che ami / che eviti -> foods_love_avoid (testo lungo)
- Intolleranze, allergie o esclusioni (mediche/religiose/etiche) -> intolerances (testo lungo)
- Chi cucina e dove mangi di solito -> who_cooks (testo)
- Integratori che assumi ora -> supplements (testo lungo)
```

### B7 — Sezione 7: Gestione e logistica (payload.submission)
```
- Come preferisci lavorare -> work_mode (scelta: "presenza"|"remoto"|"ibrido"|"app")
- Disponibilita' (giorni e fasce orarie) -> availability (testo lungo)
- Perche' proprio ora -> why_now (testo lungo)
- Gia' lavorato con un coach/in palestra: cosa ha funzionato e cosa no -> past_coaching (testo lungo)
- Ostacoli che prevedi -> foreseen_obstacles (testo lungo)
- Fra qualche mese, cosa dovra' essere successo per essere soddisfatto -> success_definition (testo lungo)
- Supporto attorno a te (famiglia/amici/partner) -> support_network (testo)
```

### B8 — Sezione 8: Neurotipo (payload.neurotype)
```
30 affermazioni, ognuna con la STESSA scala a 5 opzioni (invia la LETTERA):
  A = Mi descrive molto bene (quasi sempre)
  B = Mi descrive bene (la maggior parte delle volte)
  C = In parte (poco piu' della meta')
  D = Non molto (meno della meta')
  E = Non mi descrive affatto
Le affermazioni vanno numerate q01..q30 NELL'ORDINE QUI SOTTO (l'ordine conta: lo scoring e' per posizione). NON mostrare al cliente le etichette di gruppo (1A/1B/2A/2B/3).

q01 Quando sono in gruppo voglio esserne il leader.
q02 Se il servizio al ristorante e' cattivo, non ho problemi a farlo notare apertamente.
q03 Se so che qualcuno ha diffuso voci su di me, sento il bisogno di affrontarlo.
q04 Sento il bisogno di essere il migliore in ogni cosa; anche un gioco banale diventa una sfida.
q05 Se vedo un'opportunita' la colgo sempre, anche oltre le mie capacita'; preferisco rischiare.
q06 Se non riesco al primo colpo, significa solo che devo lavorare piu' duramente: ce la faro'.
q07 Sono sempre stato agile e veloce, fin da piccolo.
q08 Nel traffico preferisco una deviazione piuttosto che stare in coda, anche se ci metto di piu'.
q09 In attesa di un appuntamento devo tenermi impegnato: non riesco a stare fermo a far nulla.
q10 Riesco a leggere con musica in sottofondo e trattenere le informazioni.
q11 Quando parlo, spesso cambio argomento a meta' conversazione.
q12 Ho bisogno di nuove esperienze/attivita' spesso, altrimenti mi annoio.
q13 In una conversazione dico spesso "anch'io", "la penso uguale", "so cosa intendi".
q14 Odio prendere decisioni: preferisco che altri scelgano film o ristorante.
q15 In situazioni adrenaliniche divento la versione "alfa" di me: piu' sicuro e carismatico.
q16 Rimando le cose fino all'ultimo (procrastino) ed e' cosi' che lavoro meglio.
q17 Senza fretta o pressione sono pigro, ma quando le cose si muovono divento molto produttivo.
q18 Sto attento a non ferire i sentimenti degli altri, anche quando la parte offesa sono io.
q19 Sono una persona emotiva: le mie reazioni sono facili e intense (positive o negative).
q20 Preferisco attivita' che conosco e mi piacciono piuttosto che provare cose nuove.
q21 Ho un cibo preferito che potrei mangiare tutto il giorno.
q22 Ho bisogno di sentirmi desiderato, amato e apprezzato per stare bene.
q23 Ho spesso conversazioni negative con me stesso ("non sono bravo", "non valgo").
q24 Do molto peso a cio' che gli altri pensano di me.
q25 Prendo decisioni basate sui fatti, non su emozioni e istinto.
q26 Non amo attivita' con fattori di rischio troppo alti.
q27 Mi preoccupo molto per cose che potrebbero andare male in futuro.
q28 Preferisco passare il tempo libero da solo (leggere, tv, gaming) piuttosto che uscire.
q29 Se il successo non arriva subito, mi sta bene un percorso piu' graduale e lento.
q30 Faccio fatica ad addormentarmi perche' non riesco a "spegnere" il cervello.
```

---

## PARTE C — CONTRATTO submit_intake (riferimento tecnico)

Al submit, l'app costruisce UN oggetto `payload` e chiama `supabase.rpc('submit_intake', { payload })`.

```json
{
  "submission": {
    "consent_health": true, "consent_disclaimer": true,
    "consent_nutrition": false, "consent_photos": false,
    "consent_share_medical": false, "consent_marketing": false,
    "full_name": "", "sex": "maschio|femmina", "pronoun": "tu_lei|tu_lui|voi_loro",
    "birth_date": "AAAA-MM-GG", "phone": "", "email": "",
    "height_cm": 0, "weight_kg": 0, "weight_history": "", "weight_target": "",
    "main_goal": "", "aesthetic_goal": "", "deadline_event": "", "movement_goal": "",
    "work_desc": "", "stress_level": "", "sleep_hours": "", "sleep_quality": "",
    "neat_steps": "", "water_liters": "", "alcohol_week": "", "smoking": "", "lifestyle_goal": "",
    "sports_history": "", "current_sport": "", "favorite_activity": "", "barbell_experience": "",
    "experience_level": "", "workload": "", "recovery_capacity": "", "max_days_week": "",
    "session_minutes": "", "equipment": "", "recent_maxes": "",
    "work_mode": "", "availability": "", "why_now": "", "past_coaching": "",
    "foreseen_obstacles": "", "success_definition": "", "support_network": ""
  },
  "health": {
    "parq_heart": false, "parq_chest_pain": false, "parq_balance": false,
    "parq_other_chronic": false, "parq_meds": false, "parq_msk": false, "parq_supervised": false,
    "conditions_meds": "", "pain_now": false, "pain_where": "", "past_injuries": "",
    "pregnancy": "na", "cycle_status": "", "cycle_since": "",
    "safety_allergy": false, "safety_allergy_detail": ""
  },
  "nutrition": {
    "diet_assessment": "", "meals_desc": "", "diet_history": "",
    "foods_love_avoid": "", "intolerances": "", "who_cooks": "", "supplements": ""
  },
  "neurotype": { "q01": "A", "q02": "B", "...": "...", "q30": "E" }
}
```

Regole:
- Includi il blocco `nutrition` SOLO se `consent_nutrition` = true (altrimenti omettilo).
- I campi a scelta devono usare ESATTAMENTE i valori ammessi elencati nella Parte B (il DB li rifiuta se diversi).
- I Si/No vanno come booleani `true`/`false`. Le date come `AAAA-MM-GG`. I numeri (height_cm, weight_kg) come numeri o stringa vuota se non compilati.
- La funzione ritorna l'`id` della submission. Non serve leggere altro.

---

## GUARDRAIL / DA FARE (allo Step 2, in Claude Code)

- **CAPTCHA anti-spam** (Cloudflare Turnstile) sul submit pubblico + eventuale rate-limit: da aggiungere prima del go-live (endpoint pubblico = invita spam).
- **Logica condizionale** fine (sez.6 se consenso; rami "se Si") e **validazione** completa: rifinire in Claude Code.
- **Nessun dato reale** finche' non c'e' il CAPTCHA e non e' fatta la review finale.
- **Scoring neurotipo**: resta lato coach (`scoring-neurotipo.py`), non nel form.
- A scaffold pronto: **crea la repo GitHub** da Lovable -> poi Step 2 (Claude Code).
```
