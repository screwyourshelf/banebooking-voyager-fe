# Aktivt arbeid

> **Status:** Implementert og lokalt verifisert; produksjonsutrulling godkjent 2026-10-22
>
> **Arbeidsbranch:** `codex/delete-empty-arrangement`

## Mål og omfang

Fullstackretting: Når siste lagrede booking avlyses, slettes også arrangementet atomisk.
Tidligere bookinger teller og bevarer arrangementet som historikk. Eksisterende slettesperrer
for turneringer gjelder også ved siste booking. Begge avlysningsveier skal følge samme regel.
Frontend bekrefter bare avlysning av siste tid; andre tider avlyses direkte. Kalender,
arrangementlister og editor oppdateres etter avlysning.
Tomme arrangementer fra tidligere feil utelates fra visningslistene uten automatisk datasletting.

## Neste steg

Brukeren har godkjent commit, squash-merge, push og produksjonsdeploy av begge repoer.
Backend publiseres fra `master` før frontend publiseres fra `main`. Backendens kontrakttest
skal bruke den nye frontendcommiten. Kontroller GitHub Actions, Cloudflare Pages og
produksjonshelsen før utrullingen regnes som fullført.

Backend-, PostgreSQL-, frontend-, API-kontrakt-, visuelle og produksjonsroutetester er bestått.
Frontendens kvalitetsporter og begge produksjonsbuildene er verifisert.
Avhengighetskontrollen 2026-10-22 rapporterer 40 npm-funn (7 høye, 27 moderate, 6 lave)
i den uendrede pakkegrafen. Oppgradering av avhengigheter er separat oppfølging.
