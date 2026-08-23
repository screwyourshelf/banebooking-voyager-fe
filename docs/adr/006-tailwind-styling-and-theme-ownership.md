# ADR-006: Tailwind-styling og theme-eierskap

> **Status:** Godkjent
>
> **Dato:** 2026-08-23
>
> **Erstatter:** Stylingbeslutningen i ADR-004 punkt 8

## Kontekst

SvelteKit-lift-and-shift-en bevarte produktets visuelle kontrakt, men samlet nesten all
produktstyling i globale CSS-filer. Etterreviewen fant at komponentvokabularet og de semantiske
tokenene er sterke, mens CSS-eierskapet er vanskeligere å vedlikeholde:

- `patterns.css` er en bred, global mønsterfil med regler for mange uavhengige UI-familier
- responsive regler ligger separat fra komponentene de endrer
- noen regler ligger utenfor deklarerte cascade layers
- `!important` brukes for å vinne over den etablerte kaskaden
- Tailwind er installert, men brukes i praksis bare som build-, Preflight- og theme-bro

Samtidig må en ny visuell identitet kunne innføres gjennom én sentral theme-kontrakt. Lokal
styling skal ikke gi features anledning til å lage parallelle knapper, flater, typografi eller
andre produktvarianter.

## Beslutning

1. Tailwind CSS v4 er den autoritative stylingmotoren for Banebookings offentlige UI-lag.
2. Produktidentiteten uttrykkes som vanlige, semantiske CSS-variabler for blant annet flater,
   tekst, status, typografi, radius, skygge, kontrollgeometri og avstand. `@theme inline` eksponerer
   bare de rollene som skal kunne brukes som Tailwind-utilities.
3. `ui/primitives` og `ui/patterns` kan bruke Tailwind-utilities direkte i Svelte-markup. Det
   semantiske produkt-API-et er komponenten og dens typed props, ikke en offentlig klassekontrakt.
4. Visuelle utilities i offentlig UI bruker semantiske roller som `bg-surface`, `text-ink`,
   `border-line` og `rounded-record`. Rå palettklasser, vilkårlige produktverdier og lokale
   dark-mode-overstyringer er ikke tillatt.
5. Features og routes komponerer offentlig UI. De kan ikke restyle en offentlig komponent gjennom
   `class`, `style` eller interne selektorer, og kan ikke importere Bits UI direkte.
6. Featurelokal styling er et lukket unntak for faktisk unik, datadrevet visualiseringsgeometri.
   Unntaket kan bruke skopert Svelte-CSS, SVG-attributter eller navngitte CSS custom properties,
   men ikke definere produktfarger, typografi, radius, skygge eller kontrollvarianter.
7. Tailwind-utilities skrives direkte i markup. `@apply` brukes ikke til å bygge et parallelt
   komponentklasselag.
8. Global CSS begrenses etter migreringen til Tailwind-inngang, font, base/reset, theme-variabler,
   nødvendige globale dokumentregler og eksplisitt dokumenterte tredjepartsgrenser. Globale
   produktselektorer er migreringsgjeld, ikke målarkitektur.
9. Bits UI forblir headless atferdslager bak `ui/primitives`. Tailwind er ikke en Bits UI-avhengighet;
   det er Banebookings valgte visuelle implementasjon.
10. Arkitektur- og designsystemkontroller håndhever grensene med en avtakende baseline under
    migreringen og uten åpne legacyunntak i sluttporten.

## Tillatt Tailwind-vokabular

Følgende kategorier er tillatt i offentlig UI:

- identitetsnøytral struktur som display, grid/flex, posisjon, overflow og responsive skifter
- semantiske farge-, typografi-, radius-, skygge- og kontrollroller definert i theme-kontrakten
- eksplisitte statevarianter som `hover`, `focus-visible`, `disabled`, `aria-*` og Bits UI sine
  dokumenterte `data-*`-states

Følgende er ikke tillatt uten et navngitt, maskinelt unntak:

- rå produktpaletter som `bg-green-600` eller `text-slate-900`
- arbitrary visuelle verdier som `bg-[#123456]`, `rounded-[13px]` eller `p-[17px]`
- `dark:*` for egenskaper som skal løses av semantiske theme-variabler
- important-modifier eller app-eide `!important`
- dynamisk konstruerte klassenavn som ikke kan valideres eller oppdages statisk

## Konsekvenser

- Styling og responsiv oppførsel kan flyttes nær komponenten uten å flytte produktidentiteten ut av
  theme-kontrakten.
- En vanlig theme-/identitetsendring endrer semantiske variabler, ikke hver konsument.
- Featurekode får mindre selektorkunnskap og kan ikke bruke `class` som skjult variant-API.
- Svelte-markup i UI-laget får flere presentasjonelle utilities; komponentnavn og typed props
  bærer den offentlige semantikken.
- Den sentrale CSS-monolitten fjernes gradvis. En familie migreres og verifiseres før dens gamle
  selektorer slettes.
- Tailwind beholdes som en reell del av målarkitekturen, ikke bare som indirekte Preflight-verktøy.

## Verifikasjon

- Bare `ui/primitives` importerer `bits-ui`.
- Features og routes har ingen ulovlige `style`-attributter, `<style>`-blokker, CSS-importer,
  visuelle utilitykomposisjoner eller klasseoverstyringer av offentlig UI.
- Offentlig UI bruker bare godkjente semantiske visuelle utilities og statisk analyserbare klasser.
- Rå produktfarger, app-eid `!important`, ulovlige arbitrary values og legacy globale
  produktselektorer er null i sluttporten.
- Lyst og mørkt theme, representative viewporter, fokus, tastatur og visuelle snapshots er grønne.
- Sluttevalueringen i stylingplanen beviser at theme-identitet kan endres sentralt.

## Referanser

- [Tailwind CSS: Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)
- [Tailwind CSS: Theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS: Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)
- [Bits UI: Introduction](https://www.bits-ui.com/docs/introduction)
- [Bits UI: Styling](https://www.bits-ui.com/docs/styling)
- [Svelte: Scoped styles](https://svelte.dev/docs/svelte/scoped-styles)
