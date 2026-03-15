# Designdokument: Feilhåndtering i appen

## Bakgrunn

Feilrapporteringen i appen er inkonsistent og for «chatty». `toast.error` brukes til alt –
også på skjema-submit og dialogs – noe som gir dårlig UX fordi feilen vises utenfor
konteksten der den oppstod. I tillegg er det en bug i API-laget som gjør at den faktiske
feilmeldingen fra backend ikke alltid vises.

Målet med dette dokumentet er å:

- Definere en klar strategi for når vi bruker toast, inline-feil og error page
- Kartlegge alle steder som må endres
- Gi en prioritert plan som kan gjennomføres domene for domene

---

## Backend-kontrakt

Alle controllere returnerer `ProblemDetails` ved feil via `FeilResultat(melding, kode)`:

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "Faktisk feilmelding fra backend"
}
```

HTTP-statuskoder som brukes:

| Feilkode       | HTTP-status |
| -------------- | ----------- |
| `IkkeFunnet`   | 404         |
| `IkkeTilgang`  | 403         |
| _(alle andre)_ | 400         |

Den faktiske meldingen ligger alltid i `detail`. `title` er alltid HTTP-statusteksten
(«Bad Request», «Not Found» osv.) og er ikke nyttig å vise til bruker.

---

## Kjent bug – `pickErrorMessage` i `api.ts`

`pickErrorMessage` sjekker `title` **før** `detail`, noe som betyr at alle 400-svar
viser «Bad Request» i stedet for den forklarende meldingen fra backend.

```typescript
// FEIL – returnerer "Bad Request" fra title før detail leses
(typeof obj.title === "string" && obj.title) ||
(typeof obj.detail === "string" && obj.detail) ||

// RIKTIG – sjekk detail først
(typeof obj.detail === "string" && obj.detail) ||
(typeof obj.title === "string" && obj.title) ||
```

**Denne buggen må fikses før resten av planen gjennomføres**, ellers vil inline-feilmeldinger
også vise feil tekst.

---

## Strategi – tre nivåer

### Nivå 1 – Error page (hel-side)

Brukes når feilen gjør **hele siden ubrukelig**.

| Situasjon                                             | Komponent                                    |
| ----------------------------------------------------- | -------------------------------------------- |
| Route finnes ikke                                     | `NotFoundPage` (`ErrorShell + ErrorDisplay`) |
| Hele siden er utilgjengelig (403 / klubb finnes ikke) | `ErrorShell + ErrorDisplay`                  |
| App-krasj (uventet JS-feil)                           | `AppErrorBoundary`                           |

### Nivå 2 – Inline feil (i kontekst)

Brukes når **brukeren har en aktiv skjerm** og trenger å se feilen der handlingen skjedde.

| Situasjon                                      | Komponent                        |
| ---------------------------------------------- | -------------------------------- |
| Query (GET) feiler – data mangler i en seksjon | `QueryFeil` med retry-knapp      |
| Skjema-submit feiler                           | Feilmelding under submit-knappen |
| Dialog-mutation feiler                         | Feilmelding inni dialogen        |

### Nivå 3 – Toast

Brukes for **bakgrunnsoperasjoner** eller bekreftelser uten aktiv kontekst.

| Situasjon                                        | Type                             |
| ------------------------------------------------ | -------------------------------- |
| Vellykket mutation (alltid)                      | `toast.success` ✅               |
| «Fire and forget»-feil (toggle, slett fra liste) | `toast.error` ✅                 |
| Nettverksfeil (timeout, offline)                 | `toast.error` ✅                 |
| 401 – utlogget                                   | `toast.error` + redirect ✅      |
| Skjema-submit feiler                             | ❌ Ikke toast – bruk inline      |
| Dialog-mutation feiler                           | ❌ Ikke toast – bruk inline      |
| Query-feil (GET)                                 | ❌ Ikke toast – bruk `QueryFeil` |

**Tommelfingerregel:**

> Hadde brukeren en skjerm/dialog åpen da feilen skjedde? → **Inline**.
> Skjedde det i bakgrunnen eller etter at skjermen er borte? → **Toast**.

---

## Eksisterende komponenter

| Komponent          | Plassering                                   | Bruk                                                                                |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ErrorDisplay`     | `src/components/errors/ErrorDisplay.tsx`     | Sentrert feilvisning med ikon, tittel og beskrivelse                                |
| `ErrorShell`       | `src/app/ErrorShell.tsx`                     | Wrapper for hel-side error pages                                                    |
| `AppErrorBoundary` | `src/components/errors/AppErrorBoundary.tsx` | Fanger ukontrollerte JS-feil                                                        |
| `QueryFeil`        | `src/components/errors/QueryFeil.tsx`        | Inline query-feil med retry-knapp                                                   |
| `ServerFeil`       | `src/components/errors/ServerFeil.tsx`       | Inline server/mutation-feil i form og dialog (`Alert` destructive + `role="alert"`) |
| `NotFoundPage`     | `src/features/errors/pages/NotFoundPage.tsx` | 404-side                                                                            |

