# Aktivt arbeid

> **Status:** SvelteKit 3-migrering implementert og lokalt verifisert
>
> **Arbeidsbranch:** `codex/dependency-upgrade-2026-10`

## Mål og omfang

Fullstackleveransen bruker nå SvelteKit 3.1.0 og adapter-static 4.0.0. Brukeren har eksplisitt
godkjent at offentlig booking får 175 KiB gzip som budsjett; alle øvrige budsjetter, snapshots,
ikoner og produktkontrakter er bevart. Node 24/npm 10.9.9 er installasjonsverktøyet; TypeScript 6
og Hugeicons 4.2.3 videreføres av dokumenterte kompatibilitetshensyn.

## Neste steg

Avvent eksplisitt godkjenning av push, CI, merge og produksjonsdeploy. Backendens kontraktbaseline
skal peke på Kit 3-leveransens commit før publisering.
Ren installasjon, gyldig peer-graf og komplett `verify:frontend` er grønne:
105 testfiler / 458 tester, hele `check`, 24 visuelle og åtte produksjonsroutetester. Reell isolert
API-kontrakt passerer 11 tester. Audit har fem lave funn og ingen moderate/høye/kritiske.
Versjonsvalg, toolchain, målinger og restfunn finnes i
[leveransenotatet](./archive/avhengighetsoppgradering-2026-10.md).
Ingen push, deploy eller andre eksterne endringer er godkjent i denne oppgaven.
