# Aktivt arbeid

> **Status:** Fullstack-ytelsesiterasjon fullført lokalt — klar for review
>
> **Branch:** `perf/fullstack-iteration-2026-08-26`

## Aktiv leveranse

En ny fullstackbaseline, evidensbasert prioritering, tre tiltak og identisk ettermåling er fullført
mot lokal Development-backend og PostgreSQL. Resultater, gjenstående kandidater og full
verifikasjonsmatrise ligger i
[`fullstack-iterasjonen`](./performance/fullstack-iteration-2026-08-26.md).

Frontendtiltakene fjerner refetch etter avvist booking og starter bane-/overstyringswrites
parallelt. Måleharnessen dekker 27 flyter og bevarer auth-callback med `returnTo` som eksplisitt
regresjonskontrakt. En etterfølgende PageSpeed-kontroll har i tillegg rettet sluttidskontrasten og
utvidet produksjonsporten fra HTML-startfiler til hele JavaScript-grafen for offentlig booking.
UI-chunksplitt og asynkron CSS ble målt, men ikke beholdt fordi de ikke dokumenterte en trygg gevinst.

## Neste steg

Opprett separate reviewløp når ekstern endring godkjennes:

1. Merge backendbranchen til `master`.
2. Merge denne frontendbranchen til `main`.

Ikke start de utsatte cache-, polling- eller arrangementskontraktene uten ny produksjonsrelevant
evidens.

## Blokkeringer

Ingen.
