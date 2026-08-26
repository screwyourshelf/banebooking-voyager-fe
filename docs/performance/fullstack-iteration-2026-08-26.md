# Fullstack-ytelsesiterasjon 2026-08-26

> **Status:** Fullført lokalt — klar for separate reviews
>
> **Frontendgrunnlag:** `fbba604` fra `origin/main` (`606e9d2`)
>
> **Backendgrunnlag:** `0562d7f` fra `origin/master`
>
> **Frontendtiltak:** `73d8168`, `318ac32` og `c5300a0`
>
> **Backendtiltak:** `6d3026d`

## Målekontrakt

Førmålingen fulgte [`baselineprotokollen`](./baseline-protocol.md) mot lokal Chromium, Vite-proxy,
Development-backend og PostgreSQL-container. Ingen produksjonsdata eller eksterne tjenester ble
brukt. `admin`, `utvidet` og `medlem` utførte de muterende scenariene mot test-eide data som ble
gjenopprettet i `finally`.

- Node `22.23.1`, Playwright `1.62.1`, Chromium `151.0.7922.34` og .NET SDK `10.0.302`.
- Datavolum etter opprydding: 2 klubber, 4 grener, 10 baner, 5 brukere, 183 bookinger,
  5 arrangementer, 8 kunngjøringer og 2 medlemskapsbekreftelser.
- Kalenderen stod i forgrunn i 600 000 ms. Oppstartsvariantene ble kjørt tre ganger.
- Rå nettverks- og backendartefakter er ignorerte. Sammenligningsgrunnlaget er bevart lokalt som
  `/tmp/banebooking-performance-before-network.json` og
  `/tmp/banebooking-performance-before-backend.json`; ettermålingen som
  `/tmp/banebooking-performance-after-network.json` og
  `/tmp/banebooking-performance-after-backend.json`.
- `ready` er tid til avtalt synlig og brukbar UI. Det faste 500 ms-nettverksstabilitetsvinduet er
  ikke del av `ready`.

Lokale tider er diagnostikk, ikke produksjons-SLO-er. Request-, byte- og SQL-antall er de viktigste
strukturelle signalene.

## Førbaseline

| Flyt                                  | HTTP | Runder |  Bytes |  DB | SQL ms | Ready ms |
| ------------------------------------- | ---: | -----: | -----: | --: | -----: | -------: |
| Kald anonym oppstart, median          |    2 |      1 |  9 260 |   1 |      2 |    488,8 |
| Varm retur til booking                |    0 |      0 |      0 |   0 |      0 |     61,6 |
| Bytt dato                             |    1 |      1 |  5 344 |   1 |      2 |    122,4 |
| Bytt bane                             |    1 |      1 |  6 550 |   1 |      3 |    108,1 |
| Bytt gren                             |    1 |      1 |  6 010 |   1 |      4 |     90,1 |
| Kald medlem, vilkår akseptert, median |    3 |    1–2 |  9 947 |   7 |     10 |    501,0 |
| Kald medlem, vilkår mangler           |    4 |      2 | 10 463 |  12 |     17 |    478,4 |
| Medlemsarrangementer                  |    3 |      2 |  9 025 |   7 |     12 |    485,4 |
| Arrangementsdetalj                    |    0 |      0 |      0 |   0 |      0 |     59,7 |
| Opprett medlemsbooking                |    2 |      1 |  5 584 |   7 |     10 |     56,5 |
| Åpne Mine bookinger                   |    3 |      1 |  1 118 |   6 |      8 |    414,6 |
| Avbestill medlemsbooking              |    2 |      1 |     48 |   5 |     10 |     24,1 |
| Bookingkonflikt                       |    2 |      1 |  5 799 |   6 |      9 |     68,3 |
| Kalender i forgrunn, 10 minutter      |   10 |     10 | 49 900 |  30 |     71 |        0 |
| Åpne brukeradministrasjon             |    3 |      2 |  3 819 |   7 |     16 |    502,6 |
| Åpne statistikk                       |    5 |      2 | 16 273 |   8 |     20 |    530,2 |
| Opprett arrangement                   |    2 |      1 |  9 419 |   7 |     10 |     72,9 |
| Oppdater arrangementmetadata          |    1 |      1 |    199 |   3 |      5 |     85,4 |
| Rediger arrangementsbooking           |    2 |      1 |  9 475 |   8 |     10 |    116,3 |
| Opprett arrangementsbooking           |    2 |      1 |  9 581 |   8 |     14 |     51,9 |
| Slett arrangementsbooking             |    2 |      1 |  9 377 |   6 |     11 |    145,2 |
| Avlys arrangement                     |    1 |      1 |     83 |   4 |      7 |     60,7 |
| Lagre bane og bookingoverstyring      |    3 |    1\* |  3 668 |  15 |     19 |    146,5 |

