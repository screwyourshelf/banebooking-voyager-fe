# Migreringsstatus

> **Status:** Fullført — SvelteKit-, styling- og avsluttende repoopprydding er grønne
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** Ingen WP-/SWP-pakke
>
> **Sist oppdatert:** 2026-08-26

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
- Lokal utviklingsinnlogging sender backendens eksplisitte `DevelopmentBearer`-scheme. Medlem,
  utvidet bruker og klubbadministrator kan derfor testes mot lokal backend uten Supabase i
  produksjon eller Playwright-spesifikk headeromskriving.
- Browserens percent-kodede paths normaliseres én gang i tenantplattformen før routes sammenlignes.
  Norske route-navn fungerer derfor likt i policyguards, kapabilitetsguards og aktiv navigasjon,
  mens kodede skilletegn som `%2F` fortsatt ikke kan bli falske pathsegmenter.
- Policyredirecten knytter hvert navigasjonsforsøk til både kilde-URL og mål. En samtidig retur fra
  login kan derfor ikke etterlate brukeren i redirect-loading dersom den avbryter første forsøk.
- Bookingens schedule-rader har samme kompakte informasjonsgeometri for statiske, handlings- og
  ekspanderbare rader. Den offentlige `CollectionRow`-kontrakten eier tid, status, sekundærlinje,
  ekspanderingsindikator og hurtighandling; bookingfeaturen har ingen lokal styling.
- SPA-fallbacken har en statisk standardtittel og egne gyldige `robots.txt`- og `llms.txt`-filer.
  Inaktiv mobilnavigasjon bruker den kontraststerkere tekstrollen, og loading-sheen animerer bare
  `transform` slik at browseren kan kompositere bevegelsen.

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

Lokal utviklingsauth er rettet uten backend- eller produksjonsauthendringer:

- API-klienten mottar nå en typed kombinasjon av authscheme og token fra authadapteren i stedet for
  å anta `Bearer` for alle sesjoner
- Supabase beholder `Bearer`, mens alle tre lokale profiler bruker `DevelopmentBearer` direkte
- E2E-harnessen registrerer fortsatt egne testdata for opprydding, men omskriver ikke lenger
  headere og kan derfor ikke maskere forskjellen mellom manuell testing og Playwright
- tom `204`-respons fra det anonyme brukerendepunktet normaliseres til `null`, slik at Query-cachen
  aldri mottar ugyldig `undefined`

Den obligatoriske kunngjøringsguarden håndterer browser-URL-er med norske tegn:

- tenantplattformens delte pathnormalisering brukes av policyguard, kapabilitetsguard og aktiv
  navigasjon i stedet for lokale dekodingsvarianter
- en innlogget bruker med ulest kunngjøring kommer frem til `/kunngjøring` uten å bli stående i
  redirect-loading, og en avsluttet guardflate sender brukeren tilbake til tenantroten
- en konkurrerende retur fra login utløser et nytt redirectforsøk fra den ferdig navigerte URL-en;
  en deterministisk Playwright-fixture dekker kappløpet uten å mutere backenddata
- normaliseringen dekoder teksttegn med `decodeURI`, bevarer kodede skilletegn og feiler lukket ved
  ugyldig percent-koding; kontrakten og begge guardretninger er dekket av regresjonstester
- implementasjonen og testene ligger i `src/lib/platform/tenant/tenant.ts`,
  `src/lib/features/session/guard-model.ts`, `src/lib/features/session/navigation-model.ts` og deres
  samlokaliserte testfiler
- navigasjonsretryen og den deterministiske browserregresjonen ligger i
  `src/lib/features/session/SessionGate.svelte`, `e2e/harness.ts` og
  `e2e/critical-flows.spec.ts`

Bookingens mobilparitet er rettet gjennom det offentlige UI-laget:

- `CollectionRow` lar nå summary-anatomien eie samme entity- eller schedule-grid uavhengig av om
  raden er statisk, har en hurtighandling eller delegerer ekspandering til accordion-primitiven
- `ScheduleTime` eier produksjonens tankestrek foran sluttiden, og `DatePicker` sin
  bookingpresentasjon viser «Velg dato» når «I dag» eller «I morgen» er det aktive valget
- en egen mørk mobilreferanse beskytter den kompakte bookinglisten; desktopreferansen og
  kalenderens mobilreferanse er oppdatert etter den godkjente paritetsrettingen
