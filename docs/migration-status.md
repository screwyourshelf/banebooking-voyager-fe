# Migreringsstatus

> **Status:** Pågår — rammeverksløftet og SWP-0–SWP-4 er fullført; SWP-5.1–SWP-5.4 er fullført
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** SWP-5 — features, visualisering og siste legacy-CSS
>
> **Sist oppdatert:** 2026-08-24

## Mål for arbeidspakken

Theme-, cascade-, fixture-, produksjonstre- og baselineportene er håndhevende i `npm run check`, og
alle SWP-2-primitivecheckpointene, SWP-3-produktpatterncheckpointene og hele SWP-4 er migrert til
statisk analyserbare Tailwind-utilities. SWP-5.1 kaldavstemte alle routes/features, og SWP-5.2 har
flyttet statistikkens statiske presentasjon til typed offentlig UI. De 106 overgangskandidatene er
redusert til 38 faktiske geometrier etter eierkartet i
[`swp-5-route-feature-audit.md`](./swp-5-route-feature-audit.md). SWP-5.3 slettet den tomme
featurekomposisjonsfilen, og SWP-5.4 samlet dokumentbase, motion og keyframes i den eksplisitte
globale `base.css`-flaten før de tre siste legacy-stilarkene ble slettet. Fortsett med SWP-5.5:
fjern transition-baselinen og lås den varige allowlisten til faktisk datadrevet geometri. Bevar
produktadferd og backend.

## Aktiv stylingretning

- Den opprinnelige SvelteKit-lift-and-shift-en og arkitekturreviewen er fullført og forblir grønn
  baseline.
- [`ADR-006`](./adr/006-tailwind-styling-and-theme-ownership.md) gjør Tailwind v4, semantiske
  themes og offentlig UI-eierskap til målarkitektur for styling.
