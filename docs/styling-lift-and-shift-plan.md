# Styling lift-and-shift: Tailwind, themes og komponenteierskap

> **Status:** Fullført historisk utførelsesplan for SWP-0–SWP-7
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Sist oppdatert:** 2026-08-23

## Mål

Flytt den verifiserte SvelteKit-frontenden fra en global, selectorstyrt CSS-implementasjon til
Tailwind v4 i det offentlige UI-laget, uten funksjonell eller visuell redesign. Bevar de semantiske
Svelte-komponentene og Bits UI-grensen, sentraliser all theme-identitet, og etabler maskinelle guards
som hindrer at features innfører lokale produktvarianter etter migreringen.

Dette er en styling lift-and-shift. Observerbar produktadferd, informasjonshierarki, URL-er,
backendkontrakter, tilgjengelighetsatferd og godkjent mobil-/desktopdesign skal ikke endres med
mindre et avvik dokumenteres og brukeren godkjenner det separat.

Den bindende målbeslutningen ligger i
[`ADR-006`](./adr/006-tailwind-styling-and-theme-ownership.md).

## Utførelsesregel for `/start`

Denne regelen beskriver hvordan SWP-checkpointene ble gjennomført. Alle pakkene er fullført; en ny
`/start` skal lese vedlikeholdsstatusen og skal ikke velge en ny SWP-pakke fra dette dokumentet.

`/start` leser [`migration-status.md`](./migration-status.md), velger første ufullførte checkpoint i
den aktive `SWP-*`-pakken og gjennomfører bare dette checkpointet. Hver sesjon skal:

1. verifisere git-, status- og baseline-sannheten etter protokollen i `AGENTS.md`
2. lese hele den aktive arbeidspakken og ADR-006
3. kartlegge berørte Svelte-komponenter, eksisterende selektorer, responsive regler og tester
4. migrere én sammenhengende familie eller én guardkontrakt
5. slette erstattede regler i samme checkpoint; permanente parallelle stylingbaner er forbudt
6. kjøre arbeidspakkens port og oppdatere statusen med eksakt neste checkpoint
7. opprette én lokal, grønn checkpoint-commit og stoppe før neste checkpoint

En familie kan midlertidig bruke gammel global CSS frem til familiens eget checkpoint. Ny og
endret kode følger ADR-006 umiddelbart. Baselineunntak kan bare reduseres.

## Faste arkitekturgrenser

### Theme og tokens

- Vanlige CSS custom properties er autoritativ kilde for produktidentitet.
- `@theme inline` eksponerer et smalt, semantisk utilityvokabular.
- Komponenter bruker aldri rå klubbpalett når en produktrolle finnes.
- Lyst, mørkt og en eventuell senere identitet endrer verdier, ikke komponentmarkup.
- Theme-filer kan definere verdier; features kan bare konsumere dem gjennom offentlig UI eller et
  eksplisitt visualiseringsunntak.

### Offentlig UI

- `ui/primitives` og `ui/patterns` eier visuell produktimplementasjon.
- Tailwind-utilities ligger direkte i komponentmarkup; `@apply` er forbudt.
- Typed props og varianter er eneste offentlige tilpasningsgrense.
- Konsumenter kan ikke bruke `class` eller `style` som uregistrert variant-API.
- Bare primitives kan lese Bits UI sine interne states og CSS-variabler.

### Features og routes

- Features og routes importerer bare offentlig UI.
- Lokal CSS, inline style og visuelle utilitykomposisjoner er forbudt som standard.
- Nøytral arbeidsflyt uttrykkes med eksisterende patterns; mangler et pattern, forbedres det først.
- Statistikk og annen faktisk datadrevet visualisering bruker en lukket allowlist for geometri.
- Et visualiseringsunntak kan ikke definere produktidentitet.

## Guardstrategi under migreringen

Guardene etableres før den brede konverteringen. Fordi dagens globale CSS er kjent migreringsgjeld,
brukes en maskinlesbar baseline med eksakt fil, regeltype og begrunnelse:

