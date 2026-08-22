# Banebooking frontend

## Oppdrag

Gjennomfør en samlet lift-and-shift fra React/Vite til idiomatisk Svelte 5 og SvelteKit på
`feature/sveltekit-lift-and-shift`. Bevar produktadferd, URL-er og API-kontrakter, men ikke kopier
React-komponenttre, hooks, providers, guards eller filstruktur.

## Autoritative dokumenter

Les i denne rekkefølgen:

1. [`docs/migration-status.md`](./docs/migration-status.md)
2. relevant arbeidspakke i [`docs/migration-plan.md`](./docs/migration-plan.md)
3. [`docs/sveltekit-architecture.md`](./docs/sveltekit-architecture.md)
4. [`docs/product-design-rules.md`](./docs/product-design-rules.md)
5. relevante ADR-er i [`docs/adr/`](./docs/adr/README.md)

Dokumentrollene er faste:

- arkitektur og ADR-er beskriver hvordan systemet skal bygges
- produktreglene beskriver hvordan produktet skal opptre og se ut
- migreringsplanen beskriver rekkefølge, arbeidsmetode og kvalitetsporter
- migreringsstatus beskriver sann nåsituasjon og neste eksakte steg
- git er historikk; statusfilen er ikke en sesjonslogg

## `/start` — fortsettelsesprotokoll

Når brukeren skriver `/start`, `fortsett lift-and-shift` eller tilsvarende:

1. Bekreft at arbeidsmappen er frontend-repoet og les dokumentene over.
2. Bekreft aktiv branch med `git branch --show-current`, og finn migreringsbranchens faktiske base
   med `git merge-base HEAD main`.
3. Les lokale migreringscommits foran basen med
   `git log --oneline --decorate "$(git merge-base HEAD main)"..HEAD`. Inspiser også den samlede
   committede endringen med `git diff --stat "$(git merge-base HEAD main)"..HEAD` og relevante
   detaljdiffer. Commit-rekken er den eksakte historikken over fullførte checkpoints.
4. Inspiser ucommittert arbeid med `git status --short`, `git diff` og `git diff --cached`.
   Ucommitterte endringer kan være en pågående, ufullstendig leveranse og må ikke overses eller
   overskrives.
5. Sammenlign branch, commits og arbeidskopi med `migration-status.md`. Stol ikke blindt på noen
   enkeltkilde dersom de avviker; avklar sann tilstand ved å lese kode og differ, og oppdater
   statusfilen. Gjeldende `HEAD` beregnes alltid fra git og lagres ikke som en selvrefererende hash i
   statusfilen.
6. Kontroller siste verifikasjonsresultat. Kjør nødvendige, billige kontroller på nytt dersom kode
   eller avhengigheter har endret seg siden resultatet ble registrert.
7. Velg `Neste eksakte steg` fra statusfilen og opprett en konkret arbeidsplan for denne sesjonen.
8. Fortsett autonomt gjennom den aktive arbeidspakken til dens kvalitetsport er nådd eller en reell
   blokkering krever brukerbeslutning.

Ikke be brukeren gjenta arkitektur, ønsket arbeidsform eller tidligere fremdrift når repoet kan gi
svaret.

## Fast implementeringsmetode

For hver arbeidsflate:

1. Kartlegg observerbar adferd, URL, API-kall, roller, states og responsive krav fra
   produksjonsreferansen.
2. Velg SvelteKit-eier for hvert ansvar ut fra arkitekturen, ikke ut fra React-konstruksjonen.
3. Bruk eksisterende platform-, domain- og UI-kontrakter. Mangler et delt pattern, forbedres det
   sentralt før featureimplementasjonen fortsetter.
4. Implementer rene kontrakter/domene, endpoint/query, reaktiv arbeidsflyt og UI i den rekkefølgen
   ansvaret krever.
5. Verifiser funksjonell, visuell, responsiv og tilgjengelighetsmessig paritet.
6. Fjern erstattet React-kode; ikke behold permanente broer eller parallelle implementasjoner.
7. Oppdater `migration-status.md` umiddelbart når arbeidspakkens sannhet endres.

## Arkitekturgrenser

- Routes importerer bare offentlige feature-API-er.
- Features importerer ikke andre features.
- Bare `lib/ui/primitives` kan importere Bits UI.
- Bare platformlaget kan importere Supabase, Sentry og browser storage direkte.
- Komponenter gjør ikke direkte HTTP-kall.
- `load` er fri for sideeffekter.
- Modulglobal mutable state brukes ikke for bruker, sesjon eller tenant.
- Featurekode lager ikke lokal produktstyling eller parallelle designvarianter.
- Ny kode bruker Svelte 5 runes, snippets og typed context; legacy Svelte-syntaks brukes ikke.

## Handover ved slutten av hver sesjon

Før siste svar i en arbeidsøkt:

1. Kjør kontrollene som står i aktiv arbeidspakke og noter eksakt resultat.
2. Oppdater `docs/migration-status.md` med:
   - aktiv arbeidspakke og status
   - hva som faktisk ble fullført
   - neste eksakte, utførbare steg
   - blokkeringer eller beslutninger som gjenstår
   - midlertidig kode eller kjent avvik
   - siste beståtte tester, check og build
   - relevante endrede filer
3. Oppdater en ADR dersom arkitekturbeslutningen er endret. Ikke gjem beslutningen i statusfilen.
4. Kontroller at statusfilen beskriver arbeidskopien, ikke hva man håpet å fullføre.
5. Når leveransen er atomisk og verifisert, oppdater statusfilen til å beskrive tilstanden etter
   checkpointet og opprett én lokal commit. Bruk et presist scope eller arbeidspakkenummer i
   commitmeldingen når det er nyttig. Ikke push automatisk.
6. Når leveransen ikke er komplett eller verifisert, behold den ucommittet og dokumenter eksakt
   hvilke endringer som forventes å være ucommittet, hvorfor og hva neste steg er. Ikke lag en
   misvisende grønn checkpoint-commit av halvferdig arbeid.
7. Ikke amend, rebase, squash eller fjern tidligere migreringscommits uten en konkret grunn og
   eksplisitt godkjenning; de er handover-kontekst for senere sesjoner.
8. Rapporter kort hva som er levert, verifisert, committet og neste steg.

Hvis sesjonen bare gjør dokumentasjon eller analyse, oppdateres statusen når dette påvirker neste
arbeid. Ikke legg til kronologiske dagboknotater.