- implementasjon og kontrakttester ligger i `src/lib/ui/patterns`, `src/lib/ui/primitives` og
  `e2e/visual-regressions.spec.ts`; bookingfeaturen og backend er uendret

## Lighthouse-vedlikehold

PageSpeed-rapportene fra 2026-08-26 er fulgt opp uten backendendringer:

- `src/app.html` eier standardtittelen `Banebooking` før SvelteKit starter;
  `scripts/verify-production-builds.mjs` og produksjons-E2E låser tittelen i begge hostfallbackene
- `public/robots.txt` svarer med gyldig crawlpolicy i stedet for SPA-fallbacken, og
  `public/llms.txt` har navngitt Markdown-innhold og offentlige produktlenker
- `NavigationLink` og `NavigationAction` bruker `text-ink-soft` for inaktive elementer i
  mobilbunnen, mens aktiv state og øvrige navigasjonsflater er uendret
- `page-loading-sheen` og `collection-loading` animerer `transform` fremfor background-position;
  den genererte stylingbaselinen er oppdatert og alle visuelle referanser er uendret

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
- Lighthouse rapporterer fortsatt den delte UI-chunken som omtrent 62 KiB ubrukt JavaScript på
  bookingruten og den samlede stylesheeten som renderblokkerende. Å redusere disse krever en egen
  beslutning om finere offentlige UI-entrypoints eller kritisk CSS; dagens produksjonsbudsjetter er
  uendret og grønne.

## Blokkeringer og beslutninger

Ingen backendblokkeringer eller åpne produktbeslutninger. Tenantlogoene er eksplisitt godkjent som
varig navigasjonsidentitet. Desktoprekkefølgen og det faste bunnområdet er eksplisitt godkjent som
produksjonsparitet, mens mobilstrukturen og Sveltes tilgjengelighetsforbedringer skal beholdes.

En første API-/fullstackytelsesgjennomgang er bevart i
[`api-performance-follow-up.md`](./api-performance-follow-up.md). Den er parkert som en separat
oppfølging etter at migreringsbranchen er ferdig behandlet, er ikke en backendblokkering og skal
ikke aktiveres uten en eksplisitt brukerbeslutning.

## Neste eksakte steg

Ingen migreringspakke eller oppryddingsleveranse står åpen. `/start` skal bekrefte denne tilstanden
og vente på en konkret produkt- eller vedlikeholdsoppgave; den skal ikke opprette en ny WP-/SWP-pakke.

## Siste beståtte verifikasjon

| Kontroll                           | Resultat                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Målrettet navigasjons-/shelltest   | 4 testfiler, 30 tester                                                     |
| Målrettet auth-/API-regresjon      | 5 testfiler, 15 tester                                                     |
| Målrettet booking-/UI-regresjon    | 4 testfiler, 40 tester                                                     |
| Manuell lokal rolleflyt            | Medlem, utvidet bruker og klubbadministrator mot lokal backend             |
| Målrettet path-/guardregresjon     | 3 testfiler, 20 tester                                                     |
| Manuell lokal kunngjøringsflyt     | Medlemsredirect og hard refresh; korrekt innhold uten konsollfeil          |
| `npm test`                         | 96 testfiler, 352 tester                                                   |
| `npm run check`                    | Type, arkitektur, legacy, statisk analyse, design, styling, lint og format |
| Knip                               | 0 døde filer, pakker, importer, eksporter eller typer                      |
| Kritiske Playwright-flyter         | 4/4; tre profiler, policyredirect og lokale testdata gjenopprettet         |
| Visuelle Playwright-referanser     | 12/12; booking desktop/mobil og kalendergrunnlag verifisert                |
| `npm run test:e2e:production`      | 8/8 ruter for begge hostartefakter                                         |
| Lighthouse-regresjonskontrakter    | Tittel, crawlerfiler, mobilkontrast og kompositerte loading-keyframes      |
| Produksjonsbudsjett                | 37,4 KiB initial JS gzip, 27,9 KiB CSS gzip, 120,5 KiB største lazy JS     |
| `npm audit --audit-level=moderate` | 6 lave; 0 moderate, høye eller kritiske                                    |
| Parkert API-oppfølgingsnotat       | Prettier for tre dokumenter; ingen runtime- eller backendendring           |
| `git diff --check`                 | Bestått                                                                    |