De anonyme oppstartene hadde `ready` 1 395,0 / 488,8 / 486,7 ms. Første treff inkluderer Vites
førstegangskompilering og styrer derfor ikke prioriteringen. Medlemsoppstartene var 506,6 / 493,2 /
501,0 ms. `*` Banelagringens rundeheuristikk grupperte overlappende response-end events, men råsporet
viser at andre PUT startet 47,7 ms etter den første; koden avventer dem sekvensielt.

Produksjonsbuilden hadde 37,4 KiB initial JS gzip, 27,9 KiB initial CSS gzip, 120,5 KiB største lazy
JS-chunk og 61 JS-chunks for begge hostvarianter. Ingen bundle- eller renderkandidat ble valgt:
brukbar UI etter varm retur krevde null HTTP-kall, ingen duplikate browserrequests ble observert,
og de store lazy chunkene lastes ikke inn i bookingoppstarten.

## API- og databasefunn

- `GET /bruker` utførte fire kommandoer: bruker/roller/aktive sperrer, aktiv
  medlemskapsbekreftelse, aktiv kunngjøring og brukerens kunngjøringsbekreftelse. Medianen var
  7,4 ms API og 5 ms rapportert SQL. Det samme policyarbeidet gjentas etter vilkårsmutasjonen;
  `POST /bruker/vilkaar` brukte fem kommandoer.
- Hver autentisert kalenderlesing brukte tre kommandoer: requestbruker, valgt kalender og
  kvotegrunnlag. De ti pollene brukte dermed 30 kommandoer og 49,9 KB.
- Feilet booking rullet UI korrekt tilbake, men `onSettled` invaliderte kalenderen. Konflikten brukte
  derfor to HTTP-kall, 5,8 KB og seks kommandoer selv om serverens 400-svar var autoritativt.
- Arrangementsbookingmutasjoner oppdaterte editorcachen korrekt, men refetchet den avledede
  arrangementslisten. Det ekstra svaret var omtrent 9,3 KB og tre kommandoer per mutasjon.
- Baneoppdateringen gjorde to writes sekvensielt og refetchet deretter den kanoniske banelisten.
  Responsene er 204 og endrer ulike ressurser; begge writes kan startes samtidig uten kontraktendring.
- SQL-tidene var 2–20 ms per komplett flyt på 183 bookinger. Eksisterende booking-, policy- og
  tenantindekser ble brukt; ingen ny indeks eller query-planendring har dokumentert prioritet.

## Korrekthetsbaseline og avgrensninger

- Booking ble synlig både i kalender og Mine bookinger, og avbestilling fjernet samme ID.
- Konflikten viste inline feil, rullet optimistisk cache tilbake og endte med autoritativ kalender.
- Arrangement- og banemutasjoner oppdaterte aktive cacher og ble gjenopprettet etter målingen.
- Tenant, roller og kapabiliteter kom fra backend i alle tre Development-profiler.
- Auth-callback med `returnTo` beholdes som eksplisitt regresjonskontrakt i tenanttestene og den
  produksjonslike callback-/refresh-testen. Målingen viste ingen callbackspesifikk flaskehals, så
  callbacken er ikke et ytelsestiltak.
- Produktet har arrangementliste og detalj for medlem, men ingen medlemsflate eller HTTP-kontrakt
  for arrangementspåmelding, endring eller trekking. Dette er et produktscope-gap, ikke en målt
  ytelseskandidat, og ble ikke oppfunnet som del av iterasjonen.

## Prioritert tiltaksplan