### Mangler

- **`ForbudtPage`** – ingen dedikert 403-side for hel-side tilgangsnekt

---

## Hva røres ikke

- All `toast.success` er riktig og beholdes
- `useLogin.ts` – toast-bruk der er riktig (ingen skjermkontekst å returnere til)
- `api.ts` 401-håndtering er riktig
- `AppErrorBoundary` er riktig
- Nettverksfeil (timeout/offline) beholdes som `toast.error` i `api.ts`

---

## Gjennomføringsplan

### Steg 0 – Global bugfix (`api.ts`) ✦ Forutsetning for alt ✅ UTFØRT

**Fil:** `src/api/api.ts`

- [x] Bytt rekkefølge i `pickErrorMessage`: sjekk `detail` før `title`

**Utfall:**
`pickErrorMessage` sjekket `title` før `detail` i `ProblemDetails`-responsen fra backend.
Siden `title` alltid inneholder HTTP-statusteksten («Bad Request», «Not Found» osv.),
ble den faktiske feilmeldingen fra backend aldri vist til bruker.

Rekkefølgen er nå:

1. `melding` – egendefinert norsk felt (ikke standard ProblemDetails)
2. `message` – generisk JS/bibliotek-feil
3. `detail` ← **flyttet opp** – her ligger den faktiske meldingen fra `FeilResultat(melding, ...)`
4. `title` ← **flyttet ned** – fallback, vil typisk si «Bad Request» e.l.

Alle 400-svar fra API vil nå vise den forklarende meldingen i stedet for «Bad Request».
Dette gjelder alle `toast.error`-kall og fremtidig inline-feilvisning.

---

### Steg 1 – Klubb-innstillinger ✅ UTFØRT

**Filer endret:**

- `src/hooks/useKlubb.ts`
- `src/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView.tsx`
- `src/features/klubb/views/klubb-innstillinger/KlubbInnstillingerContent.tsx`
- `src/features/klubb/views/booking-innstillinger/BookingInnstillingerView.tsx`
- `src/features/klubb/views/booking-innstillinger/BookingInnstillingerContent.tsx`

| #      | Hva                                   | I dag                         | Ny strategi                                                       |
| ------ | ------------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| 1.1 ✅ | `oppdaterKlubb` feiler                | `toast.error` i `useKlubb.ts` | Fjern `onError`, eksponér `mutation.error` som prop til Content   |
| 1.2 ✅ | `useKlubb` query feiler               | `toast.error` via `useEffect` | Fjern useEffect-toast, håndter med `QueryFeil` eller error i View |
| 1.3 ✅ | `oppdaterBookinginnstillinger` feiler | `toast.error`                 | Inline under submit-knapp i BookingInnstillingerContent           |

**Utfall:**

**1.1 + 1.3 – Mutation-feil inline:**
`useKlubb.ts` eksponerer nå `oppdaterKlubbFeil: oppdaterKlubbMutation.error`. Både
`KlubbInnstillingerView` og `BookingInnstillingerView` sender `ServerFeil={oppdaterKlubbFeil?.message ?? null}`
som prop til sine respektive Content-komponenter. Content viser feilen via `<ServerFeil feil={ServerFeil} />`
over submit-knappen. `onError: toast.error` er fjernet.

