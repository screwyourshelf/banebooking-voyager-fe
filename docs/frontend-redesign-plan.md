# Frontend-redesign: plan og retningslinjer

> **Status:** Aktiv redesign
> **Sist oppdatert:** 2026-08-02
> **Arbeidsbranch:** `feature/frontend-design-poc`

Dette dokumentet er autoritativt for visuell utforming og UI-arkitektur mens redesignen
pågår. Eldre feature- og refaktordokumenter er fortsatt relevante for funksjonelle krav,
men visuelle eksempler og instruksjoner om å kopiere eksisterende UI er underordnet denne
planen.

Fullførte og historiske planer ligger i [`docs/archive/`](./archive/README.md) og skal ikke
brukes som gjeldende instruksjon uten kontroll mot dagens kode.

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
- Ikoner brukes bare når de tydeliggjør funksjon eller status. Seksjonsfaner og vanlige
  innstillingsoverskrifter skal normalt stole på teksthierarkiet alene.

### Lister og slots

- Booking-slots og resultat-/administrasjonsrader bruker samme `record-list` og
  `record-card`-ramme.
- Hver rad fyller hele bredden til beholderen.
- Avstand legges mellom radene, ikke som tilfeldig horisontal marg.
- Radius, ramme, flate og skygge styres av felles tokens.

### Responsivitet

- Mobil prioriterer dagens tilgjengelighet, korte valgveier og tommelvennlige handlinger.
- Mobil og desktop skal bruke samme visuelle vokabular, ordlyd og informasjonsrekkefølge.
- Desktop skal bruke den ekstra arbeidsflaten til rom og funksjonelt begrunnede kolonner, ikke
  til egne farger, tabelloverskrifter eller forklaringer som bare finnes på stor skjerm.
- Responsive forskjeller skal løse arbeidsform eller plassbehov; de skal ikke innføre en egen
  desktopvariant av produktets semantiske komponenter.
- Mobil og desktop ferdigstilles og kontrolleres i samme utviklingsslice.
- Typografien bruker en kompakt skala på mobil og en kontrollert, ett trinn større
  `comfortable`-skala i de redesignede arbeidsflatene fra desktop-breakpointet. Navigasjon
  og Turnering beholder sin eksisterende skala.
- Appskallet bruker ikke en global breadcrumb-rad. Aktiv side i hovednavigasjonen og en
  tydelig sidetittel gir orientering; dype detalj- og redigeringsflater skal bruke en lokal
  tilbakehandling når den trengs.
- Desktop bruker sidefeltet som samlet navigasjonsflate. Tema og konto ligger i en fast
  verktøyfot, og arbeidsflaten har ingen separat toppbar. Mobil beholder toppfeltet for
  klubbidentitet, tema og nyheter samt bunnnavigasjonen.

## Status for POC

POC-en dekker nå:

- Responsivt appskall med desktop-sidefelt og mobil bunnnavigasjon.
- Én dedikert innloggingsside for mobil og desktop, samlet desktopkonto i sidefeltet,
  lyst/mørkt tema og utviklingsinnlogging.
- Offentlig `Nyheter`-side for RSS-feeden, med ordinær navigasjon og en nøytral
  toppbarsnarvei uten varslingsbadge.
- `Book bane` med mobiltilpassede valg, aktivitetsfarger og ny slotvisning.
- `Mine tider` med kommende og gjennomførte reservasjoner, delte record-kort og
  kapabilitetsstyrt avbestilling.
- `Arrangementer` med offentlig og innlogget liste, programvisning, historikkfilter og
  kapabilitetsstyrte handlinger.
- `Arrangementadministrasjon` med liste–redigeringsflyt, felles editor for ny/rediger,
  bookingoppsett og fullbreddes bookingrader.
- `Brukere` med responsivt søk, filtre, resultatkort og redigeringsdialog.
- `Baner` med responsiv entitetsliste, fokusert redigering, opprettelse og valgfrie
  bookingoverstyringer.
