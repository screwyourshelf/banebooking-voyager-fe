# Aktivt arbeid

> **Status:** Fullført
>
> **Initiativ:** API- og fullstackytelse
>
> **Sluttkontroll:** 2026-08-26

## Mål

Performanceplanens frontend- og fullstacktiltak er levert. Resultatene ligger i
[`frontend-ettermålingen`](./performance/frontend-after-2026-08-26.md) og
[`fullstack-sluttkontrollen`](./performance/fullstack-after-2026-08-26.md).

## Resultat

- Kalenderpollingen er halvert, mutasjonsrefetcher er målrettet og stabile ressurser gjenbrukes.
- Kaldstart bygger ikke lenger full brukerprofil i booking-bootstrap.
- Vilkårsflyten bruker fire i stedet for fem API-kall og 12 i stedet for 16 DB-kommandoer.
- Arrangementbooking redigeres atomisk med to i stedet for tre API-kall og 8 i stedet for 11
  DB-kommandoer.
- Backend- og frontendendringene er levert i separate commits og verifisert sammen.

## Neste steg

Ingen aktiv performanceoppgave. Policycache og selektiv HTTP-caching er eksplisitt utsatt til en ny
produksjonsmåling eventuelt dokumenterer et konkret behov.

## Blokkeringer

Ingen.