**1.2 – Query-feil inline:**
`useEffect`/`useRef`-blokken som viste `toast.error` ved query-feil er fjernet fra `useKlubb.ts`
(imports ryddet opp). Begge Views skiller nå mellom `isLoading` (viser `FormSkeleton`) og
`!klubb` (viser `QueryFeil` med retry-knapp).

---

### Steg 2 – Baner ✅ UTFØRT

**Filer endret:**

- `src/hooks/useBaner.ts`
- `src/features/baner/views/ny-bane/NyBaneView.tsx`
- `src/features/baner/views/ny-bane/NyBaneContent.tsx`
- `src/features/baner/views/rediger-bane/RedigerBaneView.tsx`
- `src/features/baner/views/rediger-bane/RedigerBaneContent.tsx`

| #      | Hva                                          | I dag         | Ny strategi                                    |
| ------ | -------------------------------------------- | ------------- | ---------------------------------------------- |
| 2.1 ✅ | `opprettBane` feiler                         | `toast.error` | Inline under submit-knapp i NyBaneContent      |
| 2.2 ✅ | `oppdaterBane` feiler                        | `toast.error` | Inline under submit-knapp i RedigerBaneContent |
| 2.3 ✅ | `oppdaterBookinginnstillingerForBane` feiler | `toast.error` | Inline under submit-knapp                      |

**Utfall:**

`useBaner.ts` hadde `onError: toast.error` på alle tre mutations – disse er fjernet.
Mutations returneres fortsatt direkte i hook-returverdien, så kallsstedene kan lese `.error`.

`NyBaneView` sender `opprettBane.error?.message ?? null` som `ServerFeil`-prop.

`RedigerBaneView` har to mutations som kjøres sekvensielt i samme `try/catch`.
`ServerFeil` settes til første `.error` som er satt:
`oppdaterBane.error?.message ?? oppdaterBookingInnstillinger.error?.message ?? null`.
`RedigerBaneView` brukte allerede `QueryFeil` for query-feil – ingen endring der.

Begge Content-komponenter viser `ServerFeil` via `<ServerFeil feil={ServerFeil} />` over submit-knappen.

---

### Steg 3 – Min side ✅ UTFØRT

**Filer endret:**

- `src/hooks/useMeg.ts`
- `src/features/minside/views/min-profil/MinProfilView.tsx`
- `src/features/minside/views/min-profil/MinProfilContent.tsx`
- `src/features/minside/components/SlettMegDialog.tsx`
- `src/features/minside/views/persondata/PersondataView.tsx`

| #      | Hva                                  | I dag                | Ny strategi                                                                                              |
| ------ | ------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------- |
| 3.1 ✅ | `oppdaterVisningsnavn` feiler        | `toast.error`        | Inline via `serverFeil` prop + `ServerFeil` over submit i `MinProfilContent`                             |
| 3.2 ✅ | `lastNedEgenData` i `PersondataView` | Dobbel `toast.error` | Fjernet død catch-blokk – feil håndteres kun i `useMeg.lastNedEgenData` (behold toast – fire-and-forget) |
| 3.3 ✅ | `slettBruker` feiler                 | `toast.error`        | `ServerFeil` inne i `SlettMegDialog` over footer-knappene                                                |

**Utfall:**

`useMeg.ts`: Fjernet `onError: toast.error` fra `oppdaterVisningsnavn` og `slettMeg`.
`lastNedEgenData` beholder `toast.error` – nedlasting er fire-and-forget uten skjermkontekst.

`MinProfilView`: Lagt til try/catch rundt `mutateAsync` (forhindrer unhandled rejection).
Sender `serverFeil={oppdaterVisningsnavn.error?.message ?? null}` til `MinProfilContent`.

`MinProfilContent`: Ny `serverFeil` prop. `ServerFeil` vises over submit-knapp.
Eksisterende `error`-prop (lokal visningsnavnvalidering under input) er uendret.

`SlettMegDialog`: `ServerFeil` plassert øverst i `AlertDialogFooter` – vises dersom
`slettMeg.error` er satt etter mislykket sletteforsøk. Dialogen forblir åpen slik at
bruker ser feilen i kontekst.

