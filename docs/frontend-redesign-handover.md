# Frontend-redesign: handover til neste Codex-task

> **Status:** Fundament, bookingunderflyter, `Mine tider`, `Arrangementer`,
> `Arrangementadministrasjon`, `Baner`, `Grener`, `Klubbinnstillinger`, `Min side`,
> `Kunngjøringer`, `Vilkår` og guard-flater klare
> **Sist oppdatert:** 2026-08-02
> **Repo:** `/Users/andreas/Dev/banebooking/frontend`
> **Branch:** `feature/frontend-design-poc`
> **Utgangspunkt:** `main` på `dbf08f5`

## Start her

1. Les `docs/frontend-redesign-plan.md` før nye UI-endringer.
2. Bekreft branch og ren arbeidsflate med `git status --short`.
3. Start frontend med `npm run dev -- --host 0.0.0.0` hvis den ikke allerede kjører.
4. Bruk utviklingsinnloggingen på den dedikerte innloggingssiden for å teste Admin,
   Utvidet og Bruker.
5. Gjør neste arbeid som en avgrenset slice; ikke redesign flere ubeslektede sider samtidig.

Dokumenter i `docs/archive/` er historiske og skal ikke brukes som gjeldende plan.

## Hva POC-en har etablert

### Appskall og navigasjon

- Desktop har fast sidenavigasjon og bred arbeidsflate. Den tidligere toppbaren er fjernet
  på desktop; tema og konto ligger samlet i en fast verktøyfot i sidefeltet.
- Mobil har toppfelt, fast bunnnavigasjon og samlet `Mer`-/kontomeny.
- Lyst/mørkt tema er alltid tilgjengelig: som ikonverktøy på mobil og som navngitt handling
  i desktop-sidefeltet.
- Utloggede brukere åpner samme dedikerte `Logg inn`-side fra mobil og desktop. Beskyttede
  ruter sender brukeren dit og returnerer til opprinnelig side etter vellykket innlogging.
- Navigasjonsmodell og labels er samlet, slik at mobil og desktop bruker samme struktur.
- `Baner` og `Grener` er samlet i navigasjonspunktet `Baner og grener`. Arbeidsflaten
  beholder separate ruter og lister, men deler sidehode og ruteorienterte seksjonsfaner.
- De redesignede arbeidsflatene bruker responsive typografitokens: mobil beholder den
  kompakte skalaen, mens desktop løfter metadata, kontroller, brødtekst og seksjonstitler
  ett trinn. Shadcn-komponentkoden, navigasjonen og Turnering er ikke endret av skalaen.

Sentrale filer:

- `src/app/AppShell.tsx`
- `src/components/navigation/AppSidebar.tsx`
- `src/components/navigation/MobileBottomNav.tsx`
- `src/components/navigation/SidebarUtilities.tsx`
- `src/components/navigation/navigationModel.ts`
- `src/components/navigation/LoginPanel.tsx`
- `src/features/auth/pages/LoginPage.tsx`

### Innlogging for lokal POC

- Vanlig Supabase-innlogging er beholdt.
- Leverandørvalg, e-postkode og utviklingsroller rendres på én dedikert, responsiv
  innloggingsside. Den tidligere desktop-dropdownen og innloggingen i mobildraweren er
  fjernet, mens autentiseringslogikk og API-kontrakter er uendret.
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

- Booking bruker samme grønne `RecordCollectionHeader` og kontrollpanel som de øvrige
  listeflatene. Gjeldende gren, dag og bane oppsummeres sammen med antall ledige tider.
- På mobil er gren, `I dag`, `I morgen`, `Velg dato` og bane alltid tilgjengelige. Valgene
  oppdaterer resultatet uten innsending; de skjules ikke bak et ekstra filtersteg fordi de er
  selve arbeidsverktøyet for booking.
- På desktop er de samme enkeltvalgsgruppene alltid synlige og beholder innholdsbasert bredde,
  slik at kontrollene ikke strekkes over arbeidsflaten. Filter- og valgmodus eies av én felles
  `RecordControlPanel`; booking har ingen lokal kontrollflate eller parallell CSS.
- `Bookingregler` er en delt, tertiær konteksthandling ved antall ledige tider. Dialogen
  navngir valgt bane og viser dens effektive bookingregler, inkludert eventuelle
  baneoverstyringer, uten å fylle selve valgflaten med en ekstra kontrollgruppe.
