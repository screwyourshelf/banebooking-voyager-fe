# Gren — Frontend implementeringsplan

> **Formål:** Eksakte instruksjoner for AI-agent. Hvert trinn er selvstendig og verifiserbart.
> **Backend-referanse:** Gren-hierarkiet er ferdig implementert i backend (`Klubb → Gren → Baner`).
> **Sist oppdatert:** 2026-04-25
> **Status:** ✅ Alle trinn fullført

---

## Regler for agenten

1. Gjør ETT trinn om gangen. Verifiser mellom hvert trinn.
2. Ikke gjør endringer som ikke er beskrevet i trinnet.
3. Finn eksisterende lignende kode og kopier mønsteret eksakt.
4. Alle nye hooks følger `useApiQuery`/`useApiMutation`-mønsteret.
5. Alle nye typer plasseres i `src/types/` og eksporteres via `src/types/index.ts`.
6. Alle nye features følger `features/{navn}/pages/` + `views/` + `hooks/`-strukturen.
7. Ikke introduser nye UI-mønstre — bruk eksisterende komponenter (Tabs, Select, FormSkeleton, QueryFeil, etc.).

---

## Kontekst — hva backend nå returnerer

### Nytt endepunkt: `GET /api/klubb/{slug}/grener`

```json
[
  {
    "id": "guid",
    "navn": "Tennis",
    "slug": "tennis",
    "banereglement": "...",
    "sortering": 0,
    "aktiv": true,
    "bookingInnstillinger": {
      "aapningstid": "07:00",
      "stengetid": "22:00",
      "maksPerDag": 1,
      "maksTotalt": 2,
      "dagerFremITid": 7,
      "slotLengdeMinutter": 60
    },
    "kapabiliteter": ["gren:rediger", "gren:deaktiver"]
  }
]
```

### Endrede endepunkter

- `GET /api/klubb/{slug}/baner` — `BaneRespons` har nå `grenId: string` og `grenNavn: string`
- `POST /api/klubb/{slug}/baner` — `OpprettBaneForespørsel` krever nå `grenId: string`
- `POST /api/klubb/{slug}/arrangement` — `OpprettArrangementForespørsel` krever nå `grenId: string`
- `GET /api/klubb/{slug}` — `KlubbRespons` har IKKE lenger `bookingRegel` eller `banereglement` (disse er flyttet til Gren)

### Nye endepunkter

- `POST /api/klubb/{slug}/grener` — opprett gren
- `PUT /api/klubb/{slug}/grener/{id}` — oppdater gren (navn, banereglement, sortering, aktiv, bookinginnstillinger)
- `DELETE /api/klubb/{slug}/grener/{id}` — deaktiver gren
- `PUT /api/klubb/{slug}/grener/{id}/aktiver` — reaktiver gren

---

## TRINN 1 — Opprett `Gren`-typer

> Avhengighet: Ingen
> Verifisering: TypeScript kompilerer (`npm run build`)
> Mønster: Kopier strukturen fra `src/types/Bane.ts`

- [ ] Opprett fil `src/types/Gren.ts`:

```typescript
import type { BookingRegelRespons } from "./Klubbdetaljer";

// Response
export type GrenRespons = {
  id: string;
  navn: string;
  slug: string;
  banereglement: string;
  sortering: number;
  aktiv: boolean;
  bookingInnstillinger: BookingRegelRespons;
  kapabiliteter: string[];
};

// Requests
export type OpprettGrenForespørsel = {
  navn: string;
  banereglement?: string;
  sortering?: number;
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};

export type OppdaterGrenForespørsel = {
  navn: string;
  banereglement?: string;
  sortering?: number;
  aktiv: boolean;
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksTotalt: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};
```

- [ ] Legg til `export * from "./Gren";` i `src/types/index.ts`

---

## TRINN 2 — Oppdater eksisterende typer

> Avhengighet: Trinn 1
> Verifisering: TypeScript kompilerer
> Mønster: Småendringer i eksisterende typefiler

### 2a. Oppdater `BaneRespons` i `src/types/Bane.ts`

Legg til i `BaneRespons`:

```typescript
grenId: string;
grenNavn: string;
```

