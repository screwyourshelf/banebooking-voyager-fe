# Migreringsstatus

> **Status:** Pågår — rammeverksløftet og SWP-0 er fullført; SWP-1 er aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** SWP-1 — Tailwind theme-fundament og håndhevende guards
>
> **Sist oppdatert:** 2026-08-23

## Mål for arbeidspakken

Den semantiske theme-kontrakten er etablert. Flytt deretter global CSS inn i Tailwinds etablerte
cascade layers og koble de verifiserte stylingguardene til produksjonstreet og `npm run check`.
SWP-1 skal stenge ny stylinggjeld uten å endre produktmarkup, observerbart uttrykk eller backend.

## Aktiv stylingretning

- Den opprinnelige SvelteKit-lift-and-shift-en og arkitekturreviewen er fullført og forblir grønn
  baseline.
- [`ADR-006`](./adr/006-tailwind-styling-and-theme-ownership.md) gjør Tailwind v4, semantiske
  themes og offentlig UI-eierskap til målarkitektur for styling.
- [`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md) deler arbeidet i SWP-0–SWP-7
  og er den aktive utførelsesplanen for `/start`.
- Dagens globale CSS er overgangsbaseline. Nye avvik er forbudt, baselinegjeld kan bare reduseres,
  og SWP-7 krever at alle legacyunntak er fjernet.
- Backend, produktadferd, URL-er og API-kontrakter er utenfor stylingomfanget.

## Fullført rammeverksløft og paritetsbaseline

- Feature-branchen `feature/sveltekit-lift-and-shift` er opprettet.
- SvelteKit-målarkitektur er dokumentert.
- Fire ADR-er er godkjent for rendering, state/data, auth/tenant og UI/Bits UI.
- Rammeverksnøytrale produkt- og designregler er konsolidert.
- Gamle React-planer, PR-handover og arkivdokumenter er fjernet fra arbeidskopien.
- Migreringsplan, denne statusfilen og Codex-protokoll i `AGENTS.md` er etablert.
- React-referansens test-, check- og buildbaseline er grønn.
- Alle eksisterende routes, tenantformer, tilgangsnivåer, sentrale API-er, kapabiliteter og kritiske
  states er dokumentert i `docs/behavior-inventory.md`.
- WP-0-kvalitetsporten er nådd.
- Svelte 5 og SvelteKit er aktivt buildfundament med TypeScript strict, Svelte-aware lint, Prettier,
  `svelte-check` og `adapter-static`.
- Cloudflare Pages bygges med `index.html`-fallback; GitHub Pages bygges med `404.html`-fallback og
  verifisert base path.
- Root layout, root error boundary, statisk `auth/callback`, valgfri tenant-route med matcher og
  tomme routekomposisjoner for hele URL-kontrakten er etablert.
- Offentlig buildkonfigurasjon normaliseres og valideres i platformlaget.
- Første maskinelle SvelteKit-grenser håndhever offentlige featureinnganger, featureisolasjon,
  Bits-/Supabase-/Sentry-eierskap, komponenters HTTP-grense og forbud mot legacy Svelte-syntaks.
- WP-1-kvalitetsporten er nådd uten backendendringer.
- Alle eksisterende backend-DTO-er ligger i `lib/contracts`; React-referansen bruker midlertidige,
  tynne re-exports uten dupliserte transporttyper.
- Ren dato-, booking-, presentasjons- og kapabilitetslogikk ligger i `lib/domain` og testes uten DOM.
- Platformlaget har injiserbar native `fetch`-klient med base URL, auth-header, JSON/body,
  timeout/abort og normalisert `ApiError` uten sensitiv responsbody.
- Samtidige 401-responser samles i én rammeverksnøytral effekt; storage er isolert i en
  browser-only adapter og observability filtrerer sensitive kontekstfelter.
- Arkitekturkontrollen håndhever rene contracts/domain, storage-eierskap og at universal kode ikke
  importerer `*.client`-moduler.
- WP-2-kvalitetsporten er nådd uten funksjonell kontraktendring eller backendendringer.
- `/start` er avgrenset til én aktiv arbeidspakke og normalt ett verifiserbart checkpoint per
  AI-sesjon; fullført arbeidspakke skal overleveres før neste startes.
- AI-first lesbarhet er et bindende styrings- og arkitekturkrav med eksplisitt checkpointport i
  `AGENTS.md`, migreringsplanen og målarkitekturen.
- Authplattformen eksponerer diskriminerte initializing-, anonymous- og authenticated-states gjennom
  ett rammeverksnøytralt grensesnitt, typed Svelte-context og testet controller.
- Supabase- og utviklingsauth ligger bak adapters med deterministisk prioritet, sesjonsgjenoppretting,
  callback, tokenhåndtering og idempotent utlogging.
- Browser-runtime eier auth-SDK, native fetch og 401-navigasjon; Svelte-provideren publiserer bare
  stabile context-fasader og tømmer Query-cachen ved utlogging.
- Tenant fra route og dedikert build normaliseres til samme kontrakt. Build-tenant er autoritativ,
  lagrede callback-slugs valideres og alle interne navigasjoner fungerer under base path.
- TanStack Svelte Query-klient, tenant-key-konvensjon og lazy utviklings-devtools er koblet til den
  typed API-klienten.
- Session bootstrap, protected guards, fail-closed adminregler og backendstyrte kapabiliteter er
  etablert med eksplisitte loading-, error-, redirect- og blocked-states.
- WP-3-kvalitetsporten er nådd uten backendendringer.
- Den eksisterende rammeverksnøytrale token-, font- og temapaletten er bekreftet som autoritativ
  visuell kontrakt for SvelteKit; Figtree har eksplisitte systemfallbacks.
- Root layout eier en typed Svelte-temaprovider over en browser-only adapter med validert
  `light`/`dark`-kontrakt, eksisterende lagringsnøkkel og trygg storage-grense.
- `lib/ui` er offentlig UI-inngang, og første native primitive er en typed `Button` med sentrale
  produktvarianter, størrelser og fokusatferd. Guardflatene bruker den i reelle retry-forløp.
- Arkitekturkontrollen håndhever offentlig UI-import i features, sentral primitive-CSS og at
  primitiveanatomi bare defineres i `ui/primitives`.
- Første avgrensede WP-4-checkpoint for tokens, tema og primitivegrense er fullført uten Bits UI
  fordi checkpointets faktiske kontrollbehov dekkes tryggere av native HTML.
- Offentlige Svelte-patterns for `Page`, `Section`, `PageLoading`, `Feedback` og `ErrorState` eier
  nå sideanatomi, seksjoner og delte loading-, status-, warning- og errorstates gjennom `lib/ui`.
- Routeplaceholder, auth callback, root error boundary og session-/access-guards komponerer de
  offentlige patternene uten lokal produktanatomi eller komponent-CSS. En native `ButtonLink`
  dekker lenkehandlingen i routefeilflaten.
- Patternkontraktene har komponent- og axe-tester for landmarks, headinghierarki, seksjonsnavn,
  live regions, retry og loadinggeometri. Arkitekturkontrollen avviser nå `data-ui`/`data-part`
  direkte i routes og features.
- Andre avgrensede WP-4-checkpoint for Page-, Section- og feedbackpatterns er fullført uten app-shell,
  featuremigrering, Bits UI eller backendendringer.
- Offentlige Collection-patterns eier nå header, scope, collection-filterplassering, footer,
  liste-/datogruppeanatomi og entity-/schedule-rader gjennom `lib/ui`.
- `CollectionRow` bruker en eksplisitt diskriminert interaction-kontrakt. De første verifiserte
  variantene er `static`, helradsknappen `open` og den eksplisitte `action`-handlingen; category og
  faktisk status plasseres av patternet fremfor å bygges manuelt i featureinnhold.
- `CollectionLoading`, `CollectionEmpty` og `CollectionError` eier collection-spesifikk geometri,
  live-/alertsemantikk og retry. Liste- og gruppestrukturen har eksplisitte ARIA-listroller og
  navngitte datogrupper.
- Collection-kontraktene har komponent- og axe-tester for filter-/footerplassering, grouped lists,
  statiske og interaktive rader, status, loading, empty, error og retry. Designsystemkontrollen
  inkluderer nå `.svelte` når den validerer at offentlig produktanatomi og sentral CSS samsvarer.
- Tredje avgrensede WP-4-checkpoint for Collection-, row- og collection-statepatterns er fullført
  uten featuremigrering, Bits UI eller backendendringer.
- Native, typed `Input`- og `Textarea`-primitives dekker tekstlige kontroller med bindbar verdi,
  native disabled-/required-state og sentral fokus-, invalid- og temastyling.
- Offentlige `Form`, `FormFields`, `FormField`, `FormActions` og `FormSubmit` eier skjema-, felt- og
  handlingsanatomien. Feltet genererer stabil kontroll-ID og kobler label, hjelpetekst, feil,
  obligatorisk state og `aria-describedby`/`aria-invalid` automatisk til native kontroller.
- Form-kontraktene har komponent- og axe-tester for normal, obligatorisk, disabled, pending og
  ugyldig state, bindbar input/textarea, submit/cancel og forbudet mot `FormField` utenfor
  `FormFields`. Designsystemkontrollen validerer nå også at primitiveanatomi og sentral CSS
  samsvarer.
- Fjerde avgrensede WP-4-checkpoint for Form-, field- og validationpatterns er fullført uten
  featuremigrering, Settings, select, dato, dialog, Bits UI eller backendendringer.
- Native `Switch`, `Radio` og `ChoiceButton` dekker kontrollbehovene for innstillingsbrytere,
  enkeltvalg og flervalg med native button-/radiosemantikk, tydelig fokus og eksplisitt
  disabled-atferd uten Bits UI.
- Offentlige `SettingsStack`, `SettingsSection`, `SettingsPanel`, `SettingsRow`,
  `SettingsSwitchRow`, `SettingsValue`, `SettingsText`, `SettingsRadioGroup` og
  `SettingsChoiceGroup` eier innstillingsanatomi, statusrader og valgkontroller gjennom `lib/ui`.
  Redigerbare tekstkontroller komponeres i `FormField`; status, toggle og valg beholdes i
  `SettingsRow`.
- Settings-kontraktene har komponent-, tastaturkontrakt- og axe-tester for normal, valgt, disabled
  og pending state. Mobil/desktop og lyst/mørkt tema er kontrollert mot klubb-, medlemskaps-, bane-
  og arrangementflatene i React-referansen.
- Femte avgrensede WP-4-checkpoint for Settings-, row- og choicepatterns er fullført uten select,
  kalender, dialog, editor, featuremigrering, Bits UI eller backendendringer.
- Bits UI 2.19.0 er installert som headless atferdslager, og importgrensen er fortsatt lukket til
  `lib/ui/primitives`. Den interne dialogprimitiven eier portal, overlay, scroll lock, fokusfelle,
  Escape, utenfor-klikk og fokusretur.
- Offentlige `Dialog`- og `EditorDialog`-patterns eier henholdsvis kompakt standarddialog og
  fokusert editor med typed snippets, semantisk `onClose`, pending/busy state og sentrale
  størrelser. Pending blokkerer eksplisitt lukking, Escape og utenfor-klikk.
- Dialogkontraktene har komponent-, tastatur- og axe-tester for anatomi, fokusfelle, Tab-loop,
  Escape, utenfor-klikk, fokusretur, actions, pending og begge varianter. Standard og editor er
  kontrollert på 390×844 og 1440×900 i lyst og mørkt tema uten nettleserfeil.
- Sjette avgrensede WP-4-checkpoint for Dialog- og overlaypatterns er fullført uten select,
  kalender, rikteksteditor, featuremigrering eller backendendringer.
- React-referansens selectbehov er kaldkartlagt mot ny bane og brukerredigering som skjemaflater,
  samt RecordControlPanel, statistikkfilter og Min profil som filter-/innstillingsflater. De deler
  samme enkeltvalgskontrakt for placeholder, valgt verdi, tom liste, disabled, pending og feil.
- En offentlig, generisk `Select`-primitive over Bits UI eier portal, listbox, typeahead,
  tastaturnavigasjon, fokusretur og native formdata. Typed options og verdi, bindbar state og
  semantisk `onValueChange` skjuler Bits-parts og DOM-hendelser for konsumentene.
- `Select` arver kontroll-ID, label-ID, beskrivelse, required og feiltilstand fra `FormField`.
  Produktkontrakten dekker også eksplisitt tomtilstand, disabled/pending og sentral trigger- og
  listebredde uten lokale featurevarianter.
- Select-kontrakten har komponent-, tastatur- og axe-tester for åpning, piltaster, typeahead,
  valg, Escape, fokusretur, formkobling, tom liste, disabled, pending og invalid. Kontroll og
  portal er visuelt kontrollert på 390×844 og 1280×900 i lyst og mørkt tema uten overflow eller
  nettleserfeil.
- Sjuende avgrensede WP-4-checkpoint for Select- og valglistpatterns er fullført uten kalender,
  combobox, featuremigrering eller backendendringer.
- React-referansens dokumentbehov er kaldkartlagt mot vilkår, obligatorisk kunngjøring,
  bookingreglement, sperret konto og medlemskapsbekreftelse. Intro, seksjonshierarki, fakta,
  sidemetadata, lenker, handlinger, loading/error og responsiv lesing har eksplisitte eiere.
- Offentlige `Document`, `DocumentIntro`, `DocumentSection` og `DocumentFacts` eier nå native
  artikkelsemantikk, intro, navngitte `h2`-seksjoner og typed label/verdi-fakta gjennom `lib/ui`.
  Sidemetadata forblir i `Page`, mens loading/error og obligatoriske handlinger komponeres med de
  eksisterende feedback- og Form-patternene.
- Document-kontraktene har komponent- og axe-tester for landmark, headinghierarki, seksjonsnavn,
  fakta, metadata og lenker. Mobil/desktop og lyst/mørkt tema er kontrollert uten overflow;
  introen bevarer rå kunngjøringslinjer uten å arve kildekodeinnrykk i strukturerte avsnitt.
- Åttende avgrensede WP-4-checkpoint for Document- og leseinnholdspatterns er fullført uten
  featuremigrering, rikteksteditor, navigation eller backendendringer.
- React-referansens navigasjonsbehov er kaldkartlagt mot desktop-sidefeltet, mobil topp-/bunnflate,
  Baner og grener, Min side, Klubbinnstillinger, konto og editorens tilbakehandling. Routeaktivitet,
  kapabilitetsskjuling, tenantidentitet, tema, badges, fokus, loading og responsive skifter har
  eksplisitte eiere uten at app-shellen er bygget.
- Offentlige `Navigation`, `NavigationSection`, `NavigationList`, `NavigationLink`,
  `NavigationAction`, `NavigationIdentity` og `NavigationLoading` eier nav-landmarks, grupper,
  native lenke-/knappsemantikk, aktiv state, badges og indre sidefelt-, bunn-, seksjons- og
  handlingsgeometri gjennom `lib/ui`. SvelteKit-route-, auth- og kapabilitetsmodellen forblir hos
  app-shellen i WP-5.
- Navigation-kontraktene har komponent-, tastatur- og axe-tester for grupper, aktiv route,
  seksjonslenker, tenantidentitet, badges, skjulte kapabilitetsseksjoner, disabled/pending
  handlinger, fokus og loading. Mobil/desktop og lyst/mørkt tema er kontrollert uten overflow eller
  nettleserfeil.
- Niende avgrensede WP-4-checkpoint for Navigation-patterns er fullført uten app-shell,
  featuremigrering, konto-/Mer-overlay eller backendendringer.
- React-referansens datobehov er kaldkartlagt mot enkeltstående skjemafelt i bruker-,
  kunngjørings- og medlemskapsflyter, bookingens semantiske dagvalg og -navigering,
  statistikkfilteret samt manuelt flerdatovalg. Norsk locale, API-format, grenser, formkobling,
  fokus, tastatur, loading og responsiv presentasjon har eksplisitte eiere.
- Offentlige `DatePicker` og `MultiDatePicker` over interne Bits UI Calendar-/Popover-wrappers eier
  enkeltvalg, flervalg, portal, fokusretur, norsk mandagsbasert kalender og sentral formattering.
  Grensen mot features er en streng lokal ISO-dato (`YYYY-MM-DD`); eventuell konvertering til
  tidspunkt forblir domenet eller API-konsumentens ansvar.
- `DatePicker` har sentrale `field`-, `filter`- og `booking`-presentasjoner, inkludert valgfri
  forrige-/neste-dag-navigering. Begge offentlige kontroller arver FormField-kontekst, produserer
  native FormData og uttrykker required, invalid, disabled, pending, min-/maksgrenser og maksimal
  flervalgsmengde uten lokale featurevarianter.
- Date-/Calendar-kontraktene har komponent-, tastatur- og axe-tester for ISO-grensen, formkobling,
  åpning, Escape, fokusretur, enkelt-/flervalg, dagsteg, grenser og disabled/pending. Popover og
  inline kalender er kontrollert på 390×844 og 1280×900 i lyst og mørkt tema uten overflow eller
  nettleserfeil.
- Tiende avgrensede WP-4-checkpoint for Date- og Calendar-patterns er fullført uten
  featuremigrering eller backendendringer.
- React-referansens riktekstbehov er kaldkartlagt mot oppretting og redigering av arrangementets
  publiserte nettsidepresentasjon. Begge konsumenter deler serialisert Tiptap-JSON, controlled
  updates, tomt innhold, loading, fokus, tastatur, tabeller, mobilpresentasjon og feilgrense.
- Offentlig `RichTextEditor` eier bindbar JSON-streng, native FormData-speiling, FormField-kobling,
  lazy browseroppstart, verktøylinje, fokusretur, disabled/pending og fail-closed håndtering av
  ugyldig lagret innhold. En intern, browser-only adapter skjuler Tiptap-livssyklus og kommandoer.
- Fet, kursiv, h2/h3, lister, sitat og full tabellverktøylinje har samme semantiske kontrollgrense.
  Den nye offentlige `Icon`-primitiven etablerer Hugeicons Free som Svelte-flatenes ikonkonvensjon
  uten å lekke tilgjengelig navn fra den omsluttende kontrollen.
- Editor-kontrakten har komponent-, tastatur- og axe-tester for JSON, controlled updates,
  formatering, tabeller, loading, fokus, disabled/pending og ugyldig lagret innhold. Mobil/desktop og
  lyst/mørkt tema er kontrollert uten sideoverflow eller nettleserfeil; mobil-QA avdekket og fjernet
  horisontal scrolling for vanlig brødtekst.
- Ellevte avgrensede WP-4-checkpoint for Rich-text-editorgrensen er fullført uten featuremigrering
  eller backendendringer.
- React-referansens sammensatte radbehov er kaldkartlagt: fire features bruker ekspanderbare
  detaljrader, banearbeidsområdet bruker eksplisitt opp-/ned-reorder, og ingen feature bruker den
  gamle `actions`-typen. Handlingsantall, summary/detail-eierskap, fokusrekkefølge, pending og
  mobilgeometri er dermed avklart uten drag-and-drop eller meny.
- `CollectionList` eier nå bindbar, kontrollert enkeltutviding over en intern Bits UI-accordion.
  `CollectionRow` har offentlige `expand`- og `reorder`-interaksjoner; expand krever faktisk detalj-
  eller handlingsinnhold, holder hurtighandlinger som søskenkontroller og støtter accordion-
  tastatur. Reorder bruker native åpne-/opp-/nedknapper, Hugeicons, kantgrenser og felles busy-state.
- De sammensatte radkontraktene har komponent-, tastatur- og axe-tester for kontrollert åpning,
  fokus, hurtighandling, reorder og pending. Mobil/desktop og lyst/mørkt tema er kontrollert på
  390×844 og 1280×900 uten overflow eller nettleserfeil.
- Tolvte avgrensede WP-4-checkpoint for sammensatte CollectionRow-interaksjoner er fullført uten
  offentlig `actions`-variant, filterkomposisjon, featuremigrering eller backendendringer.
- React-referansens samlingskontroller er kaldkartlagt på tvers av arrangementer,
  arrangementadministrasjon, bookingliste, brukere, baner, mine bookinger, bookingvalg og
  statistikk. Header-toggle, selection, filtergrupper, søk, sortering, reset, typed felt,
  mobilatferd, fokus, pending og filtrert tomtilstand har eksplisitte eiere.
- Offentlig `CollectionControls` eier selection, mobil disclosure, søk, choice-grupper, sortering og
  diskriminerte `select`-/`date`-/`switch`-felt. `Collection` eier den typed header-togglekontrakten;
  features leverer state og semantiske callbacks uten lokal headeranatomi eller CSS.
- Selection er alltid inline, mobilfilteret kollapser med synlig søk og desktopfilteret vises
  direkte gjennom samme responsive komposisjon. Eksisterende Select-/DatePicker-portaler dekker de
  sammensatte kontrollene; checkpointet trenger ingen ny menu-/popover-primitive.
- Samlingskontrollene har komponent-, tastaturkontrakt- og axe-tester for disclosure, toggle, custom
  choice, søk, sortering, reset, typed felt, fokus og pending. Mobil/desktop og lyst/mørkt tema er
  kontrollert på 390×844 og 1280×900 uten overflow eller nettleserfeil.
- Trettende avgrensede WP-4-checkpoint for offentlig Collection-filterkomposisjon er fullført uten
  featuremigrering eller backendendringer. Alle kartlagte featurebehov kan uttrykkes uten
  feature-CSS, og WP-4-kvalitetsporten er nådd.
- React-appskallets desktop-sidefelt, mobil topp-/bunnflate, boot, auth-/tenantstates, konto, tema,
  safe areas og arbeidsområde er kaldkartlagt mot SvelteKit-layouten og de offentlige
  Navigation-patternene uten å kopiere React-providerne eller routekonfigurasjonen.
- Offentlig `AppShell` eier én responsiv frame med typed, diskriminert kontrakt: alle klare
  desktop-/mobilnavigasjonssnippets leveres samlet, eller hele navigasjonsrammen viser eksplisitt
  loadinggeometri. Shell-et eier sidefelt, toppfelt, arbeidsområde, bunnfelt, safe areas og appens
  eneste `main`-landmark.
- Tenant-layouten komponerer `AppShell` rundt eksisterende `SessionGate`. Guard-, recovery- og
  routeplaceholderflatene rendres nå inne i arbeidsområdet uten parallelle eller nestede
  `main`-landmarks; featureinnholdet er ellers uendret.
- App-shellkontrakten har komponent-, fokusrekkefølge- og axe-tester for landmarks, klare og
  lastende navigasjonsflater og bootgeometri. Mobil/desktop og lyst/mørkt tema er kontrollert på
  390×844 og 1440×900 uten overflow eller nettleserfeil.
- Første avgrensede WP-5-checkpoint for responsiv app-shellramme og loadinggeometri er fullført uten
  faktisk navigasjonsutvalg, konto-/Mer-overlay, featuremigrering eller backendendringer.
- Klubb- og brukerqueryene eies nå én gang av en typed `SessionDataProvider`; SessionGate,
  AccessGuard og app-shellnavigasjonen leser samme reaktive session-context og samme Query-cache
  uten parallelle bootstrapkall eller kopiert brukerstate.
- Én ren, diskriminert navigasjonsmodell kombinerer auth, tenant, klubb, bruker, backendstyrte
  kapabiliteter, base path og normalisert SvelteKit-path. Navigasjonsdestinasjonene er innhold, ikke
  en parallell router; adminsynlighet gjenbruker guardmodellens kapabilitetskrav.
- Desktop-sidefelt, mobil toppfelt og mobil bunnnavigasjon komponerer de offentlige Navigation-
  patternene med tenantidentitet, anonym/innlogget konto, tema, Nyheter og aktiv route. Baner og
  grener deler aktiv hoveddestinasjon, og mobilens tre prioriterte destinasjoner dupliseres ikke i
  Mer-flaten.
- Offentlig `NavigationOverlay` eier konto- og Mer-flatenes dialogsemantikk, fokusfelle, Escape,
  utenfor-klikk, fokusretur og pending/dismiss-kontrakt. Utlogging går gjennom typed auth-context;
  desktopkontoen og mobilens Mer-flate deler samme semantiske handling uten lokal overlaykode.
- Navigasjonsmodellen og komposisjonen har 12 nye modell-, komponent-, fokus- og axe-tester for
  loading/fallback, anonym/innlogget state, kapabilitetsskjuling, sammensatt routeaktivitet, base
  path, mobile prioriteringer, tema, konto/Mer, utlogging og fokusretur.
- Andre avgrensede WP-5-checkpoint er kontrollert på 390×844 og 1440×900 i lyst og mørkt tema,
  inkludert direkte route, tilbake/frem, fokusretur, én main-landmark, overflow og konsoll. Route
  metadata og lokal tilbakehandling ble ikke innført fordi de gjeldende shellflatene ikke trenger
  dem. WP-5-kvalitetsporten er nådd uten feature- eller backendendringer.
- Offentlig login er flyttet til `lib/features/auth` med eksplisitt e-post-/OTP-arbeidsflyt,
  Google, valgfri Idrettens ID, utviklingsprofiler, feltvalidering, pending-/feilstates og
  tilgjengelig provideridentitet over det eksisterende typed auth-contextet.
- `returnTo` valideres mot tenant og base path før login, bæres gjennom OAuth-/OTP-callbacken og
  valideres på nytt før intern navigasjon. Ugyldige eller tenantfremmede callbackmål faller tilbake
  til riktig tenantrot; innlogging avvises eksplisitt når lokal lagring er blokkert.
- Offentlige vilkår er flyttet til `lib/features/policy` over sessionens ene klubbquery og de
  autoritative Page-/Document-patternene. Aktiv vilkårsversjon, klubbnavn, kontaktlenke og
  headinghierarki er bevart uten duplisert query eller featurestyling.
- Root error boundary skiller nå 404 fra uventede routefeil med egen tittel, forklaring og
  hjemhandling. Login, vilkår og root-feil har komponent-, modell-, tenant-, storage- og axe-tester.
- Første WP-6-checkpoint er kontrollert på 390×844 og 1440×900 i lyst og mørkt tema med inline
  feltvalidering, fokus, én main-landmark, ingen horisontal overflow eller konsollfeil. Ekstern
  leverandørinnlogging ble verifisert ved adapter-/komponentgrensen uten å starte en reell OAuth-flyt.
- Sperret konto, obligatorisk kunngjøring og medlemskapsbekreftelse er flyttet samlet til den
  offentlige policy-featuren over sessionens autoritative klubb- og brukerdata. De tre tynne
  routene komponerer reelle Svelte-flater, og deres routeplaceholdere er fjernet.
- Kunngjørings- og medlemskapsbekreftelse bruker typed POST-endpoints og TanStack-mutations uten
  retry. Vellykket bekreftelse invaliderer bare sessionens tenantnøklede brukerquery; mutationens
  pending-state varer til guarddata er oppfrisket og `SessionGate` kan føre brukeren videre.
- Medlemskapsflyten validerer fullt navn og medlemskapstype, fokuserer første ugyldige kontroll og
  kobler label, beskrivelse, required og feil til radio-gruppen gjennom den sentrale FormField-
  kontrakten. Offentlig `PageStatus` eier kompakt warning-/dangerstatus for alle tre policyflatene.
- Andre WP-6-checkpoint er kontrollert i hele matrisen 390×844 og 1440×900, lyst og mørkt tema, for
  alle tre flater. Hver kombinasjon har én main-landmark, synlig h1, ingen horisontal overflow eller
  konsollfeil; feltfeil, fokus og ARIA-state er også kontrollert interaktivt.
- Bookingroten er flyttet til én offentlig `lib/features/booking`-inngang med typed bootstrap-,
  kalender-, booking-, avbestillings- og aktiv-arrangementendepunkter. Det samlede anonyme
  bootstrapkallet er autoritativt, mens bare 404/405 bruker eksplisitt gren-/bane-/kalenderfallback.
- TanStack Query eier tenant-, bruker-, bane- og datonøkler, 30-sekunders bakgrunnsoppfrisking med
  forrige slotliste, bootstrapstartdata og eksakt cacheinvalidering. Booking og avbestilling er
  optimistiske med tilbakeføring til den komplette forrige slotlisten og vedvarende inline-feil.
- Bookingutvalget starter på lokal dato, første aktive gren med bane og første bane. Gren, dag og
  bane, vær, regler, passerte tider, manglende oppsett, tom/error/loading og fysisk slotstatus er
  bevart; handlingene styres utelukkende av backendens kapabiliteter og innlogget state.
- Offentlige `ScheduleTime`- og `Weather`-patterns utvider designsystemet uten feature-CSS.
  Bookingregler og arrangementskobling bruker de autoritative Dialog-, Document-, Settings-, Date-
  og Collection-patternene, og den tynne bookingrotrouten komponerer bare featureinngangen.
- Tredje WP-6-checkpoint er kontrollert på 390×844 og 1440×900 i lyst og mørkt tema med én
  main-landmark, synlig h1, ingen horisontal overflow, riktige dialog-/fokusforløp og tom
  warn/error-konsoll. Visuell QA avdekket og fjernet en selvmotsigende anonym «Din tid»-tittel fra
  backenddata der fysisk status fortsatt var ledig.
- Mine tider og Min side er flyttet samlet til én offentlig `lib/features/account`-inngang med
  typed mine-bookinger-, avbestillings-, profil-, persondata- og slett-konto-endepunkter. De to
  tynne routene komponerer reelle Svelte-flater, og deres routeplaceholdere er fjernet.
- Mine tider gjenbruker bookingens eksakte tenantnøklede Query-konvensjon for historikkvariantene
  og bane-/datoslots. Avbestilling fjerner optimistisk fra begge Mine tider-cacher, gjenoppretter
  komplette snapshots ved feil og invaliderer Mine tider-prefikset samt den eksakte slotnøkkelen.
- Historikkbryter, aktivitetsfilter, paginering, datogruppering, vær, fysisk status,
  kapabilitetsstyrt avbestilling og loading/error/empty er bevart gjennom de autoritative
  Collection-patternene uten feature-CSS.
- Min side gjenbruker sessionens autoritative brukerquery for profil, konto og vilkårsdata.
  URL-styrte Profil-/Data-faner, inline navnevalidering, JSON-eksport gjennom en browser-only
  download-adapter og destruktiv slett-konto-dialog med pending-blokkering og utlogging er etablert.
- Fjerde WP-6-checkpoint er kontrollert på 390×844 og 1440×900 i lyst og mørkt tema for Mine tider,
  profil, persondata og slettedialog. Hver flate har én main-landmark, synlig h1, ingen horisontal
  overflow og tom warn/error-konsoll; fokus og dialogstate er også kontrollert interaktivt.
- Arrangementer og Nyheter er flyttet til to isolerte offentlige featureinnganger med egne typed
  API-, query-key-, query- og modellgrenser. De tynne routene komponerer reelle Svelte-flater, og
  begge routeplaceholderne er fjernet uten backendendringer.
- Arrangementlisten velger offentlig eller innlogget endpoint fra session-state, støtter historikk,
  aktivitetsfilter, lokal paginering og kontrollert detaljutviding fra `?arrangement={id}`. Avlysning
  er kapabilitetsstyrt, bruker typed mutation/dialog og invaliderer bare tenantens arrangementcache.
- Nyhetsfeeden er offentlig, lokalt paginert og presenterer backendens HTML som trygg tekst.
  Gyldige eksterne HTTP(S)-lenker åpnes i ny fane med `noopener noreferrer`; loading, retrybar feil,
  tomtilstand og bakgrunnsoppfrisking eies av de autoritative Collection-patternene.
- Femte WP-6-checkpoint er kontrollert med offentlig produksjonsdata på 390×844 og 1440×900 i lyst
  og mørkt tema. Begge flater har én main-landmark, synlig h1 og ingen sideoverflow;
  arrangement-deeplink og historikkbryter er kontrollert interaktivt. Lokal proxy ga bare forventet
  Vite-HMR-støy, uten applikasjonsfeil.
- Baner og Grener er flyttet samlet til én offentlig `lib/features/court-and-activity-admin`-inngang
  med typed adminendepunkter, tenantnøklede Query-grenser, mutations og rene utkast-, validerings-,
  sorterings- og requestmodeller. De to tynne routene velger bare aktiv seksjon og leverer sessionens
  backendstyrte kapabiliteter; begge routeplaceholderne er fjernet uten backendendringer.
- Arbeidsområdet bevarer kapabilitetsstyrte seksjonslenker, filter, create-/editordialoger,
  aktiv-state, baneoverstyringer, grenregler og deterministisk banereorder. Ulagrede utkast beholdes
  eksplisitt lokalt, mutationer invaliderer hele tenantgrensen uten featurekobling, og vedvarende
  inline-feedback viser både lagring og feil.
- Offentlig `SettingsRange` eier native rangeanatomi og labelplassering for bane- og grenreglene.
  Featureflaten komponerer ellers de autoritative Page-, Navigation-, Collection-, Settings-, Form-,
  Select-, Dialog- og feedbackpatternene uten feature-CSS eller direkte HTTP-kall.
- Sjette WP-6-checkpoint er kontrollert på 390×844 og 1440×900 i lyst og mørkt tema for begge
  routes. Hver flate har én main-landmark, synlig h1, ingen horisontal overflow og tom warn/error-
  konsoll. Filter, create-/editorflater, fokusfelle/-retur, validering, dirty-state, aktiv-state,
  reorder, baneoverstyringer, grenregler og mutasjonsfeedback er kontrollert interaktivt; alle
  midlertidige QA-endringer i utviklingsdata er tilbakeført.
- Klubb- og medlemskapsinnstillinger er flyttet til én offentlig
  `lib/features/club-and-membership-admin`-inngang med typed klubb- og medlemskapsendepunkter,
  tenantnøklede Query-grenser, mutations uten retry og rene utkast-, validerings- og requestmodeller.
  Den tynne `/admin/klubb`-routen leverer bare sessionens autoritative klubb og kapabiliteter;
  routeplaceholderen er fjernet uten backendendringer.
- Klubbprofilen bevarer navn, kontakt-e-post, nettside, koordinater, RSS-feed og synlighetsdager med
  inline validering, dirty-/pending-/success-/error-state og tenantvid invalidation. Backendinspeksjon
  bekreftet at logo og bakgrunn fortsatt er statiske tenant-assets og ikke har en eksisterende
  redigerings- eller opplastingskontrakt som skal oppfinnes i migreringen.
- Medlemskapsfanen viser aktiv periode, datoer og bekreftet/totalt, og skiller aktivering og
  deaktivering med egne mutationstates. `medlemskap:aktiver` styrer endringshandlingene, mens
  `klubb:admin` beskytter hele flaten; aktiveringsdatoen går gjennom den autoritative lokale
  ISO-datogrensen før deterministisk API-konvertering.
- Offentlig `Tabs` over en intern Bits UI-wrapper eier lokale seksjonsfaner, automatisk
  tastaturaktivering, roving fokus, kontrollert verdi og sentral responsiv styling. DatePicker har
  samtidig fått eksplisitt regresjonsdekning for tom verdi og inneværende lokal måned.
- Sjuende WP-6-checkpoint er kontrollert på 390×844 og 1440×1000 i lyst og mørkt tema for begge
  faner og DatePicker-popover. Hver kombinasjon har én main-landmark, synlig h1, korrekt tema, ingen
  horisontal overflow eller runtime-feil og 104 px sluttklaring over mobilnavigasjonen; validering,
  fanebytte og kalenderåpning er kontrollert interaktivt uten å mutere utviklingsdata.
- Arrangementadministrasjon er flyttet til én offentlig `lib/features/arrangement-admin`-inngang
  med typed API-/Query-/mutationgrenser, oversikt, totrinnseditor, metadata, gjentakende og manuelle
  forslag, konfliktsjekk, lokal staging og enkelt-/batchendringer. Den tynne `/arrangement`-routen
  komponerer featureinngangen, og routeplaceholderen er fjernet uten backendendringer.
- Offentlig `FormSteps` eier stegstatus og navigasjon over den eksisterende sentrale
  `form-steps`-anatomien. Åttende WP-6-checkpoint er kontrollert på 390×844 og 1440×1000 i lyst og
  mørkt tema med én main-landmark, synlig h1, korrekt tema og uten horisontal overflow eller nye
  warn/error-logger etter innlogging. Oppretting, metadata, gjentakende/manuelle forslag, konflikt,
  delvis batchsuksess, bookingredigering, avlysning, feedback, fokusfelle/-retur og pendingblokkering
  er kontrollert interaktivt; alle midlertidige utviklingsdata er fjernet etter testen.
- Brukere og brukersperre er flyttet til én offentlig `lib/features/user-admin`-inngang med typed
  API-, Query- og mutationgrenser, rene filter-, sorterings-, validerings- og requestmodeller samt
  eksplisitt cacheinvalidering. Den tynne `/admin/brukere`-routen leverer bare sessionens bruker-id
  og kapabiliteter; routeplaceholderen er fjernet uten backendendringer.
- Brukerflaten bevarer søk, rolle-/medlemskapsfilter, slettet-toggle, lokal paginering,
  detaljutviding, rolle-/visningsnavneditor, sletting, sperring, sperrehistorikk og oppheving.
  Global administratortilgang og backendens objektkapabiliteter kombineres med eksplisitt vern av
  egen og slettet bruker; loading, retrybar feil, tom/filtrert tom liste og mutationfeil bruker de
  autoritative Collection-, Form-, Dialog- og feedbackpatternene uten feature-CSS.
- Niende WP-6-checkpoint er kontrollert på 390×844 og 1440×1000 i lyst og mørkt tema med én
  main-landmark, synlig h1, korrekt tema, ingen horisontal overflow og tom warn/error-konsoll.
  Søk, slettet-toggle, mobilfiltre, editor- og sperrevalidering, fokus/retur, sperrehistorikk og
  avbrutt sletting er kontrollert interaktivt uten å mutere utviklingsdata.
- Kunngjøringsadministrasjon er flyttet til én offentlig
  `lib/features/announcement-admin`-inngang med typed API-, Query- og mutationgrenser, rene
  editor-, validerings-, dato- og bekreftelsesmodeller samt eksplisitt tenantinvalidering. Den tynne
  `/admin/kunngjøringer`-routen komponerer featureinngangen, og routeplaceholderen er fjernet uten
  backendendringer.
- Flaten bevarer ingen/aktiv kunngjøring, tittel, riktekst, utløpsdato, mottaker- og
  bekreftelsesstatus samt oppretting og deaktivering. Empty/204-mutasjonssvar normaliseres ved
  API-grensen, og loading, retrybar feil, inline validering, pending og mutationfeil bruker de
  autoritative Page-, Collection-, Form-, Date-, Dialog-, Document- og feedbackpatternene uten
  feature-CSS.
- Offentlig `RichTextContent` leser den støttede Tiptap-JSON-kontrakten uten rå HTML og faller trygt
  tilbake til eldre ren tekst. Den obligatoriske kunngjøringsflaten gjenbruker samme lesegrense.
  Nettleser-QA avdekket i tillegg at en prosentkodet norsk route kunne avvises av sessionguarden;
  guard- og navigasjonsmodellene normaliserer nå URL-pathen før capability- og aktiv-state-sjekk,
  men bevarer kodede reservedelere slik at `%2F` ikke kan bli en falsk path-separator.
- Tiende WP-6-checkpoint er kontrollert på 390×844 og 1440×1000 i lyst og mørkt tema med én
  main-landmark, synlig h1, korrekt aktiv navigasjon, ingen horisontal overflow og ingen nye
  warn/error-logger etter retting. Tomtilstand, editor, riktekstverktøy, dato, valideringsfokus,
  oppretting, detaljer, bekreftelser, deaktivering, Escape og fokusretur er kontrollert
  interaktivt; den midlertidige QA-kunngjøringen er deaktivert og fjernet fra aktiv state.
- Statistikk er flyttet til én offentlig `lib/features/statistics`-inngang med typed kontrakt,
  API-, Query- og modellgrenser for bookingstatistikk, grener og baner. Den tynne
  `/admin/statistikk`-routen komponerer bare featureinngangen, og den siste routeplaceholderen samt
  det nå ubrukte offentlige `RoutePlaceholder`-patternet er fjernet uten backendendringer.
- Flaten bevarer lokale periodevalg, egendefinerte datoer, sammenligning med året før, gren- og
  banefilter, medlemsfanens bookingtypefilter, nøkkeltall, månedslinje, bookingtypefordeling,
  gren-/ukedagsfordeling, tidsstolper, banetabell og toppliste. TanStack Query beholder forrige
  datasett under bakgrunnsrefresh; loading, retrybar feil, tomt datagrunnlag og full datavisning
  komponerer autoritative Page-, Section-, Collection-, Tabs-, Select-, Date- og feedbackpatterns.
- Offentlige `Metric`- og `MetricGrid`-patterns eier nøkkeltallsanatomien. Datavisualiseringene
  bruker semantiske figurer, SVG og tekstalternativer uten featurelokal CSS eller tredjeparts
  diagramruntime.
- Ellevte WP-6-checkpoint er kontrollert på 390×844 og 1440×1000 i lyst og mørkt tema med én
  main-landmark, synlig h1, korrekt tema, ingen horisontal overflow og tom warn/error-konsoll.
  Faner, automatisk tastaturaktivering, periode, egendefinerte datofelt, sammenligning,
  bookingtype, gren og bane er kontrollert interaktivt mot eksisterende utviklingsdata uten
  mutasjoner. WP-6-kvalitetsporten er nådd.
- Første WP-7-checkpoint har kaldavstemt alle 18 URL-flater, tilgangsnivåer og kritiske
  featurestates uten å finne manglende produktfeatures. Importgrafen skiller 265 Svelte-eksklusive,
  295 React-eksklusive, 46 delte autoritative og 43 runtime-uoppnåelige produksjonskandidater.
- `docs/wp-7-parity-and-cleanup-inventory.md` navngir alle aktive React-broer, 34 foreldreløse
  legacyfiler, React-/Axios-/Query-/Radix-/shadcn-avhengigheter og en atomisk sekstrinns
  fjerningsrekkefølge med faktiske konsumenter.
- Inventaret fant to konkrete runtimegap før React kan fjernes: Svelte-runtime kobler foreløpig
  ikke observability/Sentry eller storagefeilrapportering, og deploy-recoveryen for utdaterte
  oppstartsfiler finnes bare i Reacts `index.html`. Lokal innlogget E2E mangler i tillegg en
  reproduserbar authharness over det eksisterende utviklingsschemet.
- Andre WP-7-checkpoint har lukket begge runtimegapene. En browser-only `@sentry/browser`-adapter
  initialiseres fra SvelteKits klienthook bare i produksjon med konfigurert DSN; disabled/no-DSN
  forblir no-op og Sentry-chunken er en ikke-preloadet dynamisk inngang.
- SvelteKits `handleError`, app-runtimeinitialisering og storagefeil rapporteres gjennom samme
  platformgrense. Brukerdata, cookies, headere, HTTP-bodyer, URL-query, stackvariabler og sensitiv
  nested kontekst er slått av eller filtrert før sending; storagehendelsen inneholder ikke nøkkel,
  verdi eller feilmelding.
- Den aktive `src/app.html` eier nå den dokumenterte `vite:preloadError`-recoveryen før
  applikasjonsmodulene lastes: ett automatisk forsøk oppfrisker HTML og alle oppstartsassets, en
  cooldown stanser løkker, og fastlåst oppstart tilbyr eksplisitt nullstilling. Svelte-layouten
  fjerner bootflaten når appen har overtatt.
- Tredje WP-7-checkpoint har etablert Playwright med en frontend-/testeid authharness. Den aktive
  klienten beholder standard `Bearer`; bare Playwright-konteksten skriver egne API-kall om til den
  isolerte utviklingsbackendens `DevelopmentBearer`, uten backendkode eller skjult lokal proxy.
- Tre kritiske E2E-flyter kjører med eksplisitt `/banebooking`-base path: utviklingslogin bevarer
  tenantretur, medlem booker og avbestiller samme tid, og administrator endrer og gjenoppretter
  klubbnavnet. Harnessen sporer opprettet booking-ID og komplett klubbprofil og rydder bare sine
  egne mutasjoner dersom en flyt stopper underveis.
- `docs/e2e-harness.md` dokumenterer databaseforutsetning, eide backend-/frontendprosesser,
  authgrensen, testdata og opprydding. E2E-porten, full maskinport og begge hostingbuildene er
  grønne; backend-repoet er fortsatt urørt.
- Fjerde WP-7-checkpoint har etablert en produksjonslik Playwright-matrise over bygde Cloudflare
  Pages- og GitHub Pages-artefakter. Public, protected, admin og prerenderet callback lastes direkte
  og refreshes under både root path og `/banebooking`; hostfallback og anonym guard verifiseres
  eksplisitt i åtte tester.
- Fire visuelle referanser fryser anonym login, offentlige vilkår, medlemskonto og
  klubbadministrasjon på 390×844 og 1440×1000 i lyst/mørkt tema. En separat nettleserkontroll
  bekrefter landmark, heading, tema, bredde og tom warn/error-konsoll.
- Bundleporten validerer base path, hostingmarkører, fravær av React-runtime, initial JS/CSS,
  største lazy chunk og at Sentry, Supabase og ProseMirror ikke preloades. Mål og avvik er
  dokumentert i `docs/wp-7-production-evidence.md`; ingen ekstern deploy eller backendendring er
  utført.
- Femte WP-7-checkpoint har fjernet React-roten, 295 React-eksklusive produksjonsfiler, 34
  foreldreløse legacyfiler, fem legacytestfiler, alle aktive kompatibilitetsbroer og rotens inaktive
  `index.html`. De 214 `.tsx`/`.jsx`-filene og deres 21 423 linjer er borte, mens alle 46 delte
  autoritative contract-, domain-, platform- og CSS-filer er bevart.
- React-, Axios-, React Query-, Radix- og øvrige React-bundne pakker samt React-typecheck,
  lintplugins og rotkonfigurasjon er fjernet. `npm install` fjernet 169 installerte pakker og
  synkroniserte lockfilen; pakkegrafen inneholder ikke React, React DOM, Axios, React Query eller
  Radix.
- `scripts/check-legacy-frontend-removal.mjs` avviser permanent React-/TSX-kilde, de gamle
  brostiene, React-rootkonfigurasjon og de fjernede pakkene. Designsystemkontrollen leste den aktive
  Svelte-anatomien og holdt CSS-til-komponent-rekkevidden eksplisitt utsatt frem til det separate
  sjette checkpointet.
- Dialogprimitiven gjenoppretter body-scroll umiddelbart fordi flaten ikke har exit-transition.
  Overlaytestene lukker dialogene eksplisitt, slik at Bits UI ikke etterlater en utsatt global
  cleanup etter at JSDOM er avmontert.
- Hele femte checkpoint er re-verifisert med 318 Vitest-tester, Svelte-only check, sju kritiske og
  visuelle E2E-tester, åtte produksjonsroutetester og begge hostingbuildene. Initial CSS falt til
  30,2 KiB gzip når TSX-treet sluttet å være Tailwind-kilde; ekstern deploy og backend er urørt.
- Sjette WP-7-checkpoint har kaldmålt Svelte-treet mot sentral CSS og fjernet 102 ubrukte
  legacyklasser, 71 ubrukte `data-*`-ankre, foreldreløse kommentarer og 40 tokens uten aktiv
  konsument. Aktive grener i kombinerte selektorer er bevart, og alle fire fryste visuelle
  referanser er identiske etter oppryddingen.
- `src/index.css` er fri for shadcn- og ubrukt animate-CSS. `shadcn`, `zod`, `tw-animate-css` og fem
  overflødige direkte Tiptap-oppføringer er fjernet; editoren importerer fortsatt sine tre
  autoritative pakker. Pakkeryddingen fjernet 264 installerte pakker, og `nanoid` er oppdatert til
  sikker patchversjon 3.3.18.
- Designsystemkontrollen håndhever nå toveis rekkevidde for klasser, `data-ui`, primitives, slots og
  tokens. Legacykontrollen avviser de fjernede direkte pakkene, og
  `docs/development-and-operations.md` er autoritativ lokal kjøre-, bygg- og hostinginstruks.
- Sjette checkpoint er verifisert med 318 Vitest-tester, tre kritiske E2E-flyter, fire uendrede
  visuelle snapshots, åtte produksjonsroutetester, full check og begge hostingbuildene. Initial CSS
  er redusert til 21,2 KiB gzip; ingen ekstern deploy eller backendendring er utført.
- Første SWP-0-checkpoint har etablert en deterministisk PostCSS-/Svelte-AST-måler med eksplisitt
  npm-grense, versjonert JSON-baseline og en Vitest-kontrakt som regenererer og sammenligner hele
  kildedelen uten tidsstempel- eller rekkefølgestøy.
- Baseline schemaVersion 1 fører hvert legacyavvik med eksakt fil, linje, eierfamilie,
  eierpakke og planlagt fjerningscheckpoint. Den måler også alle lokale custom properties,
  utilityforekomster, markupstyling og de nåværende statistikkunntakene for klasse, inline
  geometri, SVG og semantiske visualiseringsroller.
- Ferske Cloudflare Pages- og GitHub Pages-builds registrerer initial CSS/JS, største lazy chunk og
  de konkrete lazy Sentry-, Supabase- og rikteksteditorchunkene. Måleverktøy og baselinefil er
  eksplisitt utelukket fra Tailwinds tekstskanning; en kald `HEAD`-sammenligning bekrefter at
  produksjons-CSS og klasseutvalg er byteidentisk med tilstanden før checkpointet.
- Andre SWP-0-checkpoint har frosset elleve navngitte Playwright-referanser over de faktiske
  SvelteKit-routene. Matrisen dekker app-shell/navigation, Page/Section, Collection,
  Form/Settings, Dialog/Select/Calendar, rikteksteditor og statistikk på 390×844 og 1440×1000 i
  lyst og mørkt theme.
- Referansedata, tenant, roller, kapabiliteter, dato og nettlesertid er deterministiske ved
  testgrensen. Alle flater krever én `main`, synlig `h1`, ingen horisontal overflow og tom
  warn/error-konsoll; dialog, Select, Calendar, editor og Tabs har eksplisitte fokus-, tastatur- og
  fokusreturforløp.
- Hele matrisen, de tre kritiske E2E-flytene og begge produksjonsroutematriser er grønne.
  Cloudflare- og GitHub-artefaktenes CSS beholder eksakt SWP-0.1-assetnavn, råstørrelse og
  gzipstørrelse; checkpointet endrer verken produktmarkup, produktstyling eller backend.
- Tredje SWP-0-checkpoint har etablert en versjonert, maskinlesbar guardkontrakt med ti stabile
  regel-ID-er. Kontrakten skiller identitetsnøytrale strukturutilities fra semantiske visuelle
  theme-roller og registrerer Bits-/UI-eiere, CSS-importer, custom properties, cascade layers og
  det lukkede visualiseringsunntaket for datadrevet geometri.
- Svelte- og PostCSS-AST-analysatoren kjøres foreløpig bare mot 23 små fixtures med virtuelle
  produksjonsstier. Hver regel har minst én positiv og én negativ fixture; manifestet beviser
  eksakt regel-ID og diagnostic for importgrenser, featurestyling, UI-overstyring, utilities,
  dynamiske klasser, `@apply`, globale selectors, `!important`, custom properties og layers.
- Guardfixturene er eksplisitt utelukket fra Tailwinds kildeskanning. Den regenererte baselinen
  har én ekstra konfigurasjonslinje, men fortsatt 780 CSS-regler, 846 selectors, 2233 legacyavvik
  og samme produksjons-CSS-assetnavn, råbyte og gzipstørrelse som SWP-0.1. Produktkode, markup,
  produktstyling og backend er uendret.

## Nåtilstand

- SvelteKit er den aktive dev-, test-, preview- og produksjonsbuilden.
- Login, vilkår, root-feil/404, de tre beskyttede policyflatene, booking, Mine tider, Min side,
  Arrangementer, Nyheter, Baner, Grener, Klubb- og medlemskapsinnstillinger,
  Arrangementadministrasjon, Brukere, Kunngjøringsadministrasjon og Statistikk er reelle
  Svelte-featureflater. Ingen Svelte-routeplaceholdere gjenstår.
- React-kilden, React-roten og alle kompatibilitetsbroer er fjernet. `main` og tidligere lokale
  checkpoints er historisk referanse dersom gammel adferd må inspiseres.
- Contracts, ren domenelogikk og platformkjerne er eneste autoritative implementasjoner; parallelle
  legacybaner finnes ikke lenger.
- Auth, tenant, Query og session guards er autoritativt SvelteKit-fundament. Offentlig login,
  callback-retur, vilkår, root-feil, hele sperre → kunngjøring → medlemskap-rekkefølgen og booking
  med bootstrap samt Mine tider, Min side, Arrangementer og Nyheter er migrert. Baner, Grener og
  deres felles arbeidsområde, Klubb- og medlemskapsinnstillinger, Arrangementadministrasjon,
  Brukere, brukersperre, Kunngjøringsadministrasjon og Statistikk er implementert med typed
  API-/Query-/mutationgrenser, lokal arbeidsflyt, validering og regler, og er checkpointgodkjent
  etter full maskinell og visuell port.
- WP-4 er fullført. Tokens, font, lyst/mørkt tema, offentlige handlinger, Icon-, tekst-, Select-,
  Date-/Calendar-, Tabs- og Rich-text-kontroller samt Page-, Section-, feedback-, Form-, Settings-,
  Dialog-, Document-, Navigation- og Collection-patternene inkludert sammensatte rader og
  filterkomposisjon er autoritative.
- WP-5 er fullført. Responsiv shellramme, loadinggeometri, delt session-queryeierskap,
  tenantidentitet, auth-/kapabilitetsstyrt navigasjon, routeaktivitet, tema, konto og Mer er
  autoritative SvelteKit-flater.
- WP-6 er fullført. Alle elleve featurecheckpoints er migrert til offentlige Svelte-featureinnganger
  og tynne routes uten gjenværende routeplaceholdere eller backendendringer.
- WP-7 er fullført. Route-/featureparitet, runtimeparitet, kritiske automatiserte E2E-flyter,
  produksjonsbevis, React-fjerning og CSS-/driftsopprydding er bevist med grønn sluttport.
- Etterreviewen mot gjeldende Svelte 5-, SvelteKit- og Vite-praksis er dokumentert i
  `docs/architecture-conformance-review.md`. Runes, ren `load`, stateeierskap, feature-/UI-grenser,
  lazy loading, static hosting og produksjonsrouting er i samsvar med den godkjente arkitekturen.
- Pre-module recovery kan ikke lenger slette origin-delt `localStorage`, `sessionStorage` eller
  Cache Storage. Den henter bare fersk HTML/oppstartsressurser og bruker én privat cooldown-nøkkel;
  ADR-005 og arkitekturkontrollen gjør unntaket eksplisitt og permanent.
- Bekreftet død logikk, lytterstate og unødvendige offentlige eksportflater er fjernet. Knip finner
  ingen ubrukte runtimefiler, verdi-eksporter eller direkte avhengigheter; komplette, foreløpig
  ukonsumerte transporttyper beholdes bevisst som backendkontrakt.
- Gamle React-/buildspor (`.lintstagedrc.js`, `copy-404.js`, root `vite-env.d.ts` og
  `tsconfig.tsbuildinfo`) er fjernet og lagt til i legacykontrollens forbudsliste.
- Vite er oppdatert til 8.2.2. Query-devtools er flyttet ut av runtimeavhengighetene og inn i
  `devDependencies`; Svelte 5, SvelteKit og Svelte-Vite-pluginen var allerede oppdatert.
- Sentral CSS og pakkegraf har bare aktive Svelte-konsumenter; den maskinelle kontrollen håndhever
  denne toveis rekkevidden videre.
- SWP-0 er fullført. Kildegjeld, produksjonsstørrelse og 106 visualiseringskandidater er målt;
  elleve visuelle/interaktive referanser er frosset; og ti stabile stylingregler er bevist gjennom
  positive og negative AST-fixtures før første visuelle endring.
- Første SWP-1-checkpoint har skilt rå `--aas-*`-identitet, semantiske produktroller og Tailwind-
  eksponering eksplisitt. `@theme inline` projiserer 101 farge-, typografi-, radius-, skygge-,
  spacing- og kontrollroller uten direkte råpalett eller lokal themevariant.
- Guardkontrakten har schemaVersion 2 og kobler 239 eksakte utilitynavn til én Tailwind namespace
  og én eksisterende produktvariabel. Tailwind-kompilering og custom-property-oppløsning beviser
  alle mappingene; 43 eksponerte roller endrer beregnet verdi mellom lyst og mørkt theme.
- Theme-kontrakten er aktiv og testet mot produksjons-CSS, mens de ti kildeguardene fortsatt kjøres
  bare mot fixtures frem til SWP-1.3. Cascade, produktmarkup og backend er ikke endret.
- Den aktive CSS-en er funksjonelt ryddet, men ikke målarkitekturen for styling: Tailwind brukes
  foreløpig hovedsakelig som Preflight/theme-bro, mens produktreglene ligger i globale selectorfiler.
  Dette migreres familievis etter SWP-planen uten visuell redesign.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                |
| ------------------------------------- | ------------------------------------------------- |
| Base branch                           | `main`                                            |
| Fastslått basecommit                  | `5287c5e`                                         |
| Siste semantiske checkpoint           | `feat(styling): establish SWP-1.1 theme contract` |
| Lokale commits foran base             | 45                                                |
| Forventede ucommitterte frontendfiler | Ingen etter checkpoint-commit                     |
| Neste planlagte checkpoint            | SWP-1.2 Tailwind cascade og base                  |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Start bare **SWP-1 checkpoint 2 — Tailwind cascade og base**:

1. Les hele SWP-1 og ADR-006 på nytt, deretter `src/index.css`,
   `src/styles/design-system.css`, alle fem CSS-filer under `src/styles/design-system/`, theme-
   kontrakten og cascade-fixturene. Ikke koble analysatoren til produksjonstreet i dette
   checkpointet.
2. Legg themevariabler, Preflight-/dokumentbase, produktkomponenter og utilities konsekvent i
   Tailwinds etablerte `theme`, `base`, `components` og `utilities`-lag. Bevar importrekkefølgen og
   det observerbare uttrykket; ikke flytt selectors til Svelte-markup ennå.
3. Fjern de 91 ulagrede reglene ved å gi dem korrekt lageier. De tre autoritative theme-reglene,
   de 87 legacyreglene i `patterns.css` og reduced-motion-regelen i `responsive.css` skal ende i
   registrert lag uten nye selectors, `!important`, rå deklarasjoner eller baselinegjeld.
4. Utvid cascade-fixturene og smale kontrakttester slik at alle globale produksjonsregler kan
   klassifiseres i et registrert lag. De øvrige produksjonstre-guardene forblir utsatt til
   SWP-1.3.
5. Kjør theme-/cascade-/guardtestene, `npm test`, `npm run check`, stylingbaselinen, begge
   produksjonsbuildene og hele den visuelle referansematrisen. Oppdater statusen til SWP-1.3,
   opprett én lokal grønn commit og stopp før fulltrekoblingen.

## Arbeidspakkeregister

| Arbeidspakke                     | Status   | Port/resultat                                                |
| -------------------------------- | -------- | ------------------------------------------------------------ |
| WP-0 Styring og baseline         | Fullført | Dokumentgrunnlag, React-baseline og komplett adferdsinventar |
| WP-1 Build og routes             | Fullført | Build, routes, hostingvarianter og arkitekturkontroll grønn  |
| WP-2 Contracts/domain/platform   | Fullført | Contracts, ren domain, fetch/API, 401 og adapters grønne     |
| WP-3 Auth/tenant/serverdata      | Fullført | Auth, tenant, Query, guards, 401 og base path grønne         |
| WP-4 UI-fundament                | Fullført | Alle kartlagte UI-familier og filterkomposisjon er grønne    |
| WP-5 App-shell                   | Fullført | Shell, navigation, routeaktivitet, konto og Mer grønne       |
| WP-6 Featuremigrering            | Fullført | Elleve checkpoints og alle Svelte-featureflater er grønne    |
| WP-7 Paritet og produksjonsbytte | Fullført | Paritet, React-fjerning, CSS, drift og sluttport grønne      |
| SWP-0 Baseline og guardkontrakt  | Fullført | Baseline, referanse og ti fixturetestede guardregler grønne  |
| SWP-1 Theme og guards            | Aktiv    | Theme-kontrakt grønn; neste er cascade/base i SWP-1.2        |
| SWP-2 UI-primitives              | Venter   | Tailwind-konvertering bak stabil primitivegrense             |
| SWP-3 Produktpatterns            | Venter   | Semantiske familier migreres i avhengighetsrekkefølge        |
| SWP-4 App-shell/navigation       | Venter   | Responsiv shell og navigation etter stabile patterns         |
| SWP-5 Features og legacy-CSS     | Venter   | Visualiseringsunntak og siste globale selectors              |
| SWP-6 Komponent-/API-opprydding  | Venter   | Utføres etter at stylingeierskap er synlig                   |
| SWP-7 Uavhengig sluttreview      | Venter   | Kald audit og målt vellykket/delvis/ikke vellykket resultat  |

## Featureregister

| Gruppe                       | Status   | Merknad                                                        |
| ---------------------------- | -------- | -------------------------------------------------------------- |
| Auth, policy, feil og guards | Fullført | Offentlige og beskyttede flater samt guardrekkefølge grønne    |
| Booking og bootstrap         | Fullført | Kjerneflyt, mutationer og fallback grønne                      |
| Mine tider og Min side       | Fullført | Beskyttet kontoflyt, mutationer og persondata grønne           |
| Arrangementer og Nyheter     | Fullført | Offentlig/innlogget innhold, deeplink og trygg feed grønne     |
| Baner og Grener              | Fullført | Delt adminarbeidsområde, mutations og nettlesermatrise grønne  |
| Klubb og medlemskap          | Fullført | Profil, medlemsstatus, mutations og nettlesermatrise grønne    |
| Arrangementadministrasjon    | Fullført | Editor, staging, mutations og nettlesermatrise grønne          |
| Brukere og sperre            | Fullført | Roller, sperrer, mutations og nettlesermatrise grønne          |
| Kunngjøringer og editor      | Fullført | Riktekst, bekreftelser, mutations og nettlesermatrise grønne   |
| Statistikk                   | Fullført | Filtre, sammenligning, visualisering og nettlesermatrise grønn |

## Åpne blokkeringer

Ingen åpne styling-, migrerings- eller backendblokkeringer. En faktisk ekstern deploy er en separat
oppgave som krever eksplisitt godkjenning samt valg av målhost og produksjonskonfigurasjon.

## Midlertidig kode og kjente avvik

- Playwright-harnessen omskriver bare testkontekstens API-header til `DevelopmentBearer`; vanlig
  dev-, preview- og produksjonstrafikk bruker fortsatt den autoritative `Bearer`-kontrakten.
- Stylingreferansen oppfyller bare testtenantens navngitte klubbendepunkter med faste svar og
  fryser nettleserklokken til 2026-08-23. Utviklingsinnloggingen bruker fortsatt den eksisterende
  lokale backendharnessen; vanlig utviklings- og produksjonsdata er upåvirket.
- Stylingguardanalysatoren kjører med vilje bare mot de 23 isolerte fixturene. Den aktive theme-
  kontrakten valideres separat mot produksjonsfilene, men de ti AST-guardene kobles håndhevende til
  hele treet og `npm run check` først i SWP-1.3 etter at cascade har fått målelige eiere.
- Ingen midlertidige rammeverksadapters eller React-legacy gjenstår. Stylingbaselinen måler sju
  aktive CSS-filer, 6097 linjer, 780 regler og 846 selektorer. Linjeøkningen er bare den eksplisitte
  `@theme inline`-mappingen og semantiske tokenaliaser; produktselectorene er uendret. De brede
  overgangsfilene er fortsatt `patterns.css` med 3500 linjer, `responsive.css` med 503 linjer og
  `feature-compositions.css` med 731 linjer.
- 91 regler er ulagrede: tre autoritative theme-regler, 87 legacyregler i `patterns.css` og én
  global reduced-motion-regel i `responsive.css`. Den foreløpige kaldreviewen tilskrev feilaktig
  begge de to siste gruppene til `patterns.css`; AST-baselinen er nå autoritativ.
- Baseline fører 2233 overgangsavvik: 843 globale produktselektorer, 1117 rå visuelle
  deklarasjoner, 75 `!important`, 49 komponentlokale custom-property-definisjoner, 88 ulagrede
  legacyregler, tre `@apply`, 52 featureklasseforekomster og seks inline styles.
- Tailwind er installert, men aktiv Svelte-markup bruker null utilities. De tre `@apply`-direktivene
  inneholder fem utilitytokens i primitive base-CSS. Dette er planlagt overgang, ikke
  målarkitektur.
- 360 CSS custom-property-definisjoner og 952 referanser er registrert. Økningen er 96 nye
  Tailwind-deklarasjoner utover den gamle femrollesbroen og tolv semantiske geometritokenaliaser;
  de sju nye råverdibærende deklarasjonene ligger i den autoritative theme-filen, mens legacygjeld
  og aktive utilityforekomster er uendret. Statistikk er fortsatt eneste featurestylingflate; dens
  106 unntakskandidater er 52 klasseforekomster, seks inline custom-property-verdier, 32 SVG-
  geometriattributter og 16 semantiske visualiseringsroller. Den varige allowlisten avgjøres først
  i SWP-5.2.
- `npm audit` rapporterer seks lave transitive funn i den aktive SvelteKit-/Bits UI-kjeden og ingen
  moderate, høye eller kritiske funn. Audit tilbyr ikke en kompatibel oppgradering som fjerner de
  lave funnene; foreslåtte majorendringer er derfor ikke brukt som del av lift-and-shift-en.
- `react-is@17.0.2` finnes bare transitivt i testverktøyenes `pretty-format`-kjede. Det ligger ikke
  i produksjonsgrafen eller byggartefaktene og er ikke React-/ReactDOM-runtime.
- Statisk død-kodeanalyse rapporterer bare komplette DTO-typer som ennå ikke har en UI-konsument.
  De beholdes som transportkontrakt i `lib/contracts`; det finnes ingen tilsvarende ubrukt runtimekode.
- SWP-1.1-buildens initial CSS er 21,4 KiB gzip for Cloudflare Pages og 21,5 KiB for GitHub Pages av
  et uendret 50 KiB-budsjett. Den eksplisitte theme-kontrakten legger til henholdsvis 99 og 98 gzip-
  byte fra SWP-0; største lazy JS-chunk er fortsatt 120,5 KiB av 130 KiB.

## Siste verifikasjon

| Kontroll                             | Resultat                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| Prettier på aktiv kode og dokumenter | Bestått 2026-08-23                                                                  |
| Relative dokumentlenker              | Bestått 2026-08-23                                                                  |
| `git diff --check`                   | Bestått 2026-08-23                                                                  |
| `npm test`                           | Bestått 2026-08-23: 89 filer, 321 tester                                            |
| `npm run check`                      | Bestått 2026-08-23: Svelte-typecheck, arkitektur, legacy, design, lint og format    |
| SWP-1.1 theme-kontrakt               | Bestått: 101 roller, 239 utilities og 43 light/dark-skift via Tailwind-kompilering  |
| SWP-1.1 guardfixtures                | Bestått: schemaVersion 2, 23 fixtures, 10 stabile regler og lukket råpalett         |
| SWP-1.1 kildebaseline                | Bestått: 7 CSS-filer, 6097 linjer, 780 regler, 846 selectors og 2233 legacyavvik    |
| SWP-1.1 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-1.1 produksjonsbuild             | Bestått: 21,4/21,5 KiB CSS, 61 JS-chunks og 120,5 KiB største lazy chunk            |
| SWP-0 kildebaseline                  | Bestått 2026-08-23: 7 CSS-filer, 5974 linjer, 780 regler, 846 selectors, 2233 avvik |
| SWP-0 baselinekontrakt               | Bestått 2026-08-23: schemaVersion 1 regenererer deterministisk i Vitest/npm         |
| SWP-0 visualiseringsinventar         | Komplett 2026-08-23: 106 klasse-, style-, SVG- og rollekandidater                   |
| SWP-0 visuell referansematrise       | Bestått 2026-08-23: 11 snapshots over alle stylingfamilier, viewporter og themes    |
| SWP-0 interaksjonskontrakt           | Bestått 2026-08-23: fokus, tastatur, main/h1, overflow og tom warn/error-konsoll    |
| SWP-0 guardkontrakt                  | Bestått 2026-08-23: schemaVersion 1, 10 stabile regel-ID-er og lukket vokabular     |
| SWP-0 guardfixtures                  | Bestått 2026-08-23: 23 positive/negative Svelte-/CSS-fixtures med eksakt diagnostic |
| SWP-0 komplett E2E-port              | Bestått 2026-08-23: 3 kritiske flyter + 11 visuelle/interaktive referanser          |
| SWP-0 produksjons-CSS                | Identisk med SWP-0.1: samme assetnavn, råbyte og 21,3/21,4 KiB gzip                 |
| Asset-recovery-kontrakt              | Bestått 2026-08-23: ferske assets uten sletting av auth-/site storage               |
| Knip dead-code-review                | Bestått 2026-08-23: kun bevisst beholdte transporttyper rapporteres                 |
| Cloudflare Pages-build               | Bestått 2026-08-23: 21,4 KiB initial CSS, root og `index.html`-fallback             |
| GitHub Pages-build                   | Bestått 2026-08-23: 21,5 KiB CSS, `/banebooking` og `404.html`-fallback             |
| Dev og preview                       | Bestått 2026-08-22: previewbase samt dev i multi-/dedikert tenant                   |
| Nettleserrender                      | Bestått 2026-08-23: Statistikk i 4 flater uten overflow eller konsollfeil           |
| SvelteKit-bundle                     | Verifisert 2026-08-23: 61 JS-chunks; lazygrensene og 120,5 KiB-maksimum er grønne   |
| SWP-0 målerisolasjon                 | Verifisert 2026-08-23: CSS og klasseutvalg er byteidentisk med ren `HEAD`           |
| Vite-/dependencygraf                 | Verifisert 2026-08-23: Vite 8.2.2, devtools dev-only, direkte pakkegraf komplett    |
| WP-7 React-fjerningskontroll         | Bestått 2026-08-23: ingen TSX, broer eller React/Axios/Query/Radix-pakker           |
| WP-7 CSS-/tokenrekkevidde            | Bestått 2026-08-23: toveis klasse-, anatomi-, slot- og tokenkontroll                |
| WP-7 direkte pakkegraf               | Bestått 2026-08-23: ingen shadcn, zod, tw-animate eller overflødige Tiptap-entries  |
| `npm audit`                          | 2026-08-23: 6 lave, 0 moderate, 0 høye og 0 kritiske                                |
| WP-7 paritets-/oppryddingsinventar   | Komplett 2026-08-23: 18 routes, states, importgraf, deps og fjerningsrekkefølge     |
| WP-7 runtimeparitetstester           | Bestått 2026-08-23: 5 filer, 13 tester                                              |
| WP-7 kritiske E2E-flyter             | Bestått 2026-08-23: 3 Playwright-flyter, base path og deterministisk opprydding     |
| WP-7 visuelle referanser             | Bestått 2026-08-23: 4 snapshots over roller, viewporter og lyst/mørkt tema          |
| WP-7 produksjonsroutematrise         | Bestått 2026-08-23: 4 routeklasser × root/base, direkte load, refresh og fallback   |
| WP-7 produksjonsbundle               | Bestått 2026-08-23: 37,2–37,3 KiB JS, 21,2 KiB CSS, 120,5 KiB største lazy chunk    |
| WP-0 route-/featureinventar          | Komplett 2026-08-22                                                                 |
| WP-4 fokustester                     | Bestått 2026-08-22: 2 filer, 6 tester for tema, storage og DOM-applikasjon          |
| WP-4 pattern-/a11y-tester            | Bestått 2026-08-22: 1 fil, 6 tester for semantikk, states, retry og axe             |
| WP-4 collection-/a11y-tester         | Bestått 2026-08-22: 1 fil, 16 tester for rows, controls, states, pending og axe     |
| WP-4 form-/a11y-tester               | Bestått 2026-08-22: 1 fil, 6 tester for feltkobling, states, submit og axe          |
| WP-4 settings-/a11y-tester           | Bestått 2026-08-22: 1 fil, 6 tester for rows, valg, tastatur, states og axe         |
| WP-4 dialog-/a11y-tester             | Bestått 2026-08-22: 1 fil, 7 tester for fokus, dismiss, actions, pending og axe     |
| WP-4 select-/a11y-tester             | Bestått 2026-08-22: 1 fil, 6 tester for form, tastatur, states, fokus og axe        |
| WP-4 document-/a11y-tester           | Bestått 2026-08-22: 1 fil, 5 tester for landmark, headings, facts, lenker og axe    |
| WP-4 navigation-/a11y-tester         | Bestått 2026-08-22: 1 fil, 7 tester for lenker, aktiv state, handlinger og axe      |
| WP-4 date-/a11y-tester               | Bestått 2026-08-23: 1 fil, 9 tester for form, tastatur, grenser, fokus og axe       |
| WP-4 editor-/a11y-tester             | Bestått 2026-08-23: 1 fil, 8 tester for JSON, tom verdi, tabell, fokus og axe       |
| WP-5 app-shell-/a11y-tester          | Bestått 2026-08-22: 1 fil, 4 tester for landmarks, fokus, loading og axe            |
| WP-5 navigation-/a11y-tester         | Bestått 2026-08-23: 2 filer, 12 tester for state, routes, fokus, overlay og axe     |
| WP-6 auth-/policy-/a11y-tester       | Bestått 2026-08-23: 5 filer, 11 tester for login, OTP, callback, storage og vilkår  |
| WP-6 protected policy-/guardtester   | Bestått 2026-08-23: 5 filer, 16 tester for API, guard, mutation, validation og axe  |
| WP-6 booking-/bootstraptester        | Bestått 2026-08-23: 5 filer, 28 tester for API, state, mutation, rollback og axe    |
| WP-6 konto-/persondatatester         | Bestått 2026-08-23: 5 filer, 16 tester for API, state, mutation, rollback og axe    |
| WP-6 offentlig innhold-tester        | Bestått 2026-08-23: 6 filer, 14 tester for API, query, modell, deeplink og axe      |
| WP-6 Baner-/Grener-tester            | Bestått 2026-08-23: 4 filer, 14 tester for API, query, modell, editor og axe        |
| WP-6 Baner-/Grener-nettleser         | Bestått 2026-08-23: 2 routes × 2 viewporter × 2 temaer, interaksjon og tom konsoll  |
| WP-6 Klubb-/medlemskapstester        | Bestått 2026-08-23: 6 filer, 22 tester for API, query, modell, tabs, dato og axe    |
| WP-6 Klubb-/medlemskapsnettleser     | Bestått 2026-08-23: 2 faner × 2 viewporter × 2 temaer, dato, validering og konsoll  |
| WP-6 Arrangement-admin-tester        | Bestått 2026-08-23: 3 filer, 8 tester for API, modell, staging, steg og axe         |
| WP-6 Arrangement-admin-nettleser     | Bestått 2026-08-23: 2 viewporter × 2 temaer, mutations, konflikt, fokus og konsoll  |
| WP-6 Bruker-admin-tester             | Bestått 2026-08-23: 4 filer, 10 tester for API, query, modell, mutations og axe     |
| WP-6 Bruker-admin-nettleser          | Bestått 2026-08-23: 2 viewporter × 2 temaer, filtre, dialoger, fokus og konsoll     |
| WP-6 Kunngjøring-admin-tester        | Bestått 2026-08-23: 5 filer, 11 tester for API, query, modell, riktekst og axe      |
| WP-6 Kunngjøring-admin-nettleser     | Bestått 2026-08-23: 2 viewporter × 2 temaer, editor, mutations, fokus og konsoll    |
| WP-6 Statistikk-tester               | Bestått 2026-08-23: 4 filer, 12 tester for API, query, modell, states og axe        |
| WP-6 Statistikk-nettleser            | Bestått 2026-08-23: 2 viewporter × 2 temaer, faner, filtre, fokus og tom konsoll    |

## Filer i siste checkpoint

- `src/styles/design-system/tokens.css` med eksplisitt skille mellom rå klubbidentitet, semantiske
  produktfarger, geometri og den eksisterende kompatibilitetsbroen; ingen aktiv verdi er endret
- `src/index.css` med komplett `@theme inline`-projeksjon av 101 godkjente farge-, typografi-,
  radius-, skygge-, spacing- og kontrollroller
- `scripts/styling-guards/contract.json` schemaVersion 2 med eksakte Tailwind namespaces,
  produktvariabelmapping og 239 godkjente utilities; de ti stabile regel-ID-ene er uendret
- kontraktvalidering i `contract.mjs` og namespace-aware utilityanalyse i `utility-policy.mjs`,
  inkludert positiv fixturedekning for farge, font, typografi, spacing og kontrollbredde
- `theme-contract.mjs`, `scripts/check-styling-theme-contract.mjs`, npm-scriptet og
  `src/styling-theme-contract.test.ts`, som kompilerer alle utilities og løser produktvariablene i
  lyst og mørkt theme
- regenerert `docs/styling-baseline.json` med uendret selector-, regel-, legacy- og
  visualiseringsgjeld, samt denne statusen med SWP-1.2 som neste eksakte steg

`/start` bruker commit-diffen som autoritativ kilde for nøyaktig innhold og `git status` for
pågående arbeid etter checkpointet.
