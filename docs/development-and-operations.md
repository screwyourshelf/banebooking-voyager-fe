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

### Testing fra en annen enhet på lokalnettet

Start backend og PostgreSQL som beskrevet i backend-repoets README. Start deretter frontend:

```bash
VITE_API_BASE_URL= VITE_BASE_PATH= npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Åpne `http://<maskinens-lokale-IP>:5173/aas-tennisklubb` fra samme nettverk.
Browseren bruker samme origin for `/api`; Vite videresender til backend på localhost:5015.
Det er ikke nødvendig å eksponere database eller backendport på lokalnettet.
De lokale utviklingsprofilene finnes under **Testinnlogging** på innloggingssiden.

## Kvalitetsporter

Den vanlige lokale porten er:

```bash
npm test
npm run check
```

`check` kjører Svelte-typekontroll, arkitektur-, legacy-, statisk analyse- og designsystemgrenser,
de håndhevende theme-, cascade-, fixture-, produksjonstre- og stylingbaselineportene, lint og
formatkontroll. Stylingløftet har null legacydiagnostics. Designsystemgrensen validerer aktiv
Svelte-anatomi, CSS-klasser, `data-ui`, primitives, slots, utilities og tokens toveis, mens den
separate permanente visualiseringskontrakten bare tillater registrert datadrevet geometri.
Produksjonstreet inkluderer også `src/app.html` og håndhever ADR-007-flatens eksakte inline-CSS,
eneste styleattributt og synkronisering mot de elleve `--app-startup-*`-rollene.
De bindende stylingkravene ligger i ADR-006, ADR-007 og de kjørbare kontrollene.

### Reproduserbar statisk analyse

Kjør den repoeide død-kode-, eksport-, import- og direkte avhengighetskontrollen med:

```bash
npm run static-analysis:check
```

Knip 6.32.2 er eksakt pinnet i `devDependencies`. [`knip.json`](../knip.json) registrerer isolerte
stylingfixtures og det dynamiske produksjonstretestscriptet som eksplisitte innganger. Den navngitte
kontrollen avviser alle døde runtimefiler, typer og verdi-exports samt pakke-, binary-, ulistet- og
uoppløst-importfunn; det finnes ingen allowlist.

Håndskrevne filer i `src/lib/contracts` beskriver bare transportflaten som frontenden faktisk
konsumerer. DTO-deler som bare inngår i en eksportert respons er private typer i samme modul. Nye
endpointkontrakter legges til når en frontendkonsument implementeres, eller genereres samlet fra en
autoritativ API-spesifikasjon; en manuell, ubrukt kopi av hele backendgrafen skal ikke vedlikeholdes.

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
`npm run test:e2e:production`, og kontroller `npm audit`. `npm run check` inkluderer den statiske
analysen over. Selve opplastingen til Cloudflare Pages eller GitHub Pages er en ekstern endring og
skal bare gjøres etter eksplisitt godkjenning.

Detaljer om testdata og prosesseierskap finnes i [`e2e-harness.md`](./e2e-harness.md), og den aktive
snapshotdekningen beskrives i [`visual-regression-matrix.md`](./visual-regression-matrix.md).
Stylingguardene og deres maskinelle baseline eies av `scripts/styling-guards/`; gjeldende route-,
fallback- og bundlekrav håndheves av produksjons-E2E og `scripts/verify-production-builds.mjs`.

## Publisering fra hovedbranch

Dette repoet har ingen innsjekket GitHub Actions-workflow. Produksjonsbuildene og
hostkontraktene over beskriver artefaktene; eventuell automatisk hosting ved push styres utenfor
repoet. Kontroller den tilknyttede hostingtjenestens byggestatus etter publisering, og ikke
bruk vellykket Git-push som bekreftelse på at nettstedet er oppdatert.
