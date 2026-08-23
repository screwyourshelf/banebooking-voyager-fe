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
Produksjonsklienten sender fortsatt `Authorization: Bearer <token>`. Bare Playwright-konteksten
intersepterer egne `/api/**`-kall og skriver dette om til backendens utviklingsscheme
`DevelopmentBearer`. Dermed er den tidligere manuelle rewrite-proxyen ikke en skjult forutsetning,
og vanlig dev-, preview- og produksjonstrafikk er uendret.

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
