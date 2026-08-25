# SvelteKit-målarkitektur

> **Status:** Godkjent målarkitektur for migreringen
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Sist oppdatert:** 2026-08-23

## Formål

Frontend skal omskrives fra React/Vite til Svelte 5 og SvelteKit uten å endre produktets
funksjonelle kontrakt mot backend. Migreringen er en samlet lift-and-shift på egen branch.
React-applikasjonen er produksjonsreferanse frem til SvelteKit-versjonen har funksjonsparitet.

Målarkitekturen skal:

- gi tydelig eierskap til routing, serverdata, lokal state og UI-atferd
- beholde det etablerte designspråket uten å kopiere React-komponentstrukturen
- isolere Supabase, nettleser-API-er og hostingvalg slik at senere SSR er mulig
- organisere kode etter produktfeatures uten skjulte avhengigheter mellom dem
- gjøre arkitekturgrensene maskinelt kontrollerbare

Følgende ADR-er er bindende deler av målarkitekturen:

- [ADR-001: Rendering og hosting](./adr/001-rendering-and-hosting.md)
- [ADR-002: State, data og API](./adr/002-state-data-and-api.md)
- [ADR-003: Autentisering og tenant-routing](./adr/003-authentication-and-tenancy.md)
- [ADR-004: UI- og komponentgrenser](./adr/004-ui-and-component-boundaries.md)
- [ADR-005: Gjenoppretting før appmodulen starter](./adr/005-pre-module-startup-recovery.md)
- [ADR-006: Tailwind-styling og theme-eierskap](./adr/006-tailwind-styling-and-theme-ownership.md)
- [ADR-007: Presentasjon før appmodulen starter](./adr/007-pre-module-startup-presentation.md)

## Arkitekturprinsipper

1. **Svelte, ikke React oversatt linje for linje.** React-hooks, providers og container/view-par
   kopieres ikke mekanisk. SvelteKit-layouts, route data, snippets, runes og context brukes der de
   eier problemet bedre.
2. **Én eier per tilstand.** URL, route data, Query-cache, context og lokal komponentstate har
   forskjellige ansvarsområder. Samme data lagres ikke parallelt uten en eksplisitt hydreringsbro.
3. **Avhengigheter peker innover.** Routes komponerer features. Features bruker offentlig UI,
   domenelogikk og plattformtjenester. Lavere lag kjenner aldri routes eller features.
4. **Backend er autoritativ.** Frontend presenterer kapabiliteter og valideringsresultater fra
   backend og utleder ikke autorisasjonsregler på nytt.
5. **Tilgjengelighet i fundamentet.** Komplisert fokus-, tastatur- og ARIA-atferd delegeres til
   Bits UI gjennom våre egne primitive komponenter.
6. **Webstandarder først.** Native `fetch`, `URL`, `FormData`, semantisk HTML og vanlige forms
   foretrekkes fremfor egne abstraksjoner når de dekker behovet.
7. **Eksperimentelle rammeverks-API-er er ikke fundament.** SvelteKit remote functions tas ikke i
   bruk mens de er eksperimentelle og applikasjonen har separat .NET-API og statisk hosting.
8. **AI-first lesbarhet er en arkitekturegenskap.** Eierskap, dataflyt, tilstander og offentlige
   innganger skal kunne utledes fra struktur, typer og tester uten tidligere samtalekontekst.

## AI-first arkitekturkontrakt

Arkitekturen skal redusere mengden implisitt kontekst en ny AI-agent må rekonstruere før en sikker
endring. Dette påvirker kodeformen direkte:

- Mappestrukturen uttrykker produktansvar; filnavn uttrykker rollen i ansvaret.
- En feature har én offentlig inngang. Routes og andre konsumenter importerer ikke tilfeldige
  internfiler.
- Transporttyper, domenemodeller, platformadapters og UI-kontrakter holdes eksplisitt adskilt.
- Tilstandsrom som auth, guards og mutations modelleres som typed, endelige states fremfor løse
  kombinasjoner av booleans.
- Sideeffekter ligger ved en synlig platform- eller querygrense og injiseres når det gjør kontrakten
  testbar. Importtid skal ikke skjule nettverk, storage eller brukeravhengig state.
