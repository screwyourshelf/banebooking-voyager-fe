# Refaktorering: `features/turnering`

## Bakgrunn og problem

Turnering-featuren er bygd opp som én stor klump der all logikk, state og UI for alle brukere og alle faser av turneringen er bakt inn i de samme filene. Dette gjør koden vanskelig å navigere, vanskelig å endre, og vanskelig å resonnere rundt.

### Konkrete symptomer

**`KlasseView.tsx`** er en "god object":

- Importerer ~10 hooks på en gang
- Holder all dialog-state (`resultatKampId`, `resultatErSluttspill`)
- Sender ~20 props ned til `KlasseContent`

**`KlasseContent.tsx`** har et props-interface som speiler `KlasseView` sin state 1:1:

- ~20 props inkludert alle `isPending`-flagg
- Blander påmelding-UI, draw-UI og admin-UI i samme komponent
- Bruker `erAdmin`-flagg spredt gjennom hele JSX-treet

**`TurneringContent.tsx`** blander ansvar:

- Turneringsstatus-styring (admin)
- Klasse-administrasjon (admin)
- Ansvarlige-administrasjon (admin)
- Klasse-tabs for alle brukere
- Alt i én fil

**`components/` og `hooks/`** er flate mapper:

- 14 komponenter uten domeneinndeling
- 15 hooks uten domeneinndeling
- Ingen naturlig gruppering — alt på samme nivå

### Kjerneproblemet

Koden vet ikke hvem brukeren er eller hvilken fase turneringen er i, og kompenserer med `if`-blokker spredt overalt. En admin som ser på en avsluttet turnering og en spiller som melder seg på, kjører gjennom nøyaktig samme kodebase.

---

## Mål

1. Hvert view skal ha ett klart ansvar: _hvem er du, og hva er relevant for deg akkurat nå?_
2. Rolle og turneringsstatus bestemmer hvilket view som rendres — ikke `if`-blokker inni views.
3. Komponenter og hooks grupperes etter domene, ikke etter teknisk type.
4. Ingen enkeltfil skal trenge å importere hooks og komponenter fra alle domener samtidig.

---

## Brukere og roller

Rollene utledes fra `turnering.kapabiliteter` (returnert av API).

| Rolle                 | Kapabiliteter                          | Beskrivelse             |
| --------------------- | -------------------------------------- | ----------------------- |
| **Spiller**           | `meldPaaKlasse`, `seKampprogram`       | Vanlig deltaker         |
| **Resultatansvarlig** | `registrerResultat`, `genererKampplan` | Håndterer gjennomføring |
| **Admin**             | `administrer`, `leggTilAnsvarlig`      | Full kontroll           |

> Roller er ikke gjensidig utelukkende, men en admin vil alltid se admin-viewet (høyeste privilegium vinner).

**Prioriteringsrekkefølge:**

```
Admin → ResultatansvarligView → SpillerView
```

---

## Turneringsfaser

| Status             | Fase-label       | Hva skjer                              |
| ------------------ | ---------------- | -------------------------------------- |
| `Oppsett`          | Oppsett          | Klasser konfigureres, ingen påmelding  |
| `PaameldingAapen`  | Påmelding        | Spillere melder seg på                 |
| `PaameldingLukket` | Påmelding lukket | Søknader behandles, seeding settes     |
| `DrawPublisert`    | Draw klart       | Draw synlig, kampplan kan genereres    |
| `Pagaar`           | Pågår            | Kamper spilles, resultater registreres |
| `Avsluttet`        | Avsluttet        | Kun lesing av sluttresultater          |

---

## Ny arkitektur

### Prinsipp: Rolle × Fase = fokusert view

```
TurneringPage
  └─ TurneringView          ← datahenting, error/loading-håndtering
       └─ utleder rolle
            ├─ [admin]              → TurneringAdminView
            ├─ [resultatansvarlig]  → TurneringResultatansvarligView
            └─ [spiller/publikum]   → TurneringSpillerView
```

Hvert rolle-view switcher videre på status:

```
TurneringAdminView
  ├─ Oppsett              → AdminOppsettView
  ├─ PaameldingAapen/Lukket → AdminPaameldingView
  ├─ DrawPublisert/Pagaar  → AdminKampgjennomforingView
  └─ Avsluttet            → AdminAvsluttetView

TurneringResultatansvarligView
  ├─ DrawPublisert/Pagaar  → ResultatansvarligKampView
  └─ andre statuser       → (informasjonsside)

TurneringSpillerView
  ├─ Oppsett              → (turnering ikke åpen ennå)
  ├─ PaameldingAapen      → SpillerPaameldingView
  ├─ PaameldingLukket     → SpillerVenterView
  ├─ DrawPublisert/Pagaar  → SpillerKampView
  └─ Avsluttet            → SpillerResultatView
```