- baselinegodkjent gjeld kan overleve frem til eierfamiliens checkpoint
- nye forekomster av samme gjeld feiler umiddelbart
- et checkpoint kan bare redusere eller bevare total baseline, aldri øke den
- slettede unntak kan ikke legges tilbake
- sluttporten krever tom legacybaseline; visualiseringsunntak føres i en separat, varig allowlist

Kontrollene skal bruke Svelte-/CSS-AST der det er praktisk, ikke bygge sikkerhetsgrenser på skjøre
regexer alene.

### Guardene skal håndheve

1. Bits UI-import bare fra `ui/primitives`.
2. Ingen feature-/route-eid `style=`, `style:*`, `<style>` eller CSS-import uten eksplisitt
   visualiseringsunntak.
3. Ingen `class`/`style`-overstyring på offentlige `$lib/ui`-komponenter fra features/routes.
4. Ingen rå palettklasser, ulovlige arbitrary values, important-modifier eller ordinære `dark:*`
   produktvarianter.
5. Alle visuelle utilityroller må finnes i den autoritative theme-kontrakten.
6. Dynamiske class-uttrykk må kunne løses til et endelig, validert sett med hele klassenavn.
7. Ingen `@apply`, nye globale produktselektorer eller app-eid `!important`.
8. CSS custom properties må være definerte, brukte og eid av riktig lag.
9. Global CSS må ligge i Tailwinds etablerte cascade layers; uventede ulagrede regler feiler.
10. Guardene har positive og negative fixturetester som beviser at hvert forbud faktisk utløses.

## Arbeidspakker

### SWP-0 — Kald baseline og guardkontrakt

#### Checkpoints

1. **Maskinlesbar stylingbaseline**
   - mål CSS-filer, linjer, regler, selectors, layers, `!important`, rå verdier, utilitybruk,
     inline style og unntak
   - registrer nøyaktig legacygjeld med eierfamilie; ikke bruk brede katalogunntak
   - dokumenter initial CSS gzip og relevante lazy chunks fra en fersk produksjonsbuild
2. **Visuell og interaktiv referanse**
   - frys representative screenshots for app-shell/navigation, Page/Section, Collection,
     Form/Settings, Dialog/Select/Calendar, editor og statistikk
   - dekk mobil/desktop og lyst/mørkt theme der uttrykket faktisk skifter
   - registrer fokus-, tastatur-, overflow- og konsollforventninger
3. **Guarddesign og fixturekontrakter**
   - spesifiser tillatte semantiske utilities, nøytrale strukturutilities og
     visualiseringsunntak
   - opprett positive og negative fixtures før guardene kobles til hele treet

#### Kvalitetsport

- baseline kan regenereres deterministisk fra repoet
- hvert legacyavvik har eksakt eier og planlagt fjerningspakke
- skjermbildematrise og relevante E2E-flyter er grønne før første visuelle endring
- ingen produkt- eller backendendring er blandet inn

### SWP-1 — Tailwind theme-fundament og håndhevende guards

#### Checkpoints

1. **Theme-kontrakt**
   - del rå identitetsverdier, semantiske produktroller og Tailwind-eksponerte roller tydelig
   - etabler `@theme inline` for farge, typografi, radius, skygge og nødvendige kontrollroller
   - behold lyst/mørkt theme gjennom samme semantiske variabler
2. **Cascade og base**
   - bruk Tailwinds etablerte `theme`, `base`, `components` og `utilities`-lag konsekvent
   - reparer ulagrede appregler uten å endre observerbart uttrykk
   - dokumenter nødvendig Preflight- og baseeierskap
3. **Guards i `npm run check`**
   - implementer AST-baserte feature-, utility-, theme-, override- og CSS-gjeldskontroller
   - koble fixturetestene og den avtakende baselinen til CI-porten

#### Kvalitetsport

- theme-bytting endrer representative computed styles gjennom sentrale variabler
- ingen ny stylinggjeld kan introduseres i features, routes eller offentlig UI
- alle guards beviser både godkjent og avvist kode med fixtures
- full `npm run check`, komponenttester, visuell matrise og produksjonsbuild er grønne

### SWP-2 — UI-primitives og Bits UI-grensen

Primitives migreres i små, sammenhengende checkpoints:

