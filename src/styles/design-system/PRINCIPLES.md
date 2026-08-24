# Banebooking designsystem

De autoritative, rammeverksnøytrale produktreglene ligger i
[`docs/product-design-rules.md`](../../../docs/product-design-rules.md).

Denne filen er bare en peker; regler skal ikke kopieres hit fordi én kilde hindrer at produktdesignet
utvikler parallelle varianter.

Den globale CSS-flaten er ferdig avgrenset til to filer:

- `tokens.css` eier produktroller, Tailwind-theme og light/dark-verdier.
- `base.css` eier bare dokumentdefaults, tilgjengelighetsfallbacks og keyframes som brukes av
  semantiske animation-utilities.

Produktkomponenter og patterns eier presentasjonen sin som statiske utilities i `src/lib/ui`.
Routes og features skal ikke legge til globale selectors eller utvide `base.css` med
produktspesifikke regler.