| Pri | Kandidat                                                        | Dokumentert baseline og gevinst                                         | Scope         | Risiko                                                                         | Kost    | Verifikasjon                                              |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------ | ------- | --------------------------------------------------------- |
| 1   | Samlet, ikke-cachet brukerpolicyprojeksjon                      | `GET /bruker` 4→2 DB; vilkårsflyt forventet 12→8 DB                     | Backend       | Høy: tenant, adminunntak, utløp og lest kunngjøring                            | Middels | Tjenestetester og samme oppstarts-/adminflyter            |
| 1   | Ikke refetch kalender etter feilet booking                      | Konflikt 2→1 HTTP, 5 799 bytes og 6→3 DB                                | Frontend      | Lav: eksakt rollback må beholdes                                               | Lav     | Querytest og samme konfliktflyt                           |
| 2   | Start bane- og overstyringswrite parallelt                      | Andre PUT startet 47,7 ms etter første; forventet 25–45 ms lavere ready | Frontend      | Middels: behold eksplisitt delvis-feilsemantikk og invalidér først etter begge | Lav     | Kontrollert samtidighetstest og samme adminflyt           |
| 3   | Smal autoritativ arrangementsoppsummering etter bookingmutasjon | 1 ekstra GET, ca. 9,3 KB og 3 DB per mutasjon                           | Begge         | Høy: dato-, mønster- og cachekorrekthet; ny kontrakt                           | Høy     | Utsatt; krever backend først og full arrangementsmatrise  |
| 3   | Reduser kalenderpolling videre                                  | 10 HTTP / 49,9 KB / 30 DB per 10 min                                    | Begge/produkt | Høy: konfliktferskhet                                                          | Middels | Utsatt til produksjonsbruk viser behov utover dagens 60 s |
| 4   | Policycache eller nye indekser                                  | SQL lokalt 2–20 ms; ingen planfunn                                      | Backend       | Middels–høy foreldelse/migrasjon                                               | Middels | Forkastet i denne iterasjonen                             |

De tre øverste tiltakene endrer ingen ekstern API-kontrakt og kan merges uavhengig. Backend bør
likevel merges først slik at frontendens samlede ettermåling og dokumentasjon beskriver den ferdige
fullstacktilstanden. Den utsatte arrangementsoppsummeringen ville krevd backend før frontend.

## Ettermåling og sluttkontroll

Ettermålingen brukte samme 27 målevinduer, profiler, testdata og ti minutters kalenderintervall.
Tabellen viser den autoritative hele kjøringen. `Δ ready` er absolutt og relativ endring; positive
verdier er tregere. Tidsforskjeller uten en tilsvarende strukturendring behandles som lokal støy.

