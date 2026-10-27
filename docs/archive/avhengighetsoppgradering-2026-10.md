# Avhengighetsoppgradering, oktober 2026

## Omfang og kompatibilitet

Fullstackleveransen oppgraderer stabile, kompatible avhengigheter med separat verifikasjon og
commits per repo. Frontenden bruker Node 24 LTS (`.nvmrc`: 24.22.1, CI: 24) og Node 24-typer.
Vitest oppgraderes til 5.0.5 og Sentry browser til 11.9.0. Sentrys eksisterende eksplisitte
`dataCollection`-valg og sanitering bevarer personverngrensen. Tiptap-pakkene er samlet på 3.32.0;
Tailwind/plugin og Query/devtools holdes parvis på samme versjon. Knip er eksakt pinnet på 6.43.0.

SvelteKit oppgraderes videre til 3.1.0 med adapter-static 4.0.0. Første lokale leveranse
(`f62c309`) beholdt Kit 2 fordi den første Kit 3-kandidaten brukte 171,4 KiB gzip mot et budsjett
på 165 KiB (opprinnelig baseline 163,2 KiB). Brukeren godkjente deretter eksplisitt Kit 3 og
et budsjett på 175 KiB for offentlig booking. Bare dette budsjettet endres; initial JS/CSS,
største lazy chunk, snapshots, ikoner og produktadferd beholder kontraktene sine. Ingen
utsettelsesprototyper for kalender eller bookingdialoger inngår i leveransen.

To nyere versjonslinjer holdes tilbake av konkrete kontrakter:

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
| `@sveltejs/kit`                   | 2.70.3     | 3.1.0        |
| `@sveltejs/adapter-static`        | 3.0.10     | 4.0.0        |
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

## Endelig SvelteKit 3-leveranse

Konfigurasjon er flyttet til Vite-pluginen. `#lib`-subpaths med filendelser erstatter `$lib`,
params deklareres i `src/params.ts`, og hooks, URL-lesing og navigasjon følger Kit 3-API-ene.
Eksisterende arkitektur- og stylinggrenser gjenkjenner både `.ts`- og `.js`-innganger og `/index`;
en negativ fixture bruker `.js` for å sikre at denne skrivemåten fortsatt avvises ved UI-overstyring.
De nye klienthooktestene bevarer at forventede app-/frameworkfeil ikke rapporteres som uventede.
Automatisk versjonspolling holdes avskrudd eksplisitt som i Kit 2.

npm 10.9.9 er pinnet som kompatibelt installasjonsverktøy. Rene forsøk med npm 11.19.1 og 12.2.1
opprettet Kit 2 som valgfrie peers ved installasjon, men fjernet dem ved `ci` og etterlot ugyldige
peers. npm 10.9.9 gir gyldig `ci` og `npm ls --all` uten overrides eller legacy-flagg.
Lokalt brukes `npm exec --yes --package=npm@10.9.9 -- npm ci`; CI velger samme versjon på runneren.
Brukerens globale npm endres ikke.

Den gyldige Kit 3-grafen gir fem lave auditfunn og ingen moderate, høye eller kritiske.
Restfunnene kommer fra Kit 2.70.3/cookie i runeds valgfrie peer-grafer under Bits UI og
svelte-toolbelt. Applikasjonens egen Kit 3/adapter 4-inngang er oppgradert. Kildeinspeksjonen
finner ingen import av `runed/kit` eller `use-search-params` fra appen, Bits UI eller svelte-toolbelt;
runeds ordinære inngang eksporterer bare rammeverksuavhengige utilities. De installerte pakkene
regnes fortsatt som auditfunn. Vurder dette på nytt hvis Kit-spesifikke runed-funksjoner tas i bruk.

Den endelige grafen er installert med Node 24.22.1 og npm 10.9.9 gjennom den dokumenterte
bootstrapen. Både ren installasjon og etterfølgende `npm ls --all` avslutter med kode 0; Kit 2
ligger som valgfrie peers med korrekte `peer`/`optional`-flagg. Kit genererer dessuten en lokal
`$app`-pakke under sync. Den er en verktøyeid inngang og ingen ekstra prosjektavhengighet.

Den komplette `npm exec --yes --package=npm@10.9.9 -- npm run verify:frontend` er bestått:
105 testfiler / 458 tester, `check` med null typefeil/advarsler, alle arkitektur-/stylingporter,
34 guard-fixtures, 24 visuelle tester og åtte produksjonsroutetester. Den reelle API-kontrakten
passerer 11 tester mot isolert PostgreSQL og backend på 5016, med .NET-runtime 10.0.14.
Snapshotfiler og pikselgrenser er uendret. Stylingbaselinen endrer bare syv linjeposisjoner og
15 fillengder etter importmigreringen; CSS, tokens, geometri, antall og lagstruktur er uendret.

| Sluttartefakt     | Initial JS gzip | Offentlig booking JS gzip | Initial CSS gzip | Største lazy JS gzip |
| ----------------- | --------------- | ------------------------- | ---------------- | -------------------- |
| Cloudflare Pages  | 43,7 KiB        | 171,4 KiB                 | 28,2 KiB         | 96,9 KiB             |
| GitHub Pages      | 43,8 KiB        | 171,5 KiB                 | 28,3 KiB         | 96,9 KiB             |
| Godkjent budsjett | 50 KiB          | 175 KiB                   | 50 KiB           | 130 KiB              |

Begge bygg har 68 JavaScript-chunks. Fallback, base path, direkte load/refresh for offentlige,
beskyttede, admin- og callbackroutes samt lazy-grensene for Sentry, Supabase og editor er verifisert.

De fem lave restfunnene spores til
[enhanced form-redirect](https://github.com/advisories/GHSA-pfhg-q3qv-9q6r),
[prerender-cache-control](https://github.com/advisories/GHSA-27mw-82g8-phjj) og
[cookie-navn/path/domain](https://github.com/advisories/GHSA-pxg6-pf52-xh8x) i den installerte
valgfrie Kit 2-grafen. Ingen Kit-spesifikke runed-hjelpere inngår i dagens importsti, og det ble
ikke funnet markører fra dem i produksjonsartefaktene. Dette opphever ikke auditfunnene.

## Historisk førsteleveranse

Første lokale commit `f62c309` ble verifisert med Kit 2/adapter 3: 456 enhetstester, 24 visuelle,
åtte produksjonsroutetester og 11 reelle API-kontrakttester. Offentlig booking var 164,3/164,4 KiB
mot det tidligere 165 KiB-budsjettet, og audit ga seks lave funn. Opprinnelig pakkebaseline hadde
41 funn: åtte høye, 27 moderate og seks lave. Den endelige Kit 3-leveransen over erstatter denne
mellomtilstanden uten å endre de øvrige oppgraderingene eller brukerens visuelle kontrakt.

## Kilder og videre oppfølging

- [SvelteKit 3-migrering](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [Vitest 5-migrering](https://vitest.dev/guide/migration/)
- [Sentry 11-migrering](https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md)
- [Rolldown code splitting](https://rolldown.rs/reference/OutputOptions.codeSplitting)

Nye ikoner krever en bevisst visuell beslutning før referansene oppdateres. Ingen push eller
deploy inngår i denne leveransen.
