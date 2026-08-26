# Aktivt arbeid

> **Status:** Aktiv
>
> **Initiativ:** API- og fullstackytelse
>
> **Aktiv fase:** Fase 2 — ettermåling og fullstackbeslutning

## Mål

Mål den samlede effekten av FE-1–FE-5 mot den låste
[`førmålingen`](./performance/baseline-2026-08-26.md), og velg bare fullstacktiltak som fortsatt
har dokumentert gevinst.

## Scope

- Frontend og lokal fullstackflyt kan inspiseres og måles.
- Ingen backendkontrakt eller backendadferd endres før ettermålingen er vurdert.
- Frontend-hardening avgrenses og måles før eventuelt fullstackomfang velges.
- Produktadferd, URL-er, roller, guards og autorisasjonsansvar skal bevares.

## Neste eksakte steg

1. Kjør samme ti-minutters harness og request-/EF-korrelasjon som førmålingen.
2. Dokumenter før/etter for HTTP-kall, nettverksrunder, bytes og DB-arbeid.
3. Vurder de smale fullstackkandidatene mot de gjenværende målte kostnadene.
4. Oppdater aktivt scope før et backend-repo eventuelt endres.

## Blokkeringer

Ingen kjente blokkeringer. Fullstack- og backendtiltak skal ikke velges før frontendbaselinen og en
etterfølgende frontendmåling viser at gevinsten fortsatt er relevant.