### 2b. Oppdater `OpprettBaneForespørsel` i `src/types/Bane.ts`

Legg til:

```typescript
grenId: string;
```

### 2c. Oppdater `OpprettArrangementForespørsel` i `src/types/Arrangement.ts`

Legg til:

```typescript
grenId: string;
```

### 2d. Oppdater `KlubbRespons` i `src/types/Klubbdetaljer.ts`

Fjern feltene `bookingRegel` og `banereglement` fra `KlubbRespons` (disse bor nå på Gren).

### 2e. Oppdater `OppdaterKlubbForespørsel` i `src/types/OppdaterKlubb.ts`

Fjern feltene `bookingRegel` og `banereglement`.

### 2f. Sjekk og fiks kompileringsfeil

Etter 2d/2e vil det oppstå kompileringsfeil i kode som refererer til `klubb.bookingRegel` og `klubb.banereglement`. **IKKE fiks disse nå** — de håndteres i trinn 6, 7 og 8.

---

## TRINN 3 — Opprett `useGrener`-hook

> Avhengighet: Trinn 1
> Verifisering: Hook kompilerer
> Mønster: Kopier strukturen fra `src/hooks/useBaner.ts` eksakt

- [ ] Opprett fil `src/hooks/useGrener.ts`:

Hooken skal:

- Bruke `useApiQuery` for GET `/klubb/${slug}/grener` (og `?inkluderInaktive=true` variant)
- Bruke `useApiMutation` for POST/PUT/DELETE
- Invalidere `["grener", slug]` etter mutasjoner
- **Også invalidere** `["baner", slug]` og `["klubb", slug]` etter endringer (baner refererer til gren)
- Ha staleTime på 5 minutter (som useBaner)

Returner:

```typescript
{
  grener: GrenRespons[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;

  opprettGren: UseMutationResult<...>;
  oppdaterGren: UseMutationResult<...>;
  deaktiverGren: UseMutationResult<...>;
  aktiverGren: UseMutationResult<...>;
}
```

Følg `useBaner.ts` sin `invalidateAll()`-pattern for cache-invalidering.

---

## TRINN 4 — Opprett admin-side for Grener

> Avhengighet: Trinn 3
> Verifisering: Side vises uten feil, lister grener
> Mønster: Kopier eksakt fra `features/baner/` (pages + views + tabs-layout)

### 4a. Opprett mappestruktur

```
src/features/grener/
  pages/
    GrenerPage.tsx
  views/
    rediger-gren/
      RedigerGrenView.tsx
      RedigerGrenContent.tsx
    ny-gren/
      NyGrenView.tsx
      NyGrenContent.tsx
```

### 4b. `GrenerPage.tsx`

Kopier mønster fra `BanerPage.tsx`:

```tsx
<Page>
  <Tabs
    defaultValue="rediger"
    items={[
      { value: "rediger", label: "Rediger gren", content: <RedigerGrenView /> },
      { value: "ny", label: "Ny gren", content: <NyGrenView /> },
    ]}
  />
</Page>
```

### 4c. `NyGrenView.tsx` + `NyGrenContent.tsx`

Kopier mønster fra `features/baner/views/ny-bane/`:

- Skjema med feltene: Navn, Banereglement (textarea), Sortering
- Bookinginnstillinger-seksjon: Åpningstid, Stengetid, SlotLengdeMinutter, MaksPerDag, MaksTotalt, DagerFremITid
- Bruk eksakt samme input-komponenter som brukes i `BookingInnstillingerView` og `NyBaneView`
- Submit kaller `opprettGren.mutateAsync()`

### 4d. `RedigerGrenView.tsx` + `RedigerGrenContent.tsx`

Kopier mønster fra `features/baner/views/rediger-bane/`:

- Select/dropdown for å velge gren (som bane-velgeren i RedigerBaneView)
- Rediger: Navn, Banereglement, Sortering, Aktiv
- Bookinginnstillinger-seksjon: Åpningstid, Stengetid, SlotLengde, MaksPerDag, MaksTotalt, DagerFremITid
- Submit kaller `oppdaterGren.mutateAsync()`
- **INGEN bane-overstyring her** — det ligger fortsatt på bane-nivå

