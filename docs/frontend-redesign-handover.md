# Frontend-redesign: handover til neste Codex-task

> **Status:** Fundament, `Mine tider`, `Arrangementer`, `Baner`, `Grener`,
> `Klubbinnstillinger`, `Min side`, `Kunngjøringer`, `Vilkår` og guard-flater klare
> **Sist oppdatert:** 2026-08-01
> **Repo:** `/Users/andreas/Dev/banebooking/frontend`
> **Branch:** `feature/frontend-design-poc`
> **Utgangspunkt:** `main` på `dbf08f5`

## Start her

1. Les `docs/frontend-redesign-plan.md` før nye UI-endringer.
2. Bekreft branch og ren arbeidsflate med `git status --short`.
3. Start frontend med `npm run dev -- --host 0.0.0.0` hvis den ikke allerede kjører.
4. Bruk utviklingsinnloggingen i innloggingsmenyen for å teste Admin, Utvidet og Bruker.
5. Gjør neste arbeid som en avgrenset slice; ikke redesign flere ubeslektede sider samtidig.

Dokumenter i `docs/archive/` er historiske og skal ikke brukes som gjeldende plan.

## Hva POC-en har etablert

### Appskall og navigasjon

- Desktop har fast sidenavigasjon og bred arbeidsflate.
- Mobil har toppfelt, fast bunnnavigasjon og samlet `Mer`-/kontomeny.
- Lyst/mørkt tema er alltid tilgjengelig som ikonverktøy.
- Navigasjonsmodell og labels er samlet, slik at mobil og desktop bruker samme struktur.

Sentrale filer:

- `src/app/AppShell.tsx`
- `src/components/navigation/AppSidebar.tsx`
- `src/components/navigation/MobileBottomNav.tsx`
- `src/components/navigation/navigationModel.ts`
- `src/components/navigation/LoginPanel.tsx`

### Innlogging for lokal POC

- Vanlig Supabase-innlogging er beholdt.
- I `DEV` finnes testinnlogging for `admin`, `utvidet` og `medlem` uten Supabase-brukere.
- Frontend kaller `POST /api/dev-auth/login`, lagrer en lokal utviklingssession og bruker
  `DevelopmentBearer` mot API-et.
- Testinnloggingen avhenger av at backendens dev-auth-endepunkt kjører.

Sentrale filer:

- `src/auth/`
- `src/providers/AuthProvider.tsx`
- `src/hooks/useAuth.ts`
- `src/api/api.ts`
- `src/utils/authUtils.ts`

### Book bane

- Mobilens grønne kontrollflate inneholder aktivitet, hurtigdato og banevalg.
- Valgt aktivitet styrer understrek på alle bookingvalg:
  - tennis: oransje;
  - padel: grønn;
  - bordtennis: blågrå.
- Banevalg viser ledige tider i parentes med statusprikk.
- Slots viser starttid, kompakt vær, hovedstatus og eventuell sekundær forklaring.
- `Ledig` og `Opptatt` er hovedstatus; eier, navn og arrangement er forklarende varianter.
- Slot-handlinger bruker felles hierarki og flyter til høyre.
- Varsler fra feed/RSS er tilbake i appskallet og på bookingsiden.

Sentrale filer:

- `src/features/booking/views/booking/BookingContent.tsx`
- `src/features/booking/components/BookingMobileControls.tsx`
- `src/features/booking/components/BookingCourtSwitcher.tsx`
- `src/features/booking/components/BookingSlotListAccordion.tsx`
- `src/features/booking/activityTheme.ts`
- `src/features/feed/components/FeedNotice.tsx`

### Mine tider

- Siden bruker samme `record-list`/`record-card`-ramme som booking og brukeradmin.
- Reservasjoner grupperes etter dato; datoflisen gjentas ikke i hver rad.
- Mobilraden følger bookinglistens rekkefølge: tid og vær, bane, status og eventuell
  detaljhandling.
- Siden bruker samme fulle arbeidsbredde som booking, slik at navigasjon mellom flatene ikke
  gir et tydelig breddehopp på desktop.
- Kommende reservasjoner vises først; historikk kan hentes med ett felles kontrollvalg.
- Tomtilstand, lasting, API-feil og mutasjonsfeil har bevisste tilstander i samme flate.
- `booking:fjern` fra hver reservasjon avgjør om avbestilling vises; det finnes ingen lokal
  rolletabell for handlingen.
