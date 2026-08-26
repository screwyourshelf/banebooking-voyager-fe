# ADR-007: Presentasjon før appmodulen starter

> **Status:** Godkjent
>
> **Dato:** 2026-08-25
>
> **Supplerer:** ADR-005 og ADR-006

## Kontekst

`src/app.html` viser en loader og en eksplisitt recoveryflate før SvelteKit-modulen har startet.
Flaten må fortsatt være lesbar når nettopp den bygde JavaScript- eller CSS-ressursen ikke kan
lastes. ADR-005 eier recoveryatferden, mens ADR-006 ellers sentraliserer produktidentitet og
presentasjon i theme-kontrakten og offentlig UI.

En ekstern stylesheet eller modulinnlastet komponent kan derfor ikke være eneste eier av denne
presentasjonen. Samtidig kan ikke `app.html` være en uregistrert, parallell stylingflate. Brukeren
godkjente 2026-08-25 at den eksisterende pre-module-presentasjonen beholdes som ett permanent,
navngitt og maskinelt låst unntak.

## Beslutning

1. `src/app.html` er eneste tillatte produksjons-HTML under `src` og eneste eier av pre-module-
   loaderen og recoverypresentasjonen.
2. Dokumentet kan ha nøyaktig én inline styleblokk og det eksisterende
   `style="display: contents"` på SvelteKit-roten. Selectors, at-rules, deklarasjoner, metadata og
   boot-/rootanatomien er en lukket kontrakt i stylingguardens schema 6. Dokumentet eier i tillegg
   standardtittelen `Banebooking`, slik at SPA-fallbacken har et tilgjengelig dokumentnavn før
   SvelteKit starter; routes kan erstatte den med en mer spesifikk tittel.
3. Produktverdiene eies fortsatt i `src/styles/design-system/tokens.css` som elleve eksplisitte
   `--app-startup-*`-roller. Inlineflaten bruker `var(rolle, fallback)`, og hver fallback må være
   identisk med theme-eierens verdi. `meta[name="theme-color"]` speiler sin rolle maskinelt fordi
   meta-innhold ikke kan bruke en CSS-variabel.
4. Fallbackverdiene er tillatt duplisering bare fordi de må fungere når den bygde stylesheeten
   mangler. De er ikke et offentlig variant-API eller en ny generell kilde for produktidentitet.
5. Før platformlaget starter følger oppstartsflaten `prefers-color-scheme`. Den leser ikke lagret
   tema, auth eller andre produktdata; dette bevarer storagegrensen i ADR-005. ThemeProvider tar
   over når appmodulen er klar.
6. Dokumentet kan ikke legge til class-kanaler, flere styleattributter, manuelle stylesheet-lenker
   eller imperativ DOM-styling. Nye selectors, verdier eller presentasjonskanaler krever en
   eksplisitt kontraktendring; et bredere permanent unntak krever en ny beslutning.

## Konsekvenser

- Loader og recovery forblir selvstendige når modul- eller stylesheetlasting feiler.
- Vanlige theme-endringer har én navngitt token-eier og kan ikke drive fra inlinefallbackene uten
  at `npm run check` feiler.
- Produksjonstreguarden analyserer `.html` i tillegg til `.svelte` og `.css`; `src/app.html` er
  kilde nummer 185 i den gjeldende kontrakten.
- Tailwind- og offentlig UI-eierskap er uendret for den modulinnlastede appen. Unntaket gjelder
  bare den eksakte oppstartsflaten.

## Verifikasjon

- Guarden sammenligner inline-CSS, metadata, elementanatomi og stylekanaler med den strukturelle
  ADR-007-kontrakten.
- Produksjonsverifikasjonen krever standardtittelen i begge hostfallbackene.
- Guarden parser alle `var()`-bindinger og krever identiske fallbacks og `:root`-verdier i
  `tokens.css`.
- Mutasjonsprober avviser ny selector, class, metadata-/ankerdrift, spread, event-/
  presentasjonsattributt, manuell stylesheet, ekstra styleattributt, fjernet theme-binding, driftet
  fallback/token og en ny HTML-kilde.
- Asset-recoverytestene beviser fortsatt loaderfjerning, cooldown, recoverymelding og sikker
  oppfrisking av oppstartsressurser.
