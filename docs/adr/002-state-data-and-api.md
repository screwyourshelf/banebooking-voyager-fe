# ADR-002: State, data og API

> **Status:** Godkjent
>
> **Dato:** 2026-08-22

## Kontekst

Applikasjonen har mye klientstyrt serverdata, caching og mutations mot et separat .NET-API.
React-versjonen bruker TanStack Query og Axios. SvelteKit tilbyr route data og invalidation, mens
Svelte 5 tilbyr universal reactivity. Uten tydelige grenser kan samme data ende i flere cacher og
globale stateobjekter.

## Beslutning

1. TanStack Svelte Query er autoritativ cache for data fra .NET-API-et.
2. SvelteKit `load` eier routeavhengigheter, tenantoppløsning og nødvendig bootstrap. `load` skal
   ikke ha sideeffekter.
3. Når `load` prefetcher en Query-ressurs, overføres den eksplisitt som prefetched data eller
   `initialData`; det opprettes ikke en separat cache.
4. Lokal arbeidsflyt bruker `$state` og `$derived`. Query-data kopieres bare til lokal state når det
   opprettes et selvstendig skjemautkast.
5. Typed context brukes for request-/appomspennende state. Modulglobal mutable state brukes ikke
   for tenant, bruker eller sesjon.
6. Delbar eller reload-stabil state legges i URL-parametere. Browser storage brukes bare gjennom
   en adapter for eksplisitt persistente preferanser og auth.
7. Axios erstattes med en typed klient rundt native `fetch`. Klienten injiseres med `fetch`, base
   URL, tokenleverandør og 401-handler.
8. Endpointfunksjoner er rammeverksuavhengige. Queries og mutations eies av featuremodulen.
9. SvelteKit remote functions brukes ikke mens API-et er eksperimentelt og backend er separat.

## Konsekvenser

- Dagens querysemantikk kan flyttes uten å lage et eget state-rammeverk.
- Native `fetch` gjør endpointlaget brukbart fra både SvelteKit og klienten.
- Utviklere må velge stateeier eksplisitt fremfor å opprette en generell store.
- Query key factories og invalidation blir del av featurekontrakten.

## Verifikasjon

- Ingen `.svelte`-komponent gjør direkte HTTP-kall.
- Query keys defineres på ett sted per feature.
- Ingen ressurs hentes samtidig av `load` og Query uten dokumentert hydrering.
- Navigerbare filtre kan gjenopprettes fra URL.
- Pure endpoint- og domenetester kan kjøre uten DOM.

## Referanser

- [SvelteKit: State management](https://svelte.dev/docs/kit/state-management)
- [SvelteKit: Loading data](https://svelte.dev/docs/kit/load)
- [TanStack Query: Svelte](https://tanstack.com/query/latest/docs/framework/svelte/reference)
