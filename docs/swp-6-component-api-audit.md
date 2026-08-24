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
