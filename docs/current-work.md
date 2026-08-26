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

1. Implementer FE-2 ved å fjerne klubbavhengigheten fra brukerqueryen og videresende
   session-`AbortSignal`.
2. Implementer eksplisitt authpolicy i FE-3.
3. Juster kalenderpolling og stabile stale-tider i FE-4/FE-5.
4. Kjør samlet ti-minutters ettermåling før fullstackomfang velges.

## Blokkeringer

Ingen kjente blokkeringer. Fullstack- og backendtiltak skal ikke velges før frontendbaselinen og en
etterfølgende frontendmåling viser at gevinsten fortsatt er relevant.