### Hva hvert view fokuserer på

**`AdminOppsettView`**

- Legg til / fjern klasser
- Konfigurer kampformat, struktur, maks deltakere
- Legg til / fjern resultatansvarlige
- Knapp: «Åpne påmelding»

**`AdminPaameldingView`**

- Oversikt over alle påmeldinger per klasse (søkt/godkjent/reserve/avslått)
- Godkjenn / avslå / sett til reserve
- Sett seeding
- Knapp: «Lukk påmelding» / «Generer draw»

**`AdminKampgjennomforingView`**

- Draw per klasse (grupper + sluttspill)
- Generer kampplan
- Registrer resultater
- Knapp: «Avslutt turnering»

**`AdminAvsluttetView`**

- Sluttresultater og bracket (lesemodus)

**`ResultatansvarligKampView`**

- Kampprogram med alle kamper
- Registrer resultat direkte fra liste
- Generer/oppdater kampplan

**`SpillerPaameldingView`**

- Meld på klasse(r)
- Se egne påmeldinger og status
- Se andre påmeldinger

**`SpillerKampView`**

- Draw / bracket
- Kampprogram
- Se egne kommende kamper fremhevet

**`SpillerResultatView`**

- Sluttresultater og bracket (lesemodus)

---

## Ny mappe- og filstruktur

```
features/turnering/
│
├── pages/
│   └── TurneringPage.tsx                  (uendret)
│
├── views/
│   ├── TurneringView.tsx                  (datahenting + rolle-dispatching)
│   │
│   ├── admin/
│   │   ├── TurneringAdminView.tsx         (status-switch)
│   │   ├── AdminOppsettView.tsx
│   │   ├── AdminPaameldingView.tsx
│   │   ├── AdminKampgjennomforingView.tsx
│   │   └── AdminAvsluttetView.tsx
│   │
│   ├── resultatansvarlig/
│   │   ├── TurneringResultatansvarligView.tsx
│   │   └── ResultatansvarligKampView.tsx
│   │
│   └── spiller/
│       ├── TurneringSpillerView.tsx
│       ├── SpillerPaameldingView.tsx
│       ├── SpillerKampView.tsx
│       └── SpillerResultatView.tsx
│
├── hooks/
│   ├── turnering/
│   │   ├── useTurnering.ts
│   │   ├── useOpprettTurnering.ts
│   │   ├── useOppdaterTurneringStatus.ts
│   │   ├── useLeggTilKlasse.ts
│   │   └── useFjernKlasse.ts
│   │
│   ├── paamelding/
│   │   ├── usePaameldinger.ts
│   │   ├── useMeldPaaKlasse.ts
│   │   ├── useTrekkPaamelding.ts
│   │   ├── useOppdaterPaameldingStatus.ts
│   │   └── useOppdaterPaameldingSeed.ts
│   │
│   ├── draw/
│   │   ├── useDraw.ts
│   │   ├── useGenererDraw.ts
│   │   ├── useGenererKampplan.ts
│   │   └── useRegistrerResultat.ts
│   │
│   └── admin/
│       ├── useAnsvarlige.ts
│       └── useAnsvarligMutations.ts
│
└── components/
    ├── turnering/
    │   ├── TurneringStatusBadge.tsx
    │   └── LeggTilKlasseDialog.tsx
    │
    ├── paamelding/
    │   ├── MeldPaaDialog.tsx
    │   ├── PaameldingStatusBadge.tsx
    │   ├── PaameldingStatusDialog.tsx
    │   └── SeedDialog.tsx
    │
    └── draw/
        ├── KampKort.tsx
        ├── KampStatusBadge.tsx
        ├── GruppeStillingTabell.tsx
        ├── SluttspillBracket.tsx
        ├── ResultatDialog.tsx
        ├── GenererDrawDialog.tsx
        ├── GenererKampplanDialog.tsx
        └── KlasseTypeLabel.tsx
```

---

## Implementasjonsplan

Hvert steg er uavhengig og kan landes separat uten å bryte eksisterende funksjonalitet.

---

### Steg 1 — Reorganiser `hooks/` i domener - UTFØRT!

**Omfang:** Kun filflytting + oppdatering av imports. Ingen logikkendringer.

Flytt hooks til undermapper som beskrevet i strukturen over:

- `hooks/turnering/` — turnering-nivå-hooks
- `hooks/paamelding/` — påmelding-hooks
- `hooks/draw/` — draw og kampplan-hooks
- `hooks/admin/` — ansvarlige-hooks