`PersondataView`: Fjernet `toast`-import og den døde catch-blokken i `handleLastNed`
(var aldri nådd siden `lastNedEgenData` fanger sine egne feil uten re-throw).

---

### Steg 4 – Booking ✅ UTFØRT

**Filer endret:**

- `src/features/booking/hooks/useBooking.ts`
- `src/features/minside/hooks/useBookingActions.ts`
- `src/features/booking/hooks/useSlotArrangementPaamelding.ts`
- `src/features/booking/views/booking/BookingView.tsx`
- `src/features/booking/views/booking/BookingContent.tsx`
- `src/features/minside/views/mine-bookinger/MineBookingerView.tsx`
- `src/features/minside/views/mine-bookinger/MineBookingerContent.tsx`

| #      | Hva                             | I dag         | Ny strategi           |
| ------ | ------------------------------- | ------------- | --------------------- |
| 4.1 ✅ | Opprett booking feiler          | `toast.error` | Inline i booking-UI   |
| 4.2 ✅ | Slett booking feiler            | `toast.error` | Inline i avbestill-UI |
| 4.3 ✅ | Påmelding/avmelding slot feiler | `toast.error` | Inline i booking-UI   |

**Utfall:**

Booking-siden har ingen bekreftelsesdialog for book/avbestill/slett – alle tre er
direkte knappeklikk i en slot-accordion med optimistisk oppdatering. Dialog-mønsteret
fra planen er derfor tilpasset til «inline i booking-UI» (en felles `ServerFeil` over
slot-listen i stedet for per-dialog).

**4.1 + 4.2 – `useBooking.ts`:**
Fjernet `onError: toast.error` fra alle tre mutations (`bookMutation`, `cancelMutation`,
`deleteMutation`). Optimistisk rollback ved feil beholdes. Tre nye returverdier eksponeres:
`bookFeil`, `cancelFeil`, `deleteFeil`. I `BookingView` kombineres disse (samt påmelding-feil)
til én `serverFeil`-streng som sendes som prop til `BookingContent`. `BookingContent` viser
`<ServerFeil feil={serverFeil} />` over slot-fane-listen.

**4.3 – `useSlotArrangementPaamelding.ts`:**
Fjernet `onError: toast.error` fra `meldPaaMutation` og `meldAvMutation`. Returnerer nå
`paameldingFeil` og `avmeldingFeil`. `BookingView` inkluderer disse i den kombinerte
`serverFeil`-prop til `BookingContent`.

**Min side – `useBookingActions.ts`:**
Fjernet `onError: toast.error` fra `cancelMutation`. Returnerer nå `error: cancelMutation.error`.
`MineBookingerView` wrapper `avbestillAsync` i try/catch (forhindrer unhandled rejection),
og sender `serverFeil={avbestillFeil?.message ?? null}` til `MineBookingerContent`.
`MineBookingerContent` viser `<ServerFeil feil={serverFeil} />` over accordion-listen.

---

### Steg 5 – Brukere (admin) ✅ UTFØRT

**Filer endret:**

- `src/features/brukere/hooks/useAdminBrukere.ts`
- `src/features/brukere/hooks/useAdminBrukersperre.ts`
- `src/features/brukere/views/brukere-liste/RedigerBrukerDialog.tsx`
- `src/features/brukere/views/brukere-liste/BrukereListeView.tsx`
- `src/features/brukere/components/SlettBrukerDialog.tsx`
- `src/features/brukere/components/SperrBrukerDialog.tsx`
- `src/features/brukere/components/SperreHistorikkDialog.tsx`

| #      | Hva                     | I dag         | Ny strategi                      |
| ------ | ----------------------- | ------------- | -------------------------------- |
| 5.1 ✅ | `oppdaterBruker` feiler | `toast.error` | Inline i `RedigerBrukerDialog`   |
| 5.2 ✅ | `slettBruker` feiler    | `toast.error` | Inline i `SlettBrukerDialog`     |
| 5.3 ✅ | `sperrBruker` feiler    | `toast.error` | Inline i `SperrBrukerDialog`     |
| 5.4 ✅ | `opphevSperre` feiler   | `toast.error` | Inline i `SperreHistorikkDialog` |

