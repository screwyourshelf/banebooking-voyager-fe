# Frontend-redesign: PR-handover

> **Status:** PR-kandidat
> **Sist oppdatert:** 2026-08-02
> **Repo:** `/Users/andreas/Dev/banebooking/frontend`
> **Branch:** `feature/frontend-design-poc`
> **Målbranch:** `main`
> **Utgangspunkt:** `dbf08f5`

Dette dokumentet beskriver det som er viktig for review og videre arbeid. Historiske
implementeringslogger ligger i `docs/archive/` og er ikke gjeldende instruksjon.

## Omfang

Branchen løfter appskallet og de primære arbeidsflatene til den nye visuelle profilen:

- Book bane, Mine tider og Arrangementer
- arrangementadministrasjon
- Brukere
- Baner og Grener, samlet i ett administrasjonsområde
- Klubbinnstillinger og medlemskapskontroll
- Min side, Vilkår og persondata
- Kunngjøringer, Nyheter og guard-/feilflater
- innlogging, mobilnavigasjon og desktop-sidefelt

Turnering er uttrykkelig utenfor redesignomfanget. Funksjonalitet og API-kontrakter er
beholdt, med de additive backendendringene som er listet nedenfor.

## Arkitektur som skal bevares

### Komponentlag

1. `src/components/ui/` inneholder tekniske shadcn-/Radix-primitiver.
2. `src/components/` inneholder Banebookings semantiske komponenter.
3. `src/features/` komponerer de delte mønstrene med domenedata og handlinger.
4. Sider og views orkestrerer data, tilstand og ruter.

Shadcn-kilde skal ikke få tilfeldige visuelle featuretilpasninger. Utseende og bruk styres
av Banebookings semantiske komponentlag.

### Designsystem

- `tokens.css`: globale farger, typografi, avstander og størrelser
- `primitives.css`: lavnivå layout- og temaprimitiver
- `patterns.css`: delte semantiske UI-mønstre
- `migrated-compositions.css`: migrerte sammensetninger som fortsatt må ligge samlet
- `responsive.css`: felles responsive regler
- `design-system.css`: stabil importrekkefølge

Listeflater går gjennom `RecordCollection`, `RecordList`, `RecordCard` og tilhørende
record-komponenter. Features skal ikke bruke interne `record-*`-klasser direkte.
`scripts/check-design-system-boundaries.mjs` håndhever denne grensen.

### Visuelle og funksjonelle regler

- grønn fylt knapp er positiv hovedhandling
- outline er nøytral sekundærhandling
- destruktive handlinger bruker den felles destruktive varianten
- oransje markerer ordinære valg; bookingvalg følger aktivitetens temafarge
- statusfarge beskriver status, ikke om brukeren har lov til å utføre en handling
- mobil og desktop bruker samme innhold, ordlyd og komponentfamilier
- toast er kun for globale hendelser uten lokal eier; lokal handling gir inline-feedback
- datoer går gjennom `DatoVelger`, `DatoFlervelger` eller felles `DatePickerPopover`

## Viktige implementasjonsvalg

- Desktop bruker sidefelt uten separat toppbar. Mobil bruker toppfelt og bunnnavigasjon.
- Desktopbakgrunnen bygger på lagdelingen fra `aastk.no`: et tydelig bilde, et mørkt 20
  %-scrim og en mørk retningsgradient. Desktopens sideintroduksjon bruker lys tekst,
  løsningen eies av appskallet, og mobil laster ikke bakgrunnsressursen.
- Tema etableres før første paint. Appskall og sidegeometri beholdes under lasting.
- Ruter er lazy-lastet, og tunge avhengigheter som rikteksteditoren lastes ved behov.
- Bookingens gren-, dag- og banevalg bruker samme kontrollpanelfamilie som øvrige filtre.
- Record-lister skifter fra kort til kompakte rader ut fra beholderbredde, ikke bare
  viewportbredde.
- Ekspanderbare record-lister bruker hele sammendragsraden som trigger. Hurtighandlinger
  rendres som separate søskenkontroller gjennom `RecordCard`, uten lokale
  disclosure-varianter.
- Baner og Grener deler arbeidsområde og fanemønster, men beholder egne ruter og ansvar.
- Arrangementbeskrivelsen i bookinglisten er offentlig informasjon. Avbestilling og andre
  handlinger er fortsatt kapabilitetsstyrt.
- Mine tider viser gren og støtter samme grenfilter for kommende og historiske tider.

## Backendavhengighet

Frontendbranchen skal testes mot backendcommitten som følger den separate backend-PR-en.
Den inneholder:

- `GrenId` og `GrenNavn` i `MinBookingRespons`
- korrekt lasting av `Arrangement` ved autorisasjon av avbestilling
- samlet bookingvalidering i `BookingAsyncValidator`
- utviklingsautentisering og testdata som er sperret ute av produksjon

Backend-PR-en bør merges og deployes før frontend-PR-en. Feltutvidelsen er additiv, men
frontendens Mine tider-visning forventer at grenfeltene finnes.

## Verifikasjon før PR

Frontend:

```bash
npm run check
npm run build
git diff --check
```

Backend:

```bash
dotnet test
git diff --check
```

Visuell kontroll skal minst dekke:

- 390 px mobil og vanlig desktopbredde
- lyst og mørkt tema
- offentlig bruker, Medlem, Utvidet og Admin der rollen er relevant
- lasting, tomtilstand, API-feil og vellykket mutasjon på sentrale flyter
- Book bane, Mine tider, Arrangementer, Brukere og én representativ admineditor

## Kjente avgrensninger

- Turnering beholder dagens komponenter, toast-bruk og visuelle uttrykk.
- Aktivitetsfarger mappes foreløpig fra aktivitetens slug i frontend.
- Det finnes ikke automatiserte visuelle regresjonstester.
- Overgangen bort fra flere klubber/tenants inngår ikke i denne leveransen.
- `migrated-compositions.css` kan deles videre etter mønster og ansvar, men ikke per side.

## Anbefalt PR-rekkefølge

1. Oppdater backendbranchen mot `origin/master`, kjør tester og opprett backend-PR.
2. Merge/deploy backend eller bruk en avtalt preview.
3. Kjør frontendens siste funksjonelle kontroll mot den aktuelle backendversjonen.
4. Opprett frontend-PR mot `main`.

## Reviewfokus

- API- og autorisasjonsregler er bevart.
- Ingen produksjonskode kan aktivere utviklingsinnlogging eller utviklingstestdata.
- Delte record-, feedback-, kalender- og adminmønstre brukes uten lokale varianter.
- Appstart, lazy loading og route-prefetch gir ikke blanke eller hoppende mellomflater.
- Direkte lenker og rollegrenser fungerer på mobil og desktop.