### 4e. Registrer route i `routeConfig.ts`

Legg til under `admin`-children:

```typescript
{
  path: "grener",
  breadcrumb: "Grener",
  protected: true,
  component: GrenerPage,
  loader: loadGrenerPage,
}
```

Følg eksakt samme lazy-loading-mønster som de andre admin-sidene.

---

## TRINN 5 — Oppdater navigasjon med Grener-link

> Avhengighet: Trinn 4
> Verifisering: Navigasjon viser "Grener"-link under admin
> Mønster: Finn eksisterende navigasjonskomponent og legg til

- [ ] Finn navigasjonskomponenten som viser admin-lenker (Klubb, Baner, Brukere)
- [ ] Legg til "Grener" mellom Klubb og Baner (logisk plassering i hierarkiet)
- [ ] Bruk eksakt samme mønster som de andre admin-lenkene

---

## TRINN 6 — Oppdater bookingkalenderen med gren-velger

> Avhengighet: Trinn 2, 3
> Verifisering: Bookingsiden viser gren-dropdown, filtrerer baner
> Berørte filer: `features/booking/views/booking/BookingView.tsx`, `BookingContent.tsx`

### 6a. BookingView.tsx

- Importer `useGrener`
- Legg til state: `const [valgtGrenId, setValgtGrenId] = useState("")`
- Filtrer baner: `const filtrerteBaner = baner.filter(b => !valgtGrenId || b.grenId === valgtGrenId)`
- Hvis det bare finnes én gren → IKKE vis gren-velgeren (skjul den)
- Første gren velges som default
- Når gren endres → nullstill `valgtBaneId` og velg første bane i filtrert liste
- Send `grener`, `valgtGrenId`, `onGrenChange` ned til BookingContent

### 6b. BookingContent.tsx

- Ta imot nye props: `grener`, `valgtGrenId`, `onGrenChange`
- Vis `<Select>` over bane-tabs KUN hvis `grener.length > 1`
- Plasser select-en i `<Inline>` sammen med DatoVelger (kopier eksisterende layout-mønster)
- Bane-tabs filtreres til kun baner for valgt gren

---

## TRINN 7 — Oppdater admin/baner med gren-kobling

> Avhengighet: Trinn 2, 3
> Verifisering: Ny bane krever grenId, eksisterende baner viser gren-tilhørighet
> Berørte filer: `features/baner/views/ny-bane/`, `features/baner/views/rediger-bane/`

### 7a. NyBaneView — legg til gren-select

- Hent grener med `useGrener(false)` (kun aktive)
- Legg til `<Select>` for grenvalg i skjemaet (obligatorisk)
- Hvis bare 1 gren → forhåndsvelg den og evt. skjul select
- Send `grenId` med i `OpprettBaneForespørsel`

### 7b. RedigerBaneView — vis gren-info

- Baner grupperes per gren i select-listen, ELLER vis grenNavn som label ved bane
- Bane-select viser `${bane.grenNavn}: ${bane.navn}` som label
- **Bane kan ikke flyttes mellom grener** — grenId er readonly i redigering

### 7c. Oppdater `useBaner` hook

- Sjekk om `useBaner.opprettBane` sender `grenId` korrekt (sjekk at OpprettBaneForespørsel er oppdatert i trinn 2)

---

## TRINN 8 — Oppdater arrangement-admin med gren-velger

> Avhengighet: Trinn 2, 3
> Verifisering: Arrangementskjema krever gren-valg, baner filtreres etter gren
> Berørte filer: `features/arrangement-admin/views/arrangement/`, `hooks/useArrangement.ts`

### 8a. useArrangement.ts

- Importer og kall `useGrener(false)` (kun aktive)
- Eksponer `grener` i return-objekt
- **Kritisk endring:** Tidspunkter beregnes nå fra **valgt gren** (gren.bookingInnstillinger) i stedet for `klubb.bookingRegel`
- Fjern avhengigheten til `klubb.bookingRegel` for tidspunkter
- Endre `tilgjengeligeTidspunkter` til å ta grenens bookingInnstillinger som input (sendes fra ArrangementView)

### 8b. ArrangementView.tsx

