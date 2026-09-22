# Lokal E2E-harness

Den kritiske E2E-porten kjører Playwright mot SvelteKit og den isolerte lokale
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

- Bookingtesten velger en bane med en ledig, bookbar tid gjennom UI-et og oppretter én booking for utviklingsprofilen `medlem`, avbestiller samme booking i
  produktflyten og registrerer booking-ID-en ved API-grensen. Ettertesten sletter bare denne ID-en
  dersom flyten stopper før avbestillingen er fullført.
- Admintesten leser hele den eksisterende klubbprofilen for `aas-tennisklubb`, endrer klubbnavnet
  midlertidig og setter navnet tilbake i produktflyten. Ettertesten gjenoppretter hele det leste
  klubbobjektet med et separat admin-token dersom testen stopper underveis.
- Harnessen seeder, nullstiller eller sletter ikke andre utviklingsdata. Backenden eier fortsatt
  databasemigrering og idempotent seed ved oppstart.

Kjør porten med:

```bash
npm run test:e2e
```

Denne porten inkluderer fire kritiske flyter, arrangementkontrakten nedenfor og fjorten fryste
visuelle referanser. Ytelsesbaseline kjøres bare når den aktiveres eksplisitt. Authflyten logger
inn og ut med alle tre utviklingsprofiler og aksepterer den policyflaten backenddataene faktisk
krever. En egen, responslokal kunngjøringsfixture verifiserer kappløpet mellom retur fra login og
obligatorisk policyredirect uten å endre backenddata. De to øvrige kritiske flytene verifiserer
medlemmenes booking/avbestilling og administratorens klubbendring. De visuelle testene bruker
stabile, test-eide svar og den samme authharnessen, men utfører ingen mutasjoner. Den navngitte
route-, rolle-, state-, viewport-, theme- og interaksjonskontrakten ligger i
[`visual-regression-matrix.md`](./visual-regression-matrix.md).

De visuelle referansene kan også kjøres uten backend og database:

```bash
npm run test:e2e:visual
```

Denne konfigurasjonen bruker bare frontend og eide API-fixtures. De kritiske flytene og
arrangementkontrakten bruker lokal PostgreSQL. Bookingtesten krever minst én bookbar tid
innenfor utviklingsmedlemmets kvote; eksisterende manuelle bookinger ryddes ikke bort.

## Arrangementkontrakt

`e2e/arrangement-slot-contract.spec.ts` bruker frontendens faktiske API-klient og
arrangementfunksjoner mot lokal backend og PostgreSQL. Den verifiserer eksplisitte slots,
konflikt mot egne eksisterende tider, delvis batchsuksess og oppdatering av én booking. Den
kontrollerer også backendens beholdte erstatningsendepunkt. Testen oppretter ett eget arrangement
på ledige tider og sletter bare dette arrangementet i `finally`.

```bash
npx playwright test e2e/arrangement-slot-contract.spec.ts
```

Editorens valg av forhåndsvisningsendepunkt og visning av konflikt testes separat i
`src/lib/features/arrangement-admin/admin-screen.test.ts`.

## Produksjonsartefakter og routes

Den separate produksjonsporten bygger både root path og `/banebooking` til ignorerte,
isolerte mapper, verifiserer base path, fallbackmarkører, gzipbudsjetter og lazy chunks, og kjører
direkte load/refresh for public, protected, admin og callback:

```bash
npm run test:e2e:production
```

Produksjonsporten bruker deterministiske nettverkssvar og trenger ikke backend eller database.
Route-, viewport- og bundlekravene eies av produksjonsspesifikasjonen og
`scripts/verify-production-builds.mjs`.
