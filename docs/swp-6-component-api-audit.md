# SWP-6 komponent- og API-audit

> **Status:** Aktivt bevisgrunnlag for SWP-6
>
> **Sist oppdatert:** 2026-08-24

## Formål

Auditten dokumenterer hvilke komponent- og API-grenser som faktisk ble vurdert etter at
stylingeierskapet ble synlig. Målet er én tydelig eier per ansvar, ikke færrest mulig linjer eller
flest mulig filer. Offentlige feature- og UI-innganger, produktadferd, URL-er og API-kontrakter skal
forbli uendret.

## SWP-6.1 — store featureorkestratorer

Kaldmålingen omfattet alle produksjonskomponenter under `src/lib/features` med minst 180 linjer.
Tallene under er målt før uttrekket og skiller Svelte-scriptet fra markupen.

| Komponent                | Linjer script/markup | Reaktivitet og sideeffekter                              | Vurdering                                                                                                                                                  |
| ------------------------ | -------------------: | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArrangementEditor`      |         535, 332/203 | 12 states, 7 derived, 3 effects, 1 query og 7 mutations  | Trekk ut én privat editorcontroller. Komponenten blandet totrinnsflyt, querysynkronisering, staging, konfliktkontroll og sju mutations med presentasjonen. |
| `CourtsSection`          |         362, 207/155 | 9 states, 13 derived, 1 effect, 2 queries og 3 mutations | Trekk ut én privat banearbeidscontroller. Komponenten blandet filter, utkastlager, create/edit, bookingoverstyring og reorder med samlingsmarkup.          |
| `LoginScreen`            |         271, 147/124 | 7 states, 1 derived, ingen Query                         | Behold. Scriptet eier én sammenhengende e-post-/OTP-/providerflyt; uttrekk ville skilt felttilstand fra skjemaet uten ny eier.                             |
| `ArrangementAdminScreen` |         267, 113/154 | 7 states, 10 derived, 3 queries                          | Behold. Oversikt/filter/dialogvalg er én route-nær orkestrering, mens editorarbeidsflyten allerede er et eget barn.                                        |
| `ScheduleBuilder`        |         247, 107/140 | 9 states, 8 derived, ingen sideeffekt                    | Behold. Komponenten er den avgrensede, kontrollerte arbeidsflyten for å bygge tidsforslag; state og kontrollmarkup endres sammen.                          |
| `ClubSettings`           |          238, 81/157 | 4 states, 4 derived, 1 effect, 1 mutation                | Behold. Linjetallet drives av eksplisitte skjemafelt; utkast og validering har allerede ren modellgrense.                                                  |
| `ActivitiesSection`      |          229, 133/96 | 7 states, 8 derived, 1 effect, 1 query og 2 mutations    | Behold. Én kompakt create/edit-flyt med ett utkastansvar; ingen separat flertrinns-, staging- eller reorderflyt.                                           |
| `BookingSchedule`        |         224, 121/103 | 1 state, 8 derived, ingen sideeffekt                     | Behold. Dette er en presentasjonskomponent over typed props og ren bookingmodell, uten serverdataeierskap.                                                 |
| `MembershipSettings`     |          211, 73/138 | 2 states, 1 derived, 1 query og 2 mutations              | Behold. Markup dominerer, og aktivering/deaktivering tilhører samme medlemskapsflate.                                                                      |
| `UserAdminScreen`        |          209, 90/119 | 7 states, 6 derived, 1 query                             | Behold. Filter/paginering/dialogvalg er én listeorkestrering; hver muterende dialog har allerede egen eier.                                                |
| `ArrangementsScreen`     |         209, 107/102 | 6 states, 9 derived, 1 effect, 1 query og 1 mutation     | Behold. Offentlig liste, deeplink, filter og avlysning er én sammenhengende samlingsflyt med egen rad/dialog.                                              |
| `BookingRulesFields`     |          199, 36/163 | Ingen lokal state eller sideeffekt                       | Behold. Størrelsen er eksplisitt feltmarkup; oppdeling ville bare videresendt samme skjemaprops.                                                           |
| `MyBookingsScreen`       |          199, 87/112 | 3 states, 8 derived, 1 query og 1 mutation               | Behold. Historikk/filter/paginering og avbestilling er én avgrenset samlingsflyt.                                                                          |
| `ProfileSettings`        |          193, 82/111 | 5 states, 3 derived, 1 effect, 1 mutation                | Behold. Utkast, feltvalidering og lagring er ett skjemaansvar med ren modellgrense.                                                                        |

Importgrafen for alle kandidatene holder featureisolasjonen: komponentene importerer bare egen
feature, contracts/domain, offentlig platform og `$lib/ui`. Ingen ny offentlig featureeksport eller
feature-til-featurekobling er nødvendig.

### Valgt grense

- `arrangement-editor-controller.svelte.ts` eier editorens Query-/mutationobjekter,
  propsynkronisering, metadatautkast, tidsstaging, konfliktkontroll og create/edit/delete-forløp.
- `ArrangementEditor.svelte` eier fortsatt det offentlige komponent-API-et og all
  Form-/Settings-/Dialog-komposisjon. Komponenten er redusert fra 535 til 273 linjer.
- `courts-section-controller.svelte.ts` eier banequeries, filterstate, utkastlager, validering,
  create/edit, bookingoverstyring og reordersekvensering.
- `CourtsSection.svelte` eier fortsatt samling, rader og editorpresentasjon. Komponenten er redusert
  fra 362 til 177 linjer.
- Controllerne er private, navngitte featureeiere. De deles ikke, eksponeres ikke fra `index.ts` og
  innfører ingen generell store-, service- eller prop-forwarding-abstraksjon.

Den observerbare kontrakten er bevart gjennom de eksisterende arrangementadmin- og
bane-/grenadministrasjonstestene: editorsteg, staging, oppretting, filter, reorder, ulagret utkast,
validering og bookingoverstyring går gjennom de samme offentlige komponentene og endpointene.

## SWP-6.2 — store offentlige patterns

Kaldmålingen omfattet alle 20 produksjonspatterns med minst 70 linjer. Importgrafen går bare mot
primitives, andre navngitte UI-byggesteiner og interne typed context-/controllerkontrakter; ingen
pattern kjenner features, API, auth eller routes.

| Pattern/familie                                                           |                      Kald størrelse | Vurdering                                                                                                                                                               |
| ------------------------------------------------------------------------- | ----------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CollectionControls`                                                      | 362 linjer, 130 script / 232 markup | Del intern implementasjon. Én fil eide offentlig kontrakt og disclosurestate, men også tre selvstendige anatomier for søk/header, choice-grupper og diskriminerte felt. |
| `CollectionRow`                                                           |                                 263 | Behold. Den diskriminerte interaction-kontrakten og den lokale `summary`-snippeten samler én radsemantikk; et barn ville videresendt opptil tolv radprops.              |
| `RichTextEditorToolbar`                                                   |                                 214 | Behold. Eksplisitte, statiske kommandoer gjør tastaturnavn, pressed-state, ikoner og tabellkontekst lesbare; et kontrollbarn ville bare wrappe `Button` og `Icon`.      |
| `Collection`, `RichTextEditor`, `NavigationLink`, `AppShell`, `DataTable` |                             113–130 | Behold. Hver fil eier én offentlig anatomi eller lifecycle; `CollectionToggle`, editor-toolbar/-primitive og `DataTableCell` er allerede navngitte barn.                |
| `FormField`, `SettingsRadioGroup`, `NavigationAction`, `Page`             |                             100–107 | Behold. Context-, felt-, radio-, lenke-/knapp- eller sidekontrakten må leses sammen med egen markup.                                                                    |
| `Dialog`, `Section`, `SettingsSection`, `FormSteps`, `NavigationOverlay`  |                               82–91 | Behold. Typede varianter/snippets og semantisk anatomi er ett sammenhengende patternansvar.                                                                             |
| `DataTableCell`, `EditorDialog`, `Metric`                                 |                               72–79 | Behold. Dette er allerede de smale, navngitte barna til en større offentlig familie.                                                                                    |

