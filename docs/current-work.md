# Aktivt arbeid

> **Status:** Avhengighetsoppgradering implementert og lokalt verifisert
>
> **Arbeidsbranch:** `codex/dependency-upgrade-2026-10`

## Mål og omfang

Eksplisitt fullstackoppgradering til stabile, kompatible avhengigheter med separate commits og
verifikasjon per repo. Frontend bruker Node 24 LTS, Vitest 5 og Sentry 11. SvelteKit 3/adapter-static
4 holdes tilbake av det uendrede produksjonsbudsjettet; TypeScript 7 mangler kompatibel peer-støtte,
og Hugeicons 4.3 endrer fryst ikongeometri. Eksisterende adferd, snapshots og budsjetter er bevart.

## Neste steg

Avvent eksplisitt godkjenning av push, CI, merge og produksjonsdeploy av de separate lokale
leveransene. Backendens kontraktbaseline skal peke på denne frontendleveransens commit før
publisering. `npm ci`, 105 testfiler / 456 tester, hele `check`, 24 visuelle tester, åtte
produksjonsroutetester og 11 reelle API-kontrakttester er grønne. Audit er redusert fra 41 funn til
seks lave, uten moderate/høye/kritiske.
Versjonsvalg, målinger og restfunn er dokumentert i
[leveransenotatet](./archive/avhengighetsoppgradering-2026-10.md).
Ingen push, deploy eller andre eksterne endringer er godkjent i denne oppgaven.