- Avbestill bruker den felles destruktive knappen og ligger høyrejustert i handlingsområdet.

Sentrale filer:

- `src/features/minside/views/mine-bookinger/MineBookingerView.tsx`
- `src/features/minside/views/mine-bookinger/MineBookingerContent.tsx`
- `src/features/minside/views/mine-bookinger/MineBookingRow.tsx`
- `src/features/minside/hooks/useMineBookinger.ts`
- `src/features/minside/hooks/useBookingActions.ts`

### Arrangementer

- Siden bruker samme fullbreddes `record-collection`, toolbar, historikkbryter og
  `record-list`/`record-card`-ramme som `Mine tider`.
- Mobilraden har fast rekkefølge: dato, tittel/gren og arrangementsstatus. Kategori gjentas
  ikke når den er identisk med tittelen.
- Programmet åpnes inne i kortet og grupperer tider etter dato med separate kolonner for
  klokkeslett og bane.
- Offentlig og innlogget API-flyt er beholdt. Innlogging endrer bare data og handlinger som
  backendens kapabiliteter tillater.
- `arrangement:avlys`, `arrangement:seTurnering` og
  `arrangement:administrerTurnering` styrer handlingene; siden har ingen lokal rolletabell.
- Historikk, grenfilter, direkteåpning fra `?arrangement=`, lasting, API-feil og tomtilstander
  har bevisste tilstander i samme flate.
- Avlysning bruker felles destruktiv knapp og eksisterende bekreftelsesdialog uten å endre
  API-kontrakten.

Sentrale filer:

- `src/features/arrangementer/views/arrangementer/ArrangementerView.tsx`
- `src/features/arrangementer/views/arrangementer/ArrangementerContent.tsx`
- `src/features/arrangementer/views/arrangementer/ArrangementRow.tsx`
- `src/features/arrangementer/views/arrangementer/useArrangementer.ts`
- `src/features/arrangementer/views/arrangementer/useAvlysArrangement.ts`

### Brukeradministrasjon

- Mobil har grønn kontrollflate med nøytralt søkefelt og sammenleggbare filtre.
- Desktop har bredt søk/filterområde og tabellorientert informasjon.
- Brukertreff bruker samme listekort-ramme som booking-slots.
- Medlemskap uten bekreftelse heter `Ikke bekreftet`.
- Redigeringsdialog og destruktive handlinger følger nye designroller.

Sentrale filer:

- `src/features/brukere/views/brukere-liste/BrukerFilterPanel.tsx`
- `src/features/brukere/views/brukere-liste/BrukerListeRad.tsx`
- `src/features/brukere/views/brukere-liste/BrukereListeContent.tsx`
- `src/features/brukere/views/brukere-liste/RedigerBrukerDialog.tsx`

### Baner

- Siden har samme sidehierarki og arbeidsbredde som øvrig administrasjon.
- `Ny bane` er en grønn sidehandling ved sidehodet. Opprettelse og redigering bruker samme
  `AdminEditorDialog`: helskjerm med `Alle baner` på mobil og avgrenset dialog på desktop.
- Baneoversikten bruker en delt `AdminEntityCollection` med fullbreddes record-rader, fast
  informasjonsrekkefølge, status og viderepil. Mønsteret er laget for tilsvarende
  administrasjonssider som `Grener`, ikke som en lokal banevelger.
- Valg av bane åpner et fokusert `AdminEditorDialog`: helskjerm med lokal tilbakehandling på
  mobil og en avgrenset dialog på desktop. Listen forblir sidens stabile startpunkt.
- Grenfilteret bruker delt `RecordChoiceFilter` i den grønne kontrollflaten. På mobil åpnes
  valgene med samme `Filtre`-mønster som Brukere; på desktop er valgene synlige direkte.
- Redigeringsskjemaet går direkte fra banevalg til felter. Gjentatt seksjons- og hjelpetekst
  er fjernet; forklaring beholdes bare for sortering og avvik fra standardregler.
- Opprettelse og redigering deler ikonbaserte `SettingsSection`-seksjoner for
  baneinformasjon, tilgjengelighet og eventuelle bookingavvik.
