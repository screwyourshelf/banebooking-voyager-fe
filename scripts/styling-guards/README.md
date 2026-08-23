# Styling guards

Denne mappen eier den maskinlesbare kontrakten og de isolerte SWP-0-fixturene for
stylinggrensene i ADR-006.

- `contract.json` er eneste kilde for stabile regel-ID-er, lageiere, utilityvokabular, den eksakte
  Tailwind-til-produktrolle-mappingen, custom-property-eierskap, cascade layers og det lukkede
  visualiseringsunntaket.
- `analyze.mjs` analyserer én oppgitt Svelte- eller CSS-kilde gjennom Svelte- og PostCSS-AST.
- `theme-contract.mjs` beviser at hver godkjente utility genereres fra sin registrerte
  `@theme inline`-rolle, og at produktrollen kan løses i både lyst og mørkt theme.
- `fixtures/manifest.json` gir hver liten fixture en virtuell produksjonssti, forventet regel-ID og
  eksakt diagnostikk.
- `npm run styling:guards:fixtures` validerer kontraktsformatet, alle diagnostics og at hver regel
  har minst én positiv og én negativ fixture.
- `npm run styling:theme:check` validerer den aktive theme-kontrakten mot Tailwind og tokens.css.

Svelte-/CSS-analysatoren kjører fortsatt bare mot fixturene frem til SWP-1.3. SWP-1.1 validerer den
aktive theme-flaten, men produksjonstreet og overgangsbaselinen kobles ikke håndhevende til de ti
guardreglene før det avtalte checkpointet. Mappen er derfor ikke en ny unntaksliste for dagens
legacy-CSS. Nye visualiseringskanaler krever en eksplisitt kontraktendring og kan bare beskrive
datadrevet geometri, aldri produktidentitet.