- Valgt aktivitet styrer understrek på alle bookingvalg:
  - tennis: oransje;
  - padel: grønn;
  - bordtennis: blågrå.
- Antall ledige tider tilhører resultatheaderen, ikke valgt baneknapp. Banevalgene viser kun
  sammenlignbare banenavn.
- Slots viser starttid, kompakt vær, hovedstatus og eventuell sekundær forklaring.
- `Ledig` og `Opptatt` er hovedstatus; eier, navn og arrangement er forklarende varianter.
- Slot-handlinger bruker felles hierarki og flyter til høyre.
- Bookingflaten inneholder bare bookingrelatert innhold. RSS-nyheter ligger på en egen
  offentlig `Nyheter`-side og nås via ordinær navigasjon og en nøytral avissnarvei i
  toppbaren.
- `Se bookingregler` åpner den delte editorflaten og viser grenens reelle banereglement,
  bookinggrenser, åpningstid og slotlengde i `ContentDocument`.
- Vellykket booking og avbestilling bekreftes primært ved at sloten umiddelbart endrer
  status. Det vises ingen toast for disse handlingene. Mutasjonsfeil vises ved slotlisten,
  mens innlastingsfeil beholder sidehodet og kontrollene med en eksplisitt
  prøv-igjen-handling.
- `Koble til arrangement` bruker samme `AdminEditorDialog`, settings-rader og Radix-baserte
  radiovalg som andre editorer. Den tidligere lokale Tailwind-dialogvarianten er fjernet.
- Bookingvisningen er delt i komposisjon, kontroller og resultatflate. Valgtilstand,
  spørringer og optimistiske mutasjoner ligger i dedikerte hooks, mens slotens
  kapabiliteter og presentasjon beregnes i rene funksjoner før raden rendres.
- Historikkfilteret memoiserer gruppering og synlige slots, og hver slotrad er memoisert.
  Død lokaltilstand og effekter som bare synkroniserte utledbar state er fjernet.

Sentrale filer:

- `src/features/booking/views/booking/BookingContent.tsx`
- `src/features/booking/views/booking/BookingSchedule.tsx`
- `src/features/booking/components/BookingSelectionHeader.tsx`
- `src/features/booking/components/BookingSlotListAccordion.tsx`
- `src/features/booking/components/BookingSlotRow.tsx`
- `src/features/booking/components/bookingSlotPresentation.ts`
- `src/features/booking/components/ReglementDialog.tsx`
- `src/features/booking/components/KobleTilArrangementDialog.tsx`
- `src/features/booking/hooks/useBooking.ts`
- `src/features/booking/hooks/useBookingSelection.ts`
- `src/features/booking/hooks/useBookingMutations.ts`
- `src/features/booking/activityTheme.ts`

### Nyheter

- RSS-feeden presenteres som klubbnyheter, ikke som uleste varsler.
- Bjelle, antallsbadge og sidedrawer er fjernet fordi feedkontrakten ikke har lest/ulest-
  status og innholdet egner seg bedre som en egen leseflate.
- Siden bruker samme `record-collection`/`record-list`/`record-card`-system som de øvrige
  redesignede listene. Dato, tittel, kort ingress og ekstern handling har fast hierarki.
- Den nyeste saken gjentas ikke på `Book bane`, slik at bookingkontrollene kommer tidligere
  i mobilvisningen.
- Nyheter er offentlig tilgjengelig fra hovedmenyen. Toppbaren beholder en nøytral
  avissnarvei uten badge, slik at også utloggede mobilbrukere har direkte tilgang.

Sentrale filer:

- `src/features/feed/pages/NyheterPage.tsx`
- `src/features/feed/views/nyheter/NyheterView.tsx`
- `src/features/feed/views/nyheter/NyheterContent.tsx`
- `src/features/feed/views/nyheter/NyhetRow.tsx`
- `src/features/feed/feedPresentation.ts`

### Mine tider

- Siden bruker samme `record-list`/`record-card`-ramme som booking og brukeradmin.
- Reservasjoner grupperes etter dato; datoflisen gjentas ikke i hver rad.
- Mobilraden følger bookinglistens rekkefølge: tid og vær, bane, status og eventuell
  detaljhandling.
