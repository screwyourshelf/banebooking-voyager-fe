# Førstegjennomgang: API- og fullstackytelse

> **Status:** Historisk referansegrunnlag for det fullførte ytelsesinitiativet
>
> **Reviewtidspunkt:** Frontend og backend, 2026-08-25
>
> **Autoritet:** Gjeldende kode og nye målinger veier tyngre enn dette dokumentet

## Formål

Dette dokumentet bevarer den første gjennomgangen av hvordan frontenden bruker API-et, og hvor
samspillet med backend kan forbedres. Målet er bedre opplevd ytelse og lavere ressursbruk uten å
gjøre API-et vanskeligere å forstå, skjule dataflyt eller svekke autorisasjons- og
cachekorrektheten.

Gjennomgangen var lesende. Tallene under er statiske estimater fra kontrollflyten og ble etterfulgt
av målinger før implementering. Levert resultat ligger i [`README.md`](./README.md), mens eventuell
ny aktiv status ligger i [`../current-work.md`](../current-work.md).

## Beslutning om arbeidsdeling

Arbeidet bør gjennomføres i to leveranser under én ytelsesgjennomgang:

1. **Frontend-hardening:** Forbedre querynøkler, invalidering, oppstartsrekkefølge, polling,
   stale-tider og eksplisitt authintensjon uten å endre backendkontrakter.
2. **Separat fullstackleveranse:** Endre bare kontrakter eller backendadferd som fortsatt gir en
   målbar gevinst etter frontend-hardening. Frontend- og backendendringer skal ha separate commits
   og verifiseres sammen.

Dette skillet gjør gevinstene målbare og begrenser risikoen ved endringer i API-kontrakter.

## Eksisterende styrker som skal bevares

- Komponenter gjør ikke direkte HTTP-kall. Endpointfunksjonene ligger i feature-API-moduler og går
  gjennom den sentrale API-klienten.
- Transportkontraktene er håndskrevne og begrenset til data frontenden faktisk bruker.
- TanStack Query eier serverstate, retry, kansellering, stale-tid og mutationstatus.
- De fleste queryfunksjonene videresender `AbortSignal`.
- Booking og «min side» deler kompatible bookingnøkler og har målrettede optimistiske
  cacheoppdateringer.
- Backend cacher stabile klubb-, gren-, bane-, feed-, statistikk- og offentlige arrangementdata.
- Bookingtabellen har relevante indekser for bane/dato, gren/dato, bruker og arrangement.
- Produksjons-API-et leverte Brotli-komprimerte svar ved headerkontrollen 2026-08-25.

Tiltakene skal bygge videre på dette. De skal ikke introdusere et parallelt datahentingslag, en ny
generisk store eller en ny transportprotokoll uten dokumentert behov.

## Funn

### 1. Tenant-bred invalidering gir unødvendige refetcher

`src/lib/platform/query/query-key.ts` har `invalidateTenantQueries`, som matcher enhver querynøkkel
som inneholder samme `slug`. Flere adminmutasjoner bruker denne etter en endring.

Konsekvensen er at en mutasjon kan refetche alle aktive klubb-, bruker-, arrangement-, gren-, bane-
og bookingqueries selv om bare én ressurs er endret. I arrangementeditoren var seks queries typisk
aktive under reviewet. Redigering av én eksisterende arrangementsbooking utføres som DELETE
etterfulgt av POST, og begge operasjoner utløser bred invalidering. Det kan gi:

- 2 write-kall
- opptil 12 etterfølgende GET-kall
- opptil 14 HTTP-kall for én brukerhandling

Antallet avhenger av hvilke queries som er aktive og må måles på nytt ved oppstart av arbeidet.

**Anbefalt retning:**

- Definer en eksplisitt invalidasjonsmatrise per mutasjon.
- Oppdater cache direkte når mutasjonssvaret er autoritativt.
- Invalider bare ressursene som kan være avledet av endringen.
- Bruk bred tenantinvalidering kun som dokumentert unntak for reelle bootstrapendringer.
- Unngå refetch ved feil når serveren ikke har endret data.

