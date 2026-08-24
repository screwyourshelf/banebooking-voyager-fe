# SWP-5.1: kald route- og featureaudit

> **Status:** Fullført auditgrunnlag for SWP-5.2
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Målt mot:** SWP-4.4-baseline, 2026-08-24

## Formål og avgrensning

Auditten fastslår stylingeier før SWP-5 flytter eller sletter kode. Den dekker alle 23 route- og
65 featurekomponenter i produksjon, tilhørende CSS-importer, selectorankre og de 106 registrerte
visualiseringskandidatene. Ingen feature-, API-, produkt-, theme- eller backendadferd er endret.

Kildene er den komplette produksjonstreanalysen, `docs/styling-baseline.json`, de håndhevende
guarddiagnosticsene og et kaldsøk etter `class`, `style`, `<style>` og CSS-importer. Baseline og
produksjonstre matcher før noen migrering starter.

## Bevist route- og featuregrense

- `src/routes/+layout.svelte` har den eneste CSS-importen. `../index.css` er den registrerte
  root-inngangen og er ikke stylinggjeld.
- Ingen route bruker `class`, `style`, `style:*`, `<style>` eller overstyrer offentlig UI.
- Ingen feature utenom `src/lib/features/statistics` bruker `class`, `style`, `style:*`, `<style>`
  eller CSS-import.
- Ni statistikkkomponenter står for alle 52 featureklasseforekomster og alle seks inline
  custom-property-verdier. De samme 52 klassene er de eneste route-/featurediagnosticsene fra
  `STYLING-010-VISUALIZATION-EXCEPTION`.
- Ingen døde eller erstattede route-/featurestilbaner ble funnet. Den aktive gjelden er den ene
  statistikkvisualiseringen og dens globale selectorimplementasjon.

## Klassifisering av de 106 kandidatene

| Kandidat                          | Antall | Klassifisering                                | Eier etter SWP-5.2                                   |
| --------------------------------- | -----: | --------------------------------------------- | ---------------------------------------------------- |
| Featureklasser                    |     52 | Overgangsankre, ikke varig unntak             | Offentlig UI eller navngitt, skopert diagramgeometri |
| Inline geometry-custom properties |      6 | Faktisk datadrevet geometri                   | `src/lib/features/statistics`                        |
| SVG-geometriattributter           |     32 | Faktisk diagramgeometri                       | `src/lib/features/statistics`                        |
| `data-stat-role`                  |     16 | Produktets typografi/identitet, ikke geometri | Offentlig visualiserings-UI og theme-kontrakten      |

Den varige allowlisten skal derfor ikke arve alle 106 kandidater. SWP-5.2 skal fjerne alle 52
featureklasser og alle 16 featureeide statistikkroller. De fire navngitte custom properties står
for seks datadrevne verdier og kan bestå sammen med de 32 SVG-geometriattributtene. Eventuelle
skoperte `<style>`-blokker kan bare konsumere guardkontraktens lukkede geometri-egenskaper; de kan
ikke eie farge, typografi, radius, skygge eller kontrolluttrykk.

## Filvis eierkart

| Produksjonsfil                  | Klasse | Inline | SVG | Rolle | Neste eksakte eier                                                              |
| ------------------------------- | -----: | -----: | --: | ----: | ------------------------------------------------------------------------------- |
| `StatisticsBookingType.svelte`  |      6 |      0 |  13 |     8 | Offentlig diagramflate/legend; feature beholder donutgeometri                   |
| `StatisticsCourtTable.svelte`   |     14 |      0 |   0 |     0 | Offentlig sammenligningstabell med typed layout                                 |
| `StatisticsDistribution.svelte` |      5 |      2 |   0 |     4 | Offentlig diagramflate; feature beholder to datadrevne stolpebredder            |
| `StatisticsHourChart.svelte`    |      5 |      3 |   0 |     2 | Offentlig diagramflate/legend; feature beholder antall kolonner og stolpehøyder |
| `StatisticsLoading.svelte`      |      6 |      0 |   0 |     0 | Offentlig visualiseringsloading                                                 |
| `StatisticsMembers.svelte`      |      2 |      0 |   0 |     0 | Offentlig resultatlayout og sammenligningstabell                                |
| `StatisticsMonthChart.svelte`   |      9 |      1 |  19 |     2 | Offentlig diagramflate/legend; feature beholder målt bredde og SVG-koordinater  |
| `StatisticsResults.svelte`      |      4 |      0 |   0 |     0 | Offentlig resultat-, status- og fordelingslayout                                |
| `StatisticsScreen.svelte`       |      1 |      0 |   0 |     0 | Offentlig dashboardlayout                                                       |

`Metric` og `MetricGrid` er allerede offentlige patterns, men basekortet og Metric-anatomien har
fortsatt globale regler i statistikk-CSS-en. De flyttes til statiske utilities hos eksisterende
eier i samme checkpoint. Sammenligningstabellen har to reelle konsumenter, bane- og brukertabellen,
og kan få én offentlig typed kontrakt uten å åpne klasse- eller style-props.

## Global CSS som følger eierkartet

| Fil                        | Nåtilstand                                               | Slettesteg  |
| -------------------------- | -------------------------------------------------------- | ----------- |
| `feature-compositions.css` | 731 linjer, 117 regler og 122 statistikkselectors        | SWP-5.3     |
| `responsive.css`           | Statistikkens responsive regler og global reduced motion | SWP-5.2/5.4 |
| `patterns.css`             | Fem aktive, pattern-eide keyframes                       | SWP-5.4     |
| `primitives.css`           | Seks aktive globale base-regler                          | SWP-5.4     |

`feature-compositions.css` inneholder også den gjenværende globale implementasjonen av `Metric`.
Filen kan først slettes når både offentlig UI og diagramgeometrien er flyttet. `responsive.css`
kan ikke slettes i SWP-5.2 fordi reduced-motion-basen fortsatt har globalt dokumenteierskap.

## SWP-5.2-kontrakt

1. Flytt Metric-, resultat-, legend-, tabell-, loading- og statisk diagrampresentasjon til
   offentlige UI-komponenter med typed props og statiske, semantiske Tailwind-utilities.
2. Erstatt featureklasser med semantiske komponentgrenser eller navngitte `data-visualization`-
   ankere. Bare sistnevnte kan brukes av skopert feature-CSS, og bare til geometri.
3. Behold de fire eksisterende geometry-custom-properties med lokal definisjon og lokal referanse:
   `--statistics-bar-height`, `--statistics-bar-width`, `--statistics-hour-count` og
   `--statistics-line-chart-width`.
4. Behold SVG-koordinater hos featurelaget. Flytt stroke, fill, typografi og øvrig identitet til
   offentlig UI/theme.
5. Fjern `data-context="statistics"`, `data-view`, `data-slot` og `data-stat-role` når de bare er
   globale selectorbroer. Ikke gjør dem til en ny offentlig featurevariant.
6. Slett de erstattede statistikkreglene fra `feature-compositions.css` og `responsive.css` i samme
   verifiserte endring; SWP-5.3 sletter deretter den tomme filen og importen.

Dette er en eierkontrakt, ikke en forhåndsgodkjenning av nye unntak. Produksjonsguardene skal ende
med null featureklasser og null produktidentitet i visualiseringsunntaket.
