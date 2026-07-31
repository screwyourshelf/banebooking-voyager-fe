# Frontend-redesign: plan og retningslinjer

> **Status:** Aktiv redesign
> **Sist oppdatert:** 2026-07-31
> **Arbeidsbranch:** `feature/frontend-design-poc`

Dette dokumentet er autoritativt for visuell utforming og UI-arkitektur mens redesignen
pågår. Eldre feature- og refaktordokumenter er fortsatt relevante for funksjonelle krav,
men visuelle eksempler og instruksjoner om å kopiere eksisterende UI er underordnet denne
planen.

## Mål

- Gi Banebooking en tydelig, moderne identitet som ikke ser ut som et generisk dashboard.
- Lage reelt forskjellige mobil- og desktopopplevelser der arbeidsformen krever det.
- Gjøre handlinger, status, navigasjon og listevisninger gjenkjennelige i hele appen.
- Holde farger, typografi, avstand, radius og komponentvarianter sentralt.
- La sidene komponere semantiske komponenter fremfor å definere egne visuelle mønstre.
- Migrere uten å skrive om fungerende domenelogikk eller API-integrasjoner.

## Teknisk beslutning: shadcn og Radix beholdes

Shadcn er kildekode vi eier i repoet, ikke det visuelle designsystemet. Radix/shadcn
beholdes som teknisk grunnmur for tilgjengelighet og robust interaksjon, blant annet for
`Dialog`, `Drawer`, `Popover`, `Select`, `Accordion` og kalender.

Lagdelingen skal være:

1. `src/components/ui/` — tekniske primitiver fra shadcn/Radix.
2. `src/components/` — delte Banebooking-mønstre som kontrollvalg, listekort, sidehoder,
   navigasjon, statuser og skjemaoppsett.
3. `src/features/` — domenekomponenter som setter sammen de delte mønstrene.
4. Sider — orkestrering, data og sammensetning; minst mulig lokal styling.

Shadcn-generatoren skal ikke kjøres ukritisk over lokalt tilpassede komponenter. Nye eller
oppdaterte primitiver må sammenlignes manuelt før eksisterende kode erstattes.

## Visuelle regler

### Farger

- Grønt er produktets strukturfarge: navigasjon, kontrollflater og positive
  hovedhandlinger.
- Oransje er standard markør for valgte alternativer utenfor en aktivitetskontekst.
- På bookingsiden følger alle valgte gren-, dato- og banealternativer valgt aktivitet:
  tennis er oransje, padel er grønn og bordtennis er blågrå.
- Statusfarger brukes kun for status. Destruktiv handling bruker én felles lysrød variant
  med rød tekst.
- Aktivitetsfarger endrer bare farger, aldri struktur, størrelse eller oppførsel.

### Handlinger

- Primær positiv handling: fylt grønn knapp, for eksempel `Book` og `Lagre`.
- Sekundær handling: nøytral outline, for eksempel `Koble til arrangement` og `Avbryt`.
- Destruktiv eller negativ handling: felles destruktiv variant, for eksempel `Avbestill`,
  `Sperr` og `Slett`.
- Knapper i en slot har innholdsbestemt bredde og flyter til høyre.
- Tekstknapper bruker normalt ikke dekorative ikoner. Ikoner beholdes i navigasjon,
  datavisning, leverandøridentitet og rene ikonverktøy.

### Lister og slots

- Booking-slots og resultat-/administrasjonsrader bruker samme `record-list` og
  `record-card`-ramme.
- Hver rad fyller hele bredden til beholderen.
- Avstand legges mellom radene, ikke som tilfeldig horisontal marg.
- Radius, ramme, flate og skygge styres av felles tokens.

### Responsivitet

- Mobil prioriterer dagens tilgjengelighet, korte valgveier og tommelvennlige handlinger.
- Desktop skal bruke arbeidsflaten, støtte flere kolonner og gi høyere informasjonstetthet.
- Mobil skal ikke være en krympet desktop, og desktop skal ikke være en oppblåst mobil.
- Mobil og desktop ferdigstilles og kontrolleres i samme utviklingsslice.

