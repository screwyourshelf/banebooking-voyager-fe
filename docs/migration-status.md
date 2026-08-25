# Migreringsstatus

> **Status:** Fullført — SvelteKit-, styling- og avsluttende repoopprydding er grønne
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** Ingen WP-/SWP-pakke
>
> **Sist oppdatert:** 2026-08-25

## Nåtilstand

- React/Vite-frontenden og React-runtimeavhengighetene er fjernet. Svelte 5 og SvelteKit er eneste
  frontendimplementasjon.
- Produktadferd, URL-er, auth-/tenantflyt og backend-API-er er bevart uten backendendringer.
- Cloudflare Pages- og GitHub Pages-artefaktene bruker samme statiske SPA-kontrakt, med eksplisitt
  hostfallback og verifisert base path.
- Routes er tynne, features er isolerte, og contracts, domain, platform og offentlig UI har
  maskinelt håndhevede avhengighetsgrenser.
- Tailwind-/theme-løftet SWP-0–SWP-7 er fullført. Styling-, theme-, cascade-, produksjonstre- og
  oppstartsdokumentkontraktene inngår i `npm run check`.
- Tenantlogoer er del av navigasjonskontrakten. Navigasjonen prøver tenantens SVG, deretter WebP og
  til slutt standardlogoen, også under en konfigurert base path.
- Desktopnavigasjonen følger produksjonens informasjonsarkitektur: tenantidentitet, hovedlenker,
  person-/adminseksjoner og til slutt et fast bunnområde med tema før konto eller innlogging.
  «Hovedmeny» og «Konto og visning» rendres ikke som synlige seksjonsoverskrifter. Mobilstrukturen
  er uendret.
- Håndskrevne transporttyper beskriver bare kontrakter frontenden faktisk konsumerer. Sammensatte
  DTO-deler er private i kontraktmodulen; ubrukt endpointflate beholdes ikke som manuell kopi.
- Knip-porten tillater ingen død fil-, pakke-, import-, eksport- eller typeflate.

## Avsluttende opprydding

Den avsluttende vedlikeholdsleveransen er fullført og verifisert:

- gjeninnføring av tenantlogoer med fallback og kontrakttester
- fjerning av ubrukte bakgrunner og tenant-spesifikke faviconkopier; globale faviconer beholdes
- innsnevring av transporteksporter og fjerning av Knip-allowlisten
- fjerning av det ubrukte `@`-aliaset og path-resolverte arkitekturgrenser
- konsolidering av migreringsdokumentasjonen til fullført vedlikeholdsmodus
- fjerning av tomme lokale fixture-/previewmapper og regenererbare test-/buildartefakter

## Godkjent paritetsvedlikehold

Desktopmenyens produksjonsrekkefølge er tilbakeført uten å gjeninnføre React-struktur:

- det offentlige `Navigation`-patternet eier nå fast identitet, rullbart lenkeområde og fast
  bunnområde; `AppShell` beholder flexgeometrien på alle desktopbreakpoints
- hoved-, person- og adminlenker kommer før tema og konto/innlogging, og tema kommer først i
  bunnområdet for både anonym og innlogget tilstand
- Svelte-forbedringene for `nav`, `aria-current`, native kontroller, fokusretur, eksplisitt lukking
  og pending-lås er beholdt
- fire desktopreferanser er oppdatert etter den godkjente kontraktendringen; alle fem
  mobilreferanser er uendret

## Permanente arkitektur- og produktkontrakter

- [`sveltekit-architecture.md`](./sveltekit-architecture.md) beskriver aktiv lagdeling, dataflyt og
  routeeierskap.
- [`product-design-rules.md`](./product-design-rules.md) beskriver aktiv visuell, semantisk og
  responsiv produktadferd.
- [`adr/`](./adr/README.md) inneholder bindende arkitekturbeslutninger, inkludert SPA/static-hosting,
  auth/tenant, UI-eierskap og de to smale pre-module-unntakene.
- [`development-and-operations.md`](./development-and-operations.md) beskriver lokale kommandoer,
  kvalitetsporter og produksjonsbygg.