`CollectionControls` har åtte reelle featurekonsumenter og må derfor beholde én stabil offentlig
grense. Den valgte interne oppdelingen er:

- `CollectionControls.svelte` eier fortsatt alle offentlige props, bindbar disclosurestate,
  selected-count/resetregler, responsive contentlayout og roten `data-ui="collection-controls"`.
- `CollectionControlsHeader.svelte` eier søk/clear eller filteretikett samt den navngitte
  disclosureknappen og tellingen.
- `CollectionControlGroup.svelte` eier fieldset/legend, choice-state og det eksisterende typed
  custom-control-snippetet.
- `CollectionControlField.svelte` eier den diskriminerte `select`-/`date`-/`switch`-anatomien,
  kontroll-ID, pending og bredde.
- `collection-controls.ts` er én intern sannhetskilde for typekontraktene. Hovedkomponenten
  re-eksporterer de samme typene, og `$lib/ui`-inngangen er uendret.

De tre barna har hvert sitt semantiske ansvar, er ikke eksportert fra pattern- eller UI-indeksen og
bevarer eksakt DOM-anatomi og Tailwind-klasser. Sortering og reset forblir hos hovedkomponenten fordi
de er korte deler av den samlede content-/filterregelen, ikke nye selvstendige patterns.

## SWP-6.3 — smale offentlige patterns

