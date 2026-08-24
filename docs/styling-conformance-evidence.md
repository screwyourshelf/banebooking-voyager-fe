# SWP-7 uavhengig styling-konformitetsreview

> **Resultat:** Ikke vellykket
>
> **Revidert kildecheckpoint:** `e60c8f7` (`refactor(swp-6): remove dead public surface`)
>
> **SWP-0 guard-/målebaseline:** `700cd2b` / `85cc31f`
>
> **Dato:** 2026-08-24

## Konklusjon

Den ferdige frontendkilden, den kjørbare applikasjonen og begge produksjonsmålene er grønne. Full
testport passerer, alle elleve visuelle referanser er uendret, de kritiske flytene og alle åtte
produksjonsrutene passerer, legacygjeld er null, og theme-/cascade-kontraktene beskriver den aktive
kilden uten diagnostics.

Reviewet klassifiseres likevel som **ikke vellykket** etter den bindende definisjonen i
[`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md): stylingguardene kan omgås med
vanlig Svelte-syntaks. `svelte:element`, element- og komponentspreads samt `{@html ...}` blir ikke
analysert som stylingkanaler. Samtidig lar 31 komponenter i den offentlige `$lib/ui`-barrelen
fortsatt `class` og/eller `style` inngå i propkontrakten gjennom brede HTML-attributtyper. En
feature kan dermed typegyldig sende en stylingoverride gjennom en spread uten at guarden
rapporterer den.

Dette er et håndhevings- og API-funn, ikke et påvist visuelt avvik i dagens produktkode. Ingen
produktkode eller backend er endret i audit-checkpointet. Funnene skal rettes i separate,
avgrensede checkpoints før en ny kald sluttport kan klassifisere migreringen på nytt.

## Scope og metode

Reviewet ble utført fra en ren arbeidskopi på `feature/sveltekit-lift-and-shift`, 69 commits foran
merge-base `5287c5e` mot `main`. Følgende bevis ble avstemt uten å legge tidligere
migreringskonklusjoner til grunn:

- SWP-0-baselinen og den samlede stylingdiffen frem til `e60c8f7`
- alle aktive `.svelte`- og `.css`-kilder, UI-barreler, guardkode, fixtures og kontrakter
- theme-projeksjon, custom-property-graf, cascade layers og visualiseringsallowlist
- komponent-, axe-, arkitektur-, legacy-, design- og stylingkontroller
- kritiske og visuelle Playwright-flyter
- Cloudflare Pages- og GitHub Pages-produksjonsbuild med rutematrise og bundlemåling
- `npm audit` og en separat Knip-kjøring med eksplisitt registrerte fixtures og dynamisk testscript
- ADR-er, arkitektur, produktregler, guarddokumentasjon, driftshåndbok og migreringsstatus

Backend-repoet ble ikke endret. Playwright brukte bare den eksisterende lokale testharnessen og
ryddet egne mutasjoner.

## Målematrise

| Område               | Resultat     | Målt bevis                                                                                                                                           |
| -------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Funksjonell paritet  | Bestått      | 94 testfiler/345 tester, 3/3 kritiske flyter og 8/8 produksjonsruter passerer                                                                        |
| Visuell paritet      | Bestått      | 11/11 referansesnapshots passerer uten oppdatering eller godkjent avvik                                                                              |
| Theme-sentralisering | Bestått      | 656 roller, 904 semantiske utilities og 116 reelle lyst-/mørkt-skift; toveis audit har null foreldreløse eller ubrukte projeksjoner                  |
| Featuregrenser       | Ikke bestått | Aktiv kilde har null diagnostics, men spreads, `svelte:element` og `{@html}` kan omgå style-/class-reglene                                           |
| Tailwind-vokabular   | Ikke bestått | Aktiv offentlig UI er statisk analyserbar, men guarden undersøker ikke alle ordinære Svelte-kanaler og kan derfor ikke bevise den lukkede kontrakten |
| Bits UI              | Bestått      | Bits UI-importer finnes bare under `src/lib/ui/primitives`; features kjenner ikke intern state eller interne variabler                               |
| CSS-kaskade          | Bestått      | Fire registrerte CSS-filer, ti lagrede regler, null ulagrede regler og bare fire eksakt godkjente reduced-motion-`!important`                        |
| Legacy               | Bestått      | Null transition-baseline, null featureklasser, null `@apply` og ingen globale produktselector-filer                                                  |
| Vedlikeholdbarhet    | Ikke bestått | Offentlig UI lekker en alternativ stylingkanal, og den komplette Knip-auditen er ikke reproduserbar fra et pinnet repo-script                        |
| Størrelse            | Bestått      | CSS har vokst omtrent 30 % fra SWP-0, er dokumentert her og holder 50 KiB-budsjettet på begge hostmål                                                |
| Dokumentasjon        | Ikke bestått | Flere aktive dokumenter beskriver tidligere filantall, fase eller en interaction som koden ikke tilbyr                                               |

Fire matriserader er ikke bestått selv om dagens produkt er grønt. Guardomgåelsen utløser alene
planens eksplisitte kriterium for «ikke vellykket».

## Kvantitativ avstemming mot SWP-0

| Måling                               | SWP-0 | SWP-7 audit | Endring |
| ------------------------------------ | ----: | ----------: | ------: |
| Aktive CSS-filer                     |     7 |           4 |      -3 |
| CSS-linjer                           | 5 974 |       2 044 |  -3 930 |
| CSS-regler                           |   780 |          10 |    -770 |
| Selectors                            |   846 |          12 |    -834 |
| Ulagrede regler                      |    91 |           0 |     -91 |
| `@apply`-direktiver                  |     3 |           0 |      -3 |
| `!important`-deklarasjoner           |    75 |           4 |     -71 |
| Registrerte legacyavvik              | 2 233 |           0 |  -2 233 |
| Featureklasseforekomster             |    52 |           0 |     -52 |
| Visualiseringskandidater/-unntak     |   106 |          38 |     -68 |
| Tailwind-utilityforekomster i Svelte |     0 |       1 272 |  +1 272 |

De fire gjenværende `!important`-deklarasjonene er den eksakt registrerte globale
reduced-motion-fallbacken. De 38 visualiseringsunntakene er seks inline custom-property-verdier og
32 SVG-geometriattributter hos fire navngitte statistikkeiere. De uttrykker geometri, ikke
produktidentitet.

Den nåværende produksjonstrekontrollen oppdager 184 kilder, kjører ni ikke-cascade-regler og
rapporterer null diagnostics. Theme-kontrakten finner 1 411 custom-property-definisjoner og 909
referanser. Cascade-kontrakten finner tre regler i `theme`, sju i `base` og ingen app-eide regler i
`components` eller `utilities`.

## Produksjonsstørrelse

| Artefakt                        |        SWP-0 |  SWP-7 audit |                 Delta |
| ------------------------------- | -----------: | -----------: | --------------------: |
| Cloudflare CSS, gzip            |  21 862 byte |  28 424 byte | +6 562 byte / +30,0 % |
| GitHub Pages CSS, gzip          |  21 871 byte |  28 443 byte | +6 572 byte / +30,0 % |
| Cloudflare initial JavaScript   |  38 140 byte |  38 157 byte |              +17 byte |
| GitHub Pages initial JavaScript |  38 181 byte |  38 193 byte |              +12 byte |
| JavaScript-chunks               |           61 |           60 |                    -1 |
| Største lazy chunk, gzip        | 123 363 byte | 123 363 byte |                     0 |

CSS-økningen er forventet etter at Tailwind-utilities overtok presentasjonen, er eksplisitt målt
og er godt under produksjonsbudsjettet på 50 KiB gzip. Den er derfor ikke en størrelsesfeil.

## Kritisk funn: guardene kan omgås

Kontrollprober ble kjørt direkte gjennom samme `analyzeStylingSource` som fixture- og
produksjonstre-portene bruker. Kontrolltilfellene beviser at reglene er aktive; variantene beviser
at syntaktiske kanaler mangler.

| Virtuell featurekilde                                          | Forventet              |                              Målt |
| -------------------------------------------------------------- | ---------------------- | --------------------------------: |
| `<div class="bg-red-500">`                                     | Rå palett avvises      | 1 × `STYLING-002-FEATURE-STYLING` |
| `<svelte:element this="div" class={"bg-red-500"}>`             | Rå palett avvises      |                     0 diagnostics |
| `<div {...{ class: "bg-red-500", style: "color:red" }}>`       | Featurestyling avvises |                     0 diagnostics |
| `{@html \`<div class="bg-red-500" style="color:red"></div>\`}` | Featurestyling avvises |                     0 diagnostics |
| `<Page class="bg-red-500">`                                    | UI-override avvises    |     1 × `STYLING-003-UI-OVERRIDE` |
| `<svelte:element this={Page} class="bg-red-500">`              | UI-override avvises    |                     0 diagnostics |
| `<Page {...{ class: "bg-red-500", style: "color:red" }}>`      | UI-override avvises    |                     0 diagnostics |

Årsaken ligger i [`analyze.mjs`](../scripts/styling-guards/analyze.mjs): markupbesøket sender bare
`RegularElement` og `Component` til stylingreglene, hopper eksplisitt over `attributes` under
rekursjon og behandler ikke `SpreadAttribute` eller `HtmlTag`. Den supplerende featurekontrollen
søker bare etter literal `class="..."`; expression-, spread- og HTML-variantene blir derfor heller
ikke fanget der.

Produksjonskilden bruker ikke disse omgåelsene til produktstyling. Det eneste aktive
`svelte:element`-tilfellet er `Icon.svelte`, som oppretter en privat Hugeicons-node med kontrollerte
attributter. Det finnes ingen aktiv `HtmlTag`, action-, attachment- eller spreadbasert
featurestyling. Funnets alvor ligger i at `npm run check` tillater at dette introduseres senere.

## Offentlig UI tillater fortsatt stylingprops

Den offentlige kontrakten sier at typed produktprops og variants er eneste tilpasningsgrense, og
at konsumenter ikke kan bruke `class` eller `style`. Likevel arver følgende 31 exports brede
Svelte HTML-attributtyper uten å utelate begge stylingprops:

- primitives: `Button`, `ButtonLink`, `Input` og `Textarea`
- patterns: `Collection`, `CollectionList`, `Dialog`, `Document`, `DocumentFacts`, `DocumentIntro`,
  `DocumentSection`, `EditorDialog`, `Form`, `FormActions`, `FormField`, `FormFields`, `FormSubmit`,
  `Navigation`, `NavigationAction`, `NavigationIdentity`, `NavigationLink`, `NavigationList`,
  `NavigationSection`, `Page`, `Section`, `SettingsPanel`, `SettingsRange`, `SettingsRow`,
  `SettingsSection`, `SettingsStack` og `SettingsSwitchRow`

De fleste eierklassene skrives etter spreaden og vinner derfor over en direkte `class` ved
rendering, men dette gjør ikke propen til en lukket eller maskinelt bevist kontrakt. `style` blir
stående på DOM-noden og kan overstyre theme- og geometriverdier. For eksempel er
`<Page {...{ style: "color:red" }}>` typegyldig og passerer dagens guard.

Dagens features utnytter ikke åpningen. De tre aktive komponentspreadene i featurelaget går til
`Feedback` og inneholder bare typed, semantiske feedbackprops. Funnet skal derfor lukkes uten å
endre eksisterende produktmarkup eller introdusere en ny variant.

## Eier-, theme- og legacybevis

- `src/styles/design-system/tokens.css` eier rå identitet, semantiske produktroller og lyst/mørkt
  theme; `src/index.css` eier den eksplisitte `@theme inline`-projeksjonen til Tailwind.
- `src/styles/design-system/base.css` eier bare dokumentdefaults, tilgjengelighetsfallback og
  keyframes. `src/styles/design-system.css` er den registrerte importinngangen.
- Offentlig UI eier all statisk produktpresentasjon som semantiske Tailwind-utilities.
- Routes og features har ingen uregistrert CSS-import, `<style>` eller inline-styling.
- Statistikk er eneste visualiseringsunntak, med fire eksakte eiere og bare datadrevet geometri.
- Bits UI-importer og interne statekanaler er innkapslet under primitives.
- Det finnes ingen React-kilde, transition-baseline, app-eid `@apply`, global
  produktselectorfil eller parallell stylingbane.

En ny agent kan finne de tilsiktede eierne gjennom ADR-006, produktreglene, UI-barrelen,
`tokens.css`, `index.css` og guardkontrakten. API- og guardhullene betyr likevel at eiergrensen ikke
er fullstendig håndhevet.

## Dokumentasjons- og reproduserbarhetsfunn

Migreringsstatusens aktive måltall ble korrigert i dette audit-checkpointet. Følgende avvik står
igjen og gjør dokumentasjonsraden ikke bestått:

1. [`scripts/styling-guards/README.md`](../scripts/styling-guards/README.md) sier at cascade-porten
   analyserer sju stilark og at visualiseringsinventaret er midlertidig frem til SWP-5.2. Faktisk
   kontrakt har fire stilark og en permanent allowlist.
2. [`development-and-operations.md`](./development-and-operations.md) omtaler stylingløftet som
   uferdig og SWP-1-guardene i fremtid.
3. [`product-design-rules.md`](./product-design-rules.md) navngir `actions` som en egen
   `CollectionRow`-interaction. Typen tilbyr `static`, `open`, `action`, `expand` og `reorder`;
   `actions` er bare en snippet inni `expand`.
4. [`PRINCIPLES.md`](../src/styles/design-system/PRINCIPLES.md) sier at den globale CSS-flaten er to
   filer og at `tokens.css` eier Tailwind-theme. Den registrerte flaten er fire filer, og
   `@theme inline` ligger i `src/index.css`.

SWP-6-statusen beskriver en full Knip-audit med registrerte fixtures og kontrakttestscript. Repoet
har imidlertid ingen pinnet Knip-avhengighet, config eller script som gjenskaper akkurat denne
analysen. En kald standardkjøring av Knip 6.32.2 rapporterer 24 fixtures, tre bevisst dynamiske
produksjonstre-exports og 19 beholdte transporttyper. En midlertidig, eksplisitt config som
registrerte fixtureglobben og `scripts/test-styling-production-tree-contract.mjs`, og ignorerte
bare typediagnostics under `src/lib/contracts`, ga null øvrige funn. Configen ble slettet etter
reviewet; SWP-7.2 må gjøre kontrollen permanent og reproduserbar.

## Verifikasjon

| Kontroll                               | Resultat                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                             | Bestått: 94 filer og 345 tester                                                                                                                            |
| `npm run check`                        | Bestått: Svelte-typekontroll uten feil/advarsler; arkitektur, legacy, design, theme, cascade, fixtures, produksjonstre, baseline, lint og format er grønne |
| Styling-fixtures                       | Bestått som implementert: 23 fixtures, 10 regler og positive/negative tilfeller; auditprobene over viser manglende kanaldekning                            |
| Styling-produksjonstre                 | Bestått: 184 kilder, 9 regler og 0 diagnostics                                                                                                             |
| `npm run test:e2e`                     | Bestått: 3 kritiske flyter og 11 visuelle referanser                                                                                                       |
| `npm run test:e2e:production`          | Bestått: begge hostbuild og 8/8 root-/base-path-ruter                                                                                                      |
| Bundleport                             | Bestått: 37,3 KiB initial JavaScript, 27,8 KiB CSS, 120,5 KiB største lazy chunk og 60 chunks                                                              |
| `npm audit --audit-level=moderate`     | Bestått ved terskelen: 6 lave, 0 moderate/høye/kritiske; ingen kompatibel automatisk retting                                                               |
| Knip 6.32.2 med eksplisitt auditconfig | Bestått: bare de 19 dokumenterte transporttypene er ignorert                                                                                               |
| `git diff --check` før dokumentasjon   | Bestått                                                                                                                                                    |

## Avgrensede rettingscheckpoints

### SWP-7.1 — lukk markup- og offentlig UI-grense

1. Etabler én delt typekontrakt som utelater `class` og `style` fra offentlige HTML-attributter,
   og bruk den på de 31 berørte `$lib/ui`-exports uten produkt- eller DOM-endring.
2. Utvid AST-analysen til `SvelteElement`, `SpreadAttribute` og `HtmlTag`; ta en eksplisitt
   beslutning for actions, attachments og andre DOM-stylingsinks som parseren tilbyr.
3. Behold bare et smalt, eksakt bevist unntak for Icons kontrollerte dynamiske element.
4. Legg til positive og negative fixtures, mutasjonsprober og typekontrakttester som beviser at
   hver kanal både avvises og tillater legitim semantisk bruk.

### SWP-7.2 — reproduserbar statisk audit og dokumentavstemming

1. Pin Knip, sjekk inn config og et navngitt script, registrer fixture- og dynamiske innganger og
   dokumenter de 19 bevisst beholdte transporttypene.
2. Avstem guard-README, driftshåndbok, produktregler og design-systemprinsipper mot faktisk kilde.
3. Kjør statisk død-kode-, eksport-, utility-, token- og direkte avhengighetskontroll fra bare
   repoets deklarerte kommandoer.

### SWP-7.3 — ny uavhengig sluttport

Start en ny kald `/start` etter SWP-7.1 og SWP-7.2. Les baseline, samlet diff og ferdig kilde på
nytt; kjør hele test-, check-, E2E-, snapshot-, hostbuild-, bundle- og statisk analyseport. SWP-7
kan bare klassifiseres som vellykket når alle elleve matriserader er bestått.