- Repetert struktur er akseptabel når den gjør eierskap synlig; abstraksjon innføres først når et
  stabilt felles begrep finnes.
- Tester navngir produktinvarianter og plasseres ved koden de beskytter.
- Kommentarer forklarer beslutninger som ikke kan uttrykkes gjennom struktur og typer. Store
  forklaringsblokker er et signal om at modulgrensen bør vurderes på nytt.

Disse reglene supplerer avhengighetstabellen under og inngår i kvalitetsporten for hver
arbeidspakke.

## Mappestruktur

```text
src/
├── routes/
│   ├── +layout.svelte
│   ├── +error.svelte
│   ├── auth/
│   │   └── callback/
│   │       └── +page.svelte
│   └── [[slug=tenant]]/
│       ├── +layout.ts
│       ├── +layout.svelte
│       ├── (public)/
│       ├── (protected)/
│       └── (admin)/
│
└── lib/
    ├── platform/
    │   ├── api/
    │   ├── auth/
    │   ├── config/
    │   ├── observability/
    │   └── storage/
    ├── contracts/
    ├── domain/
    ├── ui/
    │   ├── primitives/
    │   ├── patterns/
    │   ├── navigation/
    │   ├── feedback/
    │   └── shell/
    └── features/
        ├── booking/
        ├── arrangementer/
        ├── arrangement-admin/
        ├── brukere/
        └── ...
```

Mappene beskriver ansvar, ikke tekniske filtyper. Det skal ikke opprettes generelle mapper som
`helpers`, `common`, `misc` eller `services` uten et mer presist domene.

### Tillatte avhengigheter

| Fra             | Kan importere                                                             | Kan ikke importere                        |
| --------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| `routes`        | offentlige feature-API-er, `ui`, `platform`                               | interne featurefiler                      |
| `features`      | egen feature, `domain`, `contracts`, offentlig `ui`, offentlig `platform` | `routes`, andre features                  |
| `ui/patterns`   | `ui/primitives`, andre godkjente UI-byggesteiner                          | features, API, auth                       |
| `ui/primitives` | Bits UI, små stylingverktøy                                               | features, domene, API                     |
| `domain`        | `contracts`, andre rene domenemoduler                                     | Svelte-komponenter, nettleser-API, routes |
| `platform`      | tredjepartsintegrasjoner og webstandarder                                 | features, produkt-UI                      |

Når to features trenger samme funksjonalitet, flyttes den ikke automatisk til en generell mappe.
Den løftes først når det finnes et tydelig felles begrep med et stabilt ansvar.

## Routing og layouts

SvelteKits filbaserte router er eneste route-definisjon. Det skal ikke bygges en parallell
`routeConfig` som gjentar URL-strukturen.

```text
routes/
├── auth/callback/+page.svelte
└── [[slug=tenant]]/
    ├── +layout.ts                 tenantoppløsning
    ├── +layout.svelte             tenant-context og app-shell
    ├── (public)/+page.svelte      booking
    ├── (public)/login/+page.svelte
    ├── (protected)/+layout.ts     innloggingsguard
    ├── (protected)/minside/+page.svelte
    ├── (protected)/bookinger/+page.svelte
    └── (admin)/admin/...          kapabilitetsguard
```

Route groups uttrykker felles layout og tilgangsnivå uten å påvirke URL-en. `+page.svelte` skal være
tynn: den leser typed page data, komponerer en feature og setter eventuell metadata. Domene-UI og
mutasjoner skal ikke implementeres i routefilen.

`[[slug=tenant]]` normaliserer dagens to driftsformer:

- multi-tenant: slug finnes i URL
- dedikert tenant-build: slug mangler i URL og kommer fra offentlig build-konfigurasjon

En param matcher avviser reserverte toppnivåsegmenter. `auth/callback` er en eksplisitt statisk
route og ligger utenfor tenant-treet.

## Lagene

### `platform`

Isolerer integrasjoner og miljøavhengig kode:

- `api`: HTTP-klient, feilmodell, auth-header, 401-håndtering
- `auth`: Supabase-adapter, utviklingsadapter og typed auth-context
- `config`: validerte offentlige miljøvariabler og base path
- `storage`: trygg tilgang til nettleserlagring
- `observability`: Sentry og rapportering av tekniske feil

