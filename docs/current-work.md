# Aktivt arbeid

> **Status:** Ingen aktiv implementeringsoppgave
>
> **Hovedbranch:** `main`

Den samlede SOLID-leveransen er ferdigstilt. Frontend forhåndsviser tillegg til arrangementer
mot eksisterende bookinger, og datofølsomme tester bruker fast lokal klokke. Backendens punkt
1–5 er levert i backend-repoet. Punkt 6 om turneringstrekking er utsatt.

Gjeldende produktkontrakt står i [product-behavior.md](./product-behavior.md), og
[driftsinstruksen](./development-and-operations.md) beskriver oppstart, tester og publisering.
Arbeidshistorikken ligger i Git.

## Neste steg

Ingen ny implementeringsoppgave er avtalt. Avhengighetsoppfølgingen nedenfor bør behandles
som egen oppgave; den inngår ikke i SOLID-refaktoreringen.

## Kjent avhengighetsoppfølging

`npm audit` 2026-09-22 rapporterer 32 funn: 1 høy, 25 moderate og 6 lave. Avhengighetsfilene
var uendret mot `origin/main` ved kontrollen, så dette er eksisterende funn.

Det høye funnet gjelder `@tiptap/core` og Markdown-attributtparsing
([GHSA-j95f-988m-3j2f](https://github.com/advisories/GHSA-j95f-988m-3j2f)).
Audit oppgir en tilgjengelig oppdatering. Oppgrader Tiptap-pakkene samlet i en egen endring og
verifiser rikteksteditoren; faktisk eksponering i appen er ikke vurdert her.
