# Refaktorering: arrangement-admin

## Mål

Gi arrangement-admin riktig mental modell:

- **Opprettelse** og **redigering** er separate flyter
- **BookingListe** er source of truth – ikke periodegeneratoren
- **Vanlig lagring** skal aldri regenerere arrangementet
- **Manuell bookinghåndtering** er et fullverdig alternativ til gjentakende oppsett

---

## Problem i dagens løsning

### 1. Samme GUI for opprettelse og redigering

`ArrangementContent` brukes i både `ArrangementView` og `RedigerArrangementView`.
Komponentet ble designet for opprettelse og har aldri fått et eget redigeringsparadigme.

### 2. Redigering regenererer alle bookinger

`useRedigerArrangement.erstatt` kaller `PUT /klubb/:slug/arrangement/:id`.
Backend erstatter alle eksisterende bookinger basert på ny periode+ukedager+tider.
Det finnes ingen måte å redigere én booking uten å regenerere alle.

### 3. Punktredigering er umulig

Det er ingen UI for å redigere, slette eller legge til én enkelt booking.
Forhåndsvisningsdialogen er read-only og brukes som bekreftelse, ikke som redigeringsflate.

### 4. Periodegeneratoren er modellen – ikke bookingene

Skjemaet holder periode, ukedager, tider og baner.
Disse er generator-parametere, ikke en representasjon av de faktiske bookingene.
Etter opprettelse er det ingen synlig kobling mellom parameterne og de genererte bookingene.

### 5. `ArrangementContent` har 40+ props

Komponenten er blitt et "god component" som håndterer for mye.
Det gjør det vanskelig å innføre separate flyter.

---

## Ny mental modell

```
Opprettelse                      Redigering
───────────────────────────────  ───────────────────────────────
Velg oppsettsmodus               Last eksisterende arrangement
   │                                │
   ├── Gjentakende oppsett          ├── Vis metadata
   │   (periode + ukedager          └── Vis BookingListe
   │    + tider + baner)                (eksisterende bookinger)
   │   → generer forslag                │
   │                                    ├── Legg til bookinger
   └── Manuelt oppsett                  │   (gjentakende eller manuelt)
       (kalender + tid + bane)          ├── Rediger enkeltbooking
       → legg til booking               └── Slett enkeltbooking
           │
           ▼
       BookingListe  ←── source of truth
           │
           ▼
        Lagre
```

**BookingListe** holder alltid de konkrete bookingene som vil bli lagret.
Generatoren og kalendervelgeren er kun **input-verktøy** som fyller listen.

---

## GUI-forslag

### Opprett – velg modus

```text
========================================================
OPPRETT ARRANGEMENT
========================================================

Gren
[ Tennis ▾ ]

Kategori           Navn / Tittel
[ Trening ▾ ]      [ Sommercamp junior              ]

Beskrivelse
[ ...                                               ]

--------------------------------------------------------
BOOKINGOPPSETT
--------------------------------------------------------

[ Gjentakende oppsett ]   [ Manuelt oppsett ]

========================================================
```

---

### Gjentakende oppsett

```text
========================================================
GJENTAKENDE OPPSETT
========================================================

Periode
[ 01.06.2026 ] – [ 31.08.2026 ]

Ukedager
[ ] Man  [x] Tir  [x] Ons  [ ] Tor  [x] Fre  [ ] Lør  [ ] Søn

Baner
[x] Bane 1   [x] Bane 2   [ ] Bane 3

Tidspunkter
[x] 09:00  [x] 10:00  [ ] 11:00  [x] 12:00  ...

            [ Generer forslag → legg i BookingListe ]

========================================================
```

> **Merk:** Tidspunkt/slotvalg skal følge eksisterende domenemodell (`slotLengdeMinutter` per bane).
> Slotlengde-logikk skal **ikke** endres i denne refaktoren.

Knappen **Generer forslag** legger bookingene direkte i BookingListe.
Den åpner **ingen modal**.

---

### Manuelt oppsett

