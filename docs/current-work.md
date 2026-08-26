# Aktivt arbeid

> **Status:** Aktiv
>
> **Initiativ:** API- og fullstackytelse
>
> **Aktiv fase:** Fase 3 — smal fullstackleveranse

## Mål

Implementer de tre valgte kontraktsendringene fra
[`frontend-ettermålingen`](./performance/frontend-after-2026-08-26.md): smal booking-bootstrap,
oppdatert bruker fra vilkårsmutasjonen og atomisk arrangementsbookingredigering.

## Scope

- Frontend og lokal fullstackflyt kan inspiseres og måles.
- Backend- og frontendendringer holdes i separate commits og verifiseres sammen.
- Frontend-hardening avgrenses og måles før eventuelt fullstackomfang velges.
- Produktadferd, URL-er, roller, guards og autorisasjonsansvar skal bevares.

## Neste eksakte steg

1. Endre og test backendkontraktene som én separat backendleveranse.
2. Oppdater frontendkontrakter, API-funksjoner og cacheoppdatering i en separat frontendcommit.
3. Kjør full frontend- og backendverifikasjon.
4. Kjør en kort kontraktsharness og dokumenter sluttresultatet.

## Blokkeringer

Ingen kjente blokkeringer. Fullstack- og backendtiltak skal ikke velges før frontendbaselinen og en
etterfølgende frontendmåling viser at gevinsten fortsatt er relevant.
