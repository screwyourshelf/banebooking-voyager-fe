# Utviklings- og driftsinstruks

Dette er den aktive kjøre- og byggkontrakten for SvelteKit-frontenden. Den beskriver lokale
forutsetninger og statiske produksjonsartefakter, men utfører eller autoriserer ikke ekstern deploy.

## Lokal utvikling

Installer den låste pakkegrafen og start Vite fra frontend-repoet:

```bash
npm ci
npm run dev
```

Dev- og previewserveren videresender `/api` til `http://localhost:5015`. Start backenden fra det
separate `backend/`-repoet når en arbeidsflate trenger reelle API-svar. Utviklingsauth er bare
tilgjengelig i Vites development-modus og er aldri del av produksjonsbuilden.

Offentlig runtimekonfigurasjon kan legges i en lokal `.env`-fil. Verdiene bygges inn i klienten og
må derfor aldri være hemmeligheter.

| Variabel                        | Betydning                                                              |
| ------------------------------- | ---------------------------------------------------------------------- |
| `VITE_API_BASE_URL`             | Valgfri absolutt API-base; tom verdi bruker samme origin og `/api`     |
| `VITE_DEFAULT_SLUG`             | Fallback-tenant for lokal utvikling, standard `aas-tennisklubb`        |
| `VITE_TENANT_SLUG`              | Autoritativ tenant i en dedikert klubbbuild; utelates for multi-tenant |
| `VITE_ENABLE_IDRETTENS_ID`      | Aktiverer Idrettens ID bare når verdien er eksakt `true`               |
| `VITE_SUPABASE_URL`             | Offentlig Supabase-prosjekt-URL for produksjonsauth                    |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Offentlig publishable key; aldri service-role key                      |
| `VITE_SENTRY_DSN`               | Valgfri browser-DSN; adapteren er bare aktiv i produksjonsmodus        |
| `VITE_BASE_PATH`                | Tom for root-hosting, ellers normalisert understi som `/banebooking`   |
| `VITE_STATIC_HOST`              | `cloudflare-pages` eller `github-pages`; velger statisk fallback       |
| `BANEBOOKING_STATIC_OUTPUT_DIR` | Valgfri relativ artefaktmappe; standard er `dist`                      |

## Kvalitetsporter

Den vanlige lokale porten er:

```bash
npm test
npm run check
```

`check` kjører Svelte-typekontroll, arkitektur-, legacy- og designsystemgrenser, lint og
formatkontroll. Før styling lift-and-shift-en er ferdig, validerer designsystemgrensen fortsatt den
globale CSS-baselinen toveis: aktiv Svelte-anatomi må ha en stylingeier, og CSS-klasser, `data-ui`,
primitives, slots og tokens uten aktiv konsument avvises. SWP-1 utvider porten med Tailwind-/theme-
og featurestylingguards; den avtakende overgangsbaselinen og sluttkravene er definert i
[`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md).

De kritiske innloggede flytene og de fryste visuelle referansene krever lokal database/backend:

```bash
npm run test:e2e
```

Den produksjonslike routematrisen bygger begge hostvarianter og trenger ikke backend:

```bash
npm run test:e2e:production
```

Oppdater aldri visuelle snapshots som en generell feilretting. Avklar først at endringen er en
godkjent visuell kontraktendring.

## Produksjonsbuild og hosting

Bruk den eksplisitte hostkommandoen; begge skriver som standard til `dist/`:

```bash
npm run build:cloudflare-pages
npm run build:github-pages
```

- Cloudflare Pages-artefaktet bruker `index.html` som SPA-fallback og inkluderer `_redirects`.
- GitHub Pages-artefaktet bygges med `/banebooking` som base path, bruker `404.html` som fallback og
  inkluderer `.nojekyll`.
- `auth/callback` prerendres; tenant-rutene håndteres av hostfallbacken og klientrouteren.

Før et artefakt publiseres, kjør minst `npm test`, `npm run check`, `npm run test:e2e` og
`npm run test:e2e:production`, og kontroller `npm audit`. Selve opplastingen til Cloudflare Pages
eller GitHub Pages er en ekstern endring og skal bare gjøres etter eksplisitt godkjenning.

Detaljer om testdata og prosesseierskap finnes i [`e2e-harness.md`](./e2e-harness.md). Gjeldende
route-, fallback- og bundlebevis finnes i
[`wp-7-production-evidence.md`](./wp-7-production-evidence.md).