**Utfall:**

**5.1 – `oppdaterBruker` inline:**
`useAdminBrukere.ts` fjernet `onError: toast.error` fra `oppdaterMutation` og eksponerer nå
`oppdaterFeil: oppdaterMutation.error`. `BrukereListeView` wrapper `lagreEndringer` i try/catch
(dialog forblir åpen ved feil) og sender `serverFeil={oppdaterFeil?.message ?? null}` til
`RedigerBrukerDialog`. Dialogen viser `<ServerFeil feil={serverFeil} />` over knappene i footer.

**5.2 – `slettBruker` inline:**
`useAdminBrukere.ts` fjernet `onError: toast.error` fra `slettMutation` og eksponerer nå
`slettFeil: slettMutation.error`. `SlettBrukerDialog` fikk ny `serverFeil` prop og viser
`<ServerFeil feil={serverFeil} />` i `AlertDialogFooter`. Dialogen hadde allerede try/catch
som holder den åpen ved feil – catch-kommentaren er oppdatert.

**5.3 – `sperrBruker` inline:**
`useAdminBrukersperre.ts` fjernet `onError: toast.error` fra `sperrMutation` og eksponerer nå
`sperrFeil: sperrMutation.error`. `SperrBrukerDialog` fikk ny `serverFeil` prop og viser
`<ServerFeil feil={serverFeil} />` i `DialogFooter` over bekreftelsesknappen.

**5.4 – `opphevSperre` inline:**
`useAdminBrukersperre.ts` fjernet `onError: toast.error` fra `opphevMutation` og eksponerer nå
`opphevFeil: opphevMutation.error`. `SperreHistorikkDialog` fikk ny `opphevFeil` prop og viser
`<ServerFeil feil={opphevFeil} />` under sperrelisten i dialogen. `BrukereListeView` wrapper
`handleOpphev` i try/catch og sender `opphevFeil?.message ?? null` videre.

---

### Steg 6 – Arrangementer ✅ UTFØRT

**Filer:**

- `src/features/arrangementer/views/arrangementer/useAvlysArrangement.ts`
- `src/features/arrangementer/views/arrangementer/useArrangementPaamelding.ts`
- `src/features/arrangement-admin/hooks/useArrangement.ts`
- `src/features/arrangement-admin/hooks/useRedigerArrangement.ts`
- `src/features/arrangement-admin/hooks/useAvlysArrangement.ts`
- `src/features/arrangement-admin/components/SlettArrangementDialog.tsx`

| #   | Hva                         | I dag         | Ny strategi                      |
| --- | --------------------------- | ------------- | -------------------------------- |
| 6.1 | `avlysArrangement` feiler   | `toast.error` | Inline i avlys-dialog            |
| 6.2 | `opprettArrangement` feiler | `toast.error` | Inline under submit-knapp i form |
| 6.3 | `redigerArrangement` feiler | `toast.error` | Inline under submit-knapp i form |
| 6.4 | Påmelding/avmelding feiler  | `toast.error` | Inline i dialog                  |

**Utfall:**