Dette er frontend-only og forventes å være tiltaket med størst umiddelbar gevinst.

### 2. Sessionoppstart har en klubb-/brukeravhengighet

`src/lib/features/session/SessionDataProvider.svelte` laster klubb først. Brukerqueryen aktiveres
først når klubbqueryen har lykkes. Førmålingen 2026-08-26 viste at booking-bootstrap i praksis
starter parallelt med klubbrequesten for anonyme og parallelt med brukerrequesten for innloggede.
Den statiske antakelsen om at bootstrap alltid starter sist var derfor feil.

Kald, autentisert bookingoppstart er målt som:

1. `GET /klubb/{slug}`
2. `GET /klubb/{slug}/bruker` og `GET /klubb/{slug}/booking-bootstrap` parallelt

`src/lib/features/session/api.ts` gjør i tillegg `GET -> POST /vilkaar -> GET` dersom brukeren ikke
har registrert aktiv vilkårsversjon. Førstegangsflyten har fem API-kall, men bootstrap overlapper
den tidligere delen av sessionflyten.

Backendens `BookingBootstrapController` bygger samtidig komplett brukerprofil på nytt og returnerer
både klubb og bruker. Frontendens bookingkontrakt konsumerer bare grener, baner, valgt utvalg, dato
og kalenderslots. Den komplette profilen medfører oppslag av aktiv medlemskapsbekreftelse, aktiv
kunngjøring og eventuelt brukerens kunngjøringsbekreftelse uten at bookingflaten bruker resultatet.

**Anbefalt retning:**

- Frontend først: start klubb- og brukerquery parallelt og videresend `AbortSignal`.
- Behold én global eier for klubb og bruker/policystate.
- La booking-bootstrap eie bare bookingdata.
- Fjern ubrukt klubb og komplett brukerprofil fra bootstrapkontrakten i en koordinert
  fullstackendring, etter kontroll av andre API-konsumenter.
- Vurder et eget, smalt sessionendepunkt bare dersom måling etter parallelliseringen viser at det
  gir en relevant gevinst.
- La `POST /vilkaar` returnere oppdatert profil dersom den ekstra GET-en skal fjernes. Den
  observerbare policyadferden skal bevares og testes eksplisitt.

Det skal ikke opprettes en generell «hele appen»-bootstrap. En slik respons kobler uavhengige
features, cachelevetider og autorisasjonsbehov sammen og gjør API-et vanskeligere å forstå.

### 3. Kalenderpolling er den største løpende kostnaden

`src/lib/features/booking/queries.ts` poller valgt bane og dato hvert 30. sekund mens fanen er
aktiv. Det tilsvarer omtrent 120 HTTP-kall per åpen brukertime.

For en autentisert bruker innebærer kontrollflyten normalt:

- én bruker-/rolle-/sperrequery fra `KlubbContextMiddleware`
- én bookingquery for valgt bane og dato
- én kvotequery for brukeren

Aktive sperrer gjenbrukes fra middlewarelastingen, og værdata har eget cachelag. Et grovt statisk
estimat er derfor rundt 360 DB-rundturer per aktiv brukertime. Dette er en inferens, ikke en målt
produksjonsverdi.

**Anbefalt retning:**

- Mål først hvor ofte kalenderen faktisk står åpen og hvor ofte data endres.
- Prøv 60 sekunder som enkel første kandidat, med eksisterende refetch etter mutasjon, ved
  vindusfokus og ved endring av bane eller dato.
- Vurder adaptiv polling bare dersom én fast periode ikke dekker behovet.
- Behold `refetchIntervalInBackground: false`.
- Ikke innfør SSE, WebSocket, long-polling eller et delta-/revisjons-API uten dokumentert last- eller
  ferskhetsbehov.

### 4. API-klienten sender token også til brukeruavhengige endepunkter

`src/lib/platform/api/client.ts` henter token på alle requests og legger ved `Authorization` når
brukeren er innlogget. `KlubbContextMiddleware` laster da bruker, roller og aktive sperrer for alle
slugbaserte requests, også når controlleren bare trenger offentlig klubb- eller feeddata.

