# Banebooking designsystem

De autoritative, rammeverksnøytrale produktreglene ligger i
[`docs/product-design-rules.md`](../../../docs/product-design-rules.md).

Denne filen er bare en peker; regler skal ikke kopieres hit fordi én kilde hindrer at produktdesignet
utvikler parallelle varianter.

Den globale CSS-flaten er ferdig avgrenset til fire filer:

- `src/index.css` eier Tailwind-inngangen, `@theme inline`-projeksjonen, registrerte custom
  utilities/variants og de eksplisitte kildeutelatelsene.
- `design-system.css` er den registrerte importinngangen for designsystemfilene.
- `tokens.css` eier rå identitet, semantiske produktroller, light/dark-verdier og de elleve
  ADR-007-rollene som `src/app.html` speiler med maskinelt kontrollerte fallbacks.
- `base.css` eier bare dokumentdefaults, tilgjengelighetsfallbacks og keyframes som brukes av
  semantiske animation-utilities.

Produktkomponenter og patterns eier presentasjonen sin som statiske utilities i `src/lib/ui`.
Routes og features skal ikke legge til globale selectors eller utvide `base.css` med
produktspesifikke regler.

`src/app.html` er den eneste separate pre-module-flaten. Den eksakte inlinepresentasjonen er låst
av stylingproduksjonstreet og kan ikke brukes som et generelt unntak fra offentlig UI-eierskap.