Filer endret:
• useAvlysArrangement.ts
• useArrangementPaamelding.ts
• ArrangementerView.tsx
• ArrangementerContent.tsx
• src/features/arrangement-admin/hooks/useArrangement.ts
• src/features/arrangement-admin/hooks/useRedigerArrangement.ts
• src/features/arrangement-admin/hooks/useAvlysArrangement.ts
• src/features/arrangement-admin/components/SlettArrangementDialog.tsx
• src/features/arrangement-admin/views/arrangement/ArrangementView.tsx
• src/features/arrangement-admin/views/arrangement/ArrangementContent.tsx
• src/features/arrangement-admin/views/arrangement/ForhandsvisningDialog.tsx
• src/features/arrangement-admin/views/rediger-arrangement/RedigerArrangementView.tsx
6.1 – avlysArrangement inline i dialog: Begge useAvlysArrangement-hooks (admin og bruker) fjernet onError: toast.error. SlettArrangementDialog håndterer nå feilen selv via lokal feil-state i handleDelete-catch. <ServerFeil feil={feil} /> vises i AlertDialogFooter over Avbryt/Avlys-knappene. Dialog forblir åpen på feil, feil nullstilles når dialog lukkes.
6.2 – opprettArrangement inline i forhåndsvisningsdialog: useArrangement.ts fjernet onError fra opprettMutation og eksponerer opprettFeil: opprettMutation.error. ArrangementView wrapper håndterOpprett i try/catch og sender serverFeil={opprettFeil?.message ?? null} til ArrangementContent → ForhandsvisningDialog. ForhandsvisningDialog fikk serverFeil-prop og viser <ServerFeil> i DialogFooter over bekreftknappen.
6.3 – redigerArrangement inline i forhåndsvisningsdialog: useRedigerArrangement.ts fjernet onError fra erstattMutation og forhandsvisMutation, eksponerer erstattFeil og forhandsvisFeil. RedigerArrangementView wrapper håndterOppdater i try/catch og sender serverFeil={erstattFeil?.message ?? forhandsvisFeil?.message ?? null} til ArrangementContent → ForhandsvisningDialog.
6.4 – Påmelding/avmelding inline: useArrangementPaamelding.ts fjernet onError fra begge mutations og eksponerer paameldingFeil og avmeldingFeil. Siden påmelding/avmelding er enkle knappeklikk i accordion uten dialog, følger dette mønsteret fra steg 4 (booking): ArrangementerView kombinerer feilene til serverFeil = paameldingFeil?.message ?? avmeldingFeil?.message ?? null og sender som prop til ArrangementerContent. Content viser <ServerFeil feil={serverFeil ?? null} /> over accordion-listen.

---

### Steg 7 – Turnering ✅ UTFØRT

**Filer:**

- `src/features/turnering/hooks/turnering/useOpprettTurnering.ts`
- `src/features/turnering/hooks/turnering/useLeggTilKlasse.ts`
- `src/features/turnering/hooks/turnering/useFjernKlasse.ts`
- `src/features/turnering/hooks/turnering/useOppdaterTurneringStatus.ts`
- `src/features/turnering/hooks/paamelding/useMeldPaaKlasse.ts`
- `src/features/turnering/hooks/paamelding/useOppdaterPaameldingSeed.ts`
- `src/features/turnering/hooks/paamelding/useOppdaterPaameldingStatus.ts`
- `src/features/turnering/hooks/paamelding/useTrekkPaamelding.ts`
- `src/features/turnering/hooks/draw/useGenererDraw.ts`
- `src/features/turnering/hooks/draw/useGenererKampplan.ts`
- `src/features/turnering/hooks/draw/useFrøSluttspill.ts`
- `src/features/turnering/hooks/draw/useRegistrerResultat.ts`
- `src/features/turnering/hooks/admin/useAnsvarligMutations.ts`

| #    | Hva                               | I dag         | Ny strategi                       |
| ---- | --------------------------------- | ------------- | --------------------------------- |
| 7.1  | `opprettTurnering` feiler         | `toast.error` | Inline under submit-knapp         |
| 7.2  | `leggTilKlasse` feiler            | `toast.error` | Inline i `LeggTilKlasseDialog`    |
| 7.3  | `fjernKlasse` feiler              | `toast.error` | Inline i bekreftelsesdialog       |
| 7.4  | `registrerResultat` feiler        | `toast.error` | Inline i `ResultatDialog`         |
| 7.5  | `meldPaaKlasse` feiler            | `toast.error` | Inline i `MeldPaaDialog`          |
| 7.6  | `oppdaterPaameldingSeed` feiler   | `toast.error` | Inline i `SeedDialog`             |
| 7.7  | `oppdaterPaameldingStatus` feiler | `toast.error` | Inline i `PaameldingStatusDialog` |
| 7.8  | `trekkPaamelding` feiler          | `toast.error` | Inline i bekreftelsesdialog       |
| 7.9  | `leggTilAnsvarlig` feiler         | `toast.error` | Inline i ansvarlig-dialog         |
| 7.10 | `fjernAnsvarlig` feiler           | `toast.error` | Inline i bekreftelsesdialog       |
| 7.11 | `oppdaterTurneringStatus` feiler  | `toast.error` | **Beholdes** – toggle-handling    |
| 7.12 | `genererDraw` feiler              | `toast.error` | **Beholdes** – bakgrunnsoperasjon |
| 7.13 | `genererKampplan` feiler          | `toast.error` | **Beholdes** – bakgrunnsoperasjon |
| 7.14 | `frøSluttspill` feiler            | `toast.error` | **Beholdes** – bakgrunnsoperasjon |