1. base, Icon, Button/ButtonLink, Input og Textarea
2. ChoiceButton, Switch, Radio og accordion
3. Select, Dialog, Tabs, Calendar, DatePicker og MultiDatePicker
4. RichTextEditor-primitiven og nødvendige tredjeparts-/portalregler

Hvert checkpoint flytter styling til statiske Tailwind-klasser i primitivekomponenten, bruker bare
semantiske visuelle roller, bevarer Bits UI-state og sletter erstattede primitive-selectors.

#### Kvalitetsport per checkpoint

- primitive-API, formdata, fokus, tastatur, portal og ARIA er uendret
- lyst/mørkt, mobil/desktop og disabled/pending/error-states er visuelt grønne
- ingen Bits UI-detalj eller klassekontrakt lekker til patterns/features
- gammel CSS for checkpointets primitives er slettet, og baseline er redusert

### SWP-3 — Offentlige produktpatterns

Patterns migreres etter stabil avhengighetsrekkefølge:

1. Page, Section, Feedback, loading/error og Document
2. Form og Settings
3. Collection, CollectionControls og CollectionRow-familien
4. Dialog/EditorDialog, Tabs og RichTextEditor-patterns
5. ScheduleTime, Weather, Metric og andre små delte patterns

Et checkpoint kan dele interne komponenter når det gir én tydelig stylingeier, men skal ikke endre
produktadferd eller gjennomføre en samtidig generell feature-refaktor.

#### Kvalitetsport per checkpoint

- typed props og offentlig UI-vokabular er fortsatt den eneste featuregrensen
- utilities bruker semantiske theme-roller; features trenger ingen klasseoverstyring
- responsive regler ligger med komponenten som eier skiftet
- kontrakt-, axe- og visuelle tester passerer før gamle pattern-selectors slettes

### SWP-4 — App-shell, navigation og responsive arbeidsflater

#### Checkpoints

1. Navigation-familien og loading-/overlaystates
2. AppShell med desktop-sidefelt, mobil topp-/bunnflate og safe areas
3. Page-/shell-samspill, bakgrunner, tenantidentitet og lyst/mørkt theme
4. sletting av erstattede navigation-/shell-regler og relevante deler av `responsive.css`

#### Kvalitetsport

- menyutvalg, rekkefølge, kapabilitetsskjuling og aktiv route er uendret
- mobil og desktop har samme verifiserte fokusrekkefølge og landmarks som baseline
- ingen global selector avhenger av dyp app-shell-/page-DOM
- visuelle snapshots er identiske eller har et eksplisitt, godkjent avvik

### SWP-5 — Features, visualisering og siste legacy-CSS

#### Checkpoints

1. kald gjennomgang av alle routes/features for styling- og klasseoverstyringer
2. statistikk: flytt unik diagramgeometri til navngitte, skoperte unntak eller statiske utilities;
   behold alle identitetsverdier i theme-kontrakten
3. slett `feature-compositions.css` når siste aktive regel har ny eier
4. slett `patterns.css`, `responsive.css` og `primitives.css` når deres aktive eiere er migrert;
   behold bare dokumentert base/theme/global CSS
5. fjern transition-baselinen og lås varig visualiseringsallowlist

#### Kvalitetsport

- routes/features har null uregistrert lokal styling
- varig visualiseringsallowlist inneholder bare faktisk datadrevet geometri
- ingen globale produktselector-filer eller parallelle stylingbaner gjenstår
- full test-, check-, E2E-, snapshot- og produksjonsbuildport er grønn

### SWP-6 — Komponent- og offentlig API-opprydding

Denne pakken utføres etter at styling ikke lenger skjuler komponenteierskapet.

#### Checkpoints

1. vurder `ArrangementEditor`, `CourtsSection` og andre store featureorkestratorer; trekk bare ut
   state/controller eller arbeidsflyt når ansvaret blir tydeligere uten generisk abstraksjon
2. vurder `CollectionControls` og andre store offentlige patterns for intern oppdeling med uendret
   offentlig kontrakt
3. flytt eller behold `Metric`, `MetricGrid`, `FormSteps` og andre smale patterns basert på faktisk
   flerfeatureeierskap
4. fjern døde exports, komponenter, utilities, tokens og pakker etter den ferdige migreringen

#### Kvalitetsport