Supabase, Sentry og browser storage importeres bare gjennom dette laget. Browseravhengige moduler
navngis `*.client.ts` eller lastes eksplisitt på klienten.

Det eneste unntaket er den dokumenterte pre-module recoveryen i `src/app.html`: før platformlaget
kan starte, kan den lese og skrive sin ene private `sessionStorage`-nøkkel for reload-cooldown.
Den kan ikke lese eller slette produktdata, `localStorage` eller origin-delt Cache Storage. Se
[ADR-005](./adr/005-pre-module-startup-recovery.md).

Samme dokument har én eksakt pre-module-presentasjon som må fungere når den bygde stylesheeten
mangler. Elleve `--app-startup-*`-roller eies av theme-filen og speiles som identiske inline-
fallbacks; selectors, metadata og stylekanaler er låst av produksjonstreguarden. Unntaket kan ikke
brukes av routes, features eller offentlig UI. Se
[ADR-007](./adr/007-pre-module-startup-presentation.md).

### `contracts`

Inneholder DTO-er som speiler HTTP-kontrakten mot .NET-API-et. Kontraktene er transporttyper, ikke
UI-modeller. Eksisterende typer flyttes hit før de eventuelt forbedres. Respons- og requesttyper
skal kunne genereres fra OpenAPI senere uten at features må reorganiseres.

### `domain`

Inneholder ren, rammeverksuavhengig logikk:

- dato- og tidsberegninger
- sortering og gruppering
- presentasjonsmodeller
- kapabilitetsfortolkning
- mapping mellom transporttyper og featuremodeller

Modulene har ingen sideeffekter og testes med Vitest uten DOM.

### `features`

Hver feature er en vertikal produktmodul:

```text
features/booking/
├── api.ts                 endpointfunksjoner
├── query-keys.ts          stabil key factory
├── queries.ts             queries og mutations
├── model.ts               featuretyper og ren featurelogikk
├── state.svelte.ts        reaktiv arbeidsflyt når den er delt av flere komponenter
├── components/
│   ├── BookingScreen.svelte
│   ├── BookingSchedule.svelte
│   └── BookingSlotRow.svelte
└── index.ts               eneste offentlige inngang
```

Ikke alle features trenger alle filene. Strukturen opprettes etter reelt ansvar, ikke som tomt
seremonielt rammeverk. `index.ts` eksporterer bare det routes eller andre tillatte konsumenter
trenger.

Features importerer ikke hverandre. Dersom arrangementvisningen og booking deler en faktisk
produktkapabilitet, plasseres den i et eksplisitt felles domene eller et delt UI-mønster.

## State- og datamodell

| Tilstand                                       | Eier                         | Eksempel                               |
| ---------------------------------------------- | ---------------------------- | -------------------------------------- |
| Delbar eller reload-stabil navigasjonstilstand | URL                          | periode, sortering, aktiv adminseksjon |
| Route- og tenantdata                           | `load`/`page.data`           | normalisert slug, route guard-resultat |
| Data fra .NET-API                              | TanStack Svelte Query        | baner, bookinger, brukere              |
| Appomspennende klientstate                     | typed Svelte context         | auth, tenant, query client             |
| Lokal arbeidsflyt                              | `$state`/`$derived`          | dialog åpen, valgt slot, skjemautkast  |
| Midlertidig navigasjonstilstand                | SvelteKit snapshot ved behov | uferdig lokal UI-state                 |
| Persistente klientpreferanser                  | `platform/storage`           | tema                                   |

Regler:

- `load` skal være fri for sideeffekter.
- Query-data kopieres ikke inn i `$state` for vanlig lesing.
- Skjemautkast kan initialiseres fra query-data, men er deretter eksplisitt lokal state.
- Query keys eies av feature og opprettes gjennom en key factory.
- Mutasjoner og invalidation ligger sammen i featureens querymodul.
- Data som påvirker URL-resultatet, legges i search params fremfor global state.
- Modulglobale mutable runes brukes ikke til bruker- eller requestspesifikk state.
- `.svelte.ts` brukes for gjenbrukbar reaktiv logikk, ikke som standarderstatning for rene
  TypeScript-funksjoner.

