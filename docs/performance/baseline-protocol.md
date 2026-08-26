# Lokal baselineprotokoll

> **Formål:** Sammenlignbar før-/ettermåling av API- og fullstackytelse
>
> **Omfang:** Lokal Chromium, Vite-proxy, Development-backend og prosjektets PostgreSQL-container

## Målekontrakt

Baselinen kjøres fra en ren arbeidskopi på committen som skal vurderes. Før- og ettermåling skal
bruke samme maskin, nettleser, databasevolum, tidspunktinnstillinger og kommandoer. Harnessen bruker
én Chromium-worker, blokkerer service workers og kjører uten kunstig nettverks- eller CPU-throttling.
Tallene er lokal diagnostikk, ikke produksjons-SLO-er.

Hver måleflyt avgrenses med navngitte requestmarkører i backendloggen. Nettverksartefaktet
registrerer metode, URL, status, varighet, dekodede responsbytes, cacheheadere, antall kall,
sekvensielle nettverksrunder og tid til den avtalte brukbare UI-tilstanden. Backendoppsummeringen
bruker requestscopen i standard ASP.NET-/EF-loggene til å registrere antall `DbCommand` og summen av
rapportert DB-tid per endpoint.

## Forutsetninger

- Docker Desktop kjører.
- Låst frontendgraf er installert med `npm ci`.
- Playwright Chromium er installert med `npx playwright install chromium`.
- Backendens ignorerte Development-konfigurasjon finnes som beskrevet i backendens `README.md`.
- Port 5015 er ledig før den loggede backenden startes. Playwright kan selv starte Vite på 4174.

Start databasen fra backend-repoet:

```bash
docker compose up -d db
```

Start deretter backenden i en egen terminal. Scopes er nødvendige for å knytte EF-kall til riktig
HTTP-request:

```bash
env \
  ASPNETCORE_ENVIRONMENT=Development \
  'Logging__LogLevel__Microsoft.AspNetCore.Hosting.Diagnostics=Information' \
  'Logging__LogLevel__Microsoft.EntityFrameworkCore.Database.Command=Information' \
  'Logging__Console__IncludeScopes=true' \
  dotnet run --no-launch-profile --project Banebooking.Api \
  --urls http://127.0.0.1:5015 \
  2>&1 | tee /tmp/banebooking-performance-backend.log
```

## Kjøring

Kjør fra frontend-repoet:

```bash
npm run performance:baseline
```

Standardvarigheten for kalenderflyten er ti minutter. En kortere
`PERFORMANCE_CALENDAR_DURATION_MS` er bare tillatt for å kontrollere selve harnessen og skal ikke
registreres som før- eller ettermåling.

Når Playwright-kjøringen er ferdig, stopp den loggede backenden og oppsummer request-/EF-loggen:

```bash
npm run performance:backend-summary -- \
  /tmp/banebooking-performance-backend.log
```

Kjøringen skriver ignorerte råartefakter til:

- `test-results/performance-baseline.json`
- `test-results/performance-backend-summary.json`

En godkjent måling oppsummeres i et datert dokument under `docs/performance/`. Råloggen committes
ikke fordi den inneholder SQL-tekst og lokale requestdetaljer.

## Flyter og brukbar UI

1. **Kald og varm bookingoppstart:** tre nye anonyme contexts og tre nye medlemscontexts åpner
   bookingruten. UI er brukbar når «Book bane» og listen med ledige tider er synlige. En varm
   retur fra arrangementlisten måles i samme context.
2. **Bookingvalg:** dato, bane og gren byttes separat. Hver flyt avsluttes først når den valgte
   kalenderen igjen er synlig og ferdig lastet.
3. **Autentisert oppstart og vilkår:** kald medlemsoppstart kjøres både med og uten eksisterende
   vilkårsaksept. Varianten uten aksept nullstiller bare `dev|medlem` i den lokale
   Compose-databasen; produktflyten registrerer aktiv versjon på nytt, og `finally` gjenoppretter
   tilstanden ved feil.
4. **Bookingens livsløp:** medlem oppretter en booking, åpner Mine bookinger og avbestiller den.
   En separat konflikt opprettes ved at `utvidet` reserverer den synlige sloten rett før medlemmet
   forsøker å booke. UI-feil, rollback, refetch og opprydding kontrolleres eksplisitt.
5. **Medlemsarrangementer:** listen og detaljen åpnes som medlem. Påmelding, endring og trekking
   registreres som ikke støttet dersom gjeldende produktkontrakt fortsatt mangler disse flatene.
6. **Kalender i forgrunn:** en ferdig lastet medlemskalender står synlig i ti minutter uten
   interaksjon. Bare API-kall innenfor intervallet telles.
7. **Arrangementadministrasjon:** administrator oppretter et test-eid arrangement, endrer metadata,
   redigerer, oppretter og sletter en arrangementsbooking og avlyser til slutt fixturearrangementet
   gjennom produkt-UI-et. Mutasjonene registreres som separate delmålinger.
8. **Representative administrasjonsflater:** brukeradministrasjon og statistikk åpnes som egne
   kalde fullstackflyter.
9. **Bane med generelle felt og bookingoverstyring:** beskrivelse og en baneoverstyring endres og
   lagres i én brukerhandling.

Arrangementet slettes, banen gjenopprettes felt for felt og vilkårsaksept settes tilbake etter
kjøringen. Harnessen sender aldri requests til produksjon og nekter å bruke andre API-adresser enn
den faste lokale E2E-origin-kontrakten.

## Sammenligningsregler

- Bruk samme commitgrunnlag og registrer commit-SHA, Chromium- og Node-versjon.
- Kjør minst én full ti-minutters måling før implementering og én etter hver samlet kandidat.
  Oppstartsvariantene repeteres tre ganger i hver full kjøring; sammenlign medianen og oppgi
  spennvidden slik at Vite-kompilering, JIT og schedulerstøy ikke styrer prioriteringen.
- Sammenlign først requestantall, nettverksrunder og DB-queries; lokale millisekunder brukes som
  støttesignal fordi scheduler, JIT, cacheoppvarming og maskinlast gir støy.
- En response uten HTTP-request i flytvinduet er frontendcache. En request med null EF-kall og et
  autoritativt svar kan være backendcache eller en DB-fri kodevei og må kontrolleres mot endpointet.
- Mislykkede mutasjoner må måles separat når kandidaten endrer `onError`/`onSettled`; de blandes
  ikke inn i den vellykkede førmålingen.