| Flyt                                  | HTTP før→etter | Bytes før→etter | DB før→etter | SQL ms før→etter | Ready ms før→etter |            Δ ready |
| ------------------------------------- | -------------: | --------------: | -----------: | ---------------: | -----------------: | -----------------: |
| Kald anonym oppstart, median          |            2→2 |     9 260→9 272 |          1→1 |              2→2 |        488,8→499,6 |     +10,8 (+2,2 %) |
| Varm retur til booking                |            0→0 |               0 |          0→0 |              0→0 |          61,6→60,2 |      −1,4 (−2,3 %) |
| Bytt dato                             |            1→1 |     5 344→5 348 |          1→1 |              2→4 |         122,4→98,5 |    −23,9 (−19,5 %) |
| Bytt bane                             |            1→1 |     6 550→6 554 |          1→1 |              3→4 |        108,1→107,3 |      −0,8 (−0,7 %) |
| Bytt gren                             |            1→1 |     6 010→6 014 |          1→1 |              4→3 |          90,1→82,3 |      −7,8 (−8,7 %) |
| Kald medlem, vilkår akseptert, median |            3→3 |     9 947→9 959 |          7→5 |             10→9 |        501,0→492,4 |      −8,6 (−1,7 %) |
| Kald medlem, vilkår mangler           |            4→4 |   10 463→10 475 |         12→8 |            17→14 |        478,4→488,0 |      +9,6 (+2,0 %) |
| Medlemsarrangementer                  |            3→3 |     9 025→9 025 |          7→5 |             12→8 |        485,4→492,3 |      +6,9 (+1,4 %) |
| Arrangementsdetalj                    |            0→0 |               0 |          0→0 |              0→0 |          59,7→47,7 |    −12,0 (−20,1 %) |
| Opprett medlemsbooking                |            2→2 |     5 584→5 588 |          7→7 |            10→11 |          56,5→82,2 |    +25,7 (+45,5 %) |
| Åpne Mine bookinger                   |            3→3 |     1 118→1 118 |          6→4 |              8→6 |        414,6→375,2 |     −39,4 (−9,5 %) |
| Avbestill medlemsbooking              |            2→2 |           48→48 |          5→5 |            10→10 |          24,1→49,8 |   +25,7 (+106,6 %) |
| Bookingkonflikt                       |            2→1 |       5 799→207 |          6→3 |              9→4 |          68,3→52,9 |    −15,4 (−22,5 %) |
| Kalender i forgrunn, 10 minutter      |          10→10 |   49 900→50 020 |        30→30 |            71→75 |                  — |                  — |
| Åpne brukeradministrasjon             |            3→3 |     3 819→3 819 |          7→6 |             16→8 |        502,6→902,4 | +399,8 (+79,5 %)\* |
| Åpne statistikk                       |            5→5 |   16 273→16 274 |          8→7 |            20→16 |        530,2→515,2 |     −15,0 (−2,8 %) |
| Opprett arrangement                   |            2→2 |     9 419→9 419 |          7→7 |            10→11 |          72,9→76,2 |      +3,3 (+4,5 %) |
| Oppdater arrangementmetadata          |            1→1 |         199→199 |          3→3 |              5→6 |          85,4→76,0 |     −9,4 (−11,0 %) |
| Rediger arrangementsbooking           |            2→2 |     9 475→9 475 |          8→8 |            10→11 |        116,3→142,6 |    +26,3 (+22,6 %) |
| Opprett arrangementsbooking           |            2→2 |     9 581→9 581 |          8→8 |            14→10 |          51,9→36,1 |    −15,8 (−30,4 %) |
| Slett arrangementsbooking             |            2→2 |     9 377→9 377 |          6→6 |            11→12 |        145,2→144,4 |      −0,8 (−0,6 %) |
| Avlys arrangement                     |            1→1 |           83→83 |          4→4 |              7→7 |          60,7→87,3 |    +26,6 (+43,8 %) |
| Lagre bane og bookingoverstyring      |            3→3 |     3 668→3 668 |        15→12 |            19→21 |        146,5→147,1 |      +0,6 (+0,4 %) |

`*` Brukeradministrasjon ble gjentatt etter den hele kjøringen og målte 508,8 ms; den korte
PostgreSQL-diagnostikken målte 490,7 ms. Samme HTTP-, byte- og DB-antall og disse gjentakelsene
avviser 902,4 ms som en stabil regresjon. Tilsvarende tidsvariasjon ble observert for små
mutasjoner, mens de strukturelle målene var stabile.

## Faktisk effekt

### Ikke-cachet brukerpolicy

`BrukerPolicyService` projiserer aktiv medlemskapsbekreftelse, nyeste aktive kunngjøring og
brukerens bekreftelsesstatus i én EF-kommando. Det ble kontrollert mot PostgreSQL, ikke bare
InMemory-provider. Ekstern respons og adminunntak er uendret.

- `GET /bruker`: 4→2 DB-kommandoer, −2 / −50 %.
- Kald medlemsoppstart med aksepterte vilkår: 7→5, −2 / −28,6 %; median SQL 10→9 ms og median
  `ready` 501,0→492,4 ms.
- Vilkårsflyten: 12→8, −4 / −33,3 %; SQL 17→14 ms. `ready` var i praksis uendret innen lokal støy.
- Medlemsarrangementer: 7→5, og Mine bookinger: 6→4. Adminflater sparte én kommando fordi admin
  allerede hoppet over kunngjøringsbekreftelsen.

Ingen policycache ble innført; utløp, tenant og bekreftelser leses autoritativt på hver profilrequest.

### Feilet booking

Optimistisk rollback er uendret, men kalender og Mine bookinger invalideres nå bare etter suksess.
Konfliktflyten gikk:

- HTTP 2→1, −1 / −50 %
- overføring 5 799→207 bytes, −5 592 / −96,4 %
- DB 6→3, −3 / −50 %
- SQL 9→4 ms, −5 / −55,6 %
- `ready` 68,3→52,9 ms, −15,4 / −22,5 %

400-responsen forble synlig inline, og eksakt forrige slotliste ble gjenopprettet uten en skjult
etterfølgende GET.

### Bane og bookingoverstyring