Dette gjelder blant annet klubb, feed og helt offentlige arrangementresponser. Kalender,
booking-bootstrap, grener og baner kan derimot være personaliserte og må fortsatt kunne bruke
innlogget kontekst.

**Anbefalt retning:**

- Utvid requestkontrakten med en eksplisitt authpolicy, for eksempel `none | optional | required`.
- Merk helt offentlige endpointfunksjoner med `none`.
- Bruk `optional` bare der samme GET bevisst gir en rikere respons til innloggede brukere.
- Bruk `required` på beskyttede operasjoner.
- Verifiser at 401-håndteringen bare kjøres for kall der autentisering faktisk er relevant.

Dette forbedrer lesbarheten i endpointmodulene samtidig som unødvendig tokenarbeid og
brukerlasting fjernes. Backend kan senere få eksplisitt endpointmetadata som et ekstra vern, men
det bør ikke erstatte en tydelig klientkontrakt.

### 5. Frontendens cachelevetid er kortere enn backendens for stabile ressurser

Frontend bruker normalt 30–60 sekunders stale-tid for klubb, grener og baner. Backend cacher de
samme ressursene i seks timer og invaliderer ved adminendringer. Feed caches i ti minutter,
statistikk i femten minutter og anonyme/offentlige arrangementsresponser i ti minutter.

De ekstra HTTP-kallene treffer derfor ikke nødvendigvis databasen, men betaler fortsatt for
requesthåndtering, eventuell auth, mapping, serialisering og nettverk.

Det finnes også flere querynøkler for identiske HTTP-ressurser:

- statistikk og baneadministrasjon henter samme komplette bane- og grenlister
- arrangementsvisning og arrangementadministrasjon kan hente samme arrangementsressurs med ulike
  featureeide nøkler

Arrangementadministrasjonen laster arrangementslisten, grener og baner med en gang. Baner trengs i
hovedsak først når editoren åpnes.

**Anbefalt retning:**

- Bruk 5–15 minutter som utgangspunkt for stabile ressurser som allerede har eksplisitt
  invalidering.
- Behold korte levetider for kalender og annen konfliktutsatt data.
- Gi én HTTP-ressurs én kanonisk querynøkkel når respons og autorisasjonskontekst er identisk.
- Last editoravhengige data først når editoren åpnes.
- Ikke skjul ulike responsvarianter bak samme nøkkel dersom queryparametre eller kapabiliteter gjør
  innholdet forskjellig.

### 6. Flere mutasjonssvar er allerede rike nok til cacheoppdatering

Arrangement-API-et returnerer blant annet:

- oppdatert arrangementmetadata
- full opprettet arrangementsbooking
- alle opprettede og feilede elementer fra batchopprettelse
- ID og antall ved sletting

Frontend bruker deler av svarene til lokal feedback, men kjører likevel bred refetch. Tilsvarende
kan opprettelse av kunngjøring returnere hele den nye adminresponsen.

**Anbefalt retning:**

- Bruk responsen til å oppdatere den berørte cachen synkront.
- Invalider kun sekundære visninger som ikke kan oppdateres sikkert fra responsen, for eksempel
  kalenderdatoer som påvirkes av en arrangementsbooking.
- Behold en autoritativ refetch for operasjoner med delvis suksess eller kompliserte avledninger
  når lokal oppdatering ellers ville duplisert backendlogikk.
- Ikke utvid alle `204 No Content`-mutasjoner med store responser bare for å unngå sjeldne
  admin-GET-er.

### 7. Redigering av én arrangementsbooking er ikke atomisk

`src/lib/features/arrangement-admin/arrangement-editor-controller.svelte.ts` redigerer en
eksisterende booking ved å slette den og deretter opprette en ny. Det gir to requests og kan miste
den opprinnelige bookingen dersom den nye tiden avvises etter at DELETE har lykkes.

**Anbefalt retning:**

- Etabler `PUT /arrangement/{arrangementId}/bookinger/{bookingId}` eller en tilsvarende tydelig
  ressurskontrakt.