```text
========================================================
MANUELT OPPSETT
========================================================

Velg dato(er)
┌──────────────────────────────────┐
│   juni 2026                      │
│  Ma Ti On To Fr Lø Sø            │
│   1  2  3  4  5  6  7            │
│   8  9 10 11 12 13 14            │
│  15 16●17 18 19●20 21            │
│  22 23 24 25 26 27 28            │
│  29 30                           │
└──────────────────────────────────┘
Valgte datoer: 17. juni, 20. juni

Tidspunkt            Bane
[ 10:00 ▾ ]          [x] Bane 1   [ ] Bane 2

[ + Legg til i BookingListe ]

========================================================
```

shadcn `Calendar` i `mode="multiple"` for datovelger.
Én tidspunkt og én eller flere baner per batch.
Knappen legger til én booking per kombinasjon (dato × bane).

---

### BookingListe

```text
========================================================
BOOKING-LISTE  (12 bookinger, 2 konflikter)
========================================================

  Dato        Tid          Bane      Status
  ─────────────────────────────────────────────────────
  Man 17.06   10:00–11:00  Bane 1    ✓ Ledig
  Man 17.06   10:00–11:00  Bane 2    ⚠ Konflikt  [?]
  Tor 20.06   10:00–11:00  Bane 1    ✓ Ledig
  Tor 20.06   10:00–11:00  Bane 2    ✓ Ledig
  ...

  [ ✎ ]  [ 🗑 ]   (per rad)

========================================================
[ + Legg til flere ]      [ Lagre arrangement ]
========================================================
```

- **Konflikter** vises inline per rad med ikon og tooltip/popover
- **✎** åpner modal for redigering av én booking
- **🗑** for nye/genererte bookinger: fjerner fra listen. For eksisterende bookinger (har `eksternId`): markerer med `erSlettet = true` og vises med gjennomstreking til lagring
- `[ + Legg til flere ]` ekspanderer gjentakende eller manuelt oppsett igjen

> **Terminologi i UI:** For eksisterende bookinger skal handlingen hete «Avlys» eller «Marker for sletting», ikke «Slett». Knappen for nye/genererte bookinger kan hete «Fjern».

---

### Redigeringsvisning

```text
========================================================
REDIGER ARRANGEMENT
========================================================

Velg arrangement
[ Sommercamp junior ▾ ]

────────── Metadata ──────────────────────────────────

Gren       Kategori
[ Tennis ] [ Trening ▾ ]

Navn
[ Sommercamp junior              ]

Beskrivelse
[ ...                            ]

[ Lagre metadata ]

────────── Bookinger ─────────────────────────────────

  Dato        Tid          Bane      Status
  ─────────────────────────────────────────────────────
  Man 17.06   10:00–11:00  Bane 1    ✓ Aktiv
  Tir 18.06   10:00–11:00  Bane 1    ✓ Aktiv
  ...

  [ ✎ ]  [ Avlys ]   (per rad – «Avlys» for eksisterende, «Fjern» for nye)

[ + Legg til bookinger ]

────────── Farlig sone ───────────────────────────────

[ ⚠ Regenerer alle bookinger ]   (krever bekreftelse)
[ 🗑 Avlys / slett arrangement ] (krever bekreftelse)

========================================================
```

**Metadata og bookingendringer har separate lagringshandlinger i første versjon.**
Unngå én global «Lagre alt»-knapp før backend støtter trygg differanselagring.
**Regenerer** er skilt ut som eksplisitt farlig handling.

---

### Modal: rediger én booking

```text
┌──────────────────────────────────────┐
│ Rediger booking                      │
│                                      │
│ Dato     [ 17. juni 2026       ]     │
│ Starttid [ 10:00 ▾ ]                 │
│ Bane     [ Bane 1 ▾ ]               │
│                                      │
│              [ Avbryt ] [ Lagre ]    │
└──────────────────────────────────────┘
```

---

## Akseptansekriterier

### BookingListe
- [ ] Viser alle bookinger som vil bli lagret
- [ ] Viser konfliktstatus inline per booking (ikke i modal)
- [ ] Støtter sletting av enkeltbooking
- [ ] Støtter redigering av enkeltbooking via modal
- [ ] Støtter kopiering av booking (nice-to-have)
- [ ] Oppdateres umiddelbart når generator eller manuelt oppsett legger til bookinger

