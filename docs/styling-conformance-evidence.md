# SWP-7.3 uavhengig styling-konformitetsreview

> **Resultat:** Ikke vellykket — SWP-7.4 har lukket de fire guardfunnene, men oppstartsvalget står
>
> **Reviewstatus:** SWP-7.3-auditen og SWP-7.4-rettingen er fullført; SWP-7 forblir aktiv
>
> **Revidert kildecheckpoint:** `6772f1f` (`test(swp-7): make static audit reproducible`)
>
> **Rettelsescheckpoint:** SWP-7.4 (`fix(swp-7): close remaining styling guard channels`)
>
> **SWP-0 guard-/målebaseline:** `700cd2b` / `85cc31f`
>
> **Dato:** 2026-08-25

## Konklusjon

Den ferdige frontendkilden og begge produksjonsmålene er funksjonelt og visuelt grønne. Alle 346
tester, de tre kritiske flytene, elleve uendrede visuelle referanser og åtte produksjonsruter
passerer. Registrert CSS har null legacygjeld og null ulagrede regler, og produksjonstreet
rapporterer null diagnostics over 184 kilder.

Den kalde SWP-7.3-reviewen klassifiseres likevel som **ikke vellykket** etter den bindende
definisjonen i [`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md). Fire uavhengige
kontrollprober passerer guardene uten diagnostic:

1. En ny offentlig UI-komponent kan forwarde en bred native attributtype og eksponere `class` og
   `style` uten å bli oppdaget av den manuelt registrerte typekontrollen.
2. En identifier-spread i offentlig UI kan skjule `class` og `style`; bare inline
   object-expression-spreads inspiseres.
3. En gyldig CSS-referanse med whitespace, `var( --navn)`, går utenom
   custom-property-kontrakten.
4. Feature- eller routekode kan sette styling imperativt gjennom DOM-API-er i `<script>`; bare
   markup- og CSS-kanaler analyseres.

I tillegg inneholder `src/app.html` en permanent oppstartsflate med rå produktfarger, font og
radius. Baselineverktøyet måler flaten som `startup-document-contract`, men stylingguardene
oppdager ikke `.html`, og ADR-/produkt-/guarddokumentasjonen navngir verken kontrakten eller dette
ekstra permanente unntaket. Produktidentiteten kan derfor ikke endres bare gjennom
theme-kontrakten.

Ingen av hullene brukes til skjult styling i dagens routes, features eller offentlige UI. Dette er
et håndhevings-, eierskaps- og dokumentasjonsfunn, ikke et påvist produktavvik. Planen sier likevel
eksplisitt at en guard som kan omgås i vanlig Svelte-kode gjør resultatet «ikke vellykket».
Produktkode og backend er ikke endret i audit-checkpointet.

SWP-7.4 har etter denne kalde auditen lukket alle de fire reproduksjonsprobene under uten å endre
produktadferd eller oppstartsdokumentet. Den overordnede klassifiseringen forblir likevel «ikke
vellykket» frem til brukeren har besluttet oppstartskontrakten og en ny kald review har bestått alle
elleve rader.

## SWP-7.4 rettingsbevis

- Den manuelle listen over 31 forwardere er fjernet. Typeporten avleder nå alle runtimekomponenter
  direkte fra `$lib/ui`-barrelen, beviser at barrelen faktisk bare eksponerer komponenter, og avviser
  `class`/`style` på enhver nåværende eller senere offentlig eksport. En isolert bred-forwarderprobe
  beviser den negative typekontrakten.
- Native spreads hos offentlig UI må komme fra `PublicHtmlAttributes`, en eksplisitt runtime-
  destrukturering som fjerner både `class` og `style`, eller en fullstendig statisk object-expression.
  Typebeviset avviser unioner, intersections og brede indekser som kan gjeninnføre feltene. Lokale
  identifier-bindinger følges for å finne skjult `class`/`style`; ukjente eller muterte bindinger
  feiler lukket. Calendar-primitiven filtrerer de tre Bits UI-attributtsettene eksplisitt før de
  når native DOM.
- Én felles CSS-tokenizer finner custom-property-referanser med whitespace, kommentarer, escapes og
  nestede fallbacks. Stylingpolicyen, den project-wide baselinen og designsystemets token-/
  rekkeviddekontroll bruker samme parser.
- Svelte instance-/module-script analyseres for `style`, `cssText`, `className`, `classList`,
  CSSStyleDeclaration-mutasjoner, stylingattributter og dynamiske attributtnavn. Alias av `style` og
  `classList` følges. Fokus samt statiske ARIA-/semantiske attributtoperasjoner er eksplisitt bevist
  tillatt.
- Guardkontrakten er bumpet til schema 5 og registrerer offentlig forwarding og scriptkanalene
  maskinelt. Fixturematrisen er utvidet fra 28 til 34 filer med positive og negative bevis for alle
  nye grener.

| Tidligere passerende kontrollprobe                      | SWP-7.4-resultat                         |
| ------------------------------------------------------- | ---------------------------------------- |
| Ny bred offentlig UI-forwarder                          | Avvist med `STYLING-007-CSS-APPLICATION` |
| Identifier-spread med skjult `class` og `style`         | Avvist med `STYLING-007-CSS-APPLICATION` |
| `var( --unregistered-product-color)` og nestet fallback | Avvist med `STYLING-008-CUSTOM-PROPERTY` |
| `$effect(() => element.style.setProperty(...))`         | Avvist med `STYLING-002-FEATURE-STYLING` |
| Fokus og statiske `aria-*`-/semantiske DOM-operasjoner  | Tillatt uten diagnostic                  |

SWP-7.4-porten er grønn: 95 testfiler/346 tester, full `npm run check`, 3/3 kritiske flyter,
11/11 uendrede visuelle referanser og 8/8 produksjonsruter. Begge hostene har 60 JS-chunks,
123 363 gzip-byte største lazy chunk, 28 475/28 496 initiale CSS-byte og 38 151/38 190 initiale
JavaScript-byte. `npm audit --audit-level=moderate` rapporterer fortsatt bare de seks kjente lave
transitive funnene. `src/app.html` og backend er urørt.

## Scope og metode

Reviewet startet fra en ren arbeidskopi på `feature/sveltekit-lift-and-shift`, 72 commits foran
merge-base `5287c5e` mot `main`. Følgende ble lest og kontrollert på nytt uten å gjenbruke
konklusjonen fra den første SWP-7-auditen:

- hele SWP-0-baselinen, stylingdiffen `85cc31f..6772f1f` og den ferdige produksjonskilden
- alle stylingguardregler, parserkanaler, fixtures, mutasjonsprober og produksjonstrekontrakter
- offentlig UI-barrel, native prop-forwardere, theme-projeksjon, custom-property-graf og cascade
- `src/app.html`, oppstarts-/asset-recovery-kontrakten og dokumentert stylingeierskap
- komponent-, axe-, arkitektur-, legacy-, statisk analyse-, design- og stylingkontroller
- kritiske og visuelle Playwright-flyter samt begge hostbuildene og produksjonsrutematrisen
- ADR-er, arkitektur, produktregler, guarddokumentasjon, driftshåndbok og migreringsstatus

Backend-repoet ble ikke endret. Playwright brukte den eksisterende lokale testharnessen og ryddet
egne mutasjoner.

## SWP-7.3-målematrise

Tabellen fryser utfallet fra den kalde SWP-7.3-auditen. SWP-7.4-rettingen over lukker de fire
guard-/API-radene, men matrisen omskrives ikke som en ny kald review før oppstartskontrakten er
besluttet i SWP-7.5.

| Område               | Resultat     | Målt bevis                                                                                       |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| Funksjonell paritet  | Bestått      | 95 testfiler/346 tester, 3/3 kritiske flyter og 8/8 produksjonsruter passerer                    |
| Visuell paritet      | Bestått      | 11/11 referansesnapshots passerer uten oppdatering eller godkjent avvik                          |
| Theme-sentralisering | Ikke bestått | Oppstartsflaten dupliserer rå produktidentitet utenfor theme-kontrakten                          |
| Featuregrenser       | Ikke bestått | Direkte DOM-styling i script og nye brede UI-forwardere kan introduseres uten diagnostic         |
| Tailwind-vokabular   | Ikke bestått | Identifier-spreads kan skjule ikke-analyserte `class`-/`style`-verdier i offentlig UI            |
| Bits UI              | Bestått      | Bits UI-importer finnes bare under `src/lib/ui/primitives`; intern state er innkapslet           |
| CSS-kaskade          | Bestått      | Fire registrerte stilark, ti lagrede regler, null ulagrede regler og fire godkjente `!important` |
| Legacy               | Bestått      | Null transition-baseline, featureklasser, `@apply` og globale produktselector-filer              |
| Vedlikeholdbarhet    | Ikke bestått | API-oppdagelse og stylingkanaler er ikke komplette; oppstartsidentitet har ingen besluttet eier  |
| Størrelse            | Bestått      | CSS-regresjonen fra SWP-0 er målt og begge hostene holder 50 KiB-budsjettet                      |
| Dokumentasjon        | Ikke bestått | Fail-closed- og eneste-unntakspåstandene beskriver ikke guardhullene eller oppstartsflaten       |

Fem rader er ikke bestått. Guardomgåelsene utløser alene planens eksplisitte kriterium for «ikke
vellykket».

## Kvantitativ avstemming mot SWP-0

| Måling                               | SWP-0 | SWP-7.3 | Endring |
| ------------------------------------ | ----: | ------: | ------: |
| Aktive CSS-filer                     |     7 |       4 |      -3 |
| CSS-linjer                           | 5 973 |   2 045 |  -3 928 |
| CSS-regler                           |   780 |      10 |    -770 |
| Selectors                            |   846 |      12 |    -834 |
| Ulagrede regler                      |    91 |       0 |     -91 |
| `@apply`-direktiver                  |     3 |       0 |      -3 |
| `!important`-deklarasjoner           |    75 |       4 |     -71 |
| Registrerte legacyavvik              | 2 233 |       0 |  -2 233 |
| Featureklasseforekomster             |    52 |       0 |     -52 |
| Visualiseringskandidater/-unntak     |   106 |      38 |     -68 |
| Tailwind-utilityforekomster i Svelte |     0 |   1 271 |  +1 271 |

De fire gjenværende `!important`-deklarasjonene er den eksakt registrerte globale
reduced-motion-fallbacken. De 38 visualiseringsunntakene er seks inline custom-property-verdier og
32 SVG-geometriattributter hos fire navngitte statistikkeiere. De uttrykker geometri, ikke
produktidentitet.

Baselinen måler også fire styleblokker og sju styleattributter i markup. Tre blokker og seks
attributter er de registrerte statistikkgeometriene. Den siste 62-linjers blokken og det siste
attributtet ligger i `src/app.html` og er merket `startup-document-contract` uten planlagt
fjerningscheckpoint. Denne oppstartsflaten inngår ikke i de 38 visualiseringsunntakene.

Den registrerte produksjonskilden har 1 411 custom-property-definisjoner, 909 referanser og 1 271
Tailwind-utilityforekomster. Theme-kontrakten finner 656 roller, 904 semantiske utilities og 116
reelle lyst-/mørkt-skift. Cascade-kontrakten finner tre regler i `theme`, sju i `base` og ingen
app-eide regler i `components` eller `utilities`.

## Produksjonsstørrelse

| Artefakt                        |        SWP-0 | Fersk SWP-7.3 |                 Delta |
| ------------------------------- | -----------: | ------------: | --------------------: |
| Cloudflare CSS, gzip            |  21 862 byte |   28 475 byte | +6 613 byte / +30,2 % |
| GitHub Pages CSS, gzip          |  21 871 byte |   28 496 byte | +6 625 byte / +30,3 % |
| Cloudflare initial JavaScript   |  38 135 byte |   38 156 byte |              +21 byte |
| GitHub Pages initial JavaScript |  38 184 byte |   38 194 byte |              +10 byte |
| JavaScript-chunks               |           61 |            60 |                    -1 |
| Største lazy chunk, gzip        | 123 363 byte |  123 363 byte |                     0 |

CSS-økningen er forventet etter at Tailwind-utilities overtok presentasjonen, er dokumentert her
og er under produksjonsbudsjettet på 50 KiB gzip. Initial JavaScript varierer 9/10 byte fra den
innsjekkede SWP-7.2-målingen på grunn av regenererte buildartefakter, men holder 50 KiB-budsjettet.

## Kontrollprober som passerte feilaktig i SWP-7.3

Probene ble kjørt direkte gjennom samme `analyzeStylingSource` og schema 4-kontrakt som fixture- og
produksjonstre-portene bruker.

| Kanal og virtuell kilde                                                                         | Forventet guardutfall                        | Målt          |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------- |
| Offentlig UI: bred `HTMLAttributes` i `$props()` forwardes som `{...attributes}`                | `class`/`style` må være utelatt eller avvist | 0 diagnostics |
| Offentlig UI: `const styling = { class: "bg-red-500", style: "color:red" }; <div {...styling}>` | Spreadens styling må avvises                 | 0 diagnostics |
| Registrert CSS: `color: var( --unregistered-product-color)`                                     | Uregistrert custom property må avvises       | 0 diagnostics |
| Feature: `$effect(() => element.style.setProperty("color", "red"))`                             | Featureeid imperativ styling må avvises      | 0 diagnostics |

### Offentlig UI er ikke automatisk lukket

`src/lib/ui/public-html-attributes.test.ts` beviser at de 31 manuelt navngitte forwarderne bruker
en propkontrakt uten `class` og `style`. Testen oppdager ikke en ny komponent som ikke legges til i
den samme håndskrevne listen. Stylinganalysatoren undersøker markup, ikke prop-typene i scriptet,
så en ny `$lib/ui`-eier med `HTMLAttributes<HTMLElement>` og `{...attributes}` passerer både guard
og typekontroll.

For eksisterende public-UI-spreads inspiserer `staticSpreadStylingNames` bare
`ObjectExpression`. Et identifier-uttrykk returnerer en tom navneliste og godtas. Den andre proben
kan derfor skjule både rå palettutility og inline style bak et vanlig lokalt objekt.

Alle 31 registrerte offentlige og fem private forwardere i dagens kilde bruker
`PublicHtmlAttributes`, og ingen aktiv identifier-spread skjuler styling. Funnet gjelder at den
erklærte kontrakten ikke forblir lukket når vanlig ny UI-kode legges til.

### CSS-parseren overser gyldig whitespace

Både CSS-policyen og project-wide custom-property-innsamlingen bruker et mønster som krever at
custom-property-navnet følger direkte etter `var(`. CSS tillater whitespace der, og Chromium
aksepterer og løser `var( --navn)`. Proben kan dermed referere til en uregistrert produktrolle uten
at CSS- eller project-wide-kontrakten ser referansen.

Dagens fire registrerte stilark bruker ikke formen. Funnet gjelder en vanlig, gyldig CSS-skrivemåte
som `npm run check` feilaktig godtar.

### Scriptstyling er utenfor analysen

Markupbesøket klassifiserer Svelte-attributtkanaler, og CSS-policyen analyserer PostCSS-treet.
Script-AST-en undersøkes ikke for direkte DOM-stylingsinks som `element.style`, `cssText`,
`classList` eller styling gjennom `setAttribute`. Den fjerde proben introduserer derfor featureeid
produktstyling uten markupattributt, `<style>` eller CSS-import og passerer alle stylingreglene.

Det finnes ingen slik direkte DOM-styling i dagens routes eller features. Funnet krever en smal
scriptkontrakt som avviser stylingoperasjoner uten å forby legitime semantiske DOM-attributter.

## Oppstartsdokumentet mangler besluttet stylingeierskap

`src/app.html` må kunne vise boot- og asset-recovery-UI før SvelteKit-modulen er lastet. Den reelle
tekniske begrunnelsen gjør ikke presentasjonsflaten til legacykode, men eierskapet må være
eksplisitt. I dag inneholder dokumentet blant annet:

- rå `theme-color`, lys/mørk bakgrunn og produkttekst-/knappefarger
- literal systemfont, borderfarge og radius
- en 62-linjers ulagret styleblokk og `style="display: contents"` på app-roten

Kildebaselinen finner og fryser disse som `startup-document-contract`. Produksjonstrekontrollen
oppdager derimot bare `.svelte` og `.css`, og ADR-006, produktreglene og guarddokumentasjonen sier
at theme-identitet er sentral og at statistikkgeometri er det eneste permanente stylingunntaket.
Oppstartsidentiteten må redigeres separat fra `tokens.css`, og en ny agent kan ikke finne en
besluttet synkroniserings- eller guardkontrakt i dokumentasjonen.

Å gjøre dette til et nytt permanent guardunntak utover datadrevet geometri utløser planens
stoppregel. Før SWP-7 kan fullføres må brukeren velge om den eksakte pre-module-flaten skal være en
navngitt, maskinelt låst oppstartskontrakt, eller om identiteten skal genereres/sentraliseres på en
annen måte. Reviewet tar ikke produkt-/arkitekturbeslutningen på brukerens vegne.

## Eier-, theme- og legacybevis som er grønne

- `src/styles/design-system/tokens.css` eier rå identitet og semantiske produktroller for den
  modulinnlastede appen; `src/index.css` eier den eksplisitte Tailwind-projeksjonen.
- `src/styles/design-system/base.css` eier dokumentdefaults, tilgjengelighetsfallback og keyframes;
  `src/styles/design-system.css` er den registrerte importinngangen.
- Offentlig UI eier dagens statiske produktpresentasjon som semantiske Tailwind-utilities.
- Routes og features har ingen CSS-import, `<style>`, skjult class-spread eller imperativ styling.
- Statistikk er eneste besluttede visualiseringsunntak, med fire eksakte geometri-eiere.
- Bits UI-importer og intern state er innkapslet under primitives.
- Det finnes ingen React-kilde, transition-baseline, app-eid `@apply`, global produktselectorfil
  eller parallell stylingbane i den modulinnlastede appen.

## Dokumentasjonsfunn

Ved SWP-7.3 beskrev `scripts/styling-guards/README.md`, ADR-006, produktreglene og
migreringsstatusen schema 4 som fail-closed og statistikkgeometri som eneste permanente
stylingunntak. Kontrollprobene og oppstartsflaten viste at begge påstandene var for sterke. SWP-7.4
har avstemt guarddokumentasjonen mot schema 5 og lukket de fire Svelte-/CSS-kanalene. Baselinefilen
kjenner fortsatt etiketten `startup-document-contract`, men etiketten er ikke en dokumentert
arkitektur- eller guardbeslutning.

`docs/wp-7-production-evidence.md` er korrekt datert historisk WP-7-bevis, men
`development-and-operations.md` omtaler det som gjeldende bundlebevis selv om dagens CSS-/chunktall
er dokumentert i stylingbaselinen. Denne lenketeksten bør avstemmes når dokumentasjonen oppdateres
etter den besluttede oppstartskontrakten.

## Verifikasjon

| Kontroll                           | Resultat                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| SWP-7.4 kontrollprober             | Bestått: fire tidligere bypasser avvises; semantiske DOM-operasjoner tillates                  |
| SWP-7.4 styling-fixtures           | Bestått: schema 5, 34 fixtures, 10 stabile regler og eksakte diagnostics                       |
| SWP-7.4 offentlig UI-API           | Bestått: alle barrel-eksporterte runtimekomponenter utelater `class`/`style` automatisk        |
| SWP-7.4 produksjonstre             | Bestått: 184 kilder, ni ikke-cascade-regler og null diagnostics                                |
| SWP-7.4 `npm test` / full check    | Bestått: 95 filer/346 tester og alle deklarerte kvalitetporter                                 |
| SWP-7.4 kritisk/visuell E2E        | Bestått: 3/3 kritiske flyter og 11/11 uendrede referanser                                      |
| SWP-7.4 produksjonsruter/build     | Bestått: 8/8 ruter; 28 475/28 496 CSS-byte og 38 151/38 190 initiale JS-byte                   |
| SWP-7.3 `npm test`                 | Bestått: 95 filer og 346 tester                                                                |
| SWP-7.3 `npm run check`            | Bestått som implementert: deklarerte kvalitetporter var grønne                                 |
| Theme-/cascadekontrakt             | Bestått som implementert: 656 roller, 904 utilities, 116 skift; fire stilark og ti regler      |
| SWP-7.3 styling-fixtures           | Historisk: 28 fixtures var grønne, men de fire nye probene manglet dekning                     |
| SWP-7.3 styling-produksjonstre     | Historisk: 184 kilder og null diagnostics under schema 4                                       |
| SWP-7.3 `npm run test:e2e`         | Bestått: 3 kritiske flyter og 11 uendrede visuelle referanser                                  |
| SWP-7.3 produksjons-E2E            | Bestått: begge hostbuildene og 8/8 root-/base-path-ruter                                       |
| SWP-7.3 fersk bundlemåling         | Bestått: 28 475/28 496 CSS-byte, 38 156/38 194 initial JS-byte, 60 chunks og 123 363 lazy-byte |
| `npm audit --audit-level=moderate` | Bestått ved terskelen: 6 lave og 0 moderate, høye eller kritiske funn                          |
| SWP-7.3 kald kontrollprobematrise  | Historisk ikke bestått: fire ordinære stylingkanaler ga null diagnostics                       |
| `git diff --check`                 | Bestått etter SWP-7.4-rettingen                                                                |

## Avgrensede neste checkpoints

### SWP-7.4 — fullført

Alle fire guard-/API-kanalene er lukket i schema 5 med kilde-/barreldekkende offentlig API,
bevisbare native spreads, grammatikkbevisst custom-property-parsing og en smal Svelte-scriptport.
Hele test-, check-, E2E-, hostbuild-, bundle- og produksjonsruteporten er grønn uten produkt-,
oppstarts- eller backendendring.

### SWP-7.5 — beslutt og håndhev oppstartsdokumentets stylingkontrakt

Stopp for brukerbeslutning før implementasjon. Beslutningen må gjøre pre-module-behovet,
theme-synkronisering, tillatte verdier, guarddekning og dokumentasjon eksplisitt. Deretter kjøres en
ny kald elleveraders SWP-7-review. SWP-7 kan bare markeres fullført når alle radene er bestått.