- Valider konflikt og tilgang før den eksisterende bookingen endres.
- Utfør oppdateringen atomisk i backend.
- Returner den oppdaterte `ArrangementBookingRespons` slik at frontend kan oppdatere cachen direkte.

Dette er først og fremst et korrekthetsgrep, men reduserer samtidig to writes og to
invalidasjonsrunder til én operasjon. Det bør ligge i den separate fullstackleveransen.

### 8. Stabile profilpolicyer spørres fra databasen ved hver komplett profilbygging

`BrukerProfilService` leser aktiv medlemskapsbekreftelse og aktiv kunngjøring hver gang komplett
brukerprofil bygges. Dersom en kunngjøring er aktiv, kontrolleres også brukerens bekreftelse.

Aktiv medlemskapsbekreftelse og aktiv kunngjøring er klubbdata som endres sjelden og har tydelige
aktiverings-, deaktiverings- og utløpstidspunkter.

**Anbefalt retning:**

- Cache de to klubbglobale oppslagene med TTL som aldri går forbi faktisk utløpstid.
- Invalider ved opprettelse, aktivering og deaktivering.
- Cache nullresultater kortere enn aktive resultater.
- Behold den brukeravhengige bekreftelseskontrollen korrekt og fersk.
- Gjennomfør dette først etter at den dupliserte profilbyggingen i booking-bootstrap er fjernet eller
  målt; ellers kan cache skjule en dårlig kontrakt i stedet for å rette den.

### 9. HTTP-caching kan brukes selektivt; komprimering er allerede aktiv

En read-only headerkontroll mot produksjons-API-et 2026-08-25 viste `content-encoding: br` for klubb
og feed. De undersøkte svarene hadde ikke `ETag` eller eksplisitt `Cache-Control`.

**Anbefalt retning:**

- Ikke legg responskomprimering inn som et eget tiltak så lenge produksjonsserveringen fortsatt
  leverer Brotli.
- Vurder `Cache-Control` og validatorer for klubb, feed og helt offentlige arrangementer.
- Send ikke `Authorization` på ressurser som skal kunne deles i offentlig edge-/browsercache.
- Sett aldri offentlig cachepolicy på brukeravhengige responser.
- Verifiser faktiske produksjonsheadere på nytt før implementering; edgeadferd kan endres uavhengig
  av repoet.

HTTP-cache er lavere prioritert enn færre kall og bedre queryinvalidering. De minste offentlige
responsene kan koste mer å validere enn å overføre.

### 10. Skaleringstiltak skal styres av faktiske datamengder

Følgende er mulige senere tiltak, men var ikke dokumenterte problemer i førstegjennomgangen:

- Adminbrukerlisten henter alle brukere mens UI-et viser et begrenset antall om gangen. Innfør
  serverpaginering og søk først når klubbens brukertall eller responsmålinger tilsier det.
- Arrangementlisten leser bookingrader for å bygge presentasjonsmodellen. SQL-aggregering eller en
  egen lesemodell vurderes først dersom store arrangementsserier dominerer responstid eller minne.
- Backendens `IMemoryCache` er prosesslokal. Delt cache eller distribuert invalidering er relevant
  først dersom produksjonen faktisk kjører flere samtidige appinstanser over tid.
- Ikke introduser Redis, GraphQL eller et generisk BFF-lag uten et separat dokumentert behov.

## Prioriterte tiltakskandidater