- Siden bruker samme felles arbeidsbredde som booking, slik at navigasjon mellom flatene ikke
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

### Arrangementadministrasjon

- Siden følger samme liste–redigeringsmønster som Baner og Grener. En fullbreddes
  arrangementsliste er det stabile startpunktet; `Nytt arrangement` og valg av en rad åpner
  samme fokuserte editorfamilie.
- Oversikten bruker grønn `AdminEntityCollection`, oransje datoaksent, felles status,
  historikkbryter og delt grenfilter. Mobil viser fullbreddes record-rader; desktop bruker
  hele arbeidsbredden uten layoutskift.
- Editorens `wide`-størrelse er en sentral variant av `AdminEditorDialog` for avanserte
  arbeidsflater. Den er fortsatt helskjerm på mobil og kan gjenbrukes av eksempelvis
  turneringsadministrasjon.
- Informasjon og bookinger er separate `section`-faner med grønn kontrollflate og oransje
  valgtmarkør. Metadata lagres fortsatt separat og regenererer ikke bookinger.
- Ny og rediger bruker samme settings-hierarki for gren, kategori, intern beskrivelse og
  publisering. Redigering samler turneringskobling og et tydelig felles fareområde for
  avlysning i informasjonsfanen.
- Gjentakende og manuelt oppsett bruker `SettingsRadioGroup`, `SettingsChoiceGroup`,
  settings-brytere og samme grønne handlingshierarki. De bygger fortsatt den konkrete
  bookinglisten og beholder konflikt-/slotlengdelogikken uendret.
- Bookinglisten bruker `AdminEntityCollection`, `record-list` og den nye delte
  `AdminActionRow` i stedet for en lokal tabell. Dato, tidsrom, bane, status og tekstbaserte
  rediger-/avlyshandlinger følger samme informasjonsrekkefølge på mobil og desktop.
- Redigering av én booking bruker den delte editoren og settings-feltene. Avlysning bruker
  det eksisterende bekreftelsesforløpet komponert med delt fareområde og bryter.
- `arrangement:se` styrer tilgang til siden, som før. Eksisterende API-kontrakter for
  opprettelse, metadata, bookingliste, enkeltendringer, batch-opprettelse, avlysning og
  turnering er beholdt.
- Hele `src/features/arrangement-admin/` er fri for lokale `className`-koblinger og
  inline-stiler; presentasjonen eies av delte semantiske komponenter og designsystemet.

Sentrale filer:

- `src/features/arrangement-admin/pages/ArrangementPage.tsx`
- `src/features/arrangement-admin/views/ArrangementAdminOverview.tsx`
- `src/features/arrangement-admin/views/arrangement/OpprettArrangementView.tsx`
- `src/features/arrangement-admin/views/rediger-arrangement/RedigerArrangementView.tsx`
- `src/features/arrangement-admin/components/BookingListe/BookingListe.tsx`
- `src/features/arrangement-admin/components/BookingListe/BookingRad.tsx`
- `src/features/arrangement-admin/components/GjentakendeOppsett/GjentakendeOppsett.tsx`
- `src/features/arrangement-admin/components/ManueltOppsett/ManueltOppsett.tsx`
- `src/components/admin/AdminEntityCollection.tsx`
- `src/components/admin/AdminEditorDialog.tsx`
- `src/components/admin/SettingsFields.tsx`

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
- Grenfilteret bruker delt `RecordControlPanel` i den grønne kontrollflaten. På mobil åpnes
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

- `src/components/records/RecordControlPanel.tsx`
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
- `SettingsChoiceGroup` gir fler-valg i avanserte skjemaer samme `ControlChoice`-geometri
  og oransje valgtmarkør uten feature-lokale knapperekker.
- `RecordCollectionHeader` gir listeflater samme opptelling, beskrivelse og handlinger på
  den grønne kontrollflaten.
- `RecordCollection`, `RecordList`, `RecordAccordionList` og `RecordCard`-familien gir
  listeflater en lukket kontrakt for full bredde, vertikal avstand, kortflate, hover,
  detaljflate og høyrejusterte handlinger. Booking, Mine tider, Arrangementer, Brukere,
  Baner, Grener og arrangementadministrasjon bruker samme API.
