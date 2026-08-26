# Fullstack-ytelsesiterasjon 2026-08-26

> **Status:** Implementering pågår
>
> **Frontendgrunnlag:** `fbba604` fra `origin/main` (`606e9d2`)
>
> **Backendgrunnlag:** `0562d7f` fra `origin/master`

## Målekontrakt

Førmålingen fulgte [`baselineprotokollen`](./baseline-protocol.md) mot lokal Chromium, Vite-proxy,
Development-backend og PostgreSQL-container. Ingen produksjonsdata eller eksterne tjenester ble
brukt. `admin`, `utvidet` og `medlem` utførte de muterende scenariene mot test-eide data som ble
gjenopprettet i `finally`.

- Node `22.23.1`, Playwright/Chromium `140.0.7339.16` og .NET SDK `10.0.302`.
- Datavolum etter opprydding: 2 klubber, 4 grener, 10 baner, 5 brukere, 183 bookinger,
  5 arrangementer, 8 kunngjøringer og 2 medlemskapsbekreftelser.
- Kalenderen stod i forgrunn i 600 000 ms. Oppstartsvariantene ble kjørt tre ganger.
- Rå nettverks- og backendartefakter er ignorerte. Sammenligningsgrunnlaget er bevart lokalt som
  `/tmp/banebooking-performance-before-network.json` og
  `/tmp/banebooking-performance-before-backend.json`.
- `ready` er tid til avtalt synlig og brukbar UI. Det faste 500 ms-nettverksstabilitetsvinduet er
  ikke del av `ready`.

Lokale tider er diagnostikk, ikke produksjons-SLO-er. Request-, byte- og SQL-antall er de viktigste
strukturelle signalene.

## Førbaseline

| Flyt | HTTP | Runder | Bytes | DB | SQL ms | Ready ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Kald anonym oppstart, median | 2 | 1 | 9 260 | 1 | 2 | 488,8 |
| Varm retur til booking | 0 | 0 | 0 | 0 | 0 | 61,6 |
| Bytt dato | 1 | 1 | 5 344 | 1 | 2 | 122,4 |
| Bytt bane | 1 | 1 | 6 550 | 1 | 3 | 108,1 |
| Bytt gren | 1 | 1 | 6 010 | 1 | 4 | 90,1 |
| Kald medlem, vilkår akseptert, median | 3 | 1–2 | 9 947 | 7 | 10 | 501,0 |
| Kald medlem, vilkår mangler | 4 | 2 | 10 463 | 12 | 17 | 478,4 |
| Medlemsarrangementer | 3 | 2 | 9 025 | 7 | 12 | 485,4 |
| Arrangementsdetalj | 0 | 0 | 0 | 0 | 0 | 59,7 |
| Opprett medlemsbooking | 2 | 1 | 5 584 | 7 | 10 | 56,5 |
| Åpne Mine bookinger | 3 | 1 | 1 118 | 6 | 8 | 414,6 |
| Avbestill medlemsbooking | 2 | 1 | 48 | 5 | 10 | 24,1 |
| Bookingkonflikt | 2 | 1 | 5 799 | 6 | 9 | 68,3 |
| Kalender i forgrunn, 10 minutter | 10 | 10 | 49 900 | 30 | 71 | 0 |
| Åpne brukeradministrasjon | 3 | 2 | 3 819 | 7 | 16 | 502,6 |
| Åpne statistikk | 5 | 2 | 16 273 | 8 | 20 | 530,2 |
| Opprett arrangement | 2 | 1 | 9 419 | 7 | 10 | 72,9 |
| Oppdater arrangementmetadata | 1 | 1 | 199 | 3 | 5 | 85,4 |
| Rediger arrangementsbooking | 2 | 1 | 9 475 | 8 | 10 | 116,3 |
| Opprett arrangementsbooking | 2 | 1 | 9 581 | 8 | 14 | 51,9 |
| Slett arrangementsbooking | 2 | 1 | 9 377 | 6 | 11 | 145,2 |
| Avlys arrangement | 1 | 1 | 83 | 4 | 7 | 60,7 |
| Lagre bane og bookingoverstyring | 3 | 1* | 3 668 | 15 | 19 | 146,5 |

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

| Pri | Kandidat | Dokumentert baseline og gevinst | Scope | Risiko | Kost | Verifikasjon |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Samlet, ikke-cachet brukerpolicyprojeksjon | `GET /bruker` 4→2 DB; vilkårsflyt forventet 12→8 DB | Backend | Høy: tenant, adminunntak, utløp og lest kunngjøring | Middels | Tjenestetester og samme oppstarts-/adminflyter |
| 1 | Ikke refetch kalender etter feilet booking | Konflikt 2→1 HTTP, 5 799 bytes og 6→3 DB | Frontend | Lav: eksakt rollback må beholdes | Lav | Querytest og samme konfliktflyt |
| 2 | Start bane- og overstyringswrite parallelt | Andre PUT startet 47,7 ms etter første; forventet 25–45 ms lavere ready | Frontend | Middels: behold eksplisitt delvis-feilsemantikk og invalidér først etter begge | Lav | Kontrollert samtidighetstest og samme adminflyt |
| 3 | Smal autoritativ arrangementsoppsummering etter bookingmutasjon | 1 ekstra GET, ca. 9,3 KB og 3 DB per mutasjon | Begge | Høy: dato-, mønster- og cachekorrekthet; ny kontrakt | Høy | Utsatt; krever backend først og full arrangementsmatrise |
| 3 | Reduser kalenderpolling videre | 10 HTTP / 49,9 KB / 30 DB per 10 min | Begge/produkt | Høy: konfliktferskhet | Middels | Utsatt til produksjonsbruk viser behov utover dagens 60 s |
| 4 | Policycache eller nye indekser | SQL lokalt 2–20 ms; ingen planfunn | Backend | Middels–høy foreldelse/migrasjon | Middels | Forkastet i denne iterasjonen |

De tre øverste tiltakene endrer ingen ekstern API-kontrakt og kan merges uavhengig. Backend bør
likevel merges først slik at frontendens samlede ettermåling og dokumentasjon beskriver den ferdige
fullstacktilstanden. Den utsatte arrangementsoppsummeringen ville krevd backend før frontend.

## Ettermåling og sluttkontroll

Fylles ut etter implementering med samme 27 målevinduer, ti minutters kalenderintervall og
produksjonsbuild.
