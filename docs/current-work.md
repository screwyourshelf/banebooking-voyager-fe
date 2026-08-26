# Aktivt arbeid

> **Status:** Aktiv
>
> **Initiativ:** API- og fullstackytelse
>
> **Aktiv fase:** Fase 1 — frontend-hardening

## Mål

Reduser unødvendige API-kall og nettverksrunder i frontend uten å endre backendkontrakter, og mål
effekten mot den låste [`førmålingen`](./performance/baseline-2026-08-26.md).

## Scope

- Frontend og lokal fullstackflyt kan inspiseres og måles.
- Ingen backendkontrakt eller backendadferd endres i fase 1.
- Frontend-hardening avgrenses og måles før eventuelt fullstackomfang velges.
- Produktadferd, URL-er, roller, guards og autorisasjonsansvar skal bevares.

## Neste eksakte steg

1. Implementer FE-1 med eksplisitt ressursmatrise for invalidering.
2. Oppdater arrangementcachen direkte fra autoritative mutasjonssvar og unngå refetch ved feil.
3. Verifiser invalidasjonsmatrisen med enhetstester og den korte måleharnessen.
4. Fortsett med FE-2–FE-5 før samlet ti-minutters ettermåling.

## Blokkeringer

Ingen kjente blokkeringer. Fullstack- og backendtiltak skal ikke velges før frontendbaselinen og en
etterfølgende frontendmåling viser at gevinsten fortsatt er relevant.
