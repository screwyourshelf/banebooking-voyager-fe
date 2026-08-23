# WP-7 produksjonsbevis

> **Status:** Produksjonsbevis re-verifisert etter femte WP-7-checkpoint
>
> **Dato:** 2026-08-23

Fjerde checkpoint frøs produksjonsbeviset før React-referansen ble fjernet. Femte checkpoint har
kjørt hele beviset på nytt etter fjerningen. Det dekker bygde statiske artefakter, hostfallbacker,
base path, route-/refresh-atferd, visuelle referanser og bundlegrenser. Det utfører ingen ekstern
deploy og endrer ikke backend eller produksjonsauth.

## Produksjonslik routematrise

`npm run test:e2e:production` bygger Cloudflare Pages- og GitHub Pages-artefaktene separat i den
ignorerte `.e2e-build/`-mappen. En minimal statisk testserver gjenskaper hver hosts fallbackkontrakt
og merker fallbackresponsen eksplisitt, slik at testen kan skille den fra en faktisk prerenderet
fil. API-svar for klubboppslag er test-eide og deterministiske.

| Routeklasse | Route                         | Root path                  | `/banebooking`           | Renderbevis                       |
| ----------- | ----------------------------- | -------------------------- | ------------------------ | --------------------------------- |
| Public      | `aas-tennisklubb/vilkaar`     | `index.html`, load/refresh | `404.html`, load/refresh | `Vilkår for bruk`                 |
| Protected   | `aas-tennisklubb/bookinger`   | `index.html`, load/refresh | `404.html`, load/refresh | anonym guard → `Logg inn`         |
| Admin       | `aas-tennisklubb/admin/klubb` | `index.html`, load/refresh | `404.html`, load/refresh | anonym guard → `Logg inn`         |
| Callback    | `auth/callback?returnTo=…`    | prerender, load/refresh    | prerender, load/refresh  | deterministisk callback-feilflate |

Matrisen er åtte Playwright-tester: fire routeklasser i to hostingvarianter. Callbacken må treffes
som eksakt prerenderet artefakt uten fallbackheader. De tre tenantklassene må treffes gjennom
korrekt hostfallback. Protected og admin beviser at klientroutingen deretter håndhever den
anonyme tilgangsgrensen.

## Fryste visuelle referanser

De fire faktiske viewportene under kjøres som del av `npm run test:e2e`. Skjermbildene bruker
deterministiske `example.test`-data, eksplisitt tema og den autoritative utviklingsauthharnessen for
innloggede roller. Bare utviklingsdevtools skjules før sammenligning; produktflaten maskeres ikke.

| Flate              | Rolle         | Viewport    | Tema | Referanse                        |
| ------------------ | ------------- | ----------- | ---- | -------------------------------- |
| Login              | Anonym        | 390 × 844   | Lys  | `anonymous-login-mobile-light`   |
| Vilkår             | Offentlig     | 1440 × 1000 | Mørk | `public-terms-desktop-dark`      |
| Min side           | Medlem        | 1440 × 1000 | Lys  | `member-account-desktop-light`   |
| Klubbinnstillinger | Administrator | 390 × 844   | Mørk | `club-administrator-mobile-dark` |

En separat interaktiv nettleserkontroll av login og vilkår bekreftet én `main`, synlig `h1`,
riktig tema, ingen horisontal overflow og tom warn/error-konsoll. De fryste PNG-filene ligger ved
siden av `e2e/visual-regressions.spec.ts` og oppdateres bare ved en bevisst visuell endring:

```bash
npx playwright test e2e/visual-regressions.spec.ts --update-snapshots
```

## Bundle-, preload- og lazy-bevis

`npm run verify:production-builds` leser begge bygde fallbackene og alle genererte JS-chunks. Den
avviser feil base path, manglende hostmarkører, React-runtimekode, preloadet Sentry/Supabase/editor
og overskridelse av de fryste gzipbudsjettene.

| Mål                           | Cloudflare Pages | GitHub Pages |  Budsjett |
| ----------------------------- | ---------------: | -----------: | --------: |
| Initial JavaScript, gzip      |         37,6 KiB |     37,7 KiB |    50 KiB |
| Initial CSS, gzip             |         30,2 KiB |     30,2 KiB |    50 KiB |
| Største lazy JavaScript, gzip |        120,5 KiB |    120,5 KiB |   130 KiB |
| JavaScript-chunks             |               67 |           67 | Målepunkt |

Sentry, Supabase og ProseMirror finnes i separate lazy chunks og er ikke del av startupreferansene.
Begge artefakter er uten kjente React-runtime-signaturer. Cloudflare-artefaktet har eksakt
`/* /index.html 200` i `_redirects`; GitHub-artefaktet har `.nojekyll`, `/banebooking` i alle
startupreferanser og `404.html` som fallback.

Initial CSS bruker nå 60,4 % av budsjettet etter at det slettede TSX-treet ikke lenger inngår i
Tailwinds kildegrunnlag. Største lazy chunk bruker fortsatt 92,7 %. Begge er grønne; legacy-CSS-en
er ikke manuelt ryddet i dette checkpointet og forblir neste mål. Ingen visuelle paritetsavvik ble
registrert i de fryste flatene.

## Kjøring

```bash
npm run test:e2e
npm run test:e2e:production
```

Første kommando kjører kritiske innloggede flyter og visuelle snapshots mot devserver/backend.
Andre kommando rydder gamle testartefakter, bygger begge hostvarianter, verifiserer bundlekontrakten
og kjører den produksjonslike routematrisen. Produksjonsmatrisen trenger ikke en backendprosess.
