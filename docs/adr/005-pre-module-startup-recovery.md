# ADR-005: Gjenoppretting før appmodulen starter

> **Status:** Godkjent
>
> **Dato:** 2026-08-23

## Kontekst

Statisk SPA-hosting kan levere en ny HTML-fil mens en åpen fane fortsatt forsøker å laste utdaterte,
hash-baserte JavaScript-chunks. Feilen kan oppstå før SvelteKit-runtime, platformlaget og appens
vanlige feilflater har startet. `src/app.html` trenger derfor et lite gjenopprettingslag som kan
hente oppdatert HTML og oppstartsressurser.

GitHub Pages kan samtidig dele origin med andre apper. `localStorage`, `sessionStorage` og Cache
Storage er origin-scoped, ikke base-path-scoped. En generell nullstilling fra bootstrapen kan derfor
logge brukeren ut, slette appdata eller påvirke andre apper på samme origin.

## Beslutning

1. `src/app.html` kan lytte etter Vites `vite:preloadError` og feil på inngangsmodulen før
   SvelteKit-runtime har startet. `vite:preloadError` kanselleres ikke: Vite må avvise importen med
   den opprinnelige feilen i stedet for å gi SvelteKit en `undefined` routemodul.
2. Recovery markerer dokumentet mens den pågår, viser oppstartsflaten også når feilen oppstår etter
   appstart, henter HTML med `cache: "no-store"`, varmer kun ressursene som den nye HTML-filen peker
   på, og erstatter dokumentet eller gjør en vanlig navigasjon som fallback. Feilen rapporteres ikke
   separat av SvelteKit-hooken eller appens runtime-oppstart mens denne recoveryen er aktiv.
3. Bootstrapen kan ikke lese, endre eller slette `localStorage` eller Cache Storage.
4. Bootstrapen kan ikke rydde `sessionStorage`. Det eneste tillatte storage-unntaket er å lese og
   skrive den private nøkkelen `banebooking:asset-recovery-at` for å hindre reload-løkker.
5. Auth-, tema-, tenant- og andre produktdata forblir eid av `platform/storage`; recovery endrer
   aldri disse dataene og lover derfor heller ikke utlogging eller nullstilling i brukerflaten.
6. Det smale unntaket håndheves av `scripts/check-architecture-boundaries.mjs`.

## Konsekvenser

- Utdaterte chunks kan gjenopprettes før appen har startet.
- En utdatert routechunk etter appstart gir samme recoveryflate og blir ikke omskrevet til en
  misvisende intern SvelteKit-feil.
- Recovery kan ikke løse en korrupt produktverdi ved å slette all nettleserdata; slike feil må
  håndteres av den ansvarlige platformadapteren.
- En app under GitHub Pages-base path påvirker ikke søskenapper på samme origin.
- Bootstrap-scriptet forblir et avgrenset, dokumentert unntak fra platformlagets storage-eierskap.

## Verifikasjon

- Arkitekturkontrollen avviser `localStorage`, Cache Storage og alle andre `sessionStorage`-nøkler i
  `src/app.html`.
- Produksjonsbuildene verifiserer statiske fallback-filer og hash-baserte oppstartsressurser.
- Produksjons-E2E laster direkte routes og refresh for både root path og GitHub Pages-base path.

## Referanser

- [Vite: Load error handling](https://vite.dev/guide/build#load-error-handling)
- [SvelteKit: Project structure](https://svelte.dev/docs/kit/project-structure)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
