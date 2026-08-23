# Styling guards

Denne mappen eier den maskinlesbare kontrakten og de isolerte SWP-0-fixturene for
stylinggrensene i ADR-006.

- `contract.json` er eneste kilde for stabile regel-ID-er, lageiere, utilityvokabular,
  custom-property-eierskap, cascade layers og det lukkede visualiseringsunntaket.
- `analyze.mjs` analyserer én oppgitt Svelte- eller CSS-kilde gjennom Svelte- og PostCSS-AST.
- `fixtures/manifest.json` gir hver liten fixture en virtuell produksjonssti, forventet regel-ID og
  eksakt diagnostikk.
- `npm run styling:guards:fixtures` validerer kontraktsformatet, alle diagnostics og at hver regel
  har minst én positiv og én negativ fixture.

SWP-0 kjører bare analysatoren mot fixturene. Produksjonstreet og overgangsbaselinen kobles til den
samme kontrakten først i SWP-1; denne mappen er derfor ikke en ny unntaksliste for dagens legacy-CSS.
Nye visualiseringskanaler krever en eksplisitt kontraktendring og kan bare beskrive datadrevet
geometri, aldri produktidentitet.