- komponenter har én tydelig eier og offentlig inngang
- ingen oppdeling endrer produktadferd eller introduserer prop-forwarding-abstraksjoner
- statisk død-kodeanalyse, tester og full check er grønne
- offentlig UI-API inneholder bare stabile, reelle produktbyggesteiner

### SWP-7 — Uavhengig styling-konformitetsreview

SWP-7 starter i en ny `/start`-sesjon etter at SWP-6 er checkpointgodkjent. Første audit skal ikke
markere arbeidet fullført bare fordi migreringssesjonene var grønne. Den sammenligner kaldt
SWP-0-baseline, samlet git-diff, nåværende kode, bygget CSS og kjørbar frontend.

#### Målematrise

| Område               | Bestått når                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Funksjonell paritet  | Kritiske komponent- og E2E-flyter er uendret grønne                                                |
| Visuell paritet      | Referansematrisen passerer; alle avvik er eksplisitt godkjent                                      |
| Theme-sentralisering | Produktfarge, font, radius og skygge kan endres gjennom theme-kontrakten uten featureendringer     |
| Featuregrenser       | Ingen uregistrert `style`, `<style>`, CSS-import, visual utility eller UI-klasseoverstyring finnes |
| Tailwind-vokabular   | Offentlig UI bruker bare statisk analyserbare strukturutilities og semantiske visuelle roller      |
| Bits UI              | Import og intern state er fortsatt innkapslet i primitives                                         |
| CSS-kaskade          | Ingen uventede ulagrede regler eller app-eid `!important` finnes                                   |
| Legacy               | Transition-baseline og globale produktselector-filer er fjernet                                    |
| Vedlikeholdbarhet    | Styling har én tydelig eier; responsive regler og variants finnes ved eierkomponenten              |
| Størrelse            | Initial CSS holder produksjonsbudsjettet og har ingen udokumentert regresjon fra SWP-0             |
| Dokumentasjon        | ADR, arkitektur, produktregler, guards og status beskriver faktisk kode                            |

#### Resultatklassifisering

- **Vellykket:** Alle radene er bestått, transition-baselinen er tom, full verifikasjon er grønn og
  en ny agent kan finne stylingeier og theme-kontrakt uten samtalehistorikk.
- **Delvis:** Produktet er grønt, men minst én legacy-, guard-, theme- eller eierskapsrad gjenstår.
  Status forblir aktiv og navngir et nytt, avgrenset rettingscheckpoint.
- **Ikke vellykket:** Funksjonell/visuell paritet er brutt, theme krever spredte featureendringer,
  eller guardene kan omgås i vanlig Svelte-kode. Migreringen kan ikke markeres fullført.

Auditens bevis lagres i `docs/styling-conformance-evidence.md`. Filen opprettes først i SWP-7, slik
at den beskriver målt resultat og ikke en forhåndsskrevet konklusjon. Funn rettes i egne
checkpoints; en senere, kald `/start` kjører sluttporten på nytt før status settes til fullført.

## Fast verifikasjon

Minimum etter hvert kodecheckpoint:

- berørte unit-/komponent-/axe-tester
- `npm run architecture:check`
- `npm run design-system:check`
- nye styling-guardfixtures
- `npm run typecheck`
- relevante visuelle snapshots
- `git diff --check`

Full port ved arbeidspakkeskifte og SWP-7:

- `npm test`
- `npm run check`
- kritiske Playwright-flyter
- komplett styling-snapshotmatrise
- Cloudflare Pages- og GitHub Pages-build
- produksjonsbundle- og CSS-måling
- statisk død-kode- og direkte avhengighetskontroll

## Stoppregler

Stopp for brukerbeslutning dersom stylingarbeidet krever:

- en bevisst redesign eller endring av produktreglene
- nye backenddata eller backendendring
- en featurelokal visuell variant uten en naturlig offentlig UI-eier
- en permanent guard-unntakskategori utover datadrevet geometri
- ekstern deploy, produksjonsdata eller annen utvidet autoritet

Vanlig selector-, Tailwind- eller komponentusikkerhet er ikke en stoppgrunn. Inspiser eier,
kontrakter, tester og visuell baseline, velg det smaleste idiomatiske mønsteret og dokumenter det i
checkpointet.