- Legg til state: `const [valgtGrenId, setValgtGrenId] = useState("")`
- Vis `<Select>` for gren-valg (obligatorisk, alltid synlig)
- Når gren endres → nullstill `valgteBaner`, `valgteUkedager`, `valgteTidspunkter`
- Filtrer bane-listen til kun baner for valgt gren
- Beregn tidspunkter basert på **valgt gren** sin bookingInnstillinger
- Send `grenId` med i DTO-bygging (`byggDto`)

### 8c. ArrangementContent.tsx

- Ta imot `grener`, `valgtGrenId`, `onGrenChange` som props
- Vis `<Select>` øverst i skjemaet (før dato, baner etc.)

### 8d. arrangementUtils.ts — `byggDto`

- Legg til `grenId` i DTO-builder-funksjonen

---

## TRINN 9 — Fjern bookinginnstillinger fra Klubb-admin

> Avhengighet: Trinn 4 (grener admin finnes)
> Verifisering: Klubb-admin har ikke lenger booking-tab
> Berørte filer: `features/klubb/pages/KlubbPage.tsx`, `features/klubb/views/booking-innstillinger/`

### 9a. KlubbPage.tsx

- Fjern BookingInnstillingerView-tab (bookinginnstillinger er nå per gren, administreres i admin/grener)
- Behold kun KlubbInnstillingerView-tab

### 9b. KlubbInnstillingerView

- Fjern `banereglement` fra klubb-redigeringsskjemaet (flyttet til gren)
- Fjern `bookingRegel` fra OppdaterKlubbForespørsel (allerede gjort i trinn 2e)
- Oppdater submit-logikk til å ikke sende disse feltene

### 9c. Vurder sletting

- Vurder om `features/klubb/views/booking-innstillinger/` kan slettes helt
- Fjern bare hvis ingen andre referanser finnes

---

## TRINN 10 — Oppdater arrangementer-listen med gren-info

> Avhengighet: Trinn 2
> Verifisering: Arrangementlisten viser gren-info ved behov

### 10a. Legg til gren-felter i arrangement-responser

- Sjekk om backend returnerer gren-info i `ArrangementRespons` / `OffentligArrangementRespons`
- Hvis ja → legg til `grenNavn` i typene
- Hvis nei → vis grenNavn basert på baneGrupper (banene tilhører en gren)

### 10b. Eventuelt: Vis gren-label i arrangementkort

- Bare relevant hvis klubben har flere grener
- Vis grenNavn som subtittel/tag på arrangementkort

---

## TRINN 11 — Fiks og opprydding

> Avhengighet: Trinn 1–10
> Verifisering: `npm run build` uten feil, `npm run lint` uten feil

- [ ] Kjør `npm run build` og fiks alle TypeScript-feil
- [ ] Kjør `npm run lint` og fiks evt. lint-feil
- [ ] Verifiser at alle sider fungerer:
  - Bookingkalender: gren-select (kun hvis >1 gren), baner filtreres
  - Admin > Grener: opprett, rediger, bookinginnstillinger
  - Admin > Baner: ny bane krever gren, rediger viser gren
  - Arrangement-admin: gren-valg, bane-filtrering, tidspunkter fra gren
  - Admin > Klubb: ingen booking-innstillinger lenger
- [ ] Sjekk at cache-invalidering fungerer korrekt (endre gren → baner oppdateres)

---

## Trinn-avhengigheter

```
Trinn  1  Gren-typer               (ingen avh.)
Trinn  2  Oppdater eksisterende    (1)
Trinn  3  useGrener hook           (1)
Trinn  4  Admin-side for grener    (3)
Trinn  5  Navigasjon               (4)
Trinn  6  Bookingkalender + gren   (2, 3)
Trinn  7  Baner-admin + gren       (2, 3)
Trinn  8  Arrangement-admin + gren (2, 3)
Trinn  9  Fjern booking fra klubb  (4)
Trinn 10  Arrangementer-liste      (2)
Trinn 11  Fiks og opprydding       (1–10)
```

## Parallelle trinn

Trinn 4, 5, 6, 7, 8, 9, 10 er innbyrdes uavhengige (alle avhenger bare av 1–3).
Anbefalt rekkefølge likevel: 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 (bygger gradvis).
