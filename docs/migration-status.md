# Migreringsstatus

> **Status:** Aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** WP-4 — UI-fundament og designsystem (pågår)
>
> **Sist oppdatert:** 2026-08-22

## Mål for aktiv arbeidspakke

Etabler sentrale tokens, tema, font og produktets offentlige UI-familier over et minimalt sett native
eller Bits-baserte primitives. Features skal deretter kunne uttrykke loading, feedback, forms,
samlinger og dialogs uten lokal produktstyling eller direkte Bits UI-import.

## Fullført

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

## Nåtilstand

- SvelteKit er den aktive dev-, test-, preview- og produksjonsbuilden.
- Alle produkt-URL-er rendrer foreløpige Svelte-routeflater; featureadferd er ikke migrert ennå.
- React-kilden er fortsatt produksjonsreferanse i arbeidskopien, men er ikke koblet til eller bundlet
  av SvelteKit.
- Contracts, ren domenelogikk og platformkjerne er nå autoritative for både videre Svelte-arbeid og
  de midlertidige React-broene.
- Auth, tenant, Query og session guards er autoritativt SvelteKit-fundament. Login- og øvrige
  featureflater er fortsatt route-placeholdere frem til WP-4–WP-6.
- WP-4 pågår. Tokens, font, lyst/mørkt tema, offentlige handlinger, tekstkontroller og Select samt
  Page-, Section-, feedback-, Form-, Settings-, Dialog-, Document-, Navigation- og de første
  Collection-patternene er autoritative. Dato-/kalender- og rikteksteditorfamiliene er ikke
  migrert ennå; sammensatte row interactions og offentlig filterkomposisjon gjenstår innen WP-4.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                    |
| ------------------------------------- | ----------------------------------------------------- |
| Base branch                           | `main`                                                |
| Fastslått basecommit                  | `5287c5e`                                             |
| Siste semantiske checkpoint           | `feat(sveltekit): establish WP-4 navigation patterns` |
| Lokale commits foran base             | 15                                                    |
| Forventede ucommitterte frontendfiler | Ingen etter checkpoint-commit                         |
| Neste planlagte checkpoint            | WP-4 Date- og Calendar-patterns                       |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Neste `/start` skal bare starte neste avgrensede WP-4-checkpoint:

1. Kaldkartlegg React-referansens enkeltstående datofelt, bookingens datovalg/-navigering og
   flerdatovalg mot minst tre reelle flater. Dokumenter norsk locale, valgt/disabled state,
   min-/maksgrenser, native formkobling, API-format, fokus, tastatur, loading og mobilpresentasjon.
2. Etabler den minste offentlige Date-/Calendar-familien og primitive wrappers som de kartlagte
   konsumentene faktisk trenger. Kalender, locale, valgoppførsel, portal og fokus skal eies
   sentralt; featurekode skal ikke pakke kalenderen eller lage lokale date-input-varianter.
3. Legg komponent-, tastatur- og axe-tester for enkeltvalg, flervalg, grenser, formkobling, åpning,
   lukking og fokusretur. Kontroller representative datoflater på mobil/desktop og lyst/mørkt tema,
   og kjør full check/test samt begge hostingbuildene.

## Arbeidspakkeregister

| Arbeidspakke                     | Status       | Port/resultat                                                                   |
| -------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| WP-0 Styring og baseline         | Fullført     | Dokumentgrunnlag, React-baseline og komplett adferdsinventar                    |
| WP-1 Build og routes             | Fullført     | Build, routes, hostingvarianter og arkitekturkontroll grønn                     |
| WP-2 Contracts/domain/platform   | Fullført     | Contracts, ren domain, fetch/API, 401 og adapters grønne                        |
| WP-3 Auth/tenant/serverdata      | Fullført     | Auth, tenant, Query, guards, 401 og base path grønne                            |
| WP-4 UI-fundament                | Pågår        | Page, Collection, Form, Settings, Dialog, Select, Document og Navigation grønne |
| WP-5 App-shell                   | Ikke startet | —                                                                               |
| WP-6 Featuremigrering            | Ikke startet | —                                                                               |
| WP-7 Paritet og produksjonsbytte | Ikke startet | —                                                                               |

