# Arkitektur- og konformitetsreview

> **Status:** Bestått med dokumenterte tradeoffs
>
> **Gjennomført:** 2026-08-23
>
> **Omfang:** Svelte 5, SvelteKit, frontendlag, dependency-/legacyopprydding og produksjonsbuild

> **Etterfølgende beslutning:** Stylingens CSS-eierskap ble vurdert separat etter dette reviewet.
> Tailwind-/theme-målarkitekturen og den aktive oppfølgingen ligger i
> [ADR-006](./adr/006-tailwind-styling-and-theme-ownership.md) og
> [stylingplanen](./styling-lift-and-shift-plan.md). Dette reviewets konklusjon om rammeverks- og
> lagarkitektur står fast, men er ikke sluttbevis for den nye stylingretningen.

## Konklusjon

Frontendens autoritative struktur følger målarkitekturen og gjeldende Svelte 5-/SvelteKit-praksis.
Reviewen fant ingen parallelle React-flater, direkte HTTP-kall i komponenter, skjulte
feature-avhengigheter, urene `load`-funksjoner eller rammeverkskobling i domenelaget.

Det vesentlige avviket var origin-bred sletting av Web Storage og Cache Storage i pre-module
recoveryen. Dette er fjernet og erstattet av den smale kontrakten i
[ADR-005](./adr/005-pre-module-startup-recovery.md). Legacykonfigurasjon, genererte TypeScript-spor
og bekreftet død kode ble samtidig fjernet. Kontrollene hindrer de samme restfilene og det brede
storage-avviket i å komme tilbake.

## Vurdering per arkitekturområde

| Område                | Resultat                 | Evidens                                                                                                                                  |
| --------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Routing og rendering  | I samsvar                | SvelteKits filrouter er eneste router; route groups og layouts eier tenant/auth; SPA/static tradeoff er godkjent i ADR-001               |
| `load` og state       | I samsvar                | `load`-funksjonene er rene; Query eier serverdata; typed context eier appstate; lokal arbeidsflyt bruker `$state`/`$derived`             |
| Svelte 5              | I samsvar                | Runes, snippets og callback-props er autoritative; ingen `export let`, `$:`, `on:` eller legacy slots                                    |
| Sideeffekter          | I samsvar                | `$effect` brukes ved eksterne grenser eller eksplisitt reinitialisering av selvstendige skjemautkast; vanlig avledning bruker `$derived` |
| Contracts/domain      | I samsvar                | Transporttyper er isolert; domenet er uten Svelte, browser-globals og sideeffekter                                                       |
| Features og routes    | I samsvar                | Features importerer ikke hverandre; routes bruker offentlige featureinnganger og er tynne                                                |
| API og integrasjoner  | I samsvar                | HTTP går gjennom platform/API og Query; Supabase/Sentry er isolert og lazy-lastet                                                        |
| UI og tilgjengelighet | I samsvar                | Features bruker offentlig `lib/ui`; Bits UI er skjult bak primitives; semantikk og axe er testet                                         |
| Nettleserlagring      | I samsvar etter rettelse | Produktlagring eies av `platform/storage`; bootstrapen har kun privat cooldown-nøkkel                                                    |
| Bygg og ytelse        | I samsvar                | Adapter-static, base path/fallback, hash-assets og selektiv lazy loading verifiseres i begge produksjonsbygg                             |
| Legacy og pakker      | I samsvar etter rettelse | Ingen React-kilde eller runtimeavhengigheter; gamle config-/buildspor er fjernet og forbudt                                              |

## Bevisste tradeoffs

- Dynamiske app-ruter er en statisk SPA (`ssr = false`) for å bevare eksisterende hosting- og
  browser-authkontrakt. Koden er fortsatt lagdelt slik at routevis SSR kan innføres senere.
- Noen skjemaer bruker en guardet `$effect` for å reinitialisere et selvstendig utkast når
  autoritativ query-/propidentitet endres. Effekten utfører ikke vanlig avledning og overskriver
  ikke et aktivt, endret utkast.
- Pre-module bootstrap er vanlig JavaScript fordi den må håndtere chunkfeil før SvelteKit starter.
  Unntaket er smalt og maskinelt kontrollert.
- De komplette backend-DTO-typene beholdes selv om ikke alle kontrakter har en aktiv UI-konsument;
  de dokumenterer den autoritative transportflaten og er ikke runtimekode.

## Permanente porter

- `npm test`
- `npm run check`
- `npm run test:e2e:production`
- `scripts/check-architecture-boundaries.mjs`
- `scripts/check-legacy-frontend-removal.mjs`
- `scripts/check-design-system-boundaries.mjs`
- `scripts/verify-production-builds.mjs`

## Normative referanser

- [SvelteKit: State management](https://svelte.dev/docs/kit/state-management)
- [Svelte: `$effect`](https://svelte.dev/docs/svelte/$effect)
- [SvelteKit: Project structure](https://svelte.dev/docs/kit/project-structure)
- [SvelteKit: Performance](https://svelte.dev/docs/kit/performance)
- [SvelteKit: Static site generation](https://svelte.dev/docs/kit/adapter-static)
- [Vite: Building for production](https://vite.dev/guide/build)
