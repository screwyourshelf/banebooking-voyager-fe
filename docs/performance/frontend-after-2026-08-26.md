# Frontend-ettermåling 2026-08-26

> **Commit:** `5708bbcd9627d71a05feb5078e01ed29503654f8`
>
> **Omfang:** FE-1–FE-5 uten backendendringer
>
> **Resultat:** Frontend-hardening godkjent; tre smale fullstacktiltak valgt

Ettermålingen fulgte samme [`baselineprotokoll`](./baseline-protocol.md), maskin, browser,
databasevolum og lokale tjenesteoppsett som [`førmålingen`](./baseline-2026-08-26.md).

## Før og etter

| Flyt                             | API før | API etter | DB før | DB etter | Bytes før | Bytes etter |
| -------------------------------- | ------: | --------: | -----: | -------: | --------: | ----------: |
| Kald anonym oppstart             |       2 |         2 |      1 |        1 |     9 510 |       9 510 |
| Kald medlem, vilkår akseptert    |       3 |         3 |     11 |       10 |    10 784 |      10 784 |
| Kald medlem, vilkår mangler      |       5 |         5 |     17 |       16 |    11 300 |      11 300 |
| Kalender i forgrunn, 10 minutter |      20 |        10 |     60 |       30 |   100 900 |      50 450 |
| Oppdater arrangementmetadata     |       7 |         1 |     15 |        3 |    14 206 |         199 |
| Rediger arrangementsbooking      |      14 |         3 |     32 |       11 |    27 841 |       8 654 |
| Opprett arrangementsbooking      |       7 |         2 |     17 |        8 |    14 470 |       8 680 |
| Slett arrangementsbooking        |       7 |         2 |     15 |        6 |    14 087 |       8 476 |
| Lagre bane og bookingoverstyring |       6 |         3 |     20 |       15 |     5 566 |       3 668 |

Lokale tider for brukbar UI var innenfor målevariasjon for kaldstart. Mutationstidene ble ikke
brukt som beslutningsgrunnlag fordi det faste 500 ms-nettverksvinduet og lokal schedulerstøy
dominerer små forskjeller. Request-, byte- og DB-antall viser derimot entydig effekt.

## Verifiserte effekter

- Ressursbasert invalidering og direkte cacheoppdatering fjernet refetch av klubb, bruker, grener,
  baner og arrangementsbookinger når responsen allerede var autoritativ.
- DELETE-delen av bookingredigering utsetter avledet invalidasjon til POST er ferdig. Flyten gjør
  nå to writes og én arrangementsrefetch, mot to writes og to fulle seks-queryrunder før.
- 60-sekunders forgrunnspolling halverte både HTTP-, byte- og DB-kostnaden. Polling i bakgrunnen er
  fortsatt av.
- Klubb og bruker starter parallelt. Offentlige klubbrequests henter ikke token og utførte null
  EF-kommandoer også i innlogget kaldstart.
- Identiske, beskyttede `inkluderInaktive=true`-lister for statistikk og baneadministrasjon deler
  nå cacheidentitet. Arrangementbaner lastes først når en editor åpnes.

## Valgt fullstackomfang

Tre kandidater har fortsatt dokumentert gevinst og tydelige korrekthetsgrenser:

1. **Smal booking-bootstrap.** Den innloggede bootstraprequesten utførte seks DB-kommandoer, mens
   frontenden bare bruker grener, baner, valgt utvalg, dato og slots. Komplett klubb og brukerprofil
   fjernes fra responsbyggingen etter kontraktssøk.
2. **Oppdatert bruker fra vilkårsmutasjonen.** Førstegangsflyten bruker fortsatt fem requests og 16
   DB-kommandoer. `POST /bruker/vilkaar` skal returnere den oppdaterte guardprofilen slik at den
   andre `GET /bruker` kan fjernes.
3. **Atomisk redigering av arrangementsbooking.** Tre requests og 11 DB-kommandoer gjenstår, og
   dagens DELETE-deretter-POST kan miste original booking ved konflikt. Et autoritativt PUT-svar
   skal oppdatere bookingcachen direkte og redusere flyten til én write pluss nødvendig avledet
   refetch.

Policycache og HTTP-cache velges ikke nå. De gjenværende kostnadene ligger i konkrete kontrakter,
og nye generelle cachelag ville skjult disse før de var rettet.
