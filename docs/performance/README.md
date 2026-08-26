# API- og fullstackytelse

> **Status:** Ny lokal iterasjon fullført — klar for review
>
> **Sist målt:** 2026-08-26

## Siste iterasjon

Den komplette, nye målingen av offentlig booking, sesjonsoppstart, bookinglivsløp,
medlemsarrangementer og representative adminflater ligger i
[`fullstack-iteration-2026-08-26.md`](./fullstack-iteration-2026-08-26.md). Dokumentet inneholder
målekontrakt, førbaseline, prioritert plan, implementerte tiltak, ettermåling, avviste hypoteser og
separat mergeplan for frontend og backend. Samme dokument inneholder også PageSpeed-oppfølgingen:
den korrigerte produksjonsmålingen for hele offentlig booking-ruten, det forkastede
UI-chunksplitt-eksperimentet og den beholdte kontrastforbedringen.

Iterasjonen er fullført på lokale feature branches, men er ikke pushet eller merget. Den tidligere
leveransen under er fortsatt historisk referansegrunnlag.

## Tidligere mål og beslutning

Forbedre opplevd ytelse og ressursbruk uten å skjule dataflyt eller svekke autorisasjons- og
cachekorrekthet.

Arbeidet ble gjennomført i denne rekkefølgen:

1. Dagens flyter ble målt uten produktendring.
2. Frontend-hardening ble gjennomført uten backendkontraktendringer.
3. Flytene ble målt på nytt.
4. Bare fullstack- eller backendtiltak med fortsatt dokumentert gevinst ble valgt.

Den detaljerte førstegjennomgangen ligger i [`initial-review.md`](./initial-review.md). Den er et
reviewgrunnlag, ikke sannhet foran kode og målinger. Den reproduserbare lokale målekontrakten ligger
i [`baseline-protocol.md`](./baseline-protocol.md), og den låste førmålingen ligger i
[`baseline-2026-08-26.md`](./baseline-2026-08-26.md). Frontendens ettermåling og fullstackbeslutning
ligger i [`frontend-after-2026-08-26.md`](./frontend-after-2026-08-26.md).
De tre valgte fullstackkontraktene og siste kontraktsharness ligger i
[`fullstack-after-2026-08-26.md`](./fullstack-after-2026-08-26.md).

## Målte baselineflyter

Den fullførte målingen omfatter:

1. Kald anonym bookingoppstart.
2. Kald autentisert bookingoppstart med og uten eksisterende vilkårsaksept.
3. Ti minutter med bookingkalenderen åpen i forgrunn.
4. Oppdatering av arrangementmetadata.
5. Redigering, opprettelse og sletting av én arrangementsbooking.
6. Lagring av bane med generelle felt og bookingoverstyring.

Følgende ble registrert per flyt:

- antall HTTP-kall og sekvensielle nettverksrunder
- total varighet og tid til brukbar UI
- overførte bytes
- antall DB-queries og samlet DB-tid per endpoint
- refetcher etter vellykket og feilet mutasjon
- om responsen kom fra frontendcache, backendcache eller database

Browserens Network-panel og lokal request-/EF-logging ble brukt uten en ny
observability-avhengighet. Lokale enkeltmålinger er diagnostikk, ikke produksjons-SLO-er.

## Leverte frontendtiltak

| ID   | Tiltak                                                         | Status |
| ---- | -------------------------------------------------------------- | ------ |
| FE-1 | Målrettet invalidering og direkte cacheoppdatering             | Levert |
| FE-2 | Parallell klubb-/brukeroppstart og session-`AbortSignal`       | Levert |
| FE-3 | Eksplisitt `none/optional/required` authpolicy                 | Levert |
| FE-4 | Justert kalenderpolling                                        | Levert |
| FE-5 | Lengre stale-tider, kanoniske ressursnøkler og lazy admin-data | Levert |

De valgte fullstacktiltakene — smalere booking-bootstrap, oppdatert brukerrespons fra
vilkårsmutasjonen og atomisk redigering av arrangementsbooking — er levert. Utløpsstyrt policycache
og selektiv HTTP-caching ble ikke valgt fordi målingen ikke dokumenterte behov for et nytt generelt
cachelag.

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