- `Grener` med responsiv entitetsliste, felles editor for ny/rediger og delte
  bookinginnstillinger.
- `Baner` og `Grener` samlet i ett administrasjonsområde med delt sidehode og
  ruteorienterte seksjonsfaner, uten å blande entitetene i samme liste.
- `Klubbinnstillinger` med responsiv klubbprofil, medlemskapsstatus og delt
  underområdenavigasjon.
- `Min side` med responsiv profil, kontoinformasjon, persondata og delt
  underområdenavigasjon.
- `Kunngjøringer` med publiseringsstatus, opprettelse, bekreftelsesoversikt og felles
  fareområde for deaktivering.
- `Vilkår` og obligatoriske kunngjøringer med en delt, responsiv langtekstflate for innhold
  som skal leses fremfor redigeres.
- Guard-flatene `Sperret`, obligatorisk kunngjøring og medlemsbekreftelse med samme
  sidehierarki, leseflate, status- og skjemamønstre som de øvrige løftede sidene.
- Delte valg- og listeprimitiver samt sentrale design-tokens.

## Migreringsrekkefølge

### Fase 1 — Konsolider fundamentet

- `design-system.css` er delt i tokens, primitiver, delte mønstre, migrerte sammensetninger
  og responsive tilpasninger. Importrekkefølgen er stabil, og styling er ikke delt per side.
- `RecordCollection`, `RecordList` og `RecordCard` er det lukkede semantiske API-et for
  listeflater. De eier bredde, avstand, kortflate, hover, detaljflate og handlingsrad;
  features leverer innhold og tilstand uten lokale rotklasser eller `className`-smutthull.
- De underliggende `record-*`-klassene er interne implementasjonsdetaljer. En CI-kontroll
  avviser direkte bruk utenfor `src/components/records/` og de sentrale pattern-/responsive-
  filene.
- Record-rader deler en oransje informasjonsmarkør gjennom
  `RecordLeadingValue`/`RecordEyebrow`. `RecordControlPanel` gir én responsiv komponentvei
  for både flervalgsfiltre og obligatoriske enkeltvalg.
- Record-listene bruker containerstyrt tetthet: kort på smale arbeidsflater og en kompakt,
  separatorbasert radpresentasjon når selve samlingen er bred nok.
- Kartlegg direkte bruk av `components/ui` og lokale Tailwind-varianter som bør erstattes av
  semantiske komponenter.
- Behold fungerende domenelogikk uendret.

### Fase 2 — Fullfør booking- og kontoflyten

1. `Mine tider` — fullført som første slice etter POC-en.
2. Bookingbekreftelse, feiltilstander og reglement — fullført.
   Bookingens gren-, dag- og banevalg bruker samme record-kontrollpanel som filtre på andre
   listeflater. Valgene er alltid tilgjengelige, med stablet mobilflyt og kompakt,
   innholdsbasert desktoplayout.
3. `Min side` og innlogging — fullført for profil, persondata, dedikert innloggingsside og
   samlet desktopkonto i sidefeltet.
4. Guard-flater — fullført for sperret konto, obligatorisk kunngjøring og
   medlemsbekreftelse.

`Mine tider` bekrefter at slotkort, status og destruktive handlinger kan gjenbrukes utenfor
`Book bane`. Reservasjoner grupperes etter dato, og hver rad følger bookinglistens
informasjonsrekkefølge med tid/vær, bane, status og eventuell detaljhandling. Siden bruker
samme arbeidsbredde som booking for å unngå layoutskift. `Min side` gjenbruker samme
sidehierarki, settings-seksjoner, status og handlinger som administrasjonsflatene uten lokal
profilstyling. Guard-flatene bruker samme hierarki og den delte langtekstflaten, mens
medlemskapstypen bruker et felles Radix-basert radiovalg for innstillingsskjemaer. Den
eksisterende prioriteten `Sperret` → `Kunngjøring` → `Medlemskap` og alle API-kontrakter er
beholdt. Bookingens bekreftelser, feiltilstander og reglement bruker nå de samme delte
tilbakemeldings-, editor- og langtekstmønstrene som de øvrige løftede flatene.

