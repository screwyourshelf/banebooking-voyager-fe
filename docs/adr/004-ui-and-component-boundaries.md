# ADR-004: UI- og komponentgrenser

> **Status:** Godkjent, punkt 8 erstattet av ADR-006
>
> **Dato:** 2026-08-22

## Kontekst

Banebooking har et eget visuelt språk, semantiske CSS-tokens og produktmønstre. Sammensatte
kontroller trenger robust tilgjengelighetsatferd, men en ferdigstylet UI-pakke ville konkurrere med
produktets etablerte designregler.

## Beslutning

1. Bits UI brukes som headless atferdslager for sammensatte, interaktive primitives.
2. Bare `lib/ui/primitives` kan importere `bits-ui`.
3. Native HTML brukes for enkle kontroller. Bits UI brukes når fokusstyring, tastaturnavigasjon,
   portal, dismissable layers eller sammensatt ARIA-atferd gjør en egen implementasjon risikabel.
4. Vi wrapper bare primitives med reelle konsumenter. Vi kopierer ikke en komplett katalog.
5. `ui/patterns` eier produktfamiliene `Page`, `Collection`, `Form`, `Settings`, `Dialog` og
   `Document`, samt deres anatomi og størrelser.
6. Patterns bruker typed props, Svelte 5 snippets og semantiske callback-props. Bits- eller
   DOM-hendelser lekker ikke ut som produkt-API.
7. Featurekode bruker offentlig UI-API og kan ikke importere Bits UI, interne patternfiler eller
   sette produktets `data-ui`/`data-part` direkte.
8. Styling- og theme-eierskap følger ADR-006.
9. `createEventDispatcher`, legacy slots og legacy reaktiv syntaks brukes ikke i ny kode.
10. Tilgjengelighet testes på primitive- og patternnivå; features skal ikke reparere manglende
    tilgjengelighet lokalt.

## Komponentkriterier

En komponent opprettes når den minst ett av følgende:

- eier semantikk eller tilgjengelig atferd
- eier en stabil visuell anatomi med flere konsumenter
- isolerer en tydelig arbeidsflyt eller stateeier
- reduserer featurekunnskap hos konsumenten

En komponent opprettes ikke bare for å korte ned en fil eller videresende alle props til ett
element. Et nytt pattern eller en ny variant må løse samme problem for minst to reelle
konsumenter.

## Konsekvenser

- Produktdesignet forblir vårt, mens komplisert tilgjengelighetsatferd vedlikeholdes av Bits UI.
- En oppgradering av Bits UI berører primitive wrappers, ikke alle features.
- Native HTML eller eksisterende patterns brukes når en egen primitive ikke tilfører nødvendig
  atferd.
- Patterns har et stabilt offentlig API som kan utvikles uavhengig av featureimplementasjonen.

## Verifikasjon

- Arkitekturkontrollen avviser `bits-ui` utenfor `ui/primitives`.
- Dialog, select, menu, popover og kalender testes med tastatur og fokusretur.
- Featurekode inneholder ikke produktanatomi eller lokal featurestyling.
- Offentlige patterns har eksplisitte propstyper og dokumenterte states.
- Visuell paritet kontrolleres på avtalte mobile og desktop viewporter.

## Referanser

- [Bits UI: Introduction](https://www.bits-ui.com/docs/introduction)
- [Bits UI: Dialog](https://www.bits-ui.com/docs/components/dialog)
- [Svelte: Snippets](https://svelte.dev/docs/svelte/snippet)