- Felt, status og bookingoverstyringer bruker delte settings-rader og -seksjoner. De seks
  overstyringene åpnes bare når administratoren aktiverer dem. Lange skjema ruller internt,
  mens lagringshandlingen ligger tilgjengelig nederst.
- Utkast beholdes per bane når redigeringsflaten lukkes, og raden merkes `Ulagret` slik at
  lokal tilstand ikke blir usynlig for administratoren.
- Baner-featuret inneholder ingen lokale `className`-koblinger, inline-stiler eller
  hardkodede designverdier. Delte `Admin*`- og `Settings*`-komponenter eier koblingen til
  designmønstrene.
- Opprettelse og redigering beholder eksisterende validering, utkast per bane, API-kontrakter
  og lagringsflyt.
- `baner:admin` styrer både navigasjon og sideinnhold. Utvidet og Bruker får en eksplisitt
  tilgangstilstand ved direkte URL i stedet for et redigeringsskjema som backend senere
  avviser.
- Alle settings-brytere har nå tilgjengelige navn og samme oransje valgindikator som
  `FilterSwitch`, styrt sentralt gjennom det delte `SwitchRow`-laget.

Sentrale filer:

- `src/features/baner/pages/BanerPage.tsx`
- `src/features/baner/views/rediger-bane/RedigerBaneView.tsx`
- `src/features/baner/views/rediger-bane/RedigerBaneContent.tsx`
- `src/features/baner/views/ny-bane/NyBaneContent.tsx`
- `src/features/baner/views/ny-bane/NyBaneDialog.tsx`
- `src/components/admin/AdminPage.tsx`
- `src/components/admin/AdminEntityCollection.tsx`
- `src/components/admin/AdminEditorDialog.tsx`
- `src/components/admin/AdminForm.tsx`
- `src/components/admin/SettingsFields.tsx`
- `src/components/admin/SettingsSection.tsx`

- `src/components/records/RecordChoiceFilter.tsx`
- `src/components/records/RecordText.tsx`

### Grener

- Siden viderefører det samme liste–redigeringsmønsteret som `Baner`: oversikten er det
  stabile startpunktet, mens valg av gren åpner en fokusert editor.
- Grenoversikten bruker `AdminEntityCollection` og fullbreddes record-rader med åpningstid
  som oransje informasjonsmarkør, tydelig navn, kompakt oppsummering av bookingregler,
  status og viderepil.
- `Ny gren` og redigering bruker samme `AdminEditorDialog`: helskjerm med `Alle grener` på
  mobil og avgrenset dialog på desktop.
- Opprettelse og redigering deler `GrenEditorContent`. Navn, reglement, sortering, status og
  bookingregler bruker de samme `Settings*`-komponentene som Baner i stedet for lokale
  skjema- eller brytervarianter.
- Utkast beholdes per gren når editoren lukkes, og tilhørende rad merkes `Ulagret`.
- Lasting, API-feil med retry, tomtilstand, mutasjonsfeil og manglende tilgang har egne
  tilstander i den delte flaten.
- `grener:admin` styrer sideinnhold og opprettelseshandling. Utvidet og Bruker får en
  eksplisitt tilgangstilstand ved direkte URL.
- Eksisterende opprettelses- og oppdateringskontrakter, validering og bookingregler er
  beholdt uendret.
- Grener-featuret inneholder ingen lokale `className`-koblinger eller inline-stiler.

Sentrale filer:

- `src/features/grener/pages/GrenerPage.tsx`
- `src/features/grener/GrenEditorContent.tsx`
- `src/features/grener/views/rediger-gren/RedigerGrenView.tsx`
- `src/features/grener/views/ny-gren/NyGrenView.tsx`
- `src/features/grener/views/ny-gren/NyGrenDialog.tsx`
- `src/components/admin/AdminEntityCollection.tsx`
- `src/components/admin/AdminEditorDialog.tsx`
- `src/components/admin/SettingsFields.tsx`
- `src/components/admin/SettingsSection.tsx`

### Klubbinnstillinger

