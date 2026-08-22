# Banebooking frontend

## Oppdrag

Gjennomfør en samlet lift-and-shift fra React/Vite til idiomatisk Svelte 5 og SvelteKit på
`feature/sveltekit-lift-and-shift`. Bevar produktadferd, URL-er og API-kontrakter, men ikke kopier
React-komponenttre, hooks, providers, guards eller filstruktur.

Koden skal i første hånd kunne overtas, forstås og videreutvikles av nye AI-agenter uten skjult
sesjonskontekst. AI-first lesbarhet er en del av leveransen, ikke et dokumentasjonsarbeid som
utsettes til slutt.

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
7. Velg ett avgrenset, verifiserbart checkpoint fra `Neste eksakte steg` og opprett en konkret
   arbeidsplan for denne sesjonen. Aktiv arbeidspakke kan gå over flere AI-sesjoner.
8. Fortsett autonomt bare innenfor checkpointet og den aktive arbeidspakken. `/start` betyr aldri
   at hele migreringen eller alle gjenværende arbeidspakker skal utføres i ett sveip.
9. Når aktiv arbeidspakke eller avtalt checkpoint er fullført, gjennomfør handover og avslutt
   sesjonen. Statusfilen kan peke på neste arbeidspakke, men samme AI-sesjon starter den ikke
   automatisk.

Ikke be brukeren gjenta arkitektur, ønsket arbeidsform eller tidligere fremdrift når repoet kan gi
svaret.

## AI-first kodekontrakt

AI-agenter er de primære leserne og vedlikeholderne under lift-and-shift. Ny og flyttet kode skal
derfor optimaliseres for korrekt gjenopptakelse fra repoet alene:

- Bruk presise, stabile navn som uttrykker produktbegrep og ansvar. Unngå `helpers`, `common`,
  `misc`, brede `utils` og forkortelser som krever lokal sesjonskunnskap.
- Hold moduler små og sammenhengende med én tydelig eier. Offentlige innganger skal være smale og
  eksplisitte; intern struktur skal ikke lekke gjennom tilfeldige importer.
- Gjør grenser maskinlesbare med TypeScript-typer, diskriminerte states, validerte adapters og
  arkitekturkontroller. Kritiske invarianter skal finnes i kode eller tester, ikke bare i prosa.
- Samlokaliser implementasjon, kontrakt og relevante tester. Bruk forutsigbar filstruktur likt på
  tvers av features slik at en ny agent kan finne route, API, query, modell og UI uten søkegjetting.
- Foretrekk eksplisitt dataflyt og vanlige språk-/rammeverksmønstre fremfor metaprogrammering,
  skjulte sideeffekter, dynamisk registrering og «smart» abstraksjon.
- Kommenter hvorfor, eierskap, sikkerhetskrav og uventede begrensninger. Ikke kommenter det
  syntaksen allerede sier, og ikke bruk kommentarer som erstatning for presise typer og navn.
- Én sannhetskilde per kontrakt. Midlertidige broer skal være tynne, navngitte og registrert i
  statusfilen med planlagt fjerning.
- Når en løsning avviker fra etablert anbefaling, skal begrunnelsen dokumenteres nær beslutningen
  eller i ADR. En senere agent skal ikke måtte rekonstruere hensikten fra commitdiffen alene.

Før et checkpoint godkjennes, leses endringen som om neste agent ikke har samtalehistorikken: Kan
ansvar, innganger, invarianter, tester og neste endringspunkt fastslås direkte fra repoet? Hvis ikke,
er leveransen ikke ferdig.

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
8. Gjennomfør en AI-first lesbarhetskontroll før checkpoint: fjern skjult kobling, utydelige navn og
   unødvendig kompleksitet, og sørg for at tester og typer forklarer kontrakten.

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

En handover er en normal sesjonsgrense, ikke bare en feil- eller blokkeringssituasjon. En sesjon
skal ikke fortsette inn i neste arbeidspakke bare fordi det finnes tid eller kontekst igjen.

Hvis sesjonen bare gjør dokumentasjon eller analyse, oppdateres statusen når dette påvirker neste
arbeid. Ikke legg til kronologiske dagboknotater.
