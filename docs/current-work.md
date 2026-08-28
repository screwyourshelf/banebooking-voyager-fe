# Aktivt arbeid

> **Status:** Klar for review
>
> **Branch:** `feat/news-count-badge`

## Aktiv leveranse

Nyhetsindikasjon og rikere nyhetsforhåndsvisning:

- appskallet henter en separat, tenant-cachet feedstatus og viser antall nyheter i navigasjonen
- nyhetsrader viser flerlinnet tittel og ingress uten at handlingen tar lesebredde
- frontendkontrakten er samkjørt med backendens `GET /klubb/{slug}/feed/status`

## Neste steg

Følg CI og håndter eventuelle reviewkommentarer.

## Blokkeringer

Ingen.