Oppdater alle imports i `views/` og `components/` som peker på de flyttede hookene.

**Verifisering:** Bygget er grønt. Ingen funksjonell endring.

---

### Steg 2 — Reorganiser `components/` i domener UTFØRT

**Omfang:** Kun filflytting + oppdatering av imports. Ingen logikkendringer.

Flytt komponenter til undermapper som beskrevet i strukturen over:

- `components/turnering/`
- `components/paamelding/`
- `components/draw/`

Oppdater eller fjern `components/index.ts` (vurder per-domene `index.ts` i stedet).

**Verifisering:** Bygget er grønt. Ingen funksjonell endring.

Resultat:

components/
├── index.ts ← re-eksporterer alt fra nye stier
├── turnering/
│ ├── TurneringStatusBadge.tsx
│ └── LeggTilKlasseDialog.tsx
├── paamelding/
│ ├── MeldPaaDialog.tsx
│ ├── PaameldingStatusBadge.tsx
│ ├── PaameldingStatusDialog.tsx
│ └── SeedDialog.tsx
└── draw/
├── KampKort.tsx
├── KampStatusBadge.tsx
├── GruppeStillingTabell.tsx
├── SluttspillBracket.tsx
├── ResultatDialog.tsx
├── GenererDrawDialog.tsx
├── GenererKampplanDialog.tsx
└── KlasseTypeLabel.tsx

---

### Steg 3 — Introduser rolle-dispatching i `TurneringView` UTFØRT

**Omfang:** `TurneringView.tsx` og ny hjelpefunksjon `utledRolle`.

Legg til en funksjon som utleder rolle fra kapabiliteter:

```typescript
type TurneringRolle = "admin" | "resultatansvarlig" | "spiller";

function utledRolle(kapabiliteter: string[]): TurneringRolle {
  if (harHandling(kapabiliteter, Kapabiliteter.turnering.administrer)) return "admin";
  if (harHandling(kapabiliteter, Kapabiliteter.turnering.registrerResultat))
    return "resultatansvarlig";
  return "spiller";
}
```

`TurneringView` rendrer `TurneringAdminView`, `TurneringResultatansvarligView` eller `TurneringSpillerView` basert på rolle. De to sistnevnte kan i dette steget bare gjenbruke eksisterende `TurneringContent` midlertidig.

**Verifisering:** Alle brukere ser fortsatt det samme som før. Bygget er grønt.

RESULTAT: Hva som ble gjort:
• Lagt til type TurneringRolle og funksjonen utledRolle i TurneringView.tsx — prioriterer admin → resultatansvarlig → spiller basert på turnering.kapabiliteter
• TurneringView dispatcher nå til korrekt rolle-view via renderRolleView
• Opprettet tre nye views som midlertidig wrapper eksisterende TurneringContent:
• TurneringAdminView.tsx
• TurneringResultatansvarligView.tsx
• TurneringSpillerView.tsx
Alle brukere ser fortsatt nøyaktig det samme som før — ingen funksjonell endring. Bygget er grønt for de berørte filene. Klar for steg 4.

---

### Steg 4 — Bygg `TurneringAdminView` med fase-basert innhold UTFØRT

**Omfang:** Ny view-struktur under `views/admin/`.

Splitt dagens `TurneringContent` + `KlasseView` + `KlasseContent` (admin-delene) ut i:

- `TurneringAdminView` — status-switch
- `AdminOppsettView` — klasser, ansvarlige, åpne påmelding
- `AdminPaameldingView` — påmelding-liste, godkjenn/seed/trekk, generer draw
- `AdminKampgjennomforingView` — draw, kampplan, registrer resultater
- `AdminAvsluttetView` — sluttresultater (lesemodus)

Gammel `TurneringContent` og admin-deler av `KlasseContent` kan slettes når dette er på plass.

**Verifisering:** Admin-bruker ser korrekt view for hver turnerings-status.

RESULTAT:
Alle filer er feilfrie. Steg 4 er ferdig.

---

