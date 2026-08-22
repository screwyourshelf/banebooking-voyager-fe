# Migreringsstatus

> **Status:** Aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** WP-3 — Auth, tenant og serverdata
>
> **Sist oppdatert:** 2026-08-22

## Mål for aktiv arbeidspakke

Etabler et typed, rammeverksnøytralt authgrensesnitt med Supabase- og utviklingsadapter,
deterministisk sesjonsgjenoppretting og auth callback. Normaliser tenant-context, koble TanStack
Svelte Query til den nye API-klienten og håndhev protected/admin guards uten å flytte autoritet fra
backendens kapabiliteter.

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

## Nåtilstand

- SvelteKit er den aktive dev-, test-, preview- og produksjonsbuilden.
- Alle produkt-URL-er rendrer foreløpige Svelte-routeflater; featureadferd er ikke migrert ennå.
- React-kilden er fortsatt produksjonsreferanse i arbeidskopien, men er ikke koblet til eller bundlet
  av SvelteKit.
- Contracts, ren domenelogikk og platformkjerne er nå autoritative for både videre Svelte-arbeid og
  de midlertidige React-broene.
- Et ucommittert WP-3-utkast er påbegynt, men ikke kvalitetsportverifisert. Det omfatter auth- og
  tenantkontrakter, Svelte Query-avhengigheter, session/guard-utkast og routekobling.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                   |
| ------------------------------------- | ---------------------------------------------------- |
| Base branch                           | `main`                                               |
| Fastslått basecommit                  | `5287c5e`                                            |
| Siste semantiske checkpoint           | `docs: define AI-first session governance`           |
| Lokale commits foran base             | 5                                                    |
| Forventede ucommitterte frontendfiler | WP-3-utkastet beskrevet under                        |
| Neste planlagte checkpoint            | `feat(sveltekit): establish WP-3 auth and data core` |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Pågående ucommittert WP-3-utkast

Følgende endringer er forventet ucommitterte etter styringscheckpointet:

- `package.json` og `package-lock.json` med TanStack Svelte Query og devtools
- `scripts/check-architecture-boundaries.mjs`
- React-broer i `src/auth/`, `src/supabase.ts` og `src/features/policy/pages/vilkaar.ts`
- nye eller endrede moduler i `src/lib/platform/{api,app,auth,query,tenant}/`,
  `src/lib/features/session/` og `src/lib/domain/`
- routekobling i tenant-layouts og `src/routes/auth/callback/`

Utkastet ble startet før sesjonsavgrensningen ble korrigert. Det er formatert delvis og et tidlig
`svelte-check` fant én warning som deretter ble rettet, men full typecheck, test, arkitekturkontroll
og build er ikke kjørt på den samlede WP-3-diffen. Utkastet er ikke et godkjent checkpoint.

## Neste eksakte steg

Neste `/start` skal bare gjenoppta WP-3:

1. Kaldles det ucommitterte utkastet mot AI-first kodekontrakten og kontroller at ansvar, offentlige
   innganger, typed states, adapters og sideeffekter er tydelige uten samtalekontekst.
2. Sammenlign utkastet med WP-3-kontrakten og React-referansen; korriger ufullstendig eller for bred
   implementasjon før nytt omfang legges til.
3. Kjør fokuserte auth-, tenant-, endpoint- og guardtester, deretter `npm run check`, begge
   hostingbuildene og relevant nettleserverifikasjon.
4. Når WP-3-porten faktisk er grønn, oppdater statusen, opprett WP-3-checkpointet og avslutt
   sesjonen. Ikke start WP-4 i samme `/start`-sesjon.

## Arbeidspakkeregister

| Arbeidspakke                     | Status       | Port/resultat                                                 |
| -------------------------------- | ------------ | ------------------------------------------------------------- |
| WP-0 Styring og baseline         | Fullført     | Dokumentgrunnlag, React-baseline og komplett adferdsinventar  |
| WP-1 Build og routes             | Fullført     | Build, routes, hostingvarianter og arkitekturkontroll grønn   |
| WP-2 Contracts/domain/platform   | Fullført     | Contracts, ren domain, fetch/API, 401 og adapters grønne      |
| WP-3 Auth/tenant/serverdata      | Pågår        | Authport og deterministiske authstates er første eksakte steg |
| WP-4 UI-fundament                | Ikke startet | —                                                             |
| WP-5 App-shell                   | Ikke startet | —                                                             |
| WP-6 Featuremigrering            | Ikke startet | —                                                             |
| WP-7 Paritet og produksjonsbytte | Ikke startet | —                                                             |

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

Ingen kjente blokkeringer. WP-3 kan bygges mot eksisterende Supabase-, tenant- og
backendkontrakter uten backendendringer eller ny brukerbeslutning.

## Midlertidig kode og kjente avvik

- React-kilde og React-avhengigheter er midlertidig referanse og skal fjernes etter hvert som
  ansvaret erstattes; de er ikke del av SvelteKit-bundlen.
- `src/types/` og de flyttede filene i `src/utils/` er midlertidige React-re-exports til autoritativ
  kode i `src/lib/contracts`, `src/lib/domain` og `src/lib/platform`.
- Alle Svelte-featureflater er bevisst midlertidige route-placeholdere frem til WP-2–WP-5 gir
  contracts, data, auth, UI og app-shell.
- Eksisterende globale designstiler lastes av root layout som visuell baseline; de konsolideres i
  WP-4.
- Det ucommitterte WP-3-utkastet er eksplisitt WIP og kan inneholde typer eller integrasjonsvalg som
  må korrigeres før checkpoint. Ingen senere agent skal anta at utkastet er godkjent fordi filene
  finnes.

## Siste verifikasjon

| Kontroll                             | Resultat                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Prettier på aktiv kode og dokumenter | Bestått 2026-08-22                                                             |
| Relative dokumentlenker              | Bestått 2026-08-22                                                             |
| `git diff --check`                   | Bestått 2026-08-22                                                             |
| `npm test`                           | Bestått 2026-08-22: 15 filer, 48 tester                                        |
| `npm run check`                      | Bestått 2026-08-22: Svelte/React-typecheck, arkitektur, design, lint og format |
| Cloudflare Pages-build               | Bestått 2026-08-22: root path og `index.html`-fallback                         |
| GitHub Pages-build                   | Bestått 2026-08-22: `/banebooking` og `404.html`-fallback                      |
| Dev og preview                       | Bestått 2026-08-22: direkte routes i multi-tenant og dedikert tenant           |
| Nettleserrender                      | Bestått 2026-08-22: hydrert adminroute, korrekt tittel og ingen konsollfeil    |
| SvelteKit-bundle                     | Verifisert 2026-08-22: ingen React-runtime                                     |
| WP-0 route-/featureinventar          | Komplett 2026-08-22                                                            |
| Ucommittert WP-3-utkast              | Ikke fullverifisert; må kjøres fra kald start i neste AI-sesjon                |

## Filer i siste checkpoint

- avgrenset `/start`- og handoverprotokoll i `AGENTS.md`
- bindende AI-first styringskrav og checkpointport i `docs/migration-plan.md`
- AI-first arkitekturkontrakt i `docs/sveltekit-architecture.md`
- oppdatert dokumentindeks i `docs/README.md`
- `docs/migration-status.md`

Denne listen beskriver bare styringscheckpointets leveranse. Det ucommitterte WP-3-utkastet er ikke
del av checkpointet. `/start` bruker commit-diffen som autoritativ kilde for nøyaktig innhold og
`git status` for pågående arbeid etter checkpointet.