### Gjentakende oppsett
- [ ] Generator-knapp legger forslag i BookingListe – åpner ikke modal
- [ ] Eksisterende bookinger i listen beholdes (duplikater markeres)
- [ ] Advarsel ved ulike slot-lengder vises i listen, ikke som blokkering

### Manuelt oppsett
- [ ] shadcn `Calendar` i `mode="multiple"` for datovelger
- [ ] Bruker velger tidspunkt og baner per batch
- [ ] Bookinger legges i BookingListe etter klikk

### Redigering
- [ ] Lagring av metadata (tittel, kategori osv.) regenererer **ikke** bookinger
- [ ] Bokingendringer lagres separat fra metadata
- [ ] Eksisterende bookinger lastes inn i BookingListe ved oppstart
- [ ] Regenerer-knapp er tydelig adskilt og krever bekreftelse

### Generelt
- [ ] Modal brukes kun til: rediger én booking, bekreftelser, konfliktinfo
- [ ] BookingListe er alltid synlig under opprettelse og redigering

---

## Eksisterende komponenter som bør gjenbrukes

| Komponent / hook | Gjenbruk i ny løsning |
|---|---|
| `ArrangementContent` | Beholdes **midlertidig** men deles opp i separate seksjoner |
| `ForhandsvisningTable` | Gjenbrukes som grunnlag for `BookingListe`-tabellen |
| `ForhandsvisningDialog` | Erstattes – logikken flyttes til inline BookingListe |
| `arrangementUtils.ts` | Beholdes – `beregnTidspunkterForBaner`, `grupperBanerEtterSlotLengde` m.fl. gjenbrukes |
| `useArrangement.ts` | `forhandsvis`-logikken kan gjenbrukes for konfliktsjekk i BookingListe |
| `useRedigerArrangement.ts` | `erstatt`-mutasjonen isoleres til regenerering-handling |
| `DatoVelger` | Erstattes av shadcn `Calendar` i manuelt oppsett |
| `SlettArrangementDialog` | Beholdes uendret |

---

## Foreslått komponentstruktur

```
features/arrangement-admin/
├── components/
│   ├── BookingListe/
│   │   ├── BookingListe.tsx          # Tabell med alle bookinger
│   │   ├── BookingRad.tsx            # Én rad (dato, tid, bane, status, handlinger)
│   │   ├── RedigerBookingModal.tsx   # Modal for enkeltbooking-redigering
│   │   └── bookingListeUtils.ts      # Sortering, konflikt-merge, duplikatsjekk
│   ├── GjentakendeOppsett/
│   │   └── GjentakendeOppsett.tsx    # Periode + ukedager + tider + baner + generer-knapp
│   ├── ManueltOppsett/
│   │   └── ManueltOppsett.tsx        # Kalender (multiple) + tid + bane + legg-til-knapp
│   ├── ArrangementMetadata.tsx       # Gren, kategori, tittel, beskrivelse, nettside-felt
│   ├── RegenererBookingerDialog.tsx  # Bekreftelsesdialog for farlig regenerering
│   └── SlettArrangementDialog.tsx    # uendret
├── hooks/
│   ├── useArrangement.ts             # uendret (opprett)
│   ├── useRedigerArrangement.ts      # justert: erstatt → kun regenerer
│   ├── useAvlysArrangement.ts        # uendret
│   └── useBookingListe.ts            # NY: holder lokal BookingListe-state + konfliktsjekk
├── views/
│   ├── arrangement/
│   │   └── OpprettArrangementView.tsx   # erstatter ArrangementView
│   └── rediger-arrangement/
│       └── RedigerArrangementView.tsx   # refaktorert
└── pages/
    └── ArrangementPage.tsx              # uendret struktur
```

### Ny type: `LokalBooking`