- Siden bruker samme `AdminPage`-hierarki og arbeidsbredde som Baner og Grener.
- `Klubbprofil` og `Medlemskap` er reelle underområder og bruker den delte, Radix-baserte
  `section`-varianten av `Tabs` i stedet for lokale faneklasser. Valgt område har den felles
  oransje valgmarkøren.
- Klubbprofilen bruker delte `SettingsSection`-kort for klubbinformasjon, vær/posisjon og
  nyhetsfeed. Skjemaet har ingen lokale `className`-koblinger eller inline-stiler.
- Medlemskap viser aktiv/inaktiv bekreftelsesperiode med felles statusregler. Opprettelse
  bruker grønn primærhandling, mens deaktivering bruker den felles destruktive varianten.
- Lasting, API-feil med retry, feltvalidering, mutasjonsfeil og manglende tilgang har egne
  tilstander i den delte flaten.
- `klubb:admin` styrer hele siden og samsvarer med navigasjonen og backendens
  administrasjonspolicy. Utvidet og Bruker får en eksplisitt tilgangstilstand ved direkte
  URL.
- Eksisterende klubb-, feed- og medlemskapskontrakter samt aktiverings-/deaktiveringsflyt er
  beholdt.

Sentrale filer:

- `src/features/klubb/pages/KlubbPage.tsx`
- `src/features/klubb/views/klubb-innstillinger/KlubbInnstillingerView.tsx`
- `src/features/klubb/views/klubb-innstillinger/KlubbInnstillingerContent.tsx`
- `src/features/klubb/views/medlemskap-innstillinger/MedlemskapInnstillingerView.tsx`
- `src/features/klubb/views/medlemskap-innstillinger/MedlemskapInnstillingerContent.tsx`
- `src/features/klubb/hooks/useMedlemskapAdmin.ts`
- `src/components/navigation/Tabs.tsx`
- `src/components/admin/AdminForm.tsx`

### Min side

- Profil og persondata bruker samme sidehierarki, arbeidsbredde og `section`-faner som
  Klubbinnstillinger. Det er ikke innført en egen profilvariant av mønsteret.
- Seksjonsfanene bruker klubbens grønne kontrollflate med oransje understrek for valgt
  område. Fanene bruker ikke dekorative ikoner.
- Visningsnavn bruker den delte Radix-baserte `Select`-primitiven i en vanlig settings-rad.
  Lagringshandlingen ligger i samme settings-kort som feltet. Eget navn beholder
  eksisterende validering og API-kontrakt.
- Kontoopplysninger, roller og eventuell medlemskapsbekreftelse vises gjennom delte
  `SettingsSection`, `SettingsRow`, `SettingsValue` og `RecordStatus`.
- Vilkårsstatus og dataeksport bruker de samme status- og handlingsreglene som øvrige
  løftede flater. Nedlasting beholder eksisterende JSON-kontrakt.
- Sletting bruker `SettingsSection` sin delte `danger`-tone, den felles destruktive
  knappevarianten og eksisterende bekreftelsesdialog. Fareområdet kan gjenbrukes for andre
  irreversible innstillinger. Ingen sletting ble sendt under visuell kontroll.
- Lasting og API-feil med retry har egne delte tilstander. Profil- og persondataflatene har
  ingen lokale `className`-koblinger eller inline-stiler.
- Admin, Utvidet og Bruker har samme profilfunksjoner; rolledataene kommer fortsatt fra
  `/bruker/meg`.

Sentrale filer:

- `src/features/minside/pages/MinSidePage.tsx`
- `src/features/minside/views/min-profil/MinProfilView.tsx`
- `src/features/minside/views/min-profil/MinProfilContent.tsx`
- `src/features/minside/views/persondata/PersondataView.tsx`
- `src/features/minside/components/SlettMegDialog.tsx`
- `src/components/navigation/Tabs.tsx`
- `src/components/admin/AdminForm.tsx`
- `src/components/admin/SettingsFields.tsx`
- `src/components/admin/SettingsSection.tsx`

### Guard-flater

- `Sperret`, obligatorisk kunngjøring og medlemsbekreftelse bruker samme `AdminPage`-
  hierarki og arbeidsbredde som de øvrige løftede flatene. Ingen av guard-sidene har lokale
  `className`-koblinger eller inline-stiler.
