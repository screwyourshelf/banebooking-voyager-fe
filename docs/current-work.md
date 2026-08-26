# Aktivt arbeid

> **Status:** Klar for oppstart
>
> **Initiativ:** API- og fullstackytelse
>
> **Aktiv fase:** Fase 0 — målbar baseline uten produktendring

## Mål

Etabler en reproduserbar førmåling for kaldstart, løpende kalenderbruk og sentrale
adminmutasjoner. Optimalisering starter først når dagens kontrollflyt og kostnad er verifisert mot
gjeldende `main`.

## Scope

- Frontend og lokal fullstackflyt kan inspiseres og måles.
- Ingen backendkontrakt eller backendadferd endres i fase 0.
- Frontend-hardening avgrenses og måles før eventuelt fullstackomfang velges.
- Produktadferd, URL-er, roller, guards og autorisasjonsansvar skal bevares.

## Neste eksakte steg

1. Les [`performance/README.md`](./performance/README.md).
2. Verifiser filstier, queryflyt, intervaller og API-antakelser i den opprinnelige
   [`performancegjennomgangen`](./performance/initial-review.md) mot gjeldende kode.
3. Definer en reproduserbar lokal måleprotokoll for de seks baselineflytene.
4. Registrer førmålingen før en FE-kandidat implementeres.

## Blokkeringer

Ingen kjente blokkeringer. Fullstack- og backendtiltak skal ikke velges før frontendbaselinen og en
etterfølgende frontendmåling viser at gevinsten fortsatt er relevant.