```ts
// Holder én booking i BookingListe før lagring
export type LokalBooking = {
  id: string;                                          // lokal UUID (crypto.randomUUID)
  eksternId?: string;                                  // booking-id fra backend (finnes for eksisterende bookinger)
  dato: string;                                        // "YYYY-MM-DD"
  startTid: string;                                    // "HH:MM"
  sluttTid: string;                                    // "HH:MM" – beregnes fra startTid + slotLengde
  baneId: string;
  baneNavn: string;
  status: "ledig" | "konflikt" | "aktiv" | "slettet";
  kilde: "generert" | "manuell" | "eksisterende";      // opprinnelse
  erEndret?: boolean;                                  // true hvis eksisterende booking er modifisert
  erSlettet?: boolean;                                 // true hvis eksisterende booking er markert for sletting
  konfliktInfo?: string;
};
```

---

## Implementasjonsrekkefølge

### Steg 1 – `BookingListe` + `LokalBooking`-modell ✅

**Opprettede filer:**
- `features/arrangement-admin/types.ts` – `LokalBooking`, `LokalBookingStatus`, `LokalBookingKilde`
- `components/BookingListe/bookingListeUtils.ts` – `sorterBookinger`, `formatDatoMedUkedag`, `tellKonflikter`
- `hooks/useBookingListe.ts` – `leggTil`, `fjern`, `markerSlettet`, `oppdater`, `settAlle`, `nullstill`
- `components/BookingListe/BookingRad.tsx` – rad med dato/tid-intervall/bane/status + rediger/avlys-knapper
- `components/BookingListe/BookingListe.tsx` – tabell med tom-tilstand, teller og «Legg til flere»-knapp

**Valg:**
- `LokalBooking`-typen bor i feature-lokalt `types.ts` (ikke i `src/types/`) siden den ikke speiler backend
- Konflikter vises med amber-bakgrunn per rad og tooltip med `konfliktInfo`
- Eksisterende bookinger (`kilde: "eksisterende"`) bruker «Avlys»-terminologi; andre bruker «Fjern»
- Konfliktsjekk mot `forhandsvis`-endpoint er **ikke** implementert i dette steget

**Akseptansekriterium:** ✅ En tom `BookingListe` kan rendres og vise bookinger med korrekt tidsintervall.

---

### Steg 2 – Gjentakende oppsett som generator ✅

#### Steg 2a – Generator → BookingListe (ingen konfliktsjekk)

**Opprettede filer:**
- `components/GjentakendeOppsett/GjentakendeOppsett.tsx` – periode, ukedager, baner, tidspunkter + «Generer»-knapp
- `views/arrangement/OpprettArrangementView.tsx` – ny opprettelsesvisning (erstatter `ArrangementView`)
- `arrangementUtils.ts` tillagt `genererLokalBookinger()` – produserer `LokalBooking[]` fra generator-parametre

**Valg:**
- `genererLokalBookinger` bor i `arrangementUtils.ts` (gjenbrukbar, ingen React-avhengigheter)
- Slotlengde-logikk gjenbrukes uendret fra `grupperBanerEtterSlotLengde`
- `GjentakendeOppsett` er ansvarsfri for BookingListe – kaller kun `onGenerer(bookinger)`
- `ArrangementView.tsx` og `ArrangementContent.tsx` beholdes uendret (parallell eksistens)
- `ArrangementPage.tsx` peker nå på `OpprettArrangementView`

#### Steg 2b – Konfliktsjekk via forhandsvis-endpoint

**Opprettede filer:**
- `hooks/useKonfliktSjekk.ts` – POST mot `/arrangement/forhandsvis`, merger status tilbake med `mergeKonfliktStatus`

**Valg:**
- `useKonfliktSjekk` er separat hook (ikke i `useBookingListe`) – holder ansvar adskilt
- `mergeKonfliktStatus` matcher bookinger på `dato|baneId|startTid`-nøkkel
- Kjøres automatisk etter `GjentakendeOppsett.onGenerer` – ingen manuell «sjekk konflikter»-knapp
- Bookinger som ikke matches av backend-svaret beholder status `"ukjent"`

**Akseptansekriterium:** ✅ Gjentakende oppsett fyller BookingListe med korrekte tidsintervaller. Konflikter vises inline. Ingen modal åpnes.

---

### Steg 3 – Manuelt oppsett ✅