Her er hva som ble gjort:
Nye filer opprettet under views/admin/:
• adminStatusUtils.ts — delt hjelpefil med STATUS_REKKEFOLGE, STATUS_LABELS og nesteStatus(). Brukes av alle admin-views som trenger "neste status"-knapp.
• AdminOppsettView.tsx — for status Oppsett. Viser klasse-liste (legg til / fjern), resultatansvarlige (legg til / fjern) og LeggTilKlasseDialog. Ingen klasse-tabs nødvendig her.
• AdminPaameldingView.tsx — for status PaameldingAapen og PaameldingLukket. Viser header + klasse-tabs. Hver tab inneholder AdminPaameldingKlasseTab (lokal komponent) som henter påmeldingsdata selv og håndterer status, seed, trekk og draw-generering.
• AdminKampgjennomforingView.tsx — for status DrawPublisert og Pagaar. Viser header + klasse-tabs. Hver tab inneholder AdminKampKlasseTab (lokal komponent) som henter draw-data og håndterer kampplan-generering og resultat-registrering.
• AdminAvsluttetView.tsx — for status Avsluttet. Viser draw i lesemodus — ingen knapper for registrering eller statusendring.
Oppdatert TurneringAdminView.tsx — dispatcher nå på turnering.status til riktig sub-view i stedet for å wrape den gamle TurneringContent.
TurneringContent.tsx, KlasseView.tsx og KlasseContent.tsx er ikke berørt — de beholdes til steg 7.

---

### Steg 5 — Bygg `TurneringSpillerView` med fase-basert innhold

**Omfang:** Ny view-struktur under `views/spiller/`.

Bygg spillerens views fra bunnen — fokusert på det spilleren trenger:

- `TurneringSpillerView` — status-switch
- `SpillerPaameldingView` — meld på, se egne og andres påmeldinger
- `SpillerKampView` — draw, bracket, kommende kamper
- `SpillerResultatView` — sluttresultater

**Verifisering:** Spiller-bruker ser korrekt, fokusert view per fase.

---

### Steg 6 — Bygg `TurneringResultatansvarligView` UTFØRT

**Omfang:** Ny view-struktur under `views/resultatansvarlig/`.

Fokusert på gjennomføring:

- `TurneringResultatansvarligView` — status-switch
- `ResultatansvarligKampView` — kampprogram, registrer resultat, kampplan

Mye av logikken kan gjenbrukes fra `AdminKampgjennomforingView` (vurder felles hooks/komponenter).

**Verifisering:** Resultatansvarlig-bruker ser kampfokusert view.

RESULTAT: Ny fil: ResultatansvarligKampView.tsx
• Lokalt klasse-tab-komponent ResultatansvarligKlasseTab som håndterer draw-henting, resultat-registrering og kampplan-generering
• Ingen statusendrings-knapp (admin-ansvar)
• Ingen "Generer draw"-knapp (admin-ansvar) — kun kampplan-generering for kanGenererKampplan
• Samme layout-mønster som AdminKampgjennomforingView: header + klasse-tabs
Oppdatert: TurneringResultatansvarligView.tsx
• DrawPublisert / Pagaar → ResultatansvarligKampView
• Alle andre statuser → informasjonsside med turneringstittel, statusbadge og melding om at det ikke er noe å gjøre ennå
Sidefiksing (pre-eksisterende brudt import fra steg 1):
• ArrangementView.tsx og RedigerArrangementView.tsx importerte useOpprettTurnering fra gammel sti — oppdatert til hooks/turnering/useOpprettTurnering

---

### Steg 7 — Rydd opp og slett gammel kode UTFØRT

**Omfang:** Slett utgåtte filer.

- Slett `views/turnering/TurneringContent.tsx`
- Slett `views/klasse/KlasseView.tsx`
- Slett `views/klasse/KlasseContent.tsx`
- Verifiser at ingen imports peker på disse lenger

**Verifisering:** Bygget er grønt. Ingen dead code.

RESULTAT Oppsummering av hva som ble gjort:
• Slettet TurneringContent.tsx
• Slettet KlasseView.tsx
• Slettet KlasseContent.tsx
• Oppdaterte TurneringSpillerView.tsx til en ren placeholder (den midlertidige wrapperen fra steg 3 pekte fortsatt på TurneringContent)
TypeScript-kompilering er grønn. Ingen dead code gjenstår fra den gamle arkitekturen. Klar for steg 5 — bygg TurneringSpillerView med fase-basert innhold.

---

## Hva vi _ikke_ endrer

- `TurneringPage.tsx` — uendret gjennom hele prosessen
- `types/Turnering.ts` — uendret
- `utils/kapabiliteter.ts` — uendret
- Alle eksisterende hooks og komponenter — logikken flyttes, ikke omskrives
- API-kall og React Query-oppsett — uendret

---

## Avhengigheter mellom steg

```
Steg 1 ──┐
Steg 2 ──┼──► Steg 3 ──► Steg 4 ──► Steg 7
          │              Steg 5 ──►  /
          └──────────►   Steg 6 ──► /
```

Steg 1 og 2 kan gjøres parallelt. Steg 3 bør komme før steg 4–6. Steg 7 kommer sist.
