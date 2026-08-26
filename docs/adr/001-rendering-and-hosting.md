# ADR-001: Rendering og hosting

> **Status:** Godkjent
>
> **Dato:** 2026-08-22

## Kontekst

Frontenden er en statisk deployet SPA med base path, fallback-routing og støtte for både GitHub
Pages og Cloudflare Pages. Supabase-sesjonen gjenopprettes i nettleseren. En full overgang til SSR
vil derfor også berøre hosting, cookies og autharkitektur.

Ren SPA-rendering har samtidig kjente oppstarts-, robusthets- og SEO-ulemper. Vi skal ikke spre
nettleseravhengigheter slik at en senere overgang til SSR krever en ny omskriving.

## Beslutning

1. Frontenden bruker SvelteKit med `adapter-static` og hosttilpasset fallback.
2. Klientrenderte app-ruter får `ssr = false` på nærmeste felles layout, ikke i hver side.
3. Offentlige sider kan eksplisitt velge `ssr = true` og `prerender = true` når data og hosting gjør
   det forsvarlig.
4. `paths.base`, asset paths, trailing slash og fallback verifiseres for både root-domene og
   GitHub Pages-understi.
5. Browseravhengig kode isoleres i `*.client.ts` eller bak eksplisitte adapters.
6. Universal domain-, contract- og API-kode kan ikke importere `window`, `document`, browser
   storage eller en browser-only Supabase-klient.
7. En senere SSR-adapter skal kunne innføres routevis uten å flytte feature- eller UI-kode.

## Konsekvenser

- Dagens deploymodell og authsemantikk beholdes.
- Dynamiske app-ruter beholder SPA-ulempene.
- Kodegrensene blir strengere enn det statisk hosting alene krever.
- Full SSR krever en egen beslutning om cookie-basert Supabase-sesjon og hosting, men ikke en ny
  featurearkitektur.

## Verifikasjon

- Direkte lasting og refresh av en tenant-route fungerer i produksjonslik preview.
- `auth/callback` fungerer med og uten base path.
- En build produserer korrekt fallback for målhosten.
- Ingen universal modul importerer browser-only platformkode.

## Referanser

- [SvelteKit: Single-page apps](https://svelte.dev/docs/kit/single-page-apps)
- [SvelteKit: Static site generation](https://svelte.dev/docs/kit/adapter-static)
