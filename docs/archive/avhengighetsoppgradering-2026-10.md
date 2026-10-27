# Avhengighetsoppgradering, oktober 2026

## Omfang og kompatibilitet

Fullstackleveransen oppgraderer stabile, kompatible avhengigheter med separat verifikasjon og
commits per repo. Frontenden bruker Node 24 LTS (`.nvmrc`: 24.22.1, CI: 24) og Node 24-typer.
Vitest oppgraderes til 5.0.5 og Sentry browser til 11.9.0. Sentrys eksisterende eksplisitte
`dataCollection`-valg og sanitering bevarer personverngrensen. Tiptap-pakkene er samlet på 3.32.0;
Tailwind/plugin og Query/devtools holdes parvis på samme versjon. Knip er eksakt pinnet på 6.43.0.

Tre nyere versjonslinjer holdes tilbake av konkrete kontrakter:

- **SvelteKit 3.1.0 og adapter-static 4.0.0:** Den fullstendige migreringskandidaten passerte
  typekontroll, arkitektur-/stylingporter, 456 enhetstester og 11 reelle API-kontrakttester, men
  overskred det uendrede offentlige bookingbudsjettet på 165 KiB gzip. Baseline var 163,2 KiB;
  kandidaten var 171,4 KiB. Utsettelse av arrangementsdialoger til eksplisitt handling ga fortsatt
  168,3 KiB. Den leverte kandidaten bruker derfor nyeste støttede 2.x/3.x-par, SvelteKit 2.70.3 og
  adapter-static 3.0.10, og beholder opprinnelige import-, routing-, renderings- og fokuskontrakter.
- **TypeScript 7.0.2:** SvelteKit, svelte-check og typescript-eslint har ikke kompatible peer-ranges.
  TypeScript 6.0.3 beholdes. Ingen peer-avhengigheter overstyres eller ignoreres.
- **Hugeicons 4.3.x:** Alle publiserte 4.3-versjoner endrer geometrien til `UserCircleIcon`, uten en
  eksport med den eksisterende geometrien. Fire visuelle referanser avvek med 4.3.5. 4.2.3 er derfor
  eksakt pinnet. Snapshotfiler og pikselgrenser er uendret.

ProseMirror-motoren får en egen lazy chunk for gjenbruk og caching, slik at Tiptap 3.32.0 holder det
uendrede taket på 130 KiB per lazy chunk. Editorens eksisterende dynamiske grense beholdes.
Supabase-markøren i artefaktkontrollen følger den nye SDK-ens faktiske pakkenavn;
kontrollen krever fortsatt at SDK-en finnes og ikke er preloadet.
To komponenttester venter nå på samme DOM-fjerning etter dialogavlysning som før; Bits UI 2.20
fullfører denne oppdateringen asynkront etter callbacken.

## Låste direkte avhengigheter

Tabellen viser alle endrede direkte versjoner fra gammel og ny lockfil. Øvrige direkte pakker
beholder låst versjon; kompatibilitetsholdene er beskrevet over.

| Pakke                             | Før (låst) | Etter (låst) |
| --------------------------------- | ---------- | ------------ |
| `@internationalized/date`         | 3.12.3     | 3.12.4       |
| `@sentry/browser`                 | 10.70.0    | 11.9.0       |
| `@supabase/supabase-js`           | 2.104.1    | 2.118.0      |
| `@tanstack/svelte-query`          | 6.1.40     | 6.3.6        |
| `@tiptap/core`                    | 3.22.4     | 3.32.0       |
| `@tiptap/extension-table`         | 3.22.4     | 3.32.0       |
| `@tiptap/starter-kit`             | 3.22.4     | 3.32.0       |
| `bits-ui`                         | 2.19.0     | 2.20.2       |
| `date-fns`                        | 4.1.0      | 4.4.0        |
| `tailwindcss`                     | 4.2.4      | 4.3.3        |
| `@playwright/test`                | 1.62.1     | 1.64.1       |
| `@sveltejs/vite-plugin-svelte`    | 7.3.0      | 7.3.1        |
| `@tailwindcss/vite`               | 4.2.4      | 4.3.3        |
| `@tanstack/svelte-query-devtools` | 6.1.40     | 6.3.6        |
| `@types/node`                     | 25.6.0     | 24.19.2      |
| `axe-core`                        | 4.13.0     | 4.14.0       |
| `eslint`                          | 10.2.1     | 10.13.0      |
| `eslint-plugin-svelte`            | 3.23.0     | 3.23.1       |
| `globals`                         | 17.5.0     | 17.13.0      |
| `jsdom`                           | 30.0.1     | 30.1.3       |
| `knip`                            | 6.32.2     | 6.43.0       |
| `postcss`                         | 8.5.26     | 8.5.32       |
| `postcss-selector-parser`         | 7.1.5      | 7.1.7        |
| `prettier`                        | 3.8.3      | 3.9.10       |
| `svelte`                          | 5.56.10    | 5.57.3       |
| `svelte-check`                    | 4.7.6      | 4.7.7        |
| `typescript-eslint`               | 8.59.0     | 8.72.1       |
| `vite`                            | 8.2.2      | 8.3.5        |
| `vitest`                          | 4.1.10     | 5.0.5        |