- Features kan ikke legge `className` eller `style` på record-røttene. Direkte bruk av de
  underliggende `record-*`-klassene avvises av `npm run design-system:check`, som også kjøres
  gjennom `npm run check`. Innholdsoppsettet inni kortet kan fortsatt være domenespesifikt.
- `RecordLeadingValue` og `RecordEyebrow` gir vanlige record-rader én felles oransje
  informasjonsmarkør: tid i Book/Mine tider, dato i Arrangementer og rolle i Brukere.
  `AdminEntityRow` følger samme regel med gren i Baner og åpningstid i Grener.
- `RecordControlPanel` gir record-samlinger samme responsive kontrollflate. Arrangementer,
  Baner og Brukere bruker flervalgsmodus, mens Booking bruker obligatorisk enkeltvalgsmodus.
- `RecordCollection` er container for en felles bred listetetthet. Smale flater beholder
  luftige record-kort, mens brede samlinger bruker lavere rader, faste informasjonskolonner
  og separatorer uten individuelle kortskygger. Dette gjelder etter faktisk arbeidsbredde,
  også i liggende mobil, og krever ingen sidespesifikke varianter.
- `RecordStatus` og `RecordListState` gir semantiske statuser og listetilstander uten at
  features bruker shadcn-varianter som produkt-API.
- `PageHeader` gir felles sidehierarki.
- `AdminEntityCollection` og `AdminEditorDialog` gir administrasjonssider et gjenbrukbart
  liste–redigeringsmønster som prioriterer mobil uten å innføre sidespesifikk styling.
- `AdminActionRow` gir ikke-selekterbare administrasjonsrader samme record-ramme og et
  høyrejustert handlingsområde. Arrangementets bookingliste er første bruker.
- `AdminEditorDialog` sin `wide`-variant gir komplekse editorer større arbeidsflate på
  desktop uten å endre den felles helskjermmodellen på mobil.
- `Tabs` sin `section`-variant gir både administrasjons- og kontoflater en tilgjengelig
  underområdenavigasjon med felles mobil-/desktopgeometri, grønn kontrollflate og oransje
  understrek for valgt område.
- `SettingsSection` sin `danger`-tone gir irreversible innstillinger ett felles fareområde
  uten at features lager lokale røde kort.
- `AdminSettingsForm` og `AdminFormActions` lar vanlige innstillingssider bruke samme
  skjema- og handlingshierarki som editorene uten lokale layoutklasser.
- `ContentDocument` gir vilkår, reglement og obligatoriske beskjeder én responsiv
  langtekstflate med felles lesebredde, seksjoner, lenker og temaoppførsel.
- `ContentDocumentFacts` gir reglement og tilsvarende dokumenter en felles kompakt
  nøkkel–verdi-visning uten at features kobler seg direkte til presentasjonsklasser.
- `DatePickerPopover` samler Radix-popover, kalender, datogrense og lukkeatferd for alle
  datovelgere. Det hindrer lokale popover-varianter og samtidige dialoglag.
- `ActionFeedback` gir vedvarende, kontekstuell tilbakemelding med felles `success`, `info`,
  `warning` og `danger`-toner. Den bruker ikke dekorative ikoner og har felles live-regioner.
- `MutationFeedback` prioriterer feil foran suksess og brukes i skjemaets handlingsområde
  når resultatet ikke er tydelig nok gjennom den oppdaterte flaten alene.
- `QueryFeil`, `RecordListState`, `AdminAccessError` og guard-feil gir lasting og
  autorisasjonskontroll en vedvarende feil med retry. En API-feil skal aldri tolkes som
  manglende tilgang.