**Opprettede filer:**
- `components/ManueltOppsett/ManueltOppsett.tsx` – shadcn `Calendar` i `mode="multiple"`, banevalg, tidspunktvelger

**Valg:**
- `onLeggTil` bruker samme signatur som `GjentakendeOppsett.onGenerer` → identisk dedup + konfliktsjekk-flow
- `sluttTid` beregnes per bane fra `bane.bookingOverstyring?.slotLengdeMinutter ?? bane.bookingInnstillinger.slotLengdeMinutter`
- Tidspunkter genereres per valgt bane (union) – tilbakestilles hvis banen fjernes og tidspunktet ikke lenger er tilgjengelig
- Etter «Legg til»: datoer nullstilles, bane og tid beholdes for rask batch-innlegging
- `OpprettArrangementView` fikk modus-velger («Gjentakende oppsett» / «Manuelt oppsett») med to knapper – ingen shadcn Tabs for å holde det enkelt

**Konsistens verifisert (pre-steg 3):**
- `bookingNøkkel` → omdøpt til `lagBookingNøkkel` via rename symbol (9 filer)
- `slotNøkkel` i `useKonfliktSjekk` fjernet – `lagBookingNøkkel` brukes direkte for backend-svar
- Samme funksjon for: deduplisering (`leggTil`), conflict merge (`mergeKonfliktStatus`), snapshot-sjekk (`håndterGenerer`)

**Akseptansekriterium:** ✅ Manuelt oppsett legger bookinger i BookingListe uten periode/ukedager. Samme dedup og konfliktsjekk som gjentakende oppsett.

---

### Steg 4 – Redigeringsvisning + API-kartlegging ✅ (frontend), 🔲 (backend)

**Opprettede filer:**
- `views/rediger-arrangement/RedigerArrangementView2.tsx` – ny view parallelt med eksisterende

**Implementert (frontend):**
- Arrangement-velger (dropdown, aktive/passerte gruppert)
- Metadata pre-fylt (kategori, beskrivelse, tillaterPaamelding)
- BookingListe rekonstruert via `arrangementTilLokalBookinger` (se under)
- Lokal avlys-markering: `markerSlettet` for `kilde === "eksisterende"`, `fjern` for andre
- Legg til nye bookinger: GjentakendeOppsett / ManueltOppsett med samme `håndterGenerer`-flow
- Lagre-knapp deaktivert med tydelig melding om API-gap

**Rekonstruksjon av BookingListe:**
`ArrangementRespons.baneGrupper` er strukturelt identisk med `SlotLengdeGruppe`:
```typescript
// BaneGruppeRespons (fra API) ≡ SlotLengdeGruppe (lokal type)
{ slotLengdeMinutter, baneIder, baneNavn, tidspunkter }
```
Bruker `genererLokalBookinger(arr.baneGrupper, startDato, sluttDato, arr.ukedager)` direkte.
Setter `kilde: "eksisterende"` på alle genererte bookinger.

---

### API-kartlegging (steg 4 – backend-gap)

**Eksisterende endepunkter:**

| Metode | URL | Funksjon | Problem |
|--------|-----|----------|---------|
| `GET` | `/api/klubb/{slug}/arrangementer` | Liste med metadata + `baneGrupper` (regler) | Ingen individuelle booking-IDer |
| `POST` | `/api/klubb/{slug}/arrangement/forhandsvis` | Konfliktsjekk ved opprettelse | — |
| `PUT` | `/api/klubb/{slug}/arrangement/{id}/forhandsvis` | Konfliktsjekk ved redigering (ekskluderer egne) | — |
| `PUT` | `/api/klubb/{slug}/arrangement/{id}` | Erstatter ALLE bookinger i serie | Alt-eller-ingenting, destruktiv |
| `DELETE` | `/api/klubb/{slug}/arrangement/{id}` | Sletter hele arrangementet | — |

**Gap 1 – Ingen endpoint for individuelle bookinger (kritisk)**

`ArrangementRespons` inneholder `baneGrupper` (generator-regler), ikke enkeltbookinger.
Det finnes ingen `GET …/arrangement/{id}/bookinger`.

