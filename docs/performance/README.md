# API- og fullstackytelse

> **Status:** Aktivt initiativ
>
> **Aktiv fase:** Fase 0 — baseline

## Mål og beslutning

Forbedre opplevd ytelse og ressursbruk uten å skjule dataflyt eller svekke autorisasjons- og
cachekorrekthet.

Arbeidet gjennomføres i denne rekkefølgen:

1. Mål dagens flyter uten produktendring.
2. Gjennomfør frontend-hardening uten backendkontraktendringer.
3. Mål på nytt.
4. Velg bare fullstack- eller backendtiltak som fortsatt har dokumentert gevinst.

Den detaljerte førstegjennomgangen ligger i [`initial-review.md`](./initial-review.md). Den er et
reviewgrunnlag, ikke sannhet foran kode og målinger.

## Baselineflyter

Mål minst:

1. Kald anonym bookingoppstart.
2. Kald autentisert bookingoppstart med og uten eksisterende vilkårsaksept.
3. Ti minutter med bookingkalenderen åpen i forgrunn.
4. Oppdatering av arrangementmetadata.
5. Redigering, opprettelse og sletting av én arrangementsbooking.
6. Lagring av bane med generelle felt og bookingoverstyring.

Registrer per flyt:

- antall HTTP-kall og sekvensielle nettverksrunder
- total varighet og tid til brukbar UI
- overførte bytes
- antall DB-queries og samlet DB-tid per endpoint
- refetcher etter vellykket og feilet mutasjon
- om responsen kom fra frontendcache, backendcache eller database

Bruk browserens Network-panel og lokal request-/EF-logging før en ny observability-avhengighet
vurderes. Lokale enkeltmålinger er diagnostikk, ikke produksjons-SLO-er.

## Prioriterte frontendkandidater

| ID   | Kandidat                                                       | Forventet effekt |
| ---- | -------------------------------------------------------------- | ---------------- |
| FE-1 | Målrettet invalidering og direkte cacheoppdatering             | Svært høy        |
| FE-2 | Parallell klubb-/brukeroppstart og session-`AbortSignal`       | Høy kaldstart    |
| FE-3 | Eksplisitt `none/optional/required` authpolicy                 | Middels–høy      |
| FE-4 | Justert eller adaptiv kalenderpolling                          | Høy løpende      |
| FE-5 | Lengre stale-tider, kanoniske ressursnøkler og lazy admin-data | Middels          |

Fullstackkandidater omfatter smalere booking-bootstrap, oppdatert brukerrespons fra
vilkårsmutasjonen og atomisk redigering av arrangementsbooking. Backendkandidater omfatter
utløpsstyrt policycache og selektiv HTTP-caching. De vurderes først etter FE-1–FE-5 og ny måling.

## Invarianter

- Én forståelig eier og kanonisk cacheidentitet per HTTP-responsvariant.
- Hver mutasjon har en eksplisitt cacheoppdaterings- og invalidasjonsmatrise.
- Offentlige requests sender ikke token uten at responsen faktisk personaliseres.
- Bruker, roller, sperrer og kapabiliteter gjøres ikke foreldet for å spare en query.
- Før-/ettermåling bruker samme flyt og registrerer eventuelle kompromisser.
- Backendendringer og frontendendringer leveres i separate commits.

## Ikke førstevalg

Ikke innfør GraphQL, generisk BFF, en samlet app-bootstrap, SSE/WebSocket, Redis, aggressiv
brukercache eller serverpaginering uten at målinger viser et konkret behov.