| ID   | Kandidat                                                        | Scope     | Forventet effekt | Kompleksitet | API-forståelse       |
| ---- | --------------------------------------------------------------- | --------- | ---------------- | ------------ | -------------------- |
| FE-1 | Målrettet invalidering og direkte cacheoppdatering              | Frontend  | Svært høy        | Lav–middels  | Bedre                |
| FE-2 | Parallell klubb-/brukeroppstart og session-`AbortSignal`        | Frontend  | Høy kaldstart    | Lav          | Uendret/bedre        |
| FE-3 | Eksplisitt `none/optional/required` authpolicy                  | Frontend  | Middels–høy      | Lav–middels  | Bedre                |
| FE-4 | Justert eller adaptiv kalenderpolling                           | Frontend  | Høy løpende      | Lav          | Uendret              |
| FE-5 | Lengre stale-tider, kanoniske ressursnøkler og lazy admin-data  | Frontend  | Middels          | Lav–middels  | Bedre                |
| FS-1 | Smal booking-bootstrap uten global klubb-/brukerprofil          | Fullstack | Høy kaldstart    | Middels      | Bedre                |
| FS-2 | Oppdatert brukerrespons fra vilkårsmutasjonen                   | Fullstack | Lav, én gang     | Lav          | Bedre                |
| FS-3 | Atomisk `PUT` for redigering av arrangementsbooking             | Fullstack | Middels + riktig | Middels      | Bedre                |
| BE-1 | Utløpsstyrt cache for klubbglobal medlemskap-/kunngjøringsstate | Backend   | Middels          | Middels      | Uendret              |
| BE-2 | Selektiv `ETag`/`Cache-Control` på offentlige GET-er            | Backend   | Lav–middels      | Middels      | Bedre når eksplisitt |

Tabellen er en prioritering fra statisk review, ikke en vedtatt implementeringsplan. Kandidater kan
fjernes dersom baseline eller måling etter FE-1–FE-5 ikke viser relevant gevinst.

## Anbefalt gjennomføringsrekkefølge

### Fase 0 — baseline uten produktendring

Mål minst disse flytene:

1. Kald anonym bookingoppstart.
2. Kald autentisert bookingoppstart med og uten eksisterende vilkårsaksept.
3. Ti minutter med bookingkalenderen åpen i forgrunn.
4. Oppdatering av arrangementmetadata.
5. Redigering, opprettelse og sletting av én arrangementsbooking.
6. Lagring av bane med både generelle felt og bookingoverstyring.

Registrer per flyt:

- antall HTTP-kall og sekvensielle nettverksrunder
- total varighet og tid til brukbar UI
- overførte bytes
- antall DB-queries og samlet DB-tid per endpoint
- antall refetcher etter vellykket og feilet mutasjon
- om responsen kom fra frontendcache, backendcache eller database

Bruk browserens Network-panel og lokal EF-/requestlogging før ny observability-avhengighet vurderes.
Enkeltmålinger fra utviklermaskinen er diagnostikk, ikke produksjons-SLO-er.

### Fase 1 — separat frontend-hardening

Gjennomfør og verifiser FE-1–FE-5 uten backendkontraktendringer. Del arbeidet i små, atomiske
commits etter ressursansvar, ikke etter tilfeldig skjerm. Bevar URL-er, policyflyt og observerbar
produktadferd.

Kjør frontendens ordinære tester, `npm run check`, relevant Playwright og produksjonsbygg. Mål de
samme flytene på nytt før fullstackomfang godkjennes.

### Fase 2 — eksplisitt fullstackscope

Velg bare FS-/BE-kandidater som fortsatt har dokumentert gevinst. For hver kontraktendring skal
leveransen inneholde:

- backendkontrakt og OpenAPI-respons
- oppdatert håndskrevet frontendkontrakt
- utrullings-/kompatibilitetsbeslutning for eventuelle andre klienter
- cache- og invalidasjonsregler
- autorisasjons- og anonymitetsregler
- backendtester og frontend kontrakt-/flyttester
- før-/ettermåling
- separate commits i de to repoene

Backendendringer skal være en eksplisitt, separat fullstackleveranse.

## Akseptansekriterier for en senere leveranse

- Samme observerbare produktadferd, roller, guards, URL-er og feilmeldingsansvar er bevart med mindre
  en egen produktendring er godkjent.
