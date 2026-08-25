# Lokal E2E-harness

Den kritiske WP-7-porten kjører Playwright mot SvelteKit og den isolerte lokale
utviklingsbackenden. Harnessen endrer ikke produksjonsauth eller backendkode.

## Forutsetninger og prosesser

- PostgreSQL-instansen fra `backend/compose.yaml` må være konfigurert og kjøre.
- `npm run test:e2e` gjenbruker backend på `127.0.0.1:5015` når den allerede kjører. Ellers starter
  Playwright `../backend/Banebooking.Api` i `Development`; prosessen stoppes etter testen.
- Playwright starter og stopper en egen SvelteKit-devserver på `127.0.0.1:4174` med base path
  `/banebooking`. En allerede kjørende og frisk server på samme adresse kan gjenbrukes.
- Chromium installeres én gang med `npx playwright install chromium`.

## Authkontrakt

Utviklingsinnloggingen returnerer de eksisterende profilene `admin`, `utvidet` og `medlem`.
Authadapteren leverer både token og eksplisitt scheme til API-klienten: Supabase bruker
`Authorization: Bearer <token>`, mens lokal utviklingsinnlogging bruker backendens
`Authorization: DevelopmentBearer <token>`. Vanlig lokal testing er dermed uavhengig av Supabase i
produksjon. Playwright-konteksten bruker samme klientkontrakt og omskriver ikke authheadere; routen
registrerer bare test-eide booking-ID-er for avgrenset opprydding.

## Eide testdata og opprydding

- Bookingtesten oppretter én booking for utviklingsprofilen `medlem`, avbestiller samme booking i
  produktflyten og registrerer booking-ID-en ved API-grensen. Ettertesten sletter bare denne ID-en
  dersom flyten stopper før avbestillingen er fullført.
- Admintesten leser hele den eksisterende klubbprofilen for `aas-tennisklubb`, endrer klubbnavnet
  midlertidig og setter navnet tilbake i produktflyten. Ettertesten gjenoppretter hele det leste
  klubbobjektet med et separat admin-token dersom testen stopper underveis.
- Harnessen seeder, nullstiller eller sletter ikke andre utviklingsdata. Backenden eier fortsatt
  migrering og idempotent seed ved oppstart.

Kjør porten med:

```bash
npm run test:e2e
```

Denne porten inkluderer tre kritiske flyter og elleve fryste visuelle referanser. Authflyten logger
inn og ut med alle tre utviklingsprofiler; de to andre kritiske flytene verifiserer medlemmenes
booking/avbestilling og administratorens klubbendring. De visuelle testene bruker stabile,
test-eide svar og den samme authharnessen, men utfører ingen mutasjoner. Den navngitte route-,
rolle-, state-, viewport-, theme- og interaksjonskontrakten ligger i
[`styling-reference-matrix.md`](./styling-reference-matrix.md).

## Produksjonsartefakter og routes

Den separate produksjonsporten bygger både root path og `/banebooking` til ignorerte,
isolerte mapper, verifiserer base path, fallbackmarkører, gzipbudsjetter og lazy chunks, og kjører
direkte load/refresh for public, protected, admin og callback:

```bash
npm run test:e2e:production
```

Produksjonsporten bruker deterministiske nettverkssvar og trenger ikke backend eller database.
Detaljert route-, viewport- og bundlebevis finnes i
[`wp-7-production-evidence.md`](./wp-7-production-evidence.md).