## Featureregister

| Gruppe                       | Status   | Merknad                           |
| ---------------------------- | -------- | --------------------------------- |
| Auth, policy, feil og guards | Kartlagt | Første featuregruppe i WP-6       |
| Booking og bootstrap         | Kartlagt | Kjerneflyt                        |
| Mine tider og Min side       | Kartlagt | Beskyttet kontoflyt               |
| Arrangementer og Nyheter     | Kartlagt | Offentlig/innlogget innhold       |
| Baner og Grener              | Kartlagt | Delt adminarbeidsområde           |
| Klubb og medlemskap          | Kartlagt | Admininnstillinger                |
| Arrangementadministrasjon    | Kartlagt | Sammensatt editor og bookinger    |
| Brukere og sperre            | Kartlagt | Rolle- og kapabilitetsstyrt admin |
| Kunngjøringer og editor      | Kartlagt | Riktekst og obligatorisk flyt     |
| Statistikk                   | Kartlagt | Datavisualisering                 |

## Åpne blokkeringer

Ingen kjente blokkeringer. Neste Date-/Calendar-checkpoint kan gjennomføres mot eksisterende
visuell baseline og de godkjente produkt-/arkitekturreglene uten backendendringer eller ny
brukerbeslutning. Kartleggingen avgjør om eksisterende Bits UI dekker kalenderatferden før en ny
avhengighet vurderes.

## Midlertidig kode og kjente avvik

- React-kilde og React-avhengigheter er midlertidig referanse og skal fjernes etter hvert som
  ansvaret erstattes; de er ikke del av SvelteKit-bundlen.
- `src/types/` og de flyttede filene i `src/utils/` er midlertidige React-re-exports til autoritativ
  kode i `src/lib/contracts`, `src/lib/domain` og `src/lib/platform`.
- Alle Svelte-featureflater er bevisst midlertidige route-placeholdere frem til WP-4–WP-6 gir
  contracts, data, auth, UI og app-shell.
- Eksisterende globale token-, font-, theme- og primitivefiler er autoritative. Eldre React-patterns
  og featurekomposisjoner i samme CSS-kjede er fortsatt visuell referanse og konsolideres når de
  respektive WP-4-patterns og WP-6-features erstatter dem.
- Auth-, tenant-, callback- og guardflatene bruker offentlige Page-, loading-, feedback- og
  errorpatterns. Deres adferds- og datakontrakter fra WP-3 er fortsatt autoritative.
- Collection eier nå hvor filtre og footer rendres, og `Input`, Select samt Settings-valg og toggle
  dekker de etablerte kontrollene. Sorteringens produktkomposisjon og offentlig filterkomposisjon
  gjenstår; featurekode er ikke flyttet til den nye Collection-familien i dette WP-4-checkpointet.
- `CollectionRow` har foreløpig de tre interaction-variantene `static`, `open` og `action` som dekker
  flere kartlagte konsumenter. `actions`, `expand` og `reorder` etableres først sammen med reelle
  primitive- og fokusbehov senere i WP-4; de eksponeres ikke som uimplementerte offentlige typer.
- Temakontrakten og persistens er på plass, og Navigation-familien dekker den semantiske
  temahandlingen. Den faktiske brukerrettede bryteren kommer med app-shellen; det finnes ingen
  midlertidig route- eller featurelokal temakontroll.
- Form-, Settings-, Select- og tekstkontrollfamiliene er autoritative, men eksisterende
  React-skjemaer og innstillingsflater er fortsatt produksjonsreferanse frem til de respektive
  WP-6-featurene migreres. Dato og rikteksteditor får egne senere UI-checkpoints.
- Dialogfamilien og Bits-wrapperen er autoritative, men eksisterende React-dialogkonsumenter er
  fortsatt produksjonsreferanse frem til WP-6. Destruktive alert dialogs, mobile navigation sheets
  og featureinnhold er ikke utvidet inn i dette checkpointet.
- Document-familien er autoritativ for intro, seksjoner og fakta, men eksisterende React-flater er
  fortsatt produksjonsreferanse frem til WP-6. Sidemetadata, loading/error og obligatoriske
  handlinger komponeres gjennom Page-, feedback- og Form-familiene; rikteksteditoren tilhører et
  senere WP-4-checkpoint.