Begge PUT-kall starter nå samtidig. I råsporet gikk startforskjellen 47,7→0,0 ms, −100 %, og den
kanoniske GET-en startet 124,1→89,9 ms etter målevinduet, −34,2 / −27,6 %. Samtidig oppstart unngikk
også tre tenant-cache-reloads som den første PUT-ens invalidasjon tidligere utløste før den andre
requesten; totalen var 15→12 DB-kommandoer.

Synlig `ready` i den hele kjøringen var 146,5→147,1 ms, mens kontrollrepetisjonen målte 76,9 ms.
Iterasjonen dokumenterer derfor fjernet nettverks-waterfall, men hevder ikke en stabil TTI-gevinst.
Delvis feilsemantikk er uendret: visningen invalideres først når begge requests lykkes.

### Uendrede og forkastede antakelser

- Ti minutters polling var uendret på 10 requests og 30 DB-kommandoer. 120 bytes ekstra skyldes
  dynamiske responsdata, ikke en ny kontrakt. Videre reduksjon utsettes til produksjonsmålinger kan
  veie ressursbruk mot konfliktferskhet.
- Arrangementsbooking refetcher fortsatt den avledede arrangementslisten. Ny smal kontrakt ble
  utsatt fordi cirka 9,3 KB / 3 DB per mutasjon ikke forsvarte dato-, mønster- og cacherisikoen i
  denne iterasjonen.
- Lokale SQL-tider bekreftet ikke behov for nye indekser. Generell policycache ble forkastet fordi
  den ville gi foreldelsesrisiko uten dokumentert sluttbrukergevinst.
- Bundlehypotesen ble ikke bekreftet. Begge etterbuildene var uendret på 37,4 KiB initial JS gzip,
  27,9 KiB initial CSS gzip, 120,5 KiB største lazy chunk og 61 JS-chunks.
- Auth-callbacken var ingen målt flaskehals og ble ikke endret.

## Korrekthet og verifikasjon

- Alle muterende tester brukte bare lokal PostgreSQL og Development-profilene `admin`, `utvidet`
  og `medlem`. Oppryddingen endte på samme 2/4/10/5/183/5/8/2 datavolum som førmålingen.
- Booking ble opprettet, synlig i kalender og Mine bookinger, avbestilt og konfliktbehandlet.
- Arrangementer og arrangementsbookinger ble opprettet, endret og slettet med korrekte avledede
  visninger. Produktets manglende medlemspåmelding er fortsatt eksplisitt registrert som scope-gap.
- Tenant-, rolle-, admin- og kunngjøringsunntak dekkes av de nye policytestene og hele E2E-matrisen.
- Auth-callback, refresh og `returnTo`-isolasjon består i unit-/produksjonsrutetestene.
- Måleinstrumenteringen klassifiserer nå mottatte 204-responser korrekt som vellykkede.

Kjørte kvalitetsporter:

- Frontend: `npm test` — 98 filer / 364 tester; `npm run check`; `npm run test:e2e` — 16 bestått,
  1 forventet skip; full `npm run performance:baseline` — bestått på 10,5 minutter.
- Produksjon: `npm run test:e2e:production` — Cloudflare- og GitHub-build verifisert, 8/8
  produksjonsruter bestått.
- Backend: `dotnet test banebooking-voyager.sln --configuration Release` — 512 tester;
  `dotnet format ... --verify-no-changes`; `dotnet build ... --configuration Release`.
- `npm audit --omit=dev` rapporterte fem eksisterende lave, transitive `cookie`-funn. Foreslått
  tvungen løsning ville nedgradert SvelteKit brytende og ble derfor ikke blandet inn i iterasjonen.

## Leveranse- og mergeplan

Tiltakene endrer ingen ekstern HTTP-kontrakt. Opprett to separate PR-er:

1. Backend fra `perf/fullstack-iteration-2026-08-26` til `master`: ikke-cachet policyprojeksjon og
   tester.
2. Frontend fra `perf/fullstack-iteration-2026-08-26` til `main`: utvidet harness,
   booking-/adminforbedringer og før-/ettermåling.

Backend bør merges først, slik at frontendens dokumenterte sluttkontroll beskriver tilstanden som
finnes når frontend-PR-en merges. Det er ingen kodeavhengighet som krever koordinert deploy.