Importgrafen er lest på nytt fra produksjonsfiler under `src/`; tester, fixtures og barrel-filer er
utelatt. Tellingen skiller mellom importerende komponenter og featureeierskap, slik at mange
forekomster i én arbeidsflyt ikke feilaktig blir presentert som flerfeaturebruk.

| Pattern/familie                                                 | Faktiske produksjonskonsumenter                                                                                     | Plasseringsbeslutning                                                                                                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Metric` og `MetricGrid`                                        | To navngitte statistikkkomponenter; to grids og minst fire metricforekomster                                        | Behold i offentlig UI. Typografi, flate, statusfarge og responsivt grid er en stabil produktkontrakt; statistikkfeaturet leverer bare data, tekst, ikon og datadrevet geometri.  |
| `DataTable`, `DataVisualization` og `Visualization*`            | Henholdsvis 2, 4, 3, 2 og 1 importerende statistikkkomponenter                                                      | Behold som én offentlig presentasjonsfamilie. Flere uavhengige statistikkflater deler tabell-, diagram-, legend- og layoutreglene, mens featurelaget eier beregnet SVG-geometri. |
| `FormSteps`                                                     | Én arrangementeditor                                                                                                | Behold i `Form`-familien. Patternet eier typed stegvalg, `aria-current`, nummerering, navigasjonsanatomi og innholdsgeometri; flytting ville gjort produktstyling featurelokal.  |
| `AppShell` og `NavigationAction`/`Identity`/`Overlay`/`Section` | Én session-feature, fordelt på desktop-, mobil- og overlaykomponenter; overlayet rendres to ganger                  | Behold. Dette er den dokumenterte app-shellkontrakten og samme navigasjonsanatomi brukes på flere responsive flater.                                                             |
| `SettingsChoiceGroup` og `SettingsRange`                        | Én importerende featurekomponent hver, men henholdsvis tre og seks reelle feltforekomster                           | Behold i `Settings`-familien. Begge er domenenøytrale, typede feltanatomier med repeterte konsumenter, ikke arbeidsflytkomponenter.                                              |
| `DocumentSection`                                               | Én policykomponent med seks dokumentseksjoner                                                                       | Behold i `Document`-familien. Semantisk seksjonsstruktur, overskrift og produktspacing er stabil og gjentatt.                                                                    |
| Øvrige smale offentlige patterns                                | To til fjorten importerende komponenter på tvers av to til ni features, eller navngitte barn i en offentlig familie | Behold. Importgrafen viser reelt delt eierskap; ingen fil inneholder domene-, API-, route- eller featureavhengigheter.                                                           |

Ingen produksjonskomponent flyttes i dette checkpointet. En flytting av de enkeltfeaturebrukte
patternene ville enten gjort offentlig produktstyling featurelokal eller bare endret filplassering
uten å endre eier eller kontrakt. De beholder derfor den eneste lovlige avhengighetsretningen:
features importerer `$lib/ui`, mens UI-laget ikke kjenner features.

Grafen avdekket samtidig en annen kategori som ikke skal blandes med plassering: `NavigationLoading`
brukes privat av `AppShell`, og flere offentlig re-eksporterte hjelpertyper har ingen ekstern
produksjonskonsument. De vurderes som API-rekkevidde og dødkode i SWP-6.4, ikke som grunnlag for å
flytte implementasjonen til en feature.

## SWP-6.4 — død kode, API, utilities, tokens og pakker

Sluttauditen kombinerte full Knip-analyse med SvelteKits faktiske innganger, den manifestdrevne
stylingfixturekatalogen, det dynamisk startede produksjonstretestscriptet, `$lib/ui`-importgrafen og
en toveis sammenligning mellom registrerte theme-utilities og produksjonsmarkup. Resultatet etter
opprydding er null ubrukte runtimefiler, verdi-exports, direkte pakker, ulistede pakker, binaries og
uoppløste importer. Knip rapporterer fortsatt 19 komplette transporttyper under `lib/contracts`;
disse er bevisst beholdt som frontendens backendkontrakt og er ikke runtimekode.

API-oppryddingen er konkret:

- `NavigationLoading` er ikke lenger eksportert fra pattern- eller `$lib/ui`-barrelen. Komponenten
  beholdes som privat, faktisk brukt barn av `AppShell`, og navigation-fixturen tester den direkte.
- De ukonsumerte offentlige typenavnene `SelectOption`, `DataTableAlignment`, `DataTableCell`,
  `DataTablePresentation`, `DataTableVisibility`, `DataVisualizationKind`,
  `VisualizationLayoutVariant` og `VisualizationLegendItem` er fjernet fra barrelene. Props og de
  brukte `DataTableColumn`-/`DataTableDirection`-/`DataTableRow`-kontraktene er uendret.
- `CollectionChoiceContext`, `CollectionControlField` og `CollectionControlGroup` eksporteres nå
  direkte fra den interne sannhetskilden gjennom `$lib/ui`. De døde komponentmodulaliasene
  `CollectionChoiceOption`, `CollectionSearchControl` og `CollectionSortControl` samt den ubrukte
  eksportmarkøren på `CollectionChoiceOption` er fjernet.
- `validateStylingGuardContract` og `pathMatchesRoot` er gjort private i guardmodulen; begge brukes
  internt, men hadde ingen modulimportør.

Theme-rekkevidden fant seks registrerte Tailwind-projeksjoner uten én eneste eksakt utility i
produksjonsmarkup: `color-control-surface-strong`, `color-border`, `color-foreground`,
`width-dialog`, `max-width-dialog` og `max-height-dialog`. Bare projeksjonene og de tilsvarende
guardrollene er fjernet; kildeverdiene beholdes der de fortsatt inngår i base-CSS eller aktive
sammensatte tokens. Kontrakten går dermed fra 662 til 656 roller og fra 912 til 904 godkjente
utilities. Ny toveis kontroll fant null ubrukte gjenværende theme-projeksjoner, egendefinerte
utilities eller varianter, og produksjonskontrollen fant null foreldreløse custom properties.

Ingen produksjonskomponentfil, kilde-token eller npm-pakke var faktisk foreldreløs etter denne
oppryddingen, så ingen slik implementasjon er slettet på grunnlag av navnelikhet alene. De to
hostbuildene beholder 60 JS-chunks, 123 363 gzip-byte største lazy chunk og eksakt 28 424/28 443
CSS gzip-byte; de døde theme-projeksjonene var allerede utelatt av Tailwinds genererte CSS.
