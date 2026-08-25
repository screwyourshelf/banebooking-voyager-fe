# Styling guards

Denne mappen eier den maskinlesbare kontrakten og de isolerte fixturene for stylinggrensene i
ADR-006.

- `contract.json` er eneste kilde for stabile regel-ID-er, lageiere, utilityvokabular, den eksakte
  Tailwind-til-produktrolle-mappingen, custom-property-eierskap, cascade layers og det lukkede
  visualiseringsunntaket.
- `analyze.mjs` orkestrerer én oppgitt Svelte- eller CSS-kilde gjennom de navngitte policyene.
- `public-ui-spread-policy.mjs` beviser native UI-spreads; typed rest-props kan ikke gjeninnføre
  `class`/`style` gjennom en union, intersection, bred indeks, alias eller shadowed binding.
- `svelte-script-policy.mjs` eier imperative DOM-stylingsinks, mens `svelte-ast.mjs` deler de små
  AST-primitivene uten å blande policyene.
- `custom-property-references.mjs` tokeniserer gyldige `var()`-referanser med whitespace, escapes
  og nested fallback for styling-, design- og baselineportene.
- `theme-contract.mjs` beviser at hver godkjente utility genereres fra sin registrerte
  `@theme inline`-rolle, og at produktrollen kan løses i både lyst og mørkt theme.
- `cascade-contract.mjs` oppdager hele den registrerte produksjons-CSS-flaten og beviser at hver
  regel ligger i Tailwinds `theme`, `base`, `components` eller `utilities`-lag.
- `production-tree-contract.mjs` oppdager alle produksjonsfiler under `src`, kjører de ni øvrige
  reglene og krever null diagnostics. Schema 5 klassifiserer alle Svelte-attributtkanaler,
  bevisbare spreads, dynamiske elementer/komponenter, rå HTML, stylesheet-markup og imperative
  DOM-stylingsinks fail-closed. Legitime semantiske DOM-operasjoner har egne positive bevis.
- `src/lib/ui/public-html-attributes.test.ts` avleder alle runtimekomponenter direkte fra
  `src/lib/ui/index.ts` og gjør `class`/`style` til en typefeil for enhver nåværende eller ny
  offentlig eksport; den håndskrevne komponentlisten er fjernet.
- `fixtures/manifest.json` gir hver av de 34 små fixturene en virtuell produksjonssti, forventet
  regel-ID og eksakt diagnostikk.
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

`src/app.html` er foreløpig bare målt av stylingbaselinen. Pre-module-presentasjonen er ikke en del
av schema 5-produksjonstreguarden og kan ikke gjøres til et permanent stylingunntak før den
pågående SWP-7-stoppregelen er besluttet og dokumentert.