Tilbakemeldingssystemet følger én regel på tvers av de redesignede flatene: oppdatert
innhold er primær bekreftelse, uklare mutasjonsresultater får vedvarende inline-feedback,
og query-/autorisasjonsfeil beholder kontekst og retry. Toast er reservert for globale
hendelser uten lokal eier, foreløpig sesjonsutløp. Turnering er ikke migrert i POC-en.

### Fase 3 — Arrangementer

1. Arrangementsliste og detaljvisning — fullført.
2. Påmelding og avmelding.
3. Opprettelse og administrasjon — fullført visuelt med eksisterende funksjonell modell.

Funksjonell modell i `arrangement-admin-refaktor.md` beholdes. Visuell utforming følger
denne redesignplanen. Arrangementsliste og detaljvisning bruker samme fullbreddes
record-collection som `Mine tider`: dato, identitet og status har fast rekkefølge, mens
programmet grupperes etter dato i det utvidede kortet. Arrangementadministrasjon bruker
samme liste–redigeringsmønster som Baner og Grener: oversikten er stabil, ny/rediger åpnes i
en fokusert editor, og informasjon og bookinger har separate lagringsflyter. Bookinglisten
er fortsatt source of truth og bruker delte record-rader i stedet for en egen mobiltabell.
Gjentakende og manuelt oppsett deler sentrale valg-, settings- og handlingsmønstre.

### Fase 4 — Resterende administrasjon

1. Baner — fullført.
2. Grener — fullført.
3. Klubbinnstillinger — fullført.
4. Kunngjøringer — fullført.

`Brukere` er referanse for responsive adminlister, men nye sider skal gjenbruke delte
mønstre fremfor å kopiere hele siden. `Baner` etablerer et liste–redigeringsmønster med
fullbreddes record-rader, responsivt grenfilter, grønn opprettelseshandling, samme fokuserte
editor for ny og rediger, og ikonbaserte settings-seksjoner. Editoren er helskjerm på mobil
og avgrenset på desktop. `Grener` viderefører mønsteret med grenens åpningstid og
bookingregler i record-raden og samme editor for opprettelse og redigering.
`Klubbinnstillinger` bruker de samme settings-seksjonene i en vanlig sideflate. Reelle
underområder bruker `Tabs` med den delte `section`-varianten, som også er tatt i bruk på
`Min side`. Varianten bruker den grønne kontrollflaten og en tydelig oransje understrek for
valgt område. `Baner` og `Grener` ligger i ett navigasjonspunkt og bruker den samme
visuelle varianten som rutenavigasjon mellom to separate arbeidsflater. Eksisterende
direktelenker og autorisasjonsgrenser er beholdt. Destruktive innstillingsområder bruker den delte `danger`-tonen på
`SettingsSection`. `Kunngjøringer` gjenbruker det samme settings-hierarkiet for status,
opprettelse og bekreftelser. Deaktivering bruker det delte fareområdet. Obligatoriske
kunngjøringer og `Vilkår` deler `ContentDocument`, en avgrenset langtekstflate for
leseinnhold. Den skal også vurderes for reglement og annet strukturert informasjonsinnhold;
det er ikke en ny generell kortvariant eller et lokalt sidemønster.

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
- feature-kode ikke kobler seg direkte til beskyttede `record-*`-klasser;
- tekniske kontroller og visuell kontroll passerer.

## Avgrensninger

- Redesignarbeidet skal ikke kobles til den planlagte backend-endringen bort fra flere
  klubber/tenants.
- Aktivitetsfarger løses foreløpig fra aktivitetens slug i frontend. Backend-kontrakt for
  aktivitetsmetadata kan vurderes senere, men er ikke nødvendig for migreringen.
- POC-en etablerer retning; resterende sider regnes fortsatt som under redesign.