Konsekvens: Vi kan ikke se individuelle booking-IDer, kan ikke vite om noen er avlyst,
og kan ikke kalle DELETE/PATCH på enkeltbookinger.

**Foreslått minimal API-endring – 3 nye endepunkter:**

```
GET    /api/klubb/{slug}/arrangement/{id}/bookinger
DELETE /api/klubb/{slug}/arrangement/{id}/bookinger/{bookingId}
POST   /api/klubb/{slug}/arrangement/{id}/bookinger
```

**GET – hent individuelle bookinger**
```csharp
// Respons:
public record ArrangementBookingRespons
{
    public required Guid BookingId { get; init; }
    public required DateOnly Dato { get; init; }
    public required TimeOnly StartTid { get; init; }
    public required TimeOnly SluttTid { get; init; }
    public required Guid BaneId { get; init; }
    public required string BaneNavn { get; init; }
    public required bool ErAktiv { get; init; }
}
// Policy: UtvidetEllerAdminIKlubb
```

**DELETE – avlys enkeltbooking**
```csharp
// Avlyser booking med gitt ID, frigjør sloten
// Returnerer: { bookingId, melding }
// Policy: UtvidetEllerAdminIKlubb
```

**POST – legg til ny enkeltbooking på arrangement**
```csharp
public record LeggTilArrangementBookingForespørsel
{
    public required DateOnly Dato { get; init; }
    public required TimeOnly StartTid { get; init; }
    public required Guid BaneId { get; init; }
}
// Returnerer: ArrangementBookingRespons for den nye bookingen
// Policy: UtvidetEllerAdminIKlubb
```

**Gap 2 – Metadata-lagring uten å erstatte bookinger**

`PUT /api/klubb/{slug}/arrangement/{id}` (erstatt) erstatter ALLE bookinger.
Det er ingen måte å lagre kun metadata (kategori, beskrivelse, tillaterPaamelding) uten
å sende med alle bookinger på nytt.

**Foreslått tillegg:**
```
PATCH /api/klubb/{slug}/arrangement/{id}/metadata
```
```csharp
public record OppdaterArrangementMetadataForespørsel
{
    public required ArrangementKategori Kategori { get; init; }
    public string? Beskrivelse { get; init; }
    public string? NettsideTittel { get; init; }
    public string? NettsideBeskrivelse { get; init; }
    public bool? PublisertPåNettsiden { get; init; }
    public required bool TillaterPaamelding { get; init; }
}
// Policy: UtvidetEllerAdminIKlubb
```

**Prioritering:**
1. `GET …/bookinger` – lavest risiko, bare en spørring, ingen sideeffekter ← **start her**
2. `PATCH …/metadata` – isolert, trygg
3. `DELETE …/bookinger/{id}` – avlys enkeltbooking
4. `POST …/bookinger` – legg til enkeltbooking

**Stopp for review før backend-endringer implementeres.**

---

---

### Steg 5 – Flytt regenerering til eksplisitt handling

**Filer:**
- `components/RegenererBookingerDialog.tsx`
- `hooks/useRedigerArrangement.ts` (juster `erstatt` → `regenerer`)

**Hva:**
- Legg `erstatt`-logikken bak en egen knapp med `RegenererBookingerDialog`
- Vis tydelig advarsel: «Alle eksisterende bookinger slettes og regenereres»
- Krev to-stegs bekreftelse (dialog med eksplisitt tekst)

**Akseptansekriterium:** Vanlig lagring kaller aldri `erstatt`. Regenerer-knapp er skjult bak bekreftelse.

---

## Minimal migreringsstrategi

For å unngå big-bang-refaktor:

1. Steg 1 og 2 kan implementeres **ved siden av** eksisterende kode i `OpprettArrangementView` uten å røre `RedigerArrangementView`
2. `ArrangementContent` kan leve parallelt til alle steg er fullført
3. `ForhandsvisningDialog` kan beholdes i `RedigerArrangementView` til steg 4 er ferdig
4. Steg 5 er den eneste steget som krever backend-koordinering (evt. ny endpoint for patch-bookinger)

---

## Viktig

Ikke implementer alt på én gang.

Start med **Steg 1** og vent på review.
