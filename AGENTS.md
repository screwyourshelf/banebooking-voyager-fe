# Banebooking frontend

Frontend er en Svelte 5/SvelteKit-applikasjon. Koden skal kunne forstås og videreutvikles fra repoet
uten skjult sesjonskontekst.

## Start her

1. Les [`docs/current-work.md`](./docs/current-work.md) for aktivt mål og neste steg.
2. Bruk [`docs/README.md`](./docs/README.md) til å velge dokumenter som er relevante for oppgaven.
3. Kontroller `git branch --show-current`, `git status --short`, `git diff` og `git diff --cached`
   før endringer. Bevar og forstå eksisterende arbeid i arbeidskopien.

Ved `/start`, `fortsett` eller tilsvarende fortsetter du bare det konkrete steget i
`current-work.md`. Les ikke alle normative dokumenter som standard. Kode, tester og kjørbare porter
veier tyngre enn prosa ved avvik.

## Permanente kodegrenser

- Routes importerer bare offentlige feature-API-er.
- Features importerer ikke andre features.
- Bare `src/lib/ui/primitives` kan importere Bits UI.
- Bare platformlaget kan importere Supabase, Sentry og browser storage direkte.
- Komponenter gjør ikke direkte HTTP-kall, og `load` er fri for sideeffekter.
- Modulglobal mutable state brukes ikke for bruker, sesjon eller tenant.
- Ny kode bruker Svelte 5 runes, snippets og typed context; legacy Svelte-syntaks brukes ikke.
- Offentlig UI eier produktstyling. Features og routes lager ikke lokale designvarianter eller
  restyler offentlig UI gjennom `class`, `style` eller interne selectors.
- Datadrevet visualiseringsgeometri og den maskinlåste pre-module-flaten i `src/app.html` er de
  eneste registrerte stylingunntakene.

Detaljer og begrunnelser finnes i [`docs/architecture.md`](./docs/architecture.md),
[`docs/product-design-rules.md`](./docs/product-design-rules.md) og relevante ADR-er. Les dem når
oppgaven berører den aktuelle kontrakten.

## Arbeidsform

1. Fastslå observerbar adferd, eierskap, dataflyt og relevante tester før implementering.
2. Avgrens én sammenhengende, verifiserbar endring.
3. Bruk eksisterende platform-, domain- og UI-kontrakter. Forbedre riktig sentral eier når et delt
   mønster mangler.
4. Gjør grenser lesbare gjennom presise navn, typer, smale offentlige API-er og samlokaliserte
   tester. Unngå generelle `helpers`, `common`, `misc` og brede `utils`.
5. Oppdater en ADR når en arkitekturbeslutning endres. Oppdater `current-work.md` bare når aktiv
   fase, neste steg, scope eller blokkering faktisk endres; filen er ikke en sesjonslogg.
6. Kjør kontroller proporsjonalt med risikoen. Ordinære porter og produksjonskommandoer står i
   [`docs/development-and-operations.md`](./docs/development-and-operations.md).

Backendendringer gjøres bare når den aktive oppgaven uttrykkelig har fullstackomfang. Hold frontend-
og backendendringer i separate commits og verifiser kontrakten samlet.

Ikke push eller deploy automatisk. Rapporter hva som ble endret, verifisert og eventuelt committet,
samt neste konkrete steg hvis arbeid gjenstår.