Steg 7 – Turnering
Filer endret:
Hooks (9 filer) — fjernet onError: toast.error:
• useOpprettTurnering.ts · useLeggTilKlasse.ts · useFjernKlasse.ts
• useMeldPaaKlasse.ts · useOppdaterPaameldingSeed.ts · useOppdaterPaameldingStatus.ts · useTrekkPaamelding.ts
• useRegistrerResultat.ts · useAnsvarligMutations.ts
Beholdt toast.error (7.11–7.14): useOppdaterTurneringStatus, useGenererDraw, useGenererKampplan, useFrøSluttspill
Dialog-komponenter (5 filer) — ny serverFeil prop + <ServerFeil>: LeggTilKlasseDialog · ResultatDialog · MeldPaaDialog · SeedDialog · PaameldingStatusDialog
Views (7 filer):
• 7.1 – opprettTurnering: ArrangementView venter nå på turneringMutation.mutateAsync inni dialogen (dialog forblir åpen ved feil), serverFeil kombinerer arrangement- og turnering-feil. RedigerArrangementView viser <ServerFeil> inline i "Turneringsmodul"-seksjonen.
• 7.2 – leggTilKlasse: AdminOppsettView sender serverFeil til LeggTilKlasseDialog.
• 7.3 + 7.9 + 7.10 – fjernKlasse / ansvarlig: AdminOppsettView viser <ServerFeil> over klasselist og i ansvarlig-seksjonen (ingen bekreftelsesdialog eksisterte — fulgte booking-mønsteret fra steg 4).
• 7.4 – registrerResultat: Begge AdminKampgjennomforingView og ResultatansvarligKampView sender kombinert serverFeil til ResultatDialog.
• 7.5–7.8 – påmelding: AdminPaameldingView sender serverFeil til MeldPaaDialog, PaameldingStatusDialog, SeedDialog og viser trekkMutation.error inline. Lukke-tidspunktet for status- og seed-dialog er rettet (lukker nå kun onSuccess, ikke umiddelbart). TurneringSpillerView tilsvarende for spiller-flyt.

---

## Kodekonvensjon for inline mutation-feil

Mutations i form/dialog skal **ikke** ha `onError: toast.error`. I stedet eksponeres
`mutation.error` fra hook til view, og videre som prop til Content.

### Distinksjon mellom feilnåer i et skjema

| Type                    | Komponent                        | Eksempel                       |
| ----------------------- | -------------------------------- | ------------------------------ |
| Felt-validering (lokal) | `FieldError` (under input)       | "Navn er påkrevd"              |
| Server/mutation-feil    | `ServerFeil` (over submit-knapp) | "Klubbnavn er allerede i bruk" |

`ServerFeil` bruker `Alert variant="destructive"` med `role="alert"` (tilgjengelighet)
og visuelt skiller seg fra felt-level-feil.

```typescript
// Hook – eksponér error
return {
  oppdater: mutation.mutateAsync,
  isPending: mutation.isPending,
  error: mutation.error,        // ← ny
};

// View – sett error som prop
<KlubbInnstillingerContent
  ...
  ServerFeil={mutation.error?.message ?? null}
/>

// Content – vis over submit-knapp
import { ServerFeil } from "@/components/errors";

<FormActions variant="sticky">
  <ServerFeil feil={ServerFeil} />
  <FormSubmitButton ... />
</FormActions>
```

Dialogs følger samme mønster – `ServerFeil` plasseres inni dialogen
før bekreftelsesknappen.