- Hver HTTP-ressurs har én forståelig eier og én kanonisk cacheidentitet per responsvariant.
- Hver mutasjon dokumenterer hvilke cacher den oppdaterer eller invaliderer og hvorfor.
- Ingen tenant-bred invalidering brukes uten et dokumentert avhengighetsbehov.
- Offentlige requests sender ikke token uten at responsen faktisk personaliseres.
- Autorisasjon eller aktive sperrer blir ikke foreldet for å spare en databasequery.
- Kaldstart og løpende requestantall er målt før og etter.
- Endringen gir en synlig forbedring i minst én avtalt metrikk uten regresjon i de andre.
- Produksjonsheadere og edgeadferd er kontrollert på nytt.

## Tiltak som ikke anbefales i første runde

- GraphQL eller et generisk BFF-lag
- én stor app-bootstrap med data fra uavhengige features
- SSE, WebSocket eller long-polling for kalenderen
- delta-/revisjons-API før polling er målt og justert
- aggressiv cache av bruker, roller, sperrer eller kapabiliteter
- Redis eller annen distribuert cache uten dokumentert flerinstansbehov
- applikasjonskomprimering uten ny verifikasjon av produksjonsserveringen
- serverpaginering uten dokumentert respons- eller datamengdeproblem

Disse kan være riktige i en annen skala, men vil nå øke kompleksiteten mer enn den dokumenterte
gevinsten og gjøre API-et vanskeligere å følge.

## Separat funksjonell observasjon

Arrangementadministrasjonens «Vis tidligere» filtrerer lokalt, mens
`src/lib/features/arrangement-admin/api.ts` henter `/arrangementer` uten
`inkluderHistoriske=true`. Backendens endepunkt har `false` som standard og kan derfor ha filtrert
bort historiske arrangementer før UI-et får dataene.

Dette er ikke et ytelsestiltak. Ved oppstart av oppfølgingen skal forventet produktadferd verifiseres
separat før queryparametre, cacheidentitet eller UI endres.

## Kildekart fra førstegjennomgangen

Frontend:

- [`src/lib/platform/api/client.ts`](../../src/lib/platform/api/client.ts)
- [`src/lib/platform/query/client.ts`](../../src/lib/platform/query/client.ts)
- [`src/lib/platform/query/query-key.ts`](../../src/lib/platform/query/query-key.ts)
- [`src/lib/features/session/SessionDataProvider.svelte`](../../src/lib/features/session/SessionDataProvider.svelte)
- [`src/lib/features/session/SessionGate.svelte`](../../src/lib/features/session/SessionGate.svelte)
- [`src/lib/features/session/api.ts`](../../src/lib/features/session/api.ts)
- [`src/lib/features/booking/queries.ts`](../../src/lib/features/booking/queries.ts)
- [`src/lib/features/arrangement-admin/queries.ts`](../../src/lib/features/arrangement-admin/queries.ts)
- [`src/lib/features/arrangement-admin/arrangement-editor-controller.svelte.ts`](../../src/lib/features/arrangement-admin/arrangement-editor-controller.svelte.ts)
- [`src/lib/features/court-and-activity-admin/queries.ts`](../../src/lib/features/court-and-activity-admin/queries.ts)

Backend, med stier relativt til workspace-roten:

- `backend/Banebooking.Api/Program.cs`
- `backend/Banebooking.Api/Middleware/KlubbContextMiddleware.cs`
- `backend/Banebooking.Api/Controllers/BookingBootstrapController.cs`
- `backend/Banebooking.Api/Controllers/KalenderController.cs`
- `backend/Banebooking.Api/Controllers/ArrangementController.cs`
- `backend/Banebooking.Api/Controllers/BrukereController.cs`
- `backend/Banebooking.Api/Tjenester/BrukerService.cs`
- `backend/Banebooking.Api/Tjenester/BrukerProfilService.cs`
- `backend/Banebooking.Api/Tjenester/BookingService.cs`
- `backend/Banebooking.Api/Tjenester/ArrangementService.cs`
- `backend/Banebooking.Api/Tjenester/CacheService.cs`
- `backend/Banebooking.Api/Tjenester/MedlemskapService.cs`
- `backend/Banebooking.Api/Tjenester/KunngjøringService.cs`
- `backend/Banebooking.Api/Data/BanebookingDbContext.cs`
- `backend/Banebooking.Api/fly.toml`