- Guard-rekkefølgen er uendret: sperret konto prioriteres foran ulest kunngjøring, som igjen
  prioriteres foran medlemsbekreftelse. Eksisterende navigasjon, autorisasjon og
  API-kontrakter er beholdt.
- Informasjon som må leses bruker den delte `ContentDocument`-flaten med grønn innledning.
  Status vises med `RecordStatus`, og lasting/API-feil bruker de samme delte tilstandene som
  administrasjonsflatene.
- Sperret konto bruker et innebygd `SettingsSection`-fareområde og en nøytral
  kontakthandling. Det er ikke innført en egen blokkert-sidevariant.
- Medlemsbekreftelse bruker delte settings-rader, grønn hovedhandling og den nye
  `SettingsRadioGroup`. Komponenten pakker Radix-radioens tilgjengelighet inn i det samme
  sentrale valguttrykket som resten av produktet, og er laget for gjenbruk i senere
  innstillingsskjemaer.
- Obligatorisk kunngjøring bruker samme langtekstflate og handlingshierarki. Feil ved
  bekreftelse fanges og vises i den delte feilflaten.

Sentrale filer:

- `src/features/sperre/pages/SperretPage.tsx`
- `src/features/kunngjøringer/pages/KunngjøringPage.tsx`
- `src/features/medlemskap/pages/BekreftMedlemskapPage.tsx`
- `src/components/layout/ContentDocument.tsx`
- `src/components/admin/SettingsFields.tsx`

### Kunngjøringer

- Administrasjonssiden bruker samme `AdminPage`-hierarki og `SettingsSection`-mønster som
  Klubbinnstillinger og Min side. Det er ikke opprettet en lokal kunngjøringsvariant.
- Ingen aktiv kunngjøring vises som en nøytral status. Opprettelse bruker delte
  settings-rader, grønn primærhandling og felles feilflate uten lokale klasser.
- En aktiv kunngjøring viser budskap, tidsrom og bekreftelsesfremdrift gjennom delte
  status- og settings-komponenter. Hver bekreftelse er en vanlig settings-rad.
- Deaktivering ligger i `SettingsSection` sin felles `danger`-tone og beholder eksisterende
  destruktive API-flyt.
- Den obligatoriske kunngjøringen bruker samme sidehierarki og den delte
  `ContentDocument`-flaten som Vilkår. Linjeskift i budskapet beholdes, og bekreftelse er en
  grønn hovedhandling i samme flate.
- `kunngjøring:admin` styrer både navigasjon og innhold ved direkte URL. Utvidet og Bruker
  får en eksplisitt tilgangstilstand.
- Eksisterende kontrakter for aktiv kunngjøring, opprettelse, deaktivering og bekreftelse er
  beholdt.

Sentrale filer:

- `src/features/kunngjøringer/pages/KunngjøringerAdminPage.tsx`
- `src/features/kunngjøringer/views/KunngjøringerAdminView.tsx`
- `src/features/kunngjøringer/pages/KunngjøringPage.tsx`
- `src/features/kunngjøringer/hooks/useKunngjøringAdmin.ts`
- `src/components/layout/ContentDocument.tsx`
- `src/components/admin/SettingsFields.tsx`

### Vilkår

- Den offentlige vilkårssiden bruker samme sidehierarki og arbeidsbredde som de løftede
  flatene, men innholdet har en avgrenset lesebredde for lange tekster.
- Innledning og nummererte avsnitt bruker `ContentDocument`; dette er et sentralt
  langtekstmønster som også brukes av obligatoriske kunngjøringer og kan gjenbrukes for
  reglement. Det er ikke en ny generell kort- eller sidevariant.
- Oppdatert dato bruker `RecordStatus`. Kontaktlenke og typografi styles sentralt i
  langtekstmønsteret.
- Offentlig lasting og API-feil har delte tilstander med retry. Eksisterende klubb- og
  vilkårsdata er beholdt.
- Vilkårssiden inneholder ingen lokale `className`-koblinger eller inline-stiler.

Sentrale filer:

- `src/features/policy/pages/VilkaarPage.tsx`
- `src/features/policy/pages/vilkaar.ts`
- `src/components/layout/ContentDocument.tsx`

### Delte designmønstre

- `src/styles/design-system.css` er et lite, ordnet importpunkt.
- Globale tokens, tekniske grunnregler, delte mønstre, migrerte sammensetninger og responsive
  tilpasninger er skilt etter ansvar uten å dele styling per side.