TanStack Query er den autoritative cache for serverdata. `load` kan prefetch eller levere
`initialData`, men samme ressurs skal ikke ha en separat, konkurrerende cache.

## API-klient

Axios erstattes med en liten klient rundt native `fetch`:

```ts
type ApiClientOptions = {
  fetch: typeof globalThis.fetch;
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
  onUnauthorized: () => Promise<void>;
};

const api = createApiClient(options);
```

Klienten eier transportansvar:

- base URL og base path
- JSON-serialisering
- timeout og abortsignal
- auth-header
- normalisert `ApiError`
- sentral 401-håndtering

Endpointfunksjoner mottar en klient og returnerer typed kontrakter. De kjenner ikke Query, Svelte
eller UI. Komponenter gjør aldri direkte HTTP-kall.

## Autentisering og tilgang

Auth eksponeres som et lite, rammeverksnøytralt grensesnitt og en typed context-instans:

```ts
type AuthState = {
  status: "initializing" | "anonymous" | "authenticated";
  user: AuthUser | null;
  getAccessToken(): Promise<string | null>;
  signOut(): Promise<void>;
};
```

Supabase-adapteren og utviklingsadapteren implementerer samme kontrakt. Features skal ikke kjenne
sesjonskilden. Route guards gir riktig navigasjon og oppstartstilstand, men backend er alltid den
faktiske autorisasjonsgrensen.

## UI-arkitektur

UI har tre nivåer:

```text
Bits UI / native HTML
        ↓
ui/primitives
        ↓
ui/patterns
        ↓
featurekomponenter
```

### Primitives

Primitives løser lavnivåkontroller som `Button`, `Input`, `Dialog`, `Select`, `Popover`, `Menu`,
`Tooltip`, `Switch` og `Calendar`. Enkle kontroller bruker native HTML. Bits UI brukes når
komponenten krever robust fokusstyring, tastaturnavigasjon, portal eller sammensatt ARIA-atferd.

Bare `ui/primitives` kan importere `bits-ui`. Vi wrapper det vi faktisk bruker og oppretter ikke en
lokal kopi av hele bibliotekets komponentkatalog.

### Patterns

Patterns er det offentlige Banebooking-designsystemet: `Page`, `Collection`, `Form`, `Settings`,
`Dialog`, `Document`, navigation, feedback og loading. De eier semantikk, anatomi, størrelser,
Tailwind-basert visuell implementasjon og produktets `data-ui`/`data-part`-kontrakt.

Patterns komponeres med typed props og snippets. De eksponerer semantiske callbacks som
`onSave`, `onCancel` og `onSelect`, ikke interne DOM- eller Bits-hendelser.

### Features

Featurekomponenter uttrykker produktinnhold og arbeidsflyt. De:

- bruker offentlig UI-API
- lager ikke egne page shells, dialogs eller formfeltmønstre
- importerer aldri Bits UI
- gjør ikke HTTP-kall
- setter ikke produktets `data-ui` eller `data-part` selv
- har ingen feature-CSS, inline produktstyling, UI-klasseoverstyringer eller lokale visuelle
  Tailwind-komposisjoner, med maskinelt dokumenterte visualiseringsunntak

De bindende produktreglene i [`product-design-rules.md`](./product-design-rules.md) gjelder for
alle patterns og features.

## Svelte 5-konvensjoner

Ny kode bruker runes-modus konsekvent:

- `$props()` for props
- `$state` for eid, muterbar lokal state
- `$derived` for avledet state
- `$effect` bare for synkronisering med et eksternt system
- snippets og `{@render}` for innholdskomposisjon
- callback-props fremfor `createEventDispatcher`
- `createContext<T>()` fremfor utypede string keys

`$effect` brukes ikke til å beregne data som kan være `$derived`, hente vanlig serverdata eller
holde to lokale statekopier synkronisert. `bind:` brukes når toveis binding er den faktiske
komponentkontrakten, primært i skjemakontroller, og ikke som generell dataflyt mellom features.

## Feil, feedback og observability

