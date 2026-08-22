# Migreringsstatus

> **Status:** Aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** WP-2 — Contracts, domain og platform
>
> **Sist oppdatert:** 2026-08-22

## Mål for aktiv arbeidspakke

Flytt transportkontrakter og ren domenelogikk til målarkitekturen. Etabler deretter validert
offentlig konfigurasjon, typed `fetch`-klient, normalisert `ApiError`, sentral 401-kontrakt og
isolerte adapters for storage og observability.

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

## Nåtilstand

- SvelteKit er den aktive dev-, test-, preview- og produksjonsbuilden.
- Alle produkt-URL-er rendrer foreløpige Svelte-routeflater; featureadferd er ikke migrert ennå.
- React-kilden er fortsatt produksjonsreferanse i arbeidskopien, men er ikke koblet til eller bundlet
  av SvelteKit.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                 |
| ------------------------------------- | -------------------------------------------------- |
| Base branch                           | `main`                                             |
| Fastslått basecommit                  | `5287c5e`                                          |
| Siste semantiske checkpoint           | `feat(sveltekit): establish WP-1 route foundation` |
| Lokale commits foran base             | 3                                                  |
| Forventede ucommitterte frontendfiler | Ingen                                              |
| Neste planlagte checkpoint            | `feat(sveltekit): establish WP-2 platform core`    |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Etabler WP-2-kjernen i denne rekkefølgen:

1. Flytt eksisterende backend-DTO-er til `lib/contracts` uten å endre transportkontraktene, og
   behold midlertidige type-reexports bare når React-referansen trenger dem under overgangen.
2. Flytt ren dato-, sorterings-, presentasjons- og kapabilitetslogikk til `lib/domain` med
   DOM-frie Vitest-tester.
3. Implementer en injiserbar typed klient rundt native `fetch` med base URL, auth-header, timeout,
   abortsignal, JSON/body-håndtering og normalisert `ApiError`.
4. Etabler sentral, idempotent 401-kontrakt og sikre storage-/observability-adapters, og kjør
   WP-2-porten.

## Arbeidspakkeregister

| Arbeidspakke                     | Status       | Port/resultat                                                |
| -------------------------------- | ------------ | ------------------------------------------------------------ |
| WP-0 Styring og baseline         | Fullført     | Dokumentgrunnlag, React-baseline og komplett adferdsinventar |
| WP-1 Build og routes             | Fullført     | Build, routes, hostingvarianter og arkitekturkontroll grønn  |
| WP-2 Contracts/domain/platform   | Pågår        | Transporttyper er første eksakte steg                        |
| WP-3 Auth/tenant/serverdata      | Ikke startet | —                                                            |
| WP-4 UI-fundament                | Ikke startet | —                                                            |
| WP-5 App-shell                   | Ikke startet | —                                                            |
| WP-6 Featuremigrering            | Ikke startet | —                                                            |
| WP-7 Paritet og produksjonsbytte | Ikke startet | —                                                            |

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

Ingen kjente blokkeringer. WP-2 kan utføres fra eksisterende frontendkontrakter uten
backendendringer eller ny brukerbeslutning.

## Midlertidig kode og kjente avvik

- React-kilde og React-avhengigheter er midlertidig referanse og skal fjernes etter hvert som
  ansvaret erstattes; de er ikke del av SvelteKit-bundlen.
- Alle Svelte-featureflater er bevisst midlertidige route-placeholdere frem til WP-2–WP-5 gir
  contracts, data, auth, UI og app-shell.
- Eksisterende globale designstiler lastes av root layout som visuell baseline; de konsolideres i
  WP-4.

## Siste verifikasjon

| Kontroll                             | Resultat                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Prettier på aktiv kode og dokumenter | Bestått 2026-08-22                                                             |
| Relative dokumentlenker              | Bestått 2026-08-22                                                             |
| `git diff --check`                   | Bestått 2026-08-22                                                             |
| `npm test`                           | Bestått 2026-08-22: 10 filer, 36 tester                                        |
| `npm run check`                      | Bestått 2026-08-22: Svelte/React-typecheck, arkitektur, design, lint og format |
| Cloudflare Pages-build               | Bestått 2026-08-22: root path og `index.html`-fallback                         |
| GitHub Pages-build                   | Bestått 2026-08-22: `/banebooking` og `404.html`-fallback                      |
| Dev og preview                       | Bestått 2026-08-22: direkte routes i multi-tenant og dedikert tenant           |
| Nettleserrender                      | Bestått 2026-08-22: hydrert adminroute, korrekt tittel og ingen konsollfeil    |
| SvelteKit-bundle                     | Verifisert 2026-08-22: ingen React-runtime                                     |
| WP-0 route-/featureinventar          | Komplett 2026-08-22                                                            |

## Filer i siste checkpoint

- build- og verktøykonfigurasjon i `package.json`, `svelte.config.js`, `vite.config.ts`,
  `tsconfig*.json`, ESLint og Prettier
- `src/app.html`, `src/app.d.ts`, root layout og error boundary
- `src/routes/auth/callback/` og hele `src/routes/[[slug=tenant]]/` med route groups
- `src/params/tenant.ts`
- `src/lib/platform/config/`
- `src/lib/ui/feedback/RoutePlaceholder.svelte`
- `scripts/check-architecture-boundaries.mjs`
- statiske hostingfiler i `public/`
- `docs/migration-status.md`

Denne listen beskriver checkpointets leveranse. `/start` bruker commit-diffen som autoritativ kilde
for nøyaktig innhold og `git status` for eventuelt pågående arbeid etter checkpointet.