- [`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md) deler arbeidet i SWP-0–SWP-7
  og er den aktive utførelsesplanen for `/start`.
- Den globale CSS-flaten er ferdig avgrenset til Tailwind-inngangen, theme og dokumentert base.
  Transition-baselinen kan bare reduseres og skal fjernes i SWP-5.5; geometri føres separat i en
  lukket, varig allowlist.
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
- SWP-0-baselinens schemaVersion 1 førte hvert legacyavvik med eksakt fil, linje, eierfamilie,
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
- I SWP-0 ble Svelte- og PostCSS-AST-analysatoren bare kjørt mot 23 små fixtures med virtuelle
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
- SWP-1.1 har skilt rå `--aas-*`-identitet, semantiske produktroller og Tailwind-
  eksponering eksplisitt. `@theme inline` projiserer 101 farge-, typografi-, radius-, skygge-,
  spacing- og kontrollroller uten direkte råpalett eller lokal themevariant.
- Guardkontrakten har schemaVersion 2 og kobler 239 eksakte utilitynavn til én Tailwind namespace
  og én eksisterende produktvariabel. Tailwind-kompilering og custom-property-oppløsning beviser
  alle mappingene; 43 eksponerte roller endrer beregnet verdi mellom lyst og mørkt theme.
- SWP-1.2 har gitt samtlige 779 globale CSS-regler eksplisitt eie i Tailwinds `theme`, `base`
  eller `components`-lag. Den aktive cascade-kontrakten oppdager alle sju produksjonsstilark,
  avviser uregistrerte filer, ulagrede regler og ukjente lag, og er dekket av en smal Vitest-port.
- De tidligere 91 ulagrede reglene er flyttet uten markup- eller selectoromskriving. To responsive
  paddingdeklarasjoner og én regel som tidligere var fullstendig overskrevet av den ulagrede
  rad-density-kontrakten, er slettet for å bevare den verifiserte geometrien etter lagflyttingen.
  Alle elleve visuelle referanser er fortsatt pikselidentiske.
- SWP-1.3 oppdager deterministisk alle 179 produksjonskilder under `src`: samtlige `.css`-filer og
  alle produksjons-`.svelte`-filer, med bare `*.test.svelte` eksplisitt utelatt. Fixture- og
  generated-navn under produksjonsroten er bevist som vanlige, analyserte kilder.
- De ni AST-reglene utenom den separate cascade-porten avstemmes mot 1104 eksakte diagnostics med
  stabil regel-ID, fil, linje, kolonne og melding i stylingbaseline schemaVersion 2. Baseline fører
  913 CSS-application-, 139 custom-property- og 52 visualiseringsfunn; de øvrige seks håndhevede
  regel-ID-ene er null, og de 106 visualiseringskandidatene forblir et separat inventar til SWP-5.2.
- Theme-, cascade-, fixture-, produksjonstre- og komplett baselinekontroll inngår nå samlet i
  `npm run check`. Kontraktstesten beviser grønt nåtre og at én ny forekomst for hver av de ni
  produksjonsreglene feiler med eksakt lokasjon; smal kildeoppdagelse og baselinefasen valideres
  maskinelt mot brede unntak.
- SWP-1 er fullført uten produktmarkup-, CSS-, selector-, UI- eller backendendring. Alle 323 tester,
  tre kritiske E2E-flyter, elleve pikselidentiske visuelle referanser, full check og begge
  produksjonsbuildene er grønne.
- SWP-2.1 har flyttet basekontrollene Icon, Button/ButtonLink, Input og Textarea til statiske
  Tailwind-klasser i eierkomponentene. Typed props, native formdata, bindbar verdi, ARIA, fokus,
  disabled/error-state og `data-ui-primitive`-anatomi er bevart; den nye `compact-icon`-størrelsen
  gjør den eksisterende 2rem-geometrien eksplisitt uten en offentlig klasse-/stylegrense.
- 23 erstattede primitive-CSS-regler og 24 selectors er slettet. De tre siste `@apply`-direktivene
  er erstattet av ekvivalente semantiske base-deklarasjoner, og theme-kontrakten eksponerer nå 121
  roller, 272 tillatte utilities og 51 verifiserte light/dark-skift.
- SWP-2.1-baselinen er redusert fra 6106 til 5998 CSS-linjer, 779 til 756 regler, 845 til 821
  selectors og 2142 til 2076 legacyavvik. Alle elleve fryste referanser er pikselidentiske, 326
  tester, tre kritiske flyter, åtte produksjonsruter og begge hostbuildene er grønne.
- SWP-2.2 har flyttet ChoiceButton, Switch, Radio og de interne Bits UI-accordionwrapperne til
  statiske Tailwind-klasser i primitiveeierne. Valgt/ikke valgt, checked, disabled, fokus,
  radio-formdata, labelkobling, kontrollert enkeltutviding, accordion-tastatur og
  `data-ui-primitive`-anatomi er bevart uten ny offentlig klasse-/stylegrense.
- Choice-/selection-, switch-, radio- og accordiongeometrien er nå 30 nye semantiske theme-roller.
  Kontrakten eksponerer totalt 151 roller og 307 godkjente utilities med 63 verifiserte
  light/dark-skift. Settings-, Collection- og kontrollflatekomposisjonen beholder sine eksisterende
  uttrykk gjennom navngitte `--app-choice-control-*`-roller frem til SWP-3.
- 14 erstattede primitive-CSS-regler og 19 selectors er slettet. Designsystemkontrollen godtar nå
  en primitiveanatomi når den enten har registrert sentral CSS eller Tailwind-klasser på det eksakte
  eier-elementet; stylingguardene validerer fortsatt hver klasse mot det lukkede vokabularet.
- SWP-2.2-baselinen er redusert fra 5998 til 5939 CSS-linjer, 756 til 742 regler, 821 til 802
  selectors og 2076 til 2025 legacyavvik. Alle elleve fryste referanser er pikselidentiske, 329
  tester, tre kritiske flyter, åtte produksjonsruter og begge hostbuildene er grønne.
- SWP-2.3 har flyttet Select, DialogPrimitive, TabsPrimitive, CalendarBody, SingleCalendar,
  MultipleCalendar, DatePicker og MultiDatePicker til statiske Tailwind-klasser i
  primitiveeierne. Typed props, native formdata, Bits UI-verdi/state, typeahead, roving fokus,
  fokusfelle/-retur, Escape/utenfor-klikk, portal, norsk kalender, min-/maksgrenser og enkelt-/
  flervalg er bevart uten ny offentlig klasse-/stylegrense.
- Select-/date-/calendar-/dialog-/tabsfamilien har fått semantiske roller for kontrollflater,
  flytende flater, overlay, geometri, radius, skygge og state. Tre registrerte strukturelle
  `@utility`-regler kapsler Bits UI sine runtime-mål under Tailwind-inngangen; theme-kontrakten
  eksponerer totalt 201 roller og 363 godkjente utilities med 68 verifiserte light/dark-skift.
- 66 erstattede globale CSS-regler og 69 selectors er slettet. `primitives.css` inneholder nå bare
  RichTextEditorens 23 primitive-/tredjepartsregler, og den primitiveide responsive
  editor-dialogregelen er fjernet. CollectionControls og Navigationens Mer-bunnflate bevarer
  uttrykket gjennom navngitte felt-/dialogroller frem til sine SWP-3-/SWP-4-checkpoints.
- SWP-2.3-baselinen er redusert fra 5939 til 5499 CSS-linjer, 742 til 676 regler, 802 til 733
  selectors og 2025 til 1836 legacyavvik. Alle elleve fryste referanser er pikselidentiske, 329
  tester, tre kritiske flyter, åtte produksjonsruter og begge hostbuildene er grønne.
- E2E-fixturen venter nå på aktive API-route-handlers før testdata ryddes. Booking-/avbestillings-
  flyten blir dermed deterministisk uten endring i produkttrafikk eller backend.
- SWP-2.4 har flyttet RichTextEditor-primitivens mount, genererte ProseMirror-rot, dokumentflyt,
  headings, lister, sitat, lenker, markering, tabell og selected-cell-state til statiske
  Tailwind-klasser hos primitiveeieren. Seksten navngitte custom variants skoper de genererte
  tredjepartsnodene uten å flytte klasser inn i Tiptap-adapteren eller åpne en offentlig
  `class`/`style`-grense.
- Den serialiserte JSON-grensen, bindbar controlled state, tomverdi, lazy browserimport,
  controller-/Tiptap-livssyklus, formdata, FormField-ARIA, fokus, tastatur, disabled/pending,
  ugyldig-innhold-feilgrense og alle toolbar-/tabellkommandoer er uendret. Patternkomposisjonen i
  `RichTextEditor` og `RichTextEditorToolbar` står urørt til SWP-3.4.
- Seksten semantiske riktekstroller er lagt til theme-kontrakten for geometri, spacing, typografi,
  sitatkant og lenkeunderstrek. Kontrakten eksponerer totalt 217 roller og 379 godkjente utilities
  med 68 verifiserte light/dark-skift.
- RichTextEditorens 17 regler og 18 selectors er slettet fra `primitives.css`; filen inneholder nå
  bare de seks eksisterende base-reglene. SWP-2.4-baselinen er redusert fra 5499 til 5451 CSS-linjer,
  676 til 659 regler, 733 til 715 selectors og 1836 til 1796 legacyavvik.
- Alle 329 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne. SWP-2-kvalitetsporten er nådd uten
  feature-, pattern-, controller-, Tiptap- eller backendendringer.
- SWP-3.1 har flyttet `Page`, `PageLoading`, `PageStatus`, `Section`, `Feedback`, `ErrorState` og
  `Document`-familien til statiske Tailwind-klasser hos de offentlige patterneierne. Typed props og
  snippets, `main`/article-/section-landmarks, headinghierarki, live regions, tone-states,
  loadinggeometri/-animasjon, dokumentflyt og mobil/desktop-skift er bevart uten ny offentlig
  `class`/`style`-grense.
- Semantiske Page-, loading-, Section-, feedback- og Document-roller løfter tidligere rå geometri,
  typografi, overflater og motion inn i theme-kontrakten. Theme-porten validerer nå også registrerte
  egendefinerte Tailwind-utilities og eksponerer totalt 299 roller, 486 godkjente utilities og 84
  verifiserte light/dark-skift.
- 72 erstattede globale CSS-regler og 77 selectors er slettet. App-shellens responsive
  Page-komposisjon, Collectionens feedbackplassering, RichTextContent og fire datadrevne
  statistikk-gap står eksplisitt hos sine senere SWP-3.3/SWP-3.4/SWP-4/SWP-5.2-eiere.
- SWP-3.1-baselinen er redusert fra 5451 til 5141 CSS-linjer, 659 til 587 regler, 715 til 638
  selectors og 1796 til 1597 legacyavvik. Alle 330 tester, tre kritiske flyter, elleve
  pikselidentiske visuelle referanser, åtte produksjonsruter, full check og begge hostbuildene er
  grønne uten feature- eller backendendringer.
- SWP-3.2 har flyttet `Form`, `FormFields`, `FormField`, `FormActions`, `FormSubmit`, `FormSteps` og
  hele `Settings*`-familien til statiske Tailwind-klasser hos de offentlige patterneierne. Typed
  props/snippets, native submit, felt-/label-/beskrivelses-/feilkobling, required/invalid,
  disabled/pending, stegnavigasjon, valg/range, Settings-toner og mobil/desktop-skift er bevart uten
  ny offentlig `class`/`style`-grense.
- Semantiske Form-/Settings-roller og skoperte custom variants eier nå geometri, spacing,
  typografi, overflater, states og motion. FormSteps- og radioindikatorene er eksplisitte,
  presentasjonsløse spans, mens EditorDialog beholder en smal senere-eid komposisjon som bare
  overstyrer de semantiske FormActions-rollene for sticky safe-area-flaten.
- 98 erstattede globale CSS-regler og 100 selectors er slettet fra `patterns.css` og
  `responsive.css`. Form-/FormSteps-broene i `Button` er fjernet; Collection-, Dialog/EditorDialog-,
  Tabs-, RichTextEditor-, Select-/Calendar-, app-shell-, feature- og backendgrensene er ellers
  urørt.
- SWP-3.2-baselinen er redusert fra 5141 til 4696 CSS-linjer, 587 til 489 regler, 638 til 538
  selectors og 1597 til 1356 legacyavvik. Alle 333 tester, tre kritiske flyter, elleve
  pikselidentiske visuelle referanser, åtte produksjonsruter, full check og begge hostbuildene er
  grønne uten feature- eller backendendringer.
- SWP-3.3 har flyttet `Collection`, `CollectionToggle`, `CollectionControls`, `CollectionList`,
  `CollectionGroup`, `CollectionStatus`, state-/loadingfamilien og hele `CollectionRow`-familien til
  statiske Tailwind-klasser hos patterneierne. Typed props/snippets, header/scope/footer,
  filter-disclosure, søk/sortering/reset/selection, list-/groupsemantikk, alle fem radinteraksjoner,
  pending/disabled og mobil/desktop-skift er bevart uten ny offentlig `class`/`style`-grense.
- Semantiske Collection-roller og eksplisitt bundne custom variants eier nå geometri, spacing,
  typografi, overflater, states og motion. `AccordionListPrimitive` har en smal typed
  Collection-presentasjon fordi Bits UI eier root-noden, mens åpen accordion-state og
  indikatorrotasjon forblir innkapslet i `AccordionRowPrimitive`.
- Collection-toggle-, reset- og Feedback-broene er fjernet. `Button` beholder bare de senere-eide
  Dialog/EditorDialog- og tonekontrollbroene; ChoiceButton-, DatePicker- og feltkomposisjon er
  skopet fra `CollectionControls` gjennom navngitte variants og semantiske roller.
- 171 erstattede globale CSS-regler og 186 selectors er slettet fra `patterns.css` og
  `responsive.css`. SWP-3.3-baselinen er redusert fra 4696 til 3635 CSS-linjer, 489 til 318 regler,
  538 til 352 selectors og 1356 til 932 legacyavvik.
- Alle 335 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne uten feature- eller backendendringer.
- SWP-3.4 har flyttet `Dialog`, `EditorDialog`, `Tabs`, `RichTextEditor`,
  `RichTextEditorToolbar` og `RichTextContent` til statiske Tailwind-klasser hos de offentlige
  patterneierne. Typed props/snippets, dialogportal, kontrollert state, fokusfelle/-retur,
  Escape/utenfor-klikk, pending/disabled, Tabs-ARIA/-tastatur, serialisert riktekst,
  toolbarstates og mobil/desktop-skift er bevart uten ny offentlig `class`/`style`-grense.
- `TabsPrimitive` har en smal typed section-presentasjon fordi Bits UI eier root-, list-, trigger-
  og contentnodene. Dialogens lukkeknapp, EditorDialogs tilbake-/Form-/Settings-/sticky
  safe-area-komposisjon og editorens tonekontroller er bundet gjennom 22 skoperte custom variants;
  `Button` har ikke lenger mønsterkunnskap eller midlertidige `data-part`-broer.
- Semantiske Dialog-, EditorDialog-, Tabs-, riktekstflate- og toolbarroller eier nå geometri,
  spacing, typografi, overflater, states og responsive skift. Theme-kontrakten eksponerer totalt
  509 roller, 751 godkjente utilities og 107 verifiserte light/dark-skift.
- 74 erstattede globale CSS-regler og 88 selectors er slettet fra `patterns.css` og
  `responsive.css`. SWP-3.4-baselinen er redusert fra 3635 til 3235 CSS-linjer, 318 til 244 regler,
  352 til 264 selectors og 932 til 653 legacyavvik; `!important` er redusert fra 68 til 14.
- Alle 336 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne uten feature- eller backendendringer.
- SWP-3.5 har flyttet `ScheduleTime` og `Weather` til statiske Tailwind-klasser hos de offentlige
  patterneierne. Typed props/snippets, tidsformat, tabular numbers, accessory, symbol-URL,
  temperatur-/vindenheter, kompakt/full presentasjon og tom værstate er bevart uten ny offentlig
  `class`/`style`-grense.
- `MetricGrid` eier nå bare sitt delte responsive fire-/trekolonneskift gjennom statiske klasser.
  Basegridet, hele `Metric`-kortet, statistikkrollene og loading-/diagramgeometrien forblir eksakt
  registrert til SWP-5.2; den tidligere kombinerte responsive regelen er splittet langs denne
  eiergrensen uten featureendring.
- Åtte semantiske ScheduleTime-, Weather- og MetricGrid-roller eier nå spacing, ikonstørrelse,
  typografivekt, linjehøyde og bokstavavstand. Den foreldreløse kompatibilitetsrollen
  `--muted-foreground` er fjernet etter at Weather tok i bruk den autoritative `ink-soft`-rollen;
  theme-kontrakten eksponerer totalt 517 roller og 759 godkjente utilities med 107 verifiserte
  light/dark-skift.
- Ti erstattede globale CSS-regler og elleve selectors er slettet fra `patterns.css` og
  `responsive.css`. SWP-3.5-baselinen er redusert fra 3235 til 3186 CSS-linjer, 244 til 234 regler,
  264 til 253 selectors og 653 til 630 legacyavvik.
- Alle 341 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne uten feature- eller backendendringer.
- SWP-4.1 har flyttet `Navigation`, `NavigationSection`, `NavigationList`, `NavigationLink`,
  `NavigationAction`, `NavigationIdentity`, `NavigationLoading` og `NavigationOverlay` til statiske
  Tailwind-klasser hos patterneierne. En intern typed navigation-context gjør layout og overflate
  eksplisitt uten dype shell-/overlayselectors; route-, auth- og kapabilitetsutvalg forblir hos
  sessionkonsumenten.
- Sidebar-, bottom-, section- og actions-layout, identity, badges, aktiv/disabled/pending state,
  loading og konto-/Mer-overlay bevarer offentlig API, native lenke-/knappsemantikk, ARIA,
  fokusfelle/-retur og visuell geometri. `DialogPrimitive` har en smal typed `center`/`bottom`-
  presentasjon for standarddialogen, slik at Mer-flaten ikke lenger setter dialogroller gjennom
  `:has` og komponentlokale custom properties.
- 68 erstattede globale CSS-regler og 71 selectors er slettet fra `patterns.css` og
  `responsive.css`. SWP-4.1-baselinen er redusert fra 3186 til 2764 CSS-linjer, 234 til 166 regler,
  253 til 182 selectors og 630 til 447 legacyavvik; visualiseringskandidatene er uendret på 106.
- Alle 342 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne uten feature- eller backendendringer.
- SWP-4.2 har flyttet AppShells frame, desktop-sidefelt, workspace, mobil topbar, main og fast
  bunnnavigasjon til statiske responsive Tailwind-klasser hos `AppShell`. Safe-area-reservasjon,
  sticky/fixed plassering og loadinggeometri bruker navngitte shellroller ved samme 48/64 rem-skift
  som referansen.
- Den diskriminerte ready/loading-kontrakten, snippets, `data-ui`/`data-part`, main-landmark,
  dokumentrekkefølge og Navigation-komposisjonen er uendret. To smale topbar-child-varianter eier
  bare flexfordelingen mellom tenantidentitet og mobilhandlinger; sessionmodellens route-, auth- og
  kapabilitetsutvalg er urørt.
- 16 erstattede globale CSS-regler og 19 selectors er slettet fra `patterns.css` og
  `responsive.css`. SWP-4.2-baselinen er redusert fra 2764 til 2643 CSS-linjer, 166 til 150 regler,
  182 til 163 selectors og 447 til 399 legacyavvik; visualiseringskandidatene er uendret på 106.
- Alle 343 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne uten feature- eller backendendringer.
- SWP-4.3 har flyttet canvas/court, desktopbakgrunnens pseudo-lag, sidebargradient/-skygge,
  workspace/main-flater og Page-/shell-uttrykket til statiske Tailwind-klasser hos `AppShell` og
  `Page`. Elleve semantiske roller holder bakgrunner, tekst, skygger og motion sentralt i theme.
- En intern typed AppShell-context markerer bare reelt shell-nestede Pages. Heading/beskrivelse og
  tittelskygge skifter dermed ved 48/64 rem uten dype globale selectors, mens standalone Pages
  beholder sin vanlige themeflate. Desktop-Page eier selv innlastingsmotion og redusert-motion-state.
- Tenantidentiteten bruker fortsatt Navigation-familiens typed `shell`-surface og verifiserte
  light/dark-roller; menyutvalg, routeaktivitet, fokus og sessionmodell er uendret. Det nå ubrukte
  kompatibilitetsaliaset `--muted` er fjernet.
- 15 erstattede globale CSS-regler og 19 selectors er slettet fra `patterns.css` og
  `responsive.css`. SWP-4.3-baselinen er redusert fra 2643 til 2592 CSS-linjer, 150 til 135 regler,
  163 til 144 selectors og 399 til 363 legacyavvik; visualiseringskandidatene er uendret på 106.
- Alle 345 tester, tre kritiske flyter, elleve pikselidentiske visuelle referanser, åtte
  produksjonsruter, full check og begge hostbuildene er grønne uten feature- eller backendendringer.
- SWP-4.4 har kaldsøkt alle produksjonskilder, globale stilark, theme-roller, custom variants og
  baselinefunn. Alle gjenværende Navigation-/AppShell-/Page-roller, fire child-varianter og fem
  patternkeyframes har en aktiv offentlig UI-eier; `responsive.css` inneholder bare registrert
  statistikkvisualisering for SWP-5.2 og den globale reduced-motion-basen. Ingen global selector
  avhenger lenger av AppShell-/Page-DOM.
- Baselineklassifiseringen følger nå keyframenavn i stedet for den slettede patternfilens gamle
  linjegrenser. Page-, Collection-, Form-, Navigation- og AppShell-motion peker presist på aktiv
  patterneier og SWP-5.4-filopprydding; responsive statistikk peker på SWP-5.2 og global reduced
  motion på SWP-5.4.
- De ubrukte Tailwind-projeksjonene `backdrop-scrim`, `sidebar`-bredde og `sidebar-rail` samt den
  foreldreløse 4,5-rem rail-tokenen er slettet. Den private scrimrollen og sidebarbredden beholdes
  bare som aktive avhengigheter i AppShells sammensatte courtbakgrunn og gridkolonner.
- SWP-4.4-baselinen er redusert fra 2592 til 2588 CSS-linjer og fra 1284/947 til 1280/944
  custom-property-definisjoner/referanser. De 135 reglene, 144 selectorene, 363 legacyavvikene og
  106 visualiseringskandidatene er uendret fordi alle erstattede navigation-/shellselectors allerede
  var slettet ved eiercheckpointene. Theme-kontrakten er strammet til 594 roller og 837 utilities
  med de samme 116 light/dark-skiftene.
- Hele SWP-4-kvalitetsporten er grønn: menyutvalg, rekkefølge, kapabilitetsskjuling, aktiv route,
  fokusrekkefølge, landmarks, mobil/desktop og light/dark er uendret i 345 tester, tre kritiske
  flyter, elleve pikselidentiske snapshots, åtte produksjonsruter og begge hostbuildene.
- SWP-5.1 har kaldsøkt 23 route- og 65 featurekomponenter i produksjon. Den registrerte
  root-CSS-importen er eneste routefunn, og ingen feature utenom statistikk har `class`, `style`,
  `<style>`, CSS-import eller offentlig UI-overstyring.
- De 106 statistikkandidatene er avstemt eksakt til 52 overgangsklasser, seks datadrevne inline
  geometry-verdier, 32 SVG-geometriattributter og 16 produktidentitetsroller. Bare de 38
  geometrifunnene kan bestå etter SWP-5.2; klasse- og rollefunnene skal flyttes til offentlig UI.
- [`swp-5-route-feature-audit.md`](./swp-5-route-feature-audit.md) dokumenterer filvis eier,
  slettesteg og den lukkede SWP-5.2-kontrakten. Auditcheckpointet endrer ikke produktkode, styling,
  theme, API eller backend.
- SWP-5.2 har flyttet `Metric`, `MetricGrid`, resultat-/statuslayout, legends, loading, donut-,
  fordelings-, time- og linjediagram samt responsive sammenligningstabeller til typed offentlig UI.
  Featurelaget leverer nå bare data, de fire navngitte geometry-custom-properties og SVG-koordinater;
  alle 52 featureklasser, 16 `data-stat-role`-broer og overgangsankrene `data-context`, `data-view`
  og `data-slot` er fjernet.
- `DataVisualization`, `DataTable`, `VisualizationLayout`, `VisualizationLegend` og
  `VisualizationLoading` eksponerer statiske semantiske utilities uten offentlig `class`/`style`-
  overstyring. Tre eksplisitt registrerte statistikkfiler beholder bare skopert CSS for bredde,
  høyde, gridkolonner og stroke-dasharray; arkitektur- og stylingguardene lukker unntaket.
- 125 komponentregler og 132 selectors er erstattet og slettet fra
  `feature-compositions.css`/`responsive.css`. Kildebaselinen er redusert fra 2588 til 2038
  CSS-linjer, 135 til 10 regler, 144 til 12 selectors, 363 til 36 legacyavvik og 106 til 38
  visualiseringskandidater.
- SWP-5.3 har bevist at `feature-compositions.css` var tom, fjernet importen, slettet filen og
  fjernet den fra CSS-/baselinekontrakten. Baseline har nå seks CSS-filer og 2033 linjer; bygget CSS,
  regler, selectors, legacyavvik, kandidater og begge produksjonsassettene er byteidentiske med
  SWP-5.2.
- SWP-5.4 har bevart de seks dokumentreglene, den globale reduced-motion-regelen og fem keyframes i
  én dokumentert `base.css`, fjernet de gamle `primitives.css`-, `responsive.css`- og
  `patterns.css`-filene og lukket produksjonslisten til fire autoritative CSS-filer. Kildebaselinen
  har 2037 linjer, ti regler, tolv selectors, ni overgangsavvik og 38 geometrier; begge bygde
  CSS-assets er byteidentiske med SWP-5.2/SWP-5.3.
- Hele SWP-5.2-porten er grønn med 345 tester, elleve pikselidentiske visuelle referanser, full
  check og begge hostbuildene. Initial CSS er 28 350/28 370 gzip-byte innenfor 50 KiB-budsjettet;
  backend, API-er og produktadferd er uendret.
- Den aktive CSS-en har ikke lenger featureeide produktselectors. Tailwind er produkteier for alle
  SWP-2–SWP-4-flater og statistikkpresentasjonen; SWP-5 fortsetter med ren filopprydding og låsing
  av den varige geometriallowlisten uten visuell redesign.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                  |
| ------------------------------------- | --------------------------------------------------- |
| Base branch                           | `main`                                              |
| Fastslått basecommit                  | `5287c5e`                                           |
| Siste semantiske checkpoint           | `refactor(styling): remove legacy stylesheet files` |
| Lokale commits foran base             | 64                                                  |
| Forventede ucommitterte frontendfiler | Ingen etter checkpoint-commit                       |
| Neste planlagte checkpoint            | SWP-5.5 lås varig visualiseringsallowlist           |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Start **SWP-5 checkpoint 5 — fjern transition-baseline og lås visualiseringsallowlist**:

1. Avstem de 619 registrerte produksjonsdiagnostikkene mot ferdig theme-/UI-eierskap og fjern den
   migreringsspesifikke baselinepasseringen når produksjonstreet kan håndheves uten overgangsgjeld.
2. Begrens statistikkunntaket til eksakte eierfiler, de fire brukte geometry-custom-properties,
   faktisk brukte skoperte CSS-egenskaper og SVG-geometriattributter; ingen identitet eller
   presentasjonsattributter skal tillates.
3. Oppdater positive og negative guardfixtures, skill varig geometri fra legacygjeld i måleren og
   dokumenter sluttkontrakten.
4. Kjør full test-, check-, E2E-, snapshot- og produksjonsbuildport uten produkt-, API- eller
   backendendringer, og avslutt SWP-5 før SWP-6 startes.

## Arbeidspakkeregister

| Arbeidspakke                     | Status   | Port/resultat                                                 |
| -------------------------------- | -------- | ------------------------------------------------------------- |
| WP-0 Styring og baseline         | Fullført | Dokumentgrunnlag, React-baseline og komplett adferdsinventar  |
| WP-1 Build og routes             | Fullført | Build, routes, hostingvarianter og arkitekturkontroll grønn   |
| WP-2 Contracts/domain/platform   | Fullført | Contracts, ren domain, fetch/API, 401 og adapters grønne      |
| WP-3 Auth/tenant/serverdata      | Fullført | Auth, tenant, Query, guards, 401 og base path grønne          |
| WP-4 UI-fundament                | Fullført | Alle kartlagte UI-familier og filterkomposisjon er grønne     |
| WP-5 App-shell                   | Fullført | Shell, navigation, routeaktivitet, konto og Mer grønne        |
| WP-6 Featuremigrering            | Fullført | Elleve checkpoints og alle Svelte-featureflater er grønne     |
| WP-7 Paritet og produksjonsbytte | Fullført | Paritet, React-fjerning, CSS, drift og sluttport grønne       |
| SWP-0 Baseline og guardkontrakt  | Fullført | Baseline, referanse og ti fixturetestede guardregler grønne   |
| SWP-1 Theme og guards            | Fullført | Theme, cascade, fixtures, produksjonstre og baseline grønne   |
| SWP-2 UI-primitives              | Fullført | Alle fire primitivecheckpoints og full kvalitetport er grønne |
| SWP-3 Produktpatterns            | Fullført | Alle fem patterncheckpoints og full kvalitetport er grønne    |
| SWP-4 App-shell/navigation       | Fullført | Alle fire checkpoints og full kvalitetport er grønne          |
| SWP-5 Features og legacy-CSS     | Aktiv    | SWP-5.1–5.4 fullført; neste er sluttkontrakten i SWP-5.5      |
| SWP-6 Komponent-/API-opprydding  | Venter   | Utføres etter at stylingeierskap er synlig                    |
| SWP-7 Uavhengig sluttreview      | Venter   | Kald audit og målt vellykket/delvis/ikke vellykket resultat   |

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

- Playwright-harnessen omskriver bare testkontekstens API-header til `DevelopmentBearer` og venter
  på aktive route-handlers før fixture-opprydding; vanlig dev-, preview- og produksjonstrafikk
  bruker fortsatt den autoritative `Bearer`-kontrakten.
- Stylingreferansen oppfyller bare testtenantens navngitte klubbendepunkter med faste svar og
  fryser nettleserklokken til 2026-08-23. Utviklingsinnloggingen bruker fortsatt den eksisterende
  lokale backendharnessen; vanlig utviklings- og produksjonsdata er upåvirket.
- Stylingguardanalysatoren kjører de ni ikke-cascade-reglene håndhevende mot 181 produksjonskilder
  og fører 619 eksakte baselinefunn: seks CSS-application- og 613 custom-property-funn. Bare
  allerede registrerte diagnostics passerer; både nye og
  fjernede funn krever eksplisitt avstemming, slik at slettet gjeld ikke senere kan gjeninnføres.
  Cascade-regelen validerer separat alle fire stilark, mens de 23 isolerte fixturene fortsatt beviser
  positiv og negativ atferd for alle ti stabile regel-ID-er.
- Ingen midlertidige rammeverksadapters, React-legacy eller globale produktselector-filer gjenstår.
  Stylingbaselinen måler fire aktive CSS-filer og 2037 linjer. `index.css` er Tailwind-inngang,
  `tokens.css` eier theme, og `base.css` eier bare dokumentdefaults, tilgjengelighetsfallbacks og
  keyframes. De ti selectorreglene ligger i registrerte lag: tre i `theme` og sju i `base`;
  `components` og `utilities` har ingen app-eide selectorregler.
- De 91 tidligere ulagrede reglene har nå eksplisitt eier. Den gamle gjeldstypen for ulagrede
  legacyregler er redusert fra 88 til null; de tre theme-reglene var ikke legacygjeld.
- Baseline fører ni overgangsavvik: tre skoperte visualiseringsblokker og seks inline geometrier.
  Featureklasser, globale produktselectors, statistikkroller og `@apply` er null. De fire
  `!important`-deklarasjonene tilhører den dokumenterte globale reduced-motion-fallbacken og er ikke
  legacygjeld.
- Alle SWP-2-komponentene, SWP-3-patternene, hele SWP-4 og statistikkens statiske presentasjon
  bruker statiske Tailwind-utilities hos offentlig UI. `Metric`, `MetricGrid` og de nye data-/
  visualiseringspatternene eier hele produktuttrykket. `Button` har ingen patternspesifikk
  `data-part`-bro; Dialog-, EditorDialog- og
  editor-toolbar-komposisjonen eies av patterneiernes eksplisitt bundne variants. Form-,
  FormSteps-, Collection-toggle- og Collection-reset-broene er også fjernet.
- ChoiceButton bruker fortsatt navngitte `--app-choice-control-*`-roller, mens Settings og
  Collection eier sine respektive valgte states gjennom skoperte utilities. DatePickerens
  bookingpresentasjon og Select-/DatePicker-feltene får Collection-komposisjonen gjennom eksplisitt
  bundne variants hos `CollectionControls`; de generelle primitive-API-ene er uendret. Navigationens
  konto-/Mer-flater bruker nå den typed standarddialogplasseringen uten lokal dialogrollebro.
- Page bruker typed AppShell-context og lokale responsive utilities for shell-heading,
  beskrivelse, tittelskygge og motion uten en dyp global DOM-bro. Section eier igjen standardgapet
  og har en typed `data-table`-layout; ingen statistikkselector overstyrer komponentanatomien.
- 1416 CSS custom-property-definisjoner og 914 referanser er registrert. SWP-2.1–SWP-5.2 har lagt til
  semantiske action-, field-, fokus-, choice-, switch-, radio-, select-, calendar-, dialog-,
  riktekst-, Page-, Section-, feedback-, Document-, kontrollgeometri-, motion- og typografiroller i
  den autoritative theme-filen, inkludert Collection-, Dialog-, Tabs- og riktekstoverflater, rader,
  states og kontrolluttrykk samt småpatternenes tid, værikon, responsive metric-gap, Navigation-
  familien, AppShells responsive/safe-area-geometri og shell-/Page-identitet. Den lukkede kontrakten
  eksponerer 662 roller, 912 utilities og 118 light/dark-skift.
  Bits UI sine målte `--bits-*`-verdier kan bare konsumeres av tre registrerte
  strukturelle utilities i `src/index.css`; samme inngang registrerer en semantisk
  loading-sheen-utility, seks SWP-3.1-varianter, tolv SWP-3.2-varianter, 28 SWP-3.3-varianter, 22
  SWP-3.4-varianter, de seksten skoperte ProseMirror-variantene, to smale SWP-4.1-child-varianter og
  to smale SWP-4.2-topbarvarianter.
  Statistikk er eneste feature med et stylingunntak. Etter SWP-5.2 består inventaret bare av seks
  inline custom-property-verdier og 32 SVG-geometriattributter; featureklasser og semantiske
  statistikkroller er null. Den endelige allowlisten låses i SWP-5.5.
- `npm audit` rapporterer seks lave transitive funn i den aktive SvelteKit-/Bits UI-kjeden og ingen
  moderate, høye eller kritiske funn. Audit tilbyr ikke en kompatibel oppgradering som fjerner de
  lave funnene; foreslåtte majorendringer er derfor ikke brukt som del av lift-and-shift-en.
- `react-is@17.0.2` finnes bare transitivt i testverktøyenes `pretty-format`-kjede. Det ligger ikke
  i produksjonsgrafen eller byggartefaktene og er ikke React-/ReactDOM-runtime.
- Statisk død-kodeanalyse rapporterer bare komplette DTO-typer som ennå ikke har en UI-konsument.
  De beholdes som transportkontrakt i `lib/contracts`; det finnes ingen tilsvarende ubrukt runtimekode.
- SWP-5.2-buildens initial CSS er 27,7/27,7 KiB gzip for Cloudflare Pages/GitHub Pages av et uendret
  50 KiB-budsjett; eksakt er målingen 28 350 og 28 370 gzip-byte når statistikkens offentlige
  visualiseringsutilities erstatter legacy-CSS. Initial JS er 38 157/38 194 gzip-byte, 60 chunks,
  og største lazy JS-chunk er fortsatt 123 363 byte (120,5 KiB) av 130 KiB.

## Siste verifikasjon

| Kontroll                             | Resultat                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| Prettier på aktiv kode og dokumenter | Bestått 2026-08-24                                                                  |
| Relative dokumentlenker              | Bestått 2026-08-24                                                                  |
| `git diff --check`                   | Bestått 2026-08-24                                                                  |
| AI-first lesbarhetskontroll          | Bestått: eksplisitte eiere, typer, statiske klasser og samlokaliserte tester        |
| SWP-5.4 legacyfilsletting            | Bestått: tre filer/importer fjernet; dokumentert `base.css`; build byteidentisk     |
| SWP-5.4 produksjons-/baselineport    | Bestått: 4 CSS-filer, 2037 linjer, 10 regler, 9 legacyavvik og 38 kandidater        |
| SWP-5.4 visuell matrise              | Bestått: 11/11 pikselidentiske snapshots                                            |
| SWP-5.3 filsletting                  | Bestått: featurekomposisjonsfil/import/kontrakt fjernet; build byteidentisk         |
| SWP-5.3 produksjons-/baselineport    | Bestått: 6 CSS-filer, 2033 linjer, 10 regler, 36 legacyavvik og 38 kandidater       |
| SWP-5.2 featuregrense                | Bestått: 0 klasser/roller; 6 inline- og 32 SVG-geometrier = 38 kandidater           |
| SWP-5.2 theme-/cascadeport           | Bestått: 662 roller, 912 utilities, 118 skift; 10 lagrede regler                    |
| SWP-5.2 produksjons-/baselineport    | Bestått: 184 filer, 619 diagnostics, 36 legacyavvik og 38 kandidater                |
| SWP-5.2 visuell matrise              | Bestått: 11/11 pikselidentiske snapshots                                            |
| SWP-5.2 produksjonsbuild             | Bestått: 28 350/28 370 CSS-byte, 60 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-5.1 kald route-/featureaudit     | Bestått: 23 routes, 65 features; bare statistikk har overgangsstyling               |
| SWP-5.1 kandidatavstemming           | Bestått: 52 klasser, 6 inlinegeometrier, 32 SVG-geometrier og 16 roller = 106       |
| SWP-5.1 arkitektur-/designport       | Bestått: begge målrettede kontroller er grønne                                      |
| SWP-5.1 produksjons-/baselineport    | Bestått: 179 filer, 755 diagnostics, 363 legacyavvik og 106 kandidater              |
| `npm test`                           | Bestått 2026-08-24: 94 filer, 345 tester                                            |
| `npm run check`                      | Bestått: type, arkitektur, legacy, design, stylingporter, lint og format            |
| SWP-4.4 kald selector-/rolleaudit    | Bestått: aktive eiere bevist, døde roller slettet og statistikk utsatt til SWP-5.2  |
| SWP-4.4 målrettede shelltester       | Bestått: 6 filer, 32 tester for navigation, session, Page, theme, fokus og axe      |
| SWP-4.4 theme-kontrakt               | Bestått: 594 roller, 837 utilities og 116 light/dark-skift via Tailwind-kompilering |
| SWP-4.4 cascade-kontrakt             | Bestått: 7 stilark, 135 regler; theme 3, base 7, components 125, utilities 0        |
| SWP-4.4 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-4.4 produksjonstre               | Bestått: 179 filer, 755 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-4.4 kildebaseline                | Bestått: 2588 linjer, 135 regler, 144 selectors, 363 avvik og 106 kandidater        |
| SWP-4 kvalitetsport: kritiske flyter | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-4 kvalitetsport: visuell matrise | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-4 kvalitetsport: produksjon      | Bestått: 8/8 ruter, begge hostbuild, 61 JS-chunks og 120,5 KiB største lazy chunk   |
| SWP-4.4 produksjonsbuild             | Bestått: 27 145/27 164 CSS-byte og 38 146/38 191 initiale JS-byte                   |
| SWP-4.3 målrettede shelltester       | Bestått: 6 filer, 34 tester for Page, identity, theme, fokus og axe                 |
| SWP-4.3 theme-kontrakt               | Bestått: 597 roller, 840 utilities og 116 light/dark-skift via Tailwind-kompilering |
| SWP-4.3 cascade-kontrakt             | Bestått: 7 stilark, 135 regler; theme 3, base 7, components 125, utilities 0        |
| SWP-4.3 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-4.3 produksjonstre               | Bestått: 179 filer, 756 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-4.3 kildebaseline                | Bestått: 2592 linjer, 135 regler, 144 selectors, 363 avvik og 106 kandidater        |
| SWP-4.3 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-4.3 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-4.3 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-4.3 produksjonsbuild             | Bestått: 27 154/27 174 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-4.2 målrettede shelltester       | Bestått: 3 filer, 18 tester for struktur, safe areas, loading, fokus og axe         |
| SWP-4.2 theme-kontrakt               | Bestått: 586 roller, 829 utilities og 115 light/dark-skift via Tailwind-kompilering |
| SWP-4.2 cascade-kontrakt             | Bestått: 7 stilark, 150 regler; theme 3, base 7, components 140, utilities 0        |
| SWP-4.2 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-4.2 produksjonstre               | Bestått: 179 filer, 770 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-4.2 kildebaseline                | Bestått: 2643 linjer, 150 regler, 163 selectors, 399 avvik og 106 kandidater        |
| SWP-4.2 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-4.2 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-4.2 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-4.2 produksjonsbuild             | Bestått: 27 078/27 089 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-4.1 målrettede UI-/sessiontester | Bestått: 3 filer, 20 tester for layout, states, dialog, fokus, tastatur og axe      |
| SWP-4.1 theme-kontrakt               | Bestått: 565 roller, 808 utilities og 112 light/dark-skift via Tailwind-kompilering |
| SWP-4.1 cascade-kontrakt             | Bestått: 7 stilark, 166 regler; theme 3, base 7, components 156, utilities 0        |
| SWP-4.1 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-4.1 produksjonstre               | Bestått: 179 filer, 772 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-4.1 kildebaseline                | Bestått: 2764 linjer, 166 regler, 182 selectors, 447 avvik og 106 kandidater        |
| SWP-4.1 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-4.1 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-4.1 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-4.1 produksjonsbuild             | Bestått: 27 042/27 053 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-3.5 målrettede UI-/featuretester | Bestått: 4 filer, 24 tester for tid, vær, metrics, states, enheter og axe           |
| SWP-3.5 theme-kontrakt               | Bestått: 517 roller, 759 utilities og 107 light/dark-skift via Tailwind-kompilering |
| SWP-3.5 cascade-kontrakt             | Bestått: 7 stilark, 234 regler; theme 3, base 7, components 224, utilities 0        |
| SWP-3.5 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-3.5 produksjonstre               | Bestått: 179 filer, 817 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-3.5 kildebaseline                | Bestått: 3186 linjer, 234 regler, 253 selectors, 630 avvik og 106 kandidater        |
| SWP-3.5 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-3.5 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-3.5 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-3.5 produksjonsbuild             | Bestått: 27 093/27 104 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-3.4 målrettede UI-tester         | Bestått: 4 filer, 19 tester for dialog, tabs, riktekst, fokus, tastatur og axe      |
| SWP-3.4 theme-kontrakt               | Bestått: 509 roller, 751 utilities og 107 light/dark-skift via Tailwind-kompilering |
| SWP-3.4 cascade-kontrakt             | Bestått: 7 stilark, 244 regler; theme 3, base 7, components 234, utilities 0        |
| SWP-3.4 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-3.4 produksjonstre               | Bestått: 179 filer, 821 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-3.4 kildebaseline                | Bestått: 3235 linjer, 244 regler, 264 selectors, 653 avvik og 106 kandidater        |
| SWP-3.4 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-3.4 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-3.4 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-3.4 produksjonsbuild             | Bestått: 27 109/27 120 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-3.3 målrettede UI-tester         | Bestått: 1 fil, 18 tester for collection, controls, rows, states, tastatur og axe   |
| SWP-3.3 theme-kontrakt               | Bestått: 452 roller, 688 utilities og 99 light/dark-skift via Tailwind-kompilering  |
| SWP-3.3 cascade-kontrakt             | Bestått: 7 stilark, 318 regler; theme 3, base 7, components 308, utilities 0        |
| SWP-3.3 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-3.3 produksjonstre               | Bestått: 179 filer, 932 eksakte baselinefunn over 3 aktive regel-ID-er              |
| SWP-3.3 kildebaseline                | Bestått: 3635 linjer, 318 regler, 352 selectors, 932 avvik og 106 kandidater        |
| SWP-3.3 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-3.3 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-3.3 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-3.3 produksjonsbuild             | Bestått: 26 676/26 684 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-3.2 målrettede UI-tester         | Bestått: 3 filer, 19 tester for form, steg, settings, valg, states, tastatur og axe |
| SWP-3.2 theme-kontrakt               | Bestått: 357 roller, 580 utilities og 96 light/dark-skift via Tailwind-kompilering  |
| SWP-3.2 cascade-kontrakt             | Bestått: 7 stilark, 489 regler; theme 3, base 7, components 479, utilities 0        |
| SWP-3.2 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-3.2 produksjonstre               | Bestått: 179 filer, 1041 eksakte baselinefunn over 3 aktive regel-ID-er             |
| SWP-3.2 kildebaseline                | Bestått: 4696 linjer, 489 regler, 538 selectors, 1356 avvik og 106 kandidater       |
| SWP-3.2 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-3.2 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-3.2 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-3.2 produksjonsbuild             | Bestått: 25 726/25 736 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-3.1 målrettede UI-tester         | Bestått: 2 filer, 13 tester for patterns, dokument, states, retry, landmarks og axe |
| SWP-3.1 theme-kontrakt               | Bestått: 299 roller, 486 utilities og 84 light/dark-skift via Tailwind-kompilering  |
| SWP-3.1 cascade-kontrakt             | Bestått: 7 stilark, 587 regler; theme 3, base 7, components 577, utilities 0        |
| SWP-3.1 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-3.1 produksjonstre               | Bestått: 179 filer, 1088 eksakte baselinefunn over 3 aktive regel-ID-er             |
| SWP-3.1 kildebaseline                | Bestått: 5141 linjer, 587 regler, 638 selectors, 1597 avvik og 106 kandidater       |
| SWP-3.1 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-3.1 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-3.1 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-3.1 produksjonsbuild             | Bestått: 25 383/25 393 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-2.4 målrettede UI-tester         | Bestått: 4 filer, 20 tester for editor, innhold, form, axe, fokus og lifecycle      |
| SWP-2.4 theme-kontrakt               | Bestått: 217 roller, 379 utilities og 68 light/dark-skift via Tailwind-kompilering  |
| SWP-2.4 cascade-kontrakt             | Bestått: 7 stilark, 659 regler; theme 3, base 7, components 649, utilities 0        |
| SWP-2.4 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-2.4 produksjonstre               | Bestått: 179 filer, 1091 eksakte baselinefunn over 3 aktive regel-ID-er             |
| SWP-2.4 kildebaseline                | Bestått: 5451 linjer, 659 regler, 715 selectors, 1796 avvik og 106 kandidater       |
| SWP-2.4 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-2.4 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-2.4 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-2.4 produksjonsbuild             | Bestått: 24 355/24 361 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-2.3 målrettede UI-tester         | Bestått: 4 filer, 23 tester for Select, dato, Dialog, Tabs, states, fokus og axe    |
| SWP-2.3 theme-kontrakt               | Bestått: 201 roller, 363 utilities og 68 light/dark-skift via Tailwind-kompilering  |
| SWP-2.3 cascade-kontrakt             | Bestått: 7 stilark, 676 regler; theme 3, base 7, components 666, utilities 0        |
| SWP-2.3 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-2.3 produksjonstre               | Bestått: 179 filer, 1093 eksakte baselinefunn over 3 aktive regel-ID-er             |
| SWP-2.3 kildebaseline                | Bestått: 5499 linjer, 676 regler, 733 selectors, 1836 avvik og 106 kandidater       |
| SWP-2.3 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-2.3 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-2.3 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-2.3 produksjonsbuild             | Bestått: 23 702/23 710 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-2.2 målrettede UI-tester         | Bestått: 4 filer, 32 tester for choice, Settings, form, axe og accordion-tastatur   |
| SWP-2.2 theme-kontrakt               | Bestått: 151 roller, 307 utilities og 63 light/dark-skift via Tailwind-kompilering  |
| SWP-2.2 cascade-kontrakt             | Bestått: 7 stilark, 742 regler; theme 3, base 7, components 732, utilities 0        |
| SWP-2.2 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-2.2 produksjonstre               | Bestått: 179 filer, 1094 eksakte baselinefunn over 3 aktive regel-ID-er             |
| SWP-2.2 kildebaseline                | Bestått: 5939 linjer, 742 regler, 802 selectors, 2025 avvik og 106 kandidater       |
| SWP-2.2 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-2.2 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-2.2 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-2.2 produksjonsbuild             | Bestått: 23 053/23 060 CSS-byte, 61 JS-chunks og 120,5 KiB største lazy chunk       |
| SWP-2.1 målrettede UI-tester         | Bestått: 5 filer, 40 tester for basekontroller, form, axe, tastatur og komposisjon  |
| SWP-2.1 theme-kontrakt               | Bestått: 121 roller, 272 utilities og 51 light/dark-skift via Tailwind-kompilering  |
| SWP-2.1 cascade-kontrakt             | Bestått: 7 stilark, 756 regler; theme 3, base 7, components 746, utilities 0        |
| SWP-2.1 guardfixtures                | Bestått: 23 fixtures, 10 stabile regler og lukket semantisk utilityvokabular        |
| SWP-2.1 produksjonstre               | Bestått: 179 filer, 1087 eksakte baselinefunn over 3 aktive regel-ID-er             |
| SWP-2.1 kildebaseline                | Bestått: 5998 linjer, 756 regler, 821 selectors, 2076 avvik og 106 kandidater       |
| SWP-2.1 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-2.1 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-2.1 produksjonsroutematrise      | Bestått: 8/8 public, protected, admin og callback over root/base path               |
| SWP-2.1 produksjonsbuild             | Bestått: 22,2/22,2 KiB CSS, 61 JS-chunks og 120,5 KiB største lazy chunk            |
| SWP-1 theme-kontrakt                 | Bestått: 101 roller, 239 utilities og 43 light/dark-skift via Tailwind-kompilering  |
| SWP-1 cascade-kontrakt               | Bestått: 7 stilark, 779 regler; theme 3, base 7, components 769, utilities 0        |
| SWP-1 guardfixtures                  | Bestått: schemaVersion 2, 23 fixtures, 10 stabile regler og lukket råpalett         |
| SWP-1.3 produksjonstre               | Bestått: 179 filer, 9 regler, 1104 eksakte baselinefunn over 3 aktive regel-ID-er   |
| SWP-1.3 guardkontrakttest            | Bestått: grønt nåtre, smal discovery og ny forekomst av alle 9 regler avvises       |
| SWP-1.3 kildebaseline                | Bestått: schemaVersion 2, 2142 legacyavvik og 106 separate visualiseringskandidater |
| SWP-1.3 kritiske E2E-flyter          | Bestått: 3/3 login-, booking-/avbestillings- og administratorflyter                 |
| SWP-1.3 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-1.3 produksjonsbuild             | Bestått: 21,3/21,3 KiB CSS, 61 JS-chunks og 120,5 KiB største lazy chunk            |
| SWP-1.2 kildebaseline                | Bestått: 7 CSS-filer, 6106 linjer, 779 regler, 845 selectors og 2142 legacyavvik    |
| SWP-1.2 visuell/interaktiv matrise   | Bestått: 11/11 pikselidentiske snapshots med fokus, overflow og tom konsoll         |
| SWP-1.2 produksjonsbuild             | Bestått: 21,3/21,3 KiB CSS, 61 JS-chunks og 120,5 KiB største lazy chunk            |
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

- ny dokumentert `base.css` med dokumentdefaults, tilgjengelighetsfallbacks og fem keyframes
- slettet `primitives.css`, `responsive.css` og `patterns.css` samt deres importer
- stylingguardens autoritative produksjonsliste, baselineklassifisering og maskinbaseline med fire
  CSS-filer, ni overgangsavvik og byteidentiske produksjonsassets
- designsystempekeren og denne statusen med SWP-5.4 fullført og SWP-5.5 som neste eksakte
  checkpoint; produktkode, API og backend-repoet er urørt

`/start` bruker commit-diffen som autoritativ kilde for nøyaktig innhold og `git status` for
pågående arbeid etter checkpointet.