- `GlobalFeedbackToaster` er reservert for hendelser uten lokal eier, nå kun sesjonsutløp i
  de redesignede flatene. Vanlig opprettelse, lagring, sletting, booking og avbestilling skal
  ikke bruke toast.
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
- `src/components/controls/DatePickerPopover.tsx`
- `src/components/records/RecordCollectionHeader.tsx`
- `src/components/records/RecordControlPanel.tsx`
- `src/components/feedback/ActionFeedback.tsx`
- `src/components/feedback/MutationFeedback.tsx`
- `src/components/feedback/FeedbackToaster.tsx`
- `src/components/errors/QueryFeil.tsx`
- `src/components/admin/AdminAccessError.tsx`
- `src/components/records/RecordStatus.tsx`
- `src/components/records/RecordListState.tsx`
- `src/components/records/RecordCollection.tsx`
- `src/components/records/RecordCollectionHeader.tsx`
- `src/components/records/RecordList.tsx`
- `src/components/records/RecordCard.tsx`
- `scripts/check-design-system-boundaries.mjs`
- `src/components/layout/PageHeader.tsx`
- `src/components/layout/ContentDocument.tsx`
- `src/components/admin/SettingsFields.tsx`
- `src/components/admin/AdminEntityCollection.tsx`
- `src/components/admin/AdminEditorDialog.tsx`
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
- Mobil og desktop bruker samme visuelle vokabular; responsive avvik skal være funksjonelt
  begrunnet i arbeidsform eller plass.
- Sider skal ikke innføre nye tilfeldige farger eller lange lokale Tailwind-varianter.
- Synlig tilstandsendring er primær tilbakemelding. Bruk `MutationFeedback` når resultatet
  ellers er uklart, og behold feilen til brukeren prøver igjen eller endrer input.
- Toast skal bare brukes for en global hendelse som ikke har en naturlig plass i gjeldende
  flate. Rutinemessige CRUD-bekreftelser skal ikke bruke toast.

## Verifisert ved handover

- `npm run check` passerer.
- `npm run build` passerer.
- `git diff --check` passerer.
- Booking og brukeradmin er visuelt kontrollert på mobil og desktop.
- Bookingens nye valgmodus er kontrollert offentlig og med Admin på 320 og 390 px mobil
  samt 1440 px desktop i lyst og mørkt tema. Permanent synlige valg, grenbytte, `I morgen`,
  vilkårlig kalenderdato, automatisk banevalg og umiddelbar oppdatering av ledige tider er
  kontrollert. Brukeres eksisterende flervalgsfilter er regresjonskontrollert på mobil og
  desktop etter samlingen i `RecordControlPanel`.
- `Mine tider` er kontrollert med Admin, Utvidet og Bruker.
- Kommende, gjennomførte, tomtilstand, lasting, API-feil og avbestilling er kontrollert.
- `Arrangementer` er kontrollert offentlig og med Admin, Utvidet og Bruker. Program,
  historikkbryter, direkteåpning og kapabilitetsstyrt avlysning er kontrollert.
- `Arrangementadministrasjon` er visuelt kontrollert med Admin på mobil og desktop i lyst
  og mørkt tema. Oversikt, grenfilter, historikkbryter, opprett-editor, rediger-editor,
  informasjons-/bookingfaner, gjentakende og manuelt oppsett, eksisterende bookingliste,
  enkeltbookingeditor og avlysningsdialog er kontrollert uten å sende mutasjoner.
- Utvidet har fortsatt navigasjon og `arrangement:se`; den aktive obligatoriske
  kunngjøringen stopper rollen før siden uten en ny lesebekreftelse. Bruker skjuler
  navigasjonen og får den nye delte tilgangstilstanden ved direkte URL.
- Mobiloversikt, begge editorlag og kalender har full bredde uten horisontal overflow.
  Desktopeditorens sentrale `wide`-variant er kontrollert ved 1440 px.
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
- `Nyheter` er kontrollert offentlig på 320 og 390 px mobilbredde samt 1440 px desktop i
  lyst og mørkt tema. Record-radens generelle `content-action`-layout lar handlingen flyte
  til høyre og bryte kontrollert under innholdet på den smaleste bredden. Toppbarsnarveien,
  desktopnavigasjonen og den ryddede bookingflaten er kontrollert mot den reelle RSS-feeden.
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
- Bookingreglement er kontrollert offentlig og som Admin og Bruker på mobil og desktop i
  lyst og mørkt tema. Grenens egne regler og bookinggrenser vises uten lokal dialogstyling.
- Vellykket booking og avbestilling er funksjonelt kontrollert med Admin. Slotens status er
  primær bekreftelse, ingen toast vises, og testbookingen ble avbestilt igjen etter kontrollen.