## Verifikasjon

Den opprinnelige pakkegrafen ble installert med `npm ci` og passerte 105 testfiler / 456 tester,
hele `npm run check`, 24 visuelle tester og åtte produksjonsroutetester. Begge hostartefaktene og
alle eksisterende budsjetter var grønne. Den reelle baselinekontrakten passerte 11 tester mot en
separat backend og isolert PostgreSQL-database.

Den leverte kandidaten er installert på nytt med `npm ci` under Node 24.22.1. `npm ls --all`
avslutter med kode 0 uten ugyldige peer-avhengigheter. Samme endelige kandidat passerer alle delene
av `verify:frontend`: 105 testfiler / 456 tester, hele `npm run check`, 24 visuelle tester og åtte
produksjonsroutetester. Ingen snapshots er endret. Ny Prettier-versjon formaterer åtte eksisterende
filer; stylingbaselinen oppdaterer bare 68 linjeposisjoner og fire fillengder. CSS, tokens,
geometri, antall og lagstruktur samt historiske produksjonsmålinger er uendret.
Den endelige reelle API-kontrakten passerer 11 tester mot isolert PostgreSQL og backend på 5016,
med .NET-runtime 10.0.14. Den eksisterende brukerprosessen på 5015 gjenbrukes ikke av denne porten.
Kontrakten bruker lokal DevelopmentBearer-auth. Levende Supabase OAuth/OTP og faktisk levering
til Sentry er ikke kjørt; adaptere, callback og personvernsvalg er kontrollert lokalt.

| Sluttartefakt    | Initial JS gzip | Offentlig booking JS gzip | Initial CSS gzip | Største lazy JS gzip |
| ---------------- | --------------- | ------------------------- | ---------------- | -------------------- |
| Cloudflare Pages | 38,2 KiB        | 164,3 KiB                 | 28,2 KiB         | 95,6 KiB             |
| GitHub Pages     | 38,2 KiB        | 164,4 KiB                 | 28,3 KiB         | 95,6 KiB             |
| Uendret budsjett | 50 KiB          | 165 KiB                   | 50 KiB           | 130 KiB              |

Begge bygg har 63 JavaScript-chunks. Fallback, base path, direkte load/refresh for offentlige,
beskyttede, admin- og callbackroutes og lazy-grensene for Sentry, Supabase og editor er verifisert.

`npm audit` går fra 41 funn (8 høye, 27 moderate, 6 lave) til 6 lave og ingen moderate, høye
eller kritiske. Restfunnene gjelder SvelteKit/cookie og deres avhengighetskjeder via adapter-static,
Bits UI, runed og svelte-toolbelt. De beholdes synlig i den installerte grafen; ingen overrides,
`--force` eller `--legacy-peer-deps` brukes.

De tre underliggende advisoryene gjelder
[enhanced form-redirect](https://github.com/advisories/GHSA-pfhg-q3qv-9q6r),
[ikke-klarert cache-control under prerendering](https://github.com/advisories/GHSA-27mw-82g8-phjj) og
[cookie-navn/path/domain](https://github.com/advisories/GHSA-pxg6-pf52-xh8x).
Kildeinspeksjonen finner ingen enhanced forms, server actions/endepunkter, `setHeaders` eller
servercookie-serialisering i denne statiske appen. Tenant-rutene bruker `ssr=false` og
`prerender=false`; callbacken prerendres uten load/fetch/headers. Det ble derfor ikke funnet en
inngangsvei for de beskrevne forutsetningene i dagens app. Dette opphever ikke auditfunnene og må
vurderes på nytt hvis server actions, prerender-headers eller servercookies innføres.

## Kilder og videre oppfølging

- [SvelteKit 3-migrering](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [Vitest 5-migrering](https://vitest.dev/guide/migration/)
- [Sentry 11-migrering](https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md)
- [Rolldown code splitting](https://rolldown.rs/reference/OutputOptions.codeSplitting)

En senere SvelteKit 3-oppgradering må først demonstrere offentlig booking innenfor gjeldende
budsjett, eller inngå i en separat godkjent ytelses-/produktbeslutning. Nye ikoner krever en bevisst
visuell beslutning før referansene oppdateres. Ingen push eller deploy inngår i denne leveransen.