- `ControlChoice` gir felles geometri og valgtilstand.
- `FilterSwitch` gir vedvarende av/på-filtre samme Radix-bryter, etikettstruktur og oransje
  valgmarkør på tvers av flater.
- `SwitchRow` gir innstillingsfelter den samme oransje valgmarkøren; features skal ikke
  overstyre bryterfarge lokalt.
- `SettingsRadioGroup` gir innstillingsskjemaer ett felles Radix-basert radiovalg med samme
  oransje valgmarkør, temaoppførsel og responsive geometri.
- `RecordCollectionToolbar` gir listeflater samme opptelling, beskrivelse og handlinger på
  den grønne kontrollflaten.
- `record-list` og `record-card` gir felles ramme for slots og søkeresultater.
- `RecordAccent` og `RecordEyebrow` gir vanlige record-rader én felles oransje
  informasjonsmarkør: tid i Book/Mine tider, dato i Arrangementer og rolle i Brukere.
  `AdminEntityRow` følger samme regel med gren i Baner og åpningstid i Grener.
- `RecordChoiceFilter` gir record-samlinger samme responsive valgfilter. Arrangementer og
  Baner bruker komponenten uten lokale filtervarianter.
- `RecordStatus` og `RecordListState` gir semantiske statuser og listetilstander uten at
  features bruker shadcn-varianter som produkt-API.
- `PageHeader` gir felles sidehierarki.
- `ChoiceStrip` gir Book bane ett delt, semantisk lag for horisontale valgknapper.
- `AdminEntityCollection` og `AdminEditorDialog` gir administrasjonssider et gjenbrukbart
  liste–redigeringsmønster som prioriterer mobil uten å innføre sidespesifikk styling.
- `Tabs` sin `section`-variant gir både administrasjons- og kontoflater en tilgjengelig
  underområdenavigasjon med felles mobil-/desktopgeometri, grønn kontrollflate og oransje
  understrek for valgt område.
- `SettingsSection` sin `danger`-tone gir irreversible innstillinger ett felles fareområde
  uten at features lager lokale røde kort.
- `AdminSettingsForm` og `AdminFormActions` lar vanlige innstillingssider bruke samme
  skjema- og handlingshierarki som editorene uten lokale layoutklasser.
- `ContentDocument` gir vilkår, reglement og obligatoriske beskjeder én responsiv
  langtekstflate med felles lesebredde, seksjoner, lenker og temaoppførsel.
- `SettingsText` viser lengre, skrivebeskyttet innhold i vanlige settings-rader uten lokal
  tekststyling.
- `AdminPage`, `AdminEntityCollection`, `AdminEditorDialog`, `AdminForm` og `SettingsFields`
  eier
  presentasjonsklassene for administrasjonsflater. Features komponerer semantiske komponenter
  og skal ikke koble seg direkte til `admin-*`- eller `settings-*`-klassene.
- Appskallet viser ikke en global breadcrumb. Dype flater skal få lokale tilbakehandlinger
  når de redesignes.
- Shadcn/Radix-primitiver er beholdt i `src/components/ui/`.

Sentrale filer:

- `src/styles/design-system.css`
- `src/styles/design-system/tokens.css`
- `src/styles/design-system/primitives.css`
- `src/styles/design-system/patterns.css`
- `src/styles/design-system/migrated-compositions.css`
- `src/styles/design-system/responsive.css`
- `src/components/controls/ControlChoice.tsx`
- `src/components/controls/FilterSwitch.tsx`
- `src/components/records/RecordStatus.tsx`
- `src/components/records/RecordListState.tsx`
- `src/components/records/RecordCollectionToolbar.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/layout/ContentDocument.tsx`
- `src/components/admin/SettingsFields.tsx`
- `src/components/admin/SettingsSection.tsx`
- `src/components/navigation/Tabs.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/accordion.tsx`

## Beslutninger som skal bevares