- Inline lagringsbekreftelse er kontrollert i Klubbinnstillinger på mobil og desktop i lyst
  og mørkt tema. Bekreftelsen forsvinner ved ny redigering og vises igjen etter lagring.
  Testverdien for feedens synlighet ble satt tilbake til `100` etter kontrollen.
- `booking:kobleTilArrangement` ble ikke eksponert på ledige slots i den kjørende lokale
  API-responsen. Dialogens data-, feil- og tomtilstander er derfor kartlagt i kode, men
  selve dialogen er ikke utløst via bookinglisten i denne kontrollen.
- Den endelige normaltilstanden for `Mine tider` lastet uten feil eller advarsler i
  nettleserkonsollen.

Vite viser fortsatt et ikke-blokkerende varsel om at React-chunken er større enn 500 kB.
Dette er ikke introdusert som en funksjonell feil i redesignarbeidet.

## Kjent gjeld og avgrensninger

- `migrated-compositions.css` og `responsive.css` samler fortsatt flere migrerte flater for å
  bevare kaskaden. Videre oppdeling skal skje etter mønster og ansvar, ikke per side.
- Flere gamle sider bruker fortsatt lokale Tailwind-klasser og direkte shadcn-varianter.
- Turnering beholder foreløpig sine eksisterende toast-kall og er uttrykkelig utenfor denne
  POC-migreringen.
- De primære arbeidsflatene bruker nå samme visuelle vokabular på mobil og desktop. Booking
  bruker én grønn kontrollflate, én banevelger og én slotpresentasjon på begge størrelser;
  Brukere bruker samme grønne filterflate og kompakte radmetadata uten en egen desktoptabell.
  Record-verktøylinjene viser ikke ekstra desktoptekst, og Book bane, Mine tider,
  Arrangementer og administrasjonssidene deler `xl` som arbeidsbredde.
- Aktivitetsfarger er foreløpig mappet fra slug i frontend.
- Det finnes ingen automatisert visuell regresjonstest ennå.
- Testdataene inneholder ett aktivt arrangement uten turnering, 17 eksisterende bookinger
  og tre grener. Grenfilter, bookingrader og handlinger er visuelt kontrollert;
  turneringsadministrasjon, historiske rader, konfliktstatus og lagrede forslag er kartlagt
  i kode, men ikke utløst ved å endre fixture.
- Alle åtte baner i testdataene er aktive og bruker standardregler. Inaktiv status og lagret
  bookingoverstyring er derfor kartlagt i kode; overstyringsskjemaet er visuelt kontrollert
  som et lokalt utkast uten å lagre testdata.
- Alle tre grener i testdataene er aktive. Inaktiv status, tomtilstand og API-feil er derfor
  kartlagt i kode, mens opprettelsesvalidering og editor er visuelt kontrollert uten å lagre
  testdata.
- Testklubben har en aktiv medlemskapsperiode (`Sesong 2026`). Medlemsguarden er visuelt og
  funksjonelt kontrollert frem til innsending; ingen medlemsbekreftelse eller destruktiv
  deaktivering ble sendt under kontrollen.
- Testklubben har en aktiv kunngjøring. Den obligatoriske leseflaten er kontrollert uten å
  sende nye bekreftelser i arrangementadministrasjonsslicen.
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

Løft de gjenværende brukerunderflytene uten å endre de godkjente hovedsidene:
brukeradministrasjonens sperre-, historikk- og slettedialoger.

### Foreslått rekkefølge

1. Kartlegg brukerhandlingenes lasting, tomtilstander, feil, bekreftelser og tilbakeveier på
   mobil og desktop.
2. Gjenbruk delte record-, editor-, settings- og fareområdemønstre. Ikke endre den
   godkjente brukerlisten eller dens informasjonsstruktur.
3. Behold eksisterende feed-, bruker-, sperre- og slettingkontrakter.
4. Løs mobil, desktop og lyst/mørkt tema i samme slice.
5. Kontroller relevante roller og både vellykkede og avbrutte flyter.
6. Kjør tekniske kontroller og visuell nettleserkontroll.

### Ikke gjør i samme task

- Ikke start turnering eller backend-redesign samtidig.
- Ikke fjern Radix/shadcn-primitiver som fortsatt gir tilgjengelig interaksjon.
- Ikke endre bruker- eller autorisasjonsregler som del av den visuelle migreringen.

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