## Status for POC

POC-en dekker nå:

- Responsivt appskall med desktop-sidefelt og mobil bunnnavigasjon.
- Samlet innlogging/kontomeny, lyst/mørkt tema og utviklingsinnlogging.
- RSS-/feedvarsler i det nye appskallet.
- `Book bane` med mobiltilpassede valg, aktivitetsfarger og ny slotvisning.
- `Brukere` med responsivt søk, filtre, resultatkort og redigeringsdialog.
- Delte valg- og listeprimitiver samt sentrale design-tokens.

## Migreringsrekkefølge

### Fase 1 — Konsolider fundamentet

- Del den store `design-system.css` etter ansvar når grensene er tydelige: tokens,
  primitiver og delte mønstre. Ikke del per side.
- Gjør eksisterende `record-list`/`record-card`, status- og handlingsmønstre til tydelige,
  dokumenterte delte komponenter der det gir reell type- eller atferdsverdi.
- Kartlegg direkte bruk av `components/ui` og lokale Tailwind-varianter som bør erstattes av
  semantiske komponenter.
- Behold fungerende domenelogikk uendret.

### Fase 2 — Fullfør booking- og kontoflyten

1. `Mine tider` — neste anbefalte slice.
2. Bookingbekreftelse, feiltilstander og reglement.
3. `Min side`, innlogging og kontorelaterte flater.

`Mine tider` prioriteres fordi siden kan gjenbruke slotkort, status og destruktive
handlinger fra `Book bane` og dermed teste at fundamentet fungerer utenfor POC-siden.

### Fase 3 — Arrangementer

1. Arrangementsliste og detaljvisning.
2. Påmelding og avmelding.
3. Opprettelse og administrasjon.

Funksjonell modell i `arrangement-admin-refaktor.md` beholdes. Visuell utforming følger
denne redesignplanen.

### Fase 4 — Resterende administrasjon

1. Baner og grener.
2. Kunngjøringer.
3. Klubbinnstillinger.

`Brukere` er referanse for responsive adminlister, men nye sider skal gjenbruke delte
mønstre fremfor å kopiere hele siden.

### Fase 5 — Turnering

Turnering tas sist fordi området har flest spesialtilfeller og pågående arkitekturplaner.
Funksjonell refaktorering og visuell migrering må koordineres, men bør fortsatt leveres i
små, verifiserbare deler.

## Arbeidsform per slice

1. Kartlegg eksisterende funksjon, tilstander, handlinger og skjermstørrelser.
2. Finn hvilke delte mønstre som allerede dekker behovet.
3. Utvid designsystemet semantisk hvis et reelt nytt mønster mangler.
4. Implementer mobil og desktop i samme slice.
5. Kontroller lyst og mørkt tema, tomtilstand, lasting, feil og relevante roller.
6. Kjør `npm run check`, `npm run build` og `git diff --check`.
7. Gjør visuell nettleserkontroll før commit.
8. Fjern erstattet lokal styling og ubrukte komponenter når slicen er trygg.

## Ferdigkriterier

En side er ferdig migrert når:

- funksjonalitet og autorisasjon er uendret eller eksplisitt avtalt endret;
- mobil og desktop har bevisst utforming;
- lyst og mørkt tema fungerer;
- handlinger og status følger de semantiske rollene;
- siden ikke introduserer tilfeldige farger, knappetyper eller lokale designvarianter;
- relevante delte komponenter brukes;
- tekniske kontroller og visuell kontroll passerer.

## Avgrensninger

- Redesignarbeidet skal ikke kobles til den planlagte backend-endringen bort fra flere
  klubber/tenants.
- Aktivitetsfarger løses foreløpig fra aktivitetens slug i frontend. Backend-kontrakt for
  aktivitetsmetadata kan vurderes senere, men er ikke nødvendig for migreringen.
- POC-en etablerer retning; resterende sider regnes fortsatt som under redesign.