- Grønt betyr struktur og positiv hovedhandling.
- Oransje er generell valgmarkør; booking overstyrer alle valg med aktivitetsfargen.
- `Book`/`Lagre` er primær grønn.
- `Koble til arrangement`/`Avbryt` er nøytral sekundær.
- `Avbestill`/`Sperr`/`Slett` bruker samme destruktive variant.
- Tekstknapper har normalt ikke dekorative ikoner.
- Slots og resultatrader fyller hele beholderbredden; luft legges kun mellom radene.
- Mobil og desktop skal løses bevisst, ikke som skalerte kopier.
- Sider skal ikke innføre nye tilfeldige farger eller lange lokale Tailwind-varianter.

## Verifisert ved handover

- `npm run check` passerer.
- `npm run build` passerer.
- `git diff --check` passerer.
- Booking og brukeradmin er visuelt kontrollert på mobil og desktop.
- `Mine tider` er kontrollert med Admin, Utvidet og Bruker.
- Kommende, gjennomførte, tomtilstand, lasting, API-feil og avbestilling er kontrollert.
- `Arrangementer` er kontrollert offentlig og med Admin, Utvidet og Bruker. Program,
  historikkbryter, direkteåpning og kapabilitetsstyrt avlysning er kontrollert.
- `Baner` er kontrollert med Admin, Utvidet og Bruker på direkte URL. Banevalg,
  redigeringsutkast, opprettelsesvalidering og bookingoverstyringer er kontrollert uten å
  sende mutasjoner.
- `Baner` er visuelt kontrollert på mobil og desktop i lyst og mørkt tema.
- `Grener` er kontrollert med Admin, Utvidet og Bruker på direkte URL. Liste, editor,
  opprettelsesvalidering og utkast er kontrollert uten å sende mutasjoner.
- `Grener` er visuelt kontrollert på mobil og desktop i lyst og mørkt tema.
- `Klubbinnstillinger` er kontrollert med Admin, Utvidet og Bruker på direkte URL.
  Klubbprofil, medlemskap, lokal feltvalidering og handlingshierarki er kontrollert uten å
  sende mutasjoner.
- `Klubbinnstillinger` er visuelt kontrollert på mobil og desktop i lyst og mørkt tema.
- `Min side` er kontrollert med Admin, Utvidet og Bruker. Profilvalg, lokal validering,
  vilkårsstatus, dataeksportens tilgjengelighet og slettedialog er kontrollert uten å sende
  mutasjoner eller nedlasting.
- `Min side` er visuelt kontrollert på mobil og desktop i lyst og mørkt tema.
- `Kunngjøringer` er kontrollert med Admin, Utvidet og Bruker på direkte URL. Inaktiv
  status, opprettelsesfelter og handlingshierarki er kontrollert uten å publisere eller
  endre testdata.
- `Kunngjøringer` er kontrollert på mobil og desktop i lyst og mørkt tema. Nettleserkontroll
  bekrefter full mobilbredde uten horisontal overflow og samme desktoparbeidsbredde som de
  øvrige administrasjonsflatene.
- `Vilkår` er kontrollert offentlig og innlogget på mobil og desktop i lyst og mørkt tema.
  Langtekstflaten har avgrenset lesebredde på desktop og fyller mobilens innholdsflate.
- Medlemsbekreftelse er utløst gjennom den reelle guarden med Bruker og Utvidet. Mobil og
  desktop, lyst og mørkt tema, fullt navn, fire medlemskapstyper, valgt tilstand og aktivert
  hovedhandling er kontrollert uten å sende bekreftelsen. Flaten har ingen horisontal
  overflow.
- Sperret-flaten er visuelt kontrollert på direkte URL på mobil og desktop i lyst og mørkt
  tema. Fareområde og kontaktlenke er kontrollert uten å sperre en testbruker.
- Guard-rekkefølgen `Sperret` → `Kunngjøring` → `Medlemskap` er kontrollert i rutingen.
  Dagens fixture har ingen aktiv kunngjøring eller sperret bruker, så disse to guardene er
  ikke utløst ved å mutere testdata i denne slicen.
- Lyst og mørkt tema er kontrollert.
- Aktivitetsoverstyring er kontrollert for tennis, padel og bordtennis.
- Den endelige normaltilstanden for `Mine tider` lastet uten feil eller advarsler i
  nettleserkonsollen.

Vite viser fortsatt et ikke-blokkerende varsel om at React-chunken er større enn 500 kB.
Dette er ikke introdusert som en funksjonell feil i redesignarbeidet.