- Navigation-familien er autoritativ for identity, grupper, lister, lenker, handlinger, badges,
  loading og indre mobil/desktop-geometri. Eksisterende React-app-shell er fortsatt
  produksjonsreferanse frem til WP-5; SvelteKit-routeaktivitet, auth-/kapabilitetsutvalg,
  konto-dropdown og mobil «Mer»-overlay er bevisst ikke integrert eller bygget i dette
  patterncheckpointet.
- Bits UI brukes bare i primitive wrappers med reelle sammensatte behov: Dialog for fokusfelle og
  dismissable layer, og Select for listbox, portal, typeahead og fokusretur. Button, Input,
  Textarea, Switch, Radio og ChoiceButton beholder enkel native atferd.

## Siste verifikasjon

| Kontroll                             | Resultat                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| Prettier på aktiv kode og dokumenter | Bestått 2026-08-22                                                                  |
| Relative dokumentlenker              | Bestått 2026-08-22                                                                  |
| `git diff --check`                   | Bestått 2026-08-22                                                                  |
| `npm test`                           | Bestått 2026-08-22: 33 filer, 125 tester                                            |
| `npm run check`                      | Bestått 2026-08-22: Svelte/React-typecheck, arkitektur, design, lint og format      |
| Cloudflare Pages-build               | Bestått 2026-08-22: root path og `index.html`-fallback                              |
| GitHub Pages-build                   | Bestått 2026-08-22: eksplisitt `/banebooking` og `404.html`-fallback                |
| Dev og preview                       | Bestått 2026-08-22: previewbase samt dev i multi-/dedikert tenant                   |
| Nettleserrender                      | Bestått 2026-08-22: 390×844 og 1440×900, Navigation, lyst/mørkt, ingen feil         |
| SvelteKit-bundle                     | Verifisert 2026-08-22: ingen React-runtime                                          |
| WP-0 route-/featureinventar          | Komplett 2026-08-22                                                                 |
| WP-4 fokustester                     | Bestått 2026-08-22: 2 filer, 6 tester for tema, storage og DOM-applikasjon          |
| WP-4 pattern-/a11y-tester            | Bestått 2026-08-22: 1 fil, 6 tester for semantikk, states, retry og axe             |
| WP-4 collection-/a11y-tester         | Bestått 2026-08-22: 1 fil, 6 tester for anatomy, rows, groups, states, retry og axe |
| WP-4 form-/a11y-tester               | Bestått 2026-08-22: 1 fil, 6 tester for feltkobling, states, submit og axe          |
| WP-4 settings-/a11y-tester           | Bestått 2026-08-22: 1 fil, 6 tester for rows, valg, tastatur, states og axe         |
| WP-4 dialog-/a11y-tester             | Bestått 2026-08-22: 1 fil, 7 tester for fokus, dismiss, actions, pending og axe     |
| WP-4 select-/a11y-tester             | Bestått 2026-08-22: 1 fil, 6 tester for form, tastatur, states, fokus og axe        |
| WP-4 document-/a11y-tester           | Bestått 2026-08-22: 1 fil, 5 tester for landmark, headings, facts, lenker og axe    |
| WP-4 navigation-/a11y-tester         | Bestått 2026-08-22: 1 fil, 7 tester for lenker, aktiv state, handlinger og axe      |

## Filer i siste checkpoint

- native, typed Navigation-patterns med fixture, komponent-, tastatur- og axe-tester i
  `src/lib/ui/patterns/`
- offentlig Navigation-API og typed layout-, badge- og handlingskontrakter i `src/lib/ui/`
- sentral sidefelt-, bunn-, seksjons-, handling-, identity-, badge- og loadinggeometri i
  `src/styles/design-system/patterns.css`
- Navigation- og app-shell-eierskapskontrakten i `docs/product-design-rules.md`
- `docs/migration-status.md`

`/start` bruker commit-diffen som autoritativ kilde for nøyaktig innhold og `git status` for
pågående arbeid etter checkpointet.