- [`behavior-inventory.md`](./behavior-inventory.md) er paritetsreferanse for routes, roller og
  kritiske brukerflyter.

## Historisk migreringsbevis

- [`migration-plan.md`](./migration-plan.md) og
  [`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md) er fullførte utførelsesplaner,
  ikke aktive arbeidskøer.
- [`wp-7-parity-and-cleanup-inventory.md`](./wp-7-parity-and-cleanup-inventory.md),
  [`wp-7-production-evidence.md`](./wp-7-production-evidence.md),
  [`styling-reference-matrix.md`](./styling-reference-matrix.md),
  [`styling-conformance-evidence.md`](./styling-conformance-evidence.md),
  [`swp-5-route-feature-audit.md`](./swp-5-route-feature-audit.md) og
  [`swp-6-component-api-audit.md`](./swp-6-component-api-audit.md) bevarer målt migreringsbevis.
- Detaljert checkpointrekkefølge og tidligere mellomtilstander finnes i git-historikken, ikke i
  denne statusfilen.

## Aksepterte tradeoffs

- App-rutene er en statisk SPA med `ssr = false` for å bevare eksisterende hosting og browser-auth.
  Ytelses- og SEO-avveiningen er godkjent i ADR-001.
- `src/app.html` har de eksakte pre-module recovery- og presentasjonsflatene i ADR-005 og ADR-007.
  Guardene tillater ikke at unntakene utvides til ordinær produktkode.
- `react-is` kan finnes transitivt gjennom testverktøyenes formattering, men er ikke del av React-
  eller produksjonsruntime.
- En fersk `npm ci` kan få `npm ls --depth=0` til å vise fem valgfrie WASM-hjelpepakker som
  `extraneous`. De opprettes på nytt fra lockfilens valgfrie Oxc-/Tailwind-verktøykjede og er ikke
  manuelle toppnivåavhengigheter eller gamle installasjonsrester.
- Siste dependencyaudit rapporterte seks lave transitive funn og ingen moderate, høye eller kritiske
  funn. Det finnes ikke en kompatibel automatisk oppgradering som fjerner dem; tvungen majorendring
  er ikke en del av migreringsslutten.
- Den store `styling-baseline.json` er et generert, aktivt kontrollartefakt. Den beholdes fordi
  `npm run check` sammenligner kilde- og produksjonsmålinger mot den; mennesker skal bruke de
  kortere normative dokumentene over.

## Blokkeringer og beslutninger

Ingen backendblokkeringer eller åpne produktbeslutninger. Tenantlogoene er eksplisitt godkjent som
varig navigasjonsidentitet. Desktoprekkefølgen og det faste bunnområdet er eksplisitt godkjent som
produksjonsparitet, mens mobilstrukturen og Sveltes tilgjengelighetsforbedringer skal beholdes.

## Neste eksakte steg

Ingen migreringspakke eller oppryddingsleveranse står åpen. `/start` skal bekrefte denne tilstanden
og vente på en konkret produkt- eller vedlikeholdsoppgave; den skal ikke opprette en ny WP-/SWP-pakke.

## Siste beståtte verifikasjon

| Kontroll                           | Resultat                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Målrettet navigasjons-/shelltest   | 4 testfiler, 30 tester                                                     |
| `npm test`                         | 95 testfiler, 348 tester                                                   |
| `npm run check`                    | Type, arkitektur, legacy, statisk analyse, design, styling, lint og format |
| Knip                               | 0 døde filer, pakker, importer, eksporter eller typer                      |
| Kritiske Playwright-flyter         | 3/3 bestått; egne lokale testdata gjenopprettet                            |
| Visuelle Playwright-referanser     | 11/11 bestått; 4 desktop oppdatert, 5 mobil uendret                        |
| `npm run test:e2e:production`      | 8/8 ruter for begge hostartefakter                                         |
| Produksjonsbudsjett                | 37,4 KiB initial JS gzip, 27,9 KiB CSS gzip, 120,5 KiB største lazy JS     |
| `npm audit --audit-level=moderate` | 6 lave; 0 moderate, høye eller kritiske                                    |
| `git diff --check`                 | Bestått                                                                    |
