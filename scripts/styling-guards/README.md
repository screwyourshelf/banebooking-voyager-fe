# Styling guards

Denne mappen eier den maskinlesbare kontrakten og de isolerte fixturene for stylinggrensene i
ADR-006.

- `contract.json` er eneste kilde for stabile regel-ID-er, lageiere, utilityvokabular, den eksakte
  Tailwind-til-produktrolle-mappingen, custom-property-eierskap, cascade layers og det lukkede
  visualiseringsunntaket.
- `analyze.mjs` analyserer én oppgitt Svelte- eller CSS-kilde gjennom Svelte- og PostCSS-AST.
- `theme-contract.mjs` beviser at hver godkjente utility genereres fra sin registrerte
  `@theme inline`-rolle, og at produktrollen kan løses i både lyst og mørkt theme.
- `cascade-contract.mjs` oppdager hele den registrerte produksjons-CSS-flaten og beviser at hver
  regel ligger i Tailwinds `theme`, `base`, `components` eller `utilities`-lag.
- `production-tree-contract.mjs` oppdager alle produksjonsfiler under `src`, kjører de ni øvrige
  reglene og krever null diagnostics. Schema 4 klassifiserer alle Svelte-attributtkanaler,
  spreads, dynamiske elementer/komponenter, rå HTML og stylesheet-markup fail-closed.
- `fixtures/manifest.json` gir hver liten fixture en virtuell produksjonssti, forventet regel-ID og
  eksakt diagnostikk.
- `npm run styling:guards:fixtures` validerer kontraktsformatet, alle diagnostics og at hver regel
  har minst én positiv og én negativ fixture.
- `npm run styling:theme:check` validerer den aktive theme-kontrakten mot Tailwind og tokens.css.
- `npm run styling:cascade:check` validerer den aktive cascade-kontrakten mot alle fire
  produksjonsstilark.
- `npm run styling:guards:production` validerer alle registrerte produksjonskilder mot diagnostics
  med stabil regel-ID, fil, linje og kolonne.

Theme-, cascade-, fixture- og produksjonstre-portene inngår alle i `npm run check`. Bare
`*.test.svelte` er eksplisitt utelatt fra produksjonskildene; fixture- eller generated-navn under
`src` gir ikke et unntak. Stylingbaselinen inneholder ingen legacydiagnostics, så ethvert nytt funn
feiler uten en overgangsallowlist. Den separate, permanente visualiseringskontrakten tillater bare
seks inline custom-property-verdier og 32 SVG-geometriattributter hos fire eksakte
statistikkeiere. Nye visualiseringskanaler krever en eksplisitt kontraktendring og kan bare
beskrive datadrevet geometri, aldri produktidentitet.