## Kjent gjeld og avgrensninger

- `migrated-compositions.css` og `responsive.css` samler fortsatt flere migrerte flater for å
  bevare kaskaden. Videre oppdeling skal skje etter mønster og ansvar, ikke per side.
- Flere gamle sider bruker fortsatt lokale Tailwind-klasser og direkte shadcn-varianter.
- Desktop er kontrollert, men mobil har fått mest produktdesignarbeid i POC-en.
- Aktivitetsfarger er foreløpig mappet fra slug i frontend.
- Det finnes ingen automatisert visuell regresjonstest ennå.
- Testdataene inneholder nå ett kommende arrangement uten turnering og bare én gren.
  Historiske kort, grenfilter med flere valg og turneringshandlingene er derfor kartlagt i
  kode, men ikke visuelt utløst med dagens fixture.
- Alle åtte baner i testdataene er aktive og bruker standardregler. Inaktiv status og lagret
  bookingoverstyring er derfor kartlagt i kode; overstyringsskjemaet er visuelt kontrollert
  som et lokalt utkast uten å lagre testdata.
- Alle tre grener i testdataene er aktive. Inaktiv status, tomtilstand og API-feil er derfor
  kartlagt i kode, mens opprettelsesvalidering og editor er visuelt kontrollert uten å lagre
  testdata.
- Testklubben har en aktiv medlemskapsperiode (`Sesong 2026`). Medlemsguarden er visuelt og
  funksjonelt kontrollert frem til innsending; ingen medlemsbekreftelse eller destruktiv
  deaktivering ble sendt under kontrollen.
- Testklubben har ingen aktiv kunngjøring. Aktiv status, bekreftelsesliste, deaktivering og
  den obligatoriske lesebekreftelsen er derfor kartlagt i kode, mens inaktiv status og
  opprettelsesflaten er kontrollert uten å publisere eller endre testdata.
- Testdataene har ingen sperret bruker. Sperret-flaten er derfor visuelt kontrollert på
  direkte URL, mens guardbetingelsen og prioriteringen er kartlagt i kode.
- Gjentatt åpning av utviklingsinnloggingens konto-/rolledialog kan fortsatt gi Radix-
  advarselen `Missing Description or aria-describedby={undefined}` i Vite-konsollen. Den
  normale sidevisningen er ren; dialogadvarselen bør avgrenses og rettes i en egen liten
  tilgjengelighetsoppgave.
- Resterende sider er ikke migrert og kan derfor avvike tydelig fra appskallet.
- Backendens planlagte overgang bort fra flere klubber/tenants inngår ikke i denne branchen.

## Anbefalt neste oppgave

### Mål

Fullfør booking- og kontoflyten med bookingbekreftelse, feiltilstander og reglement som
neste avgrensede slice.

### Foreslått rekkefølge

1. Kartlegg bookingbekreftelse, reglement, alle API-feil og tilbakeveier på mobil og
   desktop.
2. Gjenbruk bookingens record-/statusregler, eksisterende handlingshierarki og
   `ContentDocument` for reglement der mønsteret passer.
3. Behold eksisterende booking-, bekreftelses- og regelkontrakter.
4. Løs mobil, desktop og lyst/mørkt tema i samme slice.
5. Kontroller relevante roller og både vellykkede og avbrutte flyter.
6. Kjør tekniske kontroller og visuell nettleserkontroll.

### Ikke gjør i samme task

- Ikke start arrangementadministrasjon, turnering eller backend-redesign samtidig.
- Ikke fjern Radix/shadcn-primitiver som fortsatt gir tilgjengelig interaksjon.
- Ikke koble aktivitetsfarger eller grenmetadata til en ny backend-kontrakt uten en separat
  beslutning.
- Ikke endre booking- eller autorisasjonsregler som del av den visuelle migreringen.

## Nyttige kommandoer

```bash
npm run dev -- --host 0.0.0.0
npm run typecheck
npm run check
npm run build
git diff --check
```

Lokal app brukes normalt på `http://localhost:5173/aas-tennisklubb`. Ved testing på telefon
må Vite kjøre med `--host 0.0.0.0`, og telefonen må bruke Macens aktive Wi-Fi-adresse.