- Forventede API-feil normaliseres til `ApiError` og presenteres gjennom felles feedbackmønstre.
- Uventede routefeil håndteres av nærmeste `+error.svelte`.
- Feltvalidering vises ved feltet; mutationfeil vises ved handlingen.
- 401 håndteres én gang i platformlaget og starter kontrollert utlogging.
- Sentry importeres bare fra `platform/observability` og skal ikke motta tokens eller sensitiv
  responsdata.

## Teststrategi

| Nivå              | Verktøy                              | Hva testes                                 |
| ----------------- | ------------------------------------ | ------------------------------------------ |
| Ren logikk        | Vitest                               | mapping, sortering, dato, kapabiliteter    |
| Komponentkontrakt | Svelte Testing Library + Vitest      | states, callbacks, semantikk               |
| Tilgjengelighet   | axe i utvalgte komponenttester       | primitives og patterns                     |
| Brukerflyt        | Playwright                           | login, booking, avbestilling, adminendring |
| Visuell paritet   | skjermbilder på definerte viewporter | app-shell og sentrale features             |

Ingen feature regnes som migrert før dens kritiske flyt har minst samme verifikasjonsnivå som
React-versjonen. Manglende React-tester er ikke grunn til å videreføre manglende dekning.

## Maskinelle grenser

Følgende skal inngå i `npm run check` når SvelteKit-grunnlaget etableres:

- `svelte-check`
- ESLint og Prettier med Svelte-støtte
- eksisterende design-systemkontroll tilpasset `.svelte`
- semantisk Tailwind-/theme-vokabular, featurestylingforbud og avtakende stylingbaseline etter
  ADR-006
- forbud mot Bits UI-import utenfor `ui/primitives`
- forbud mot feature-til-feature-importer
- forbud mot direkte Supabase-, Sentry- og storage-importer utenfor platformlaget
- forbud mot direkte `fetch` i komponenter
- eksakt, maskinell storage-grense for pre-module bootstrapen
- eksakt, token-synkronisert presentasjonsgrense for pre-module oppstartsdokumentet
- tester og `git diff --check`

Arkitekturkontrollen skal bruke eksplisitte tillatte grenser. En voksende unntaksliste er teknisk
gjeld og kan ikke utvides uten en dokumentert beslutning.

## Migreringsrekkefølge

Migreringen skjer på samme branch og deployes ikke delvis:

1. SvelteKit-build, adapter-static, base path og fallback.
2. Contracts, domainverktøy og platformlag.
3. Auth, tenant-routing, Query client, feil og observability.
4. UI-primitives og designsystem-patterns.
5. App-shell og navigasjon.
6. Features i avhengighetsrekkefølge.
7. Full funksjonell, visuell og deploymessig paritetskontroll.
8. Produksjonsbytte og deretter fjerning av React-koden.

En tidlig komplett flyt brukes til å validere implementasjonen av beslutningene, men er ikke et
separat eksperiment eller en delvis produksjonsutrulling.

## Ikke-mål for lift-and-shift

- endre backendkontrakter uten at migreringen avdekker en reell blokkering
- innføre BFF eller SvelteKit-server som nytt autoritativt backendlag
- redesigne produktet samtidig med rammeverksbyttet
- innføre offline-first, lokal database eller realtime uten separat beslutning
- gjøre SSR-auth til del av paritetsleveransen
- videreføre React-struktur bare for å minimere linjediff

## Referanser

- [SvelteKit: State management](https://svelte.dev/docs/kit/state-management)
- [SvelteKit: Loading data](https://svelte.dev/docs/kit/load)
- [SvelteKit: Advanced routing](https://svelte.dev/docs/kit/advanced-routing)
- [SvelteKit: Single-page apps](https://svelte.dev/docs/kit/single-page-apps)
- [SvelteKit: Static site generation](https://svelte.dev/docs/kit/adapter-static)
- [Svelte: `.svelte.js` og `.svelte.ts`](https://svelte.dev/docs/svelte/svelte-js-files)
- [Svelte: Context](https://svelte.dev/docs/svelte/context)
- [Svelte: Snippets](https://svelte.dev/docs/svelte/snippet)
- [Bits UI: Introduction](https://www.bits-ui.com/docs/introduction)
- [TanStack Query: Svelte](https://tanstack.com/query/latest/docs/framework/svelte/reference)
