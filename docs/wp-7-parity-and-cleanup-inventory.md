# WP-7 paritets- og oppryddingsinventar

> **Status:** Første WP-7-checkpoint fullført
>
> **Fastslått mot:** `feature/sveltekit-lift-and-shift` ved `4520f65`
>
> **Dato:** 2026-08-23

## Formål og avgrensning

Dette dokumentet er fjerningskartet for resten av WP-7. Det avstemmer den autoritative
adferdskontrakten mot SvelteKit-treet og skiller mellom:

- reelle produkt- eller produksjonsgap som må lukkes før React-referansen fjernes
- React-kode og kompatibilitetsbroer som fortsatt har faktiske konsumenter
- allerede ubrukte filer og avhengigheter
- autoritativ Svelte-, contract-, domain-, platform- og CSS-kode som må bevares

Inventaret er en kaldlesing av routes, guards, offentlige featureinnganger, testnavn, importgraf,
pakkeimporter og hostingkonfigurasjon. Det er ikke en godkjenning for å slette kode i samme
checkpoint.

## Route- og tilgangsparitet

Alle de 18 URL-flatene i [`behavior-inventory.md`](./behavior-inventory.md) har en eksplisitt
SvelteKit-route. Public-, protected- og admin-gruppene eier tilgangsnivået, mens
`SessionGate` eier sperre → kunngjøring → medlemskap-rekkefølgen og `AccessGuard` bruker den
samme capabilitytabellen som navigasjonen.

| URL                            | SvelteKit-eier                                       | Tilgangsbevis                                           | URL-/guardstate                             | Resultat |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | -------- |
| `{tenant}`                     | `(public)/+page.svelte` → `booking`                  | Offentlig                                               | Gren, bane og dato er lokal state           | Paritet  |
| `{tenant}/vilkaar`             | `(public)/vilkaar` → `policy`                        | Offentlig                                               | Ingen URL-state                             | Paritet  |
| `{tenant}/login`               | `(public)/login` → `auth`                            | Offentlig; `SessionGate` sender innlogget bruker videre | Validert `returnTo`                         | Paritet  |
| `{tenant}/minside`             | `(protected)/minside` → `account`                    | Protected layout                                        | `tab=profil\|persondata` normaliseres       | Paritet  |
| `{tenant}/bookinger`           | `(protected)/bookinger` → `account`                  | Protected layout                                        | Historikk er lokal state                    | Paritet  |
| `{tenant}/arrangementer`       | `(public)/arrangementer` → `arrangements`            | Offentlig                                               | `arrangement={id}` åpner kontrollert rad    | Paritet  |
| `{tenant}/nyheter`             | `(public)/nyheter` → `news`                          | Offentlig                                               | Ingen URL-state                             | Paritet  |
| `{tenant}/arrangement`         | `(admin)/arrangement` → `arrangement-admin`          | `arrangement:se`                                        | Editor og steg er lokal state               | Paritet  |
| `{tenant}/admin/klubb`         | `(admin)/admin/klubb` → `club-and-membership-admin`  | `klubb:admin`                                           | Fanen er lokal state                        | Paritet  |
| `{tenant}/admin/baner`         | `(admin)/admin/baner` → `court-and-activity-admin`   | `baner:admin`                                           | Seksjonen kommer fra routen                 | Paritet  |
| `{tenant}/admin/grener`        | `(admin)/admin/grener` → `court-and-activity-admin`  | `grener:admin`                                          | Seksjonen kommer fra routen                 | Paritet  |
| `{tenant}/admin/brukere`       | `(admin)/admin/brukere` → `user-admin`               | `brukere:lese` eller `brukere:admin`                    | Søk og filter er lokal state                | Paritet  |
| `{tenant}/admin/kunngjøringer` | `(admin)/admin/kunngjøringer` → `announcement-admin` | `kunngjøring:admin`                                     | Ingen URL-state                             | Paritet  |
| `{tenant}/admin/statistikk`    | `(admin)/admin/statistikk` → `statistics`            | `statistikk:lese`                                       | Periode og filter er lokal state            | Paritet  |
| `{tenant}/bekreft-medlemskap`  | `(protected)/bekreft-medlemskap` → `policy`          | Protected layout og policyguard                         | Guardstyrt                                  | Paritet  |
| `{tenant}/kunngjøring`         | `(protected)/kunngjøring` → `policy`                 | Protected layout og policyguard                         | Guardstyrt                                  | Paritet  |
| `{tenant}/sperret`             | `(protected)/sperret` → `policy`                     | Protected layout og policyguard                         | Guardstyrt                                  | Paritet  |
| `/auth/callback`               | `auth/callback`                                      | Offentlig, statisk route utenfor tenanttreet            | Leverandørparametere og validert `returnTo` | Paritet  |

I tillegg dekker `[[slug=tenant]]/+layout.ts` både route-tenant og dedikert build, `+error.svelte`
eier ukjent URL, og `SessionGate` eier ukjent tenant med retrybar klubbfeil. Det finnes ingen egen
`/admin`-produktside i SvelteKit-treet.

## Featurestate-paritet

Kaldavstemmingen fant ingen manglende produktfeature eller kritisk state i Svelte-treet.
Kontraktene er uttrykt i samlokaliserte modell-, API-, Query- og komponenttester:

| Flate                      | Observerbare states med kode-/testbevis                                                                                | Resultat |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| Auth, tenant og guards     | initializing, anonymous/authenticated, trygg retur, klubbfeil, policyrekkefølge, blocked og retry                      | Dekket   |
| Booking                    | bootstrap/fallback, manglende oppsett/bane, loading, tom, refresh, retry, optimistisk booking/avbestilling og rollback | Dekket   |
| Mine tider og Min side     | URL-fane, profil/listeloading, historikk, tom, retry, validering, eksport, sletting og rollback                        | Dekket   |
| Arrangementer og Nyheter   | offentlig/innlogget endpoint, deeplink, historikk/filter, paginering, tom/filtrert tom, refresh, retry og avlysning    | Dekket   |
| Baner og Grener            | capabilityseksjoner, tom/loading/retry, editor, dirty state, validering, reorder, overstyringer og mutationfeedback    | Dekket   |
| Klubb og medlemskap        | lokale faner, dirty/invalid, loading/retry, lagring og separate aktiverings-/deaktiveringsfeil                         | Dekket   |
| Arrangementadministrasjon  | tom/loading, to steg, staging, forslag, konflikt, delvis/full suksess, retry og mutationfeil                           | Dekket   |
| Brukere og sperre          | lese-/adminmodus, søk/filter/paginering, tom/filtrert tom, editor, sperre, historikk, oppheving og sletting            | Dekket   |
| Kunngjøringsadministrasjon | ingen/aktiv, loading/retry, riktekst, dato, validering, pending, suksess og deaktivering                               | Dekket   |
| Statistikk                 | førstegangsloading, tidligere data under refresh, filtre, tomt datagrunnlag, retry og full visning                     | Dekket   |

Dette er komponent-, kontrakt- og tidligere nettleserbevis. Automatiserte ende-til-ende-flyter er
fortsatt en egen WP-7-leveranse og kan ikke utledes av denne tabellen.

## Reelle gap før React kan fjernes

### 1. Observability er definert, men ikke koblet til runtime

`src/lib/platform/observability/index.ts` har bare testkonsumenten
`src/lib/platform/observability/index.test.ts`. Svelte-runtime initialiserer ikke Sentry, kobler
ikke storage-reporteren og rapporterer ikke uventede runtimefeil. React-referansen gjør alle tre
delene gjennom `src/main.tsx` og `AppErrorBoundary.tsx`, mens vilkårsflaten fortsatt opplyser om
Sentry.

Eier: `lib/platform/observability` og `lib/platform/app`. Gapet må lukkes bak platformgrensen med
sensitiv kontekstfiltrering før `@sentry/react` og React-feilgrensen fjernes.

### 2. Gjenoppretting etter utdaterte oppstartsfiler finnes bare i React-HTML-en

Rotfilen `index.html` lytter på `vite:preloadError`, laster oppstartsassets på nytt og tilbyr
kontrollert nullstilling ved en fastlåst deploy. SvelteKits aktive `src/app.html` har ikke denne
atferden. Den er ikke registrert som en produktfeature i adferdsinventaret, men er en reell
produksjonsrobusthetsforskjell som må avgjøres under produksjonslik hostingtest.

Eier: `lib/platform/app` og `src/app.html`. Atferden skal enten flyttes til en smal SvelteKit-eid
oppstartsgrense eller eksplisitt pensjoneres med dokumentert hostingbevis; React-HTML-en skal ikke
slettes før avgjørelsen er tatt.

### 3. Innlogget lokal E2E trenger en autoritativ utviklingsauthvei

Svelteklienten sender standard `Authorization: Bearer`, mens den isolerte lokale
utviklingsbackenden forventer `DevelopmentBearer`. Tidligere visuell QA brukte en midlertidig
header-rewrite-proxy. Dette er ikke et backend- eller produktparitetsgap, men det blokkerer en
reproduserbar Playwright-port for booking, avbestilling og adminendring.

Eier: WP-7-testharnessen over eksisterende auth-/API-kontrakter. Løsningen må ikke endre
produksjonens authscheme eller backend uten en separat godkjenning.

## Kilde- og importinventar

En statisk importgraf over `src/` fant 649 produksjonskandidater:

| Klasse                          | Antall | Betydning                                                                          |
| ------------------------------- | -----: | ---------------------------------------------------------------------------------- |
| Bare SvelteKit-grafen           |    265 | Bevares                                                                            |
| Bare React-roten `src/main.tsx` |    295 | Kan fjernes etter paritetsfrys                                                     |
| Nådd av begge runtimegrafer     |     46 | Contracts, domain, platform og sentral CSS; må ikke slettes med React              |
| Ikke nådd av noen runtimegraf   |     43 | 34 reelt foreldreløse legacyfiler, 7 test-/konvensjonsfiler og 2 deklarasjonsfiler |

React-referansen har 214 `.tsx`/`.jsx`-filer og 21 423 linjer. Den aktive SvelteKit-builden bruker
`src/app.html`; rotens `index.html` og `src/main.tsx` er bare React-referanse.

### Autoritativ delt kode

De 46 delte filene består av:

- `src/lib/contracts/**` og `src/lib/domain/**`
- de delte platformfilene for API-feil/-klient, auth, config og storage
- `src/lib/features/statistics/model.ts`, som legacy Statistikk importerer gjennom en tynn typebro
- `src/index.css` og designsystemets token-, primitive-, pattern-, responsive- og midlertidige
  feature-composition-filer

Disse filene skal beholdes. React-konsumenter og broer fjernes fra utsiden og inn; den
autoritative implementasjonen flyttes ikke tilbake til legacybaner.

### Aktive kompatibilitetsbroer

| Bro                                                                       |                Faktiske legacykonsumenter | Fjerning                               |
| ------------------------------------------------------------------------- | ----------------------------------------: | -------------------------------------- |
| `src/types/index.ts`                                                      | 63 importsetninger i React-features/hooks | Sammen med React-featuretreet          |
| `src/types/Klubbdetaljer.ts`                                              |                 1 (`ReglementDialog.tsx`) | Sammen med bookingreferansen           |
| `src/utils/arrangementPresentation.ts`                                    |                                         6 | Sammen med arrangementreferansen       |
| `src/utils/bookingUtils.ts`                                               |                                         3 | Sammen med bookingreferansen           |
| `src/utils/browserStorage.ts`                                             |                                        10 | Sammen med React boot/auth/theme       |
| `src/utils/brukerPresentation.ts`                                         |                                         7 | Sammen med konto-/brukerreferansen     |
| `src/utils/datoUtils.ts`                                                  |                                        17 | Sammen med React-featuretreet          |
| `src/utils/handlingUtils.ts`                                              |                                        11 | Sammen med React capabilitykonsumenter |
| `src/utils/kapabiliteter.ts`                                              |                                        12 | Sammen med React capabilitykonsumenter |
| `src/features/statistikk/types.ts`                                        |                                         9 | Sammen med React Statistikk            |
| `src/auth/authTypes.ts`                                                   |                                         2 | Sammen med React authprovider          |
| `src/auth/developmentSession.ts`, `supabaseToken.ts` og `src/supabase.ts` |                                 3, 5 og 5 | Sammen med React auth/API              |
| `src/features/policy/pages/vilkaar.ts`                                    |                        1 (`useBruker.ts`) | Sammen med React brukerhook            |

`src/api/api.ts` er ikke en tynn bro: det er Reacts Axios-klient med 7 direkte konsumenter og en
re-export av den autoritative `ApiError`. Hele filen fjernes med React-dataflyten.

### Foreldreløse legacyfiler

Følgende 22 genererte React/shadcn-filer har ingen konsument fra React-roten. `input-group.tsx` og
`toggle.tsx` importeres bare av andre filer i samme foreldreløse gruppe:

`aspect-ratio.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `carousel.tsx`, `checkbox.tsx`,
`collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `drawer.tsx`, `form.tsx`, `hover-card.tsx`,
`input-group.tsx`, `input-otp.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`,
`progress.tsx`, `scroll-area.tsx`, `slider.tsx`, `toggle-group.tsx` og `toggle.tsx` under
`src/components/ui/`.

Følgende 12 enkeltfil-re-exports under `src/types/` har ingen importkonsument fordi React nå bruker
`src/types/index.ts`: `Arrangement.ts`, `Bane.ts`, `Booking.ts`, `BookingBootstrap.ts`,
`BookingSlot.ts`, `Bruker.ts`, `FeedItem.ts`, `Gren.ts`, `KalenderSlot.ts`, `Medlemskap.ts`,
`MinBooking.ts` og `OppdaterKlubb.ts`.

`src/params/tenant.ts`, `src/app.d.ts` og `src/vite-env.d.ts` er SvelteKit-/TypeScript-konvensjoner,
ikke foreldreløse filer. `*-test-data.ts` og observabilitymodulen har eksplisitte testkonsumenter.

## Avhengighetsinventar

### SvelteKit-avhengigheter som skal beholdes

- `@fontsource-variable/figtree`, `@hugeicons/core-free-icons`, `@internationalized/date`
- `@supabase/supabase-js`
- `@tanstack/svelte-query` og `@tanstack/svelte-query-devtools`
- `@tiptap/core`, `@tiptap/extension-table` og `@tiptap/starter-kit`
- `bits-ui`, `date-fns`, `tailwindcss` og `tw-animate-css`
- SvelteKit-, Svelte-, test-, lint-, format- og TypeScript-verktøykjeden

`shadcn` er foreløpig også en Svelte-buildkonsument fordi `src/index.css` importerer
`shadcn/tailwind.css`. Importen må fjernes eller erstattes før pakken kan slettes.

### Avhengigheter med bare React-konsumenter

`@hugeicons/react`, `@sentry/react`, `@tanstack/react-query`,
`@tanstack/react-query-devtools`, `@tiptap/react`, `axios`, `class-variance-authority`, `clsx`,
`lucide-react`, `next-themes`, `radix-ui`, `react`, `react-day-picker`, `react-dom`,
`react-router-dom`, `sonner` og `tailwind-merge` kan fjernes når deres React-konsumenter er slettet.
`date-fns` kan ikke fjernes fordi den autoritative Svelte-statistikkmodellen bruker pakken.

React-verktøyene `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`,
`eslint-plugin-react-hooks` og `eslint-plugin-react-refresh` fjernes samtidig med
`tsconfig.react.json` og `typecheck:react`.

### Allerede ubrukte eller bare foreldreløst brukte avhengigheter

- Ingen importkonsument: `@hookform/resolvers`, `use-debounce` og `zod`.
- Bare foreldreløse shadcn-filer: `cmdk`, `embla-carousel-react`, `input-otp`, `react-hook-form` og
  `vaul`.
- Ingen direkte kildeimport: `@tiptap/extension-link`, `@tiptap/extension-table-cell`,
  `@tiptap/extension-table-header`, `@tiptap/extension-table-row` og `@tiptap/pm`. De må
  kontrolleres mot Tiptaps transitive pakkegraph når `package.json` ryddes.

## TODO-er og konfigurasjonsrester

Det finnes én faktisk TODO i aktiv arbeidskopi: React-regelunntaket i `eslint.config.js` for
`react-hooks/refs` og `react-hooks/set-state-in-effect`. Det fjernes med React-lintoppsettet; det
skal ikke flyttes til Svelte-konfigurasjonen.

Andre React-rester som må fjernes i samme oppryddingsrekkefølge er:

- `tsconfig.react.json` og `typecheck:react`
- React-plugins og React-regler i `eslint.config.js`
- `components.json` og shadcn-kommentaren i `.prettierignore`
- React-roten `index.html`
- legacy designselektorer og kommentarer i `feature-compositions.css`, `patterns.css` og
  `tokens.css` først etter at Svelte-render og skjermbilder er fryst

## Atomisk checkpointrekkefølge

1. **WP-7 runtimeparitet.** Koble observability/Sentry og storagefeil til Svelte-runtime. Avklar og
   test gjenoppretting etter utdaterte oppstartsfiler. Behold hele React-referansen.
2. **WP-7 kritiske E2E-flyter.** Etabler en reproduserbar authharness og Playwright for login,
   booking, avbestilling og én representativ adminendring. Ingen backendendring eller ekstern
   deploy uten ny autoritet.
3. **WP-7 produksjonsbevis.** Kjør direkte lasting/refresh på alle routeklasser under root og
   `/banebooking`, kontroller callback, bundle, lazy chunks og avtalte viewporter/roller/temaer.
   Frys beviset før referansen fjernes.
4. **WP-7 React-fjerning.** Slett React-roten, de 295 React-eksklusive filene, de 34 foreldreløse
   legacyfilene og alle aktive broer i én commit. Behold de 46 delte autoritative filene. Fjern
   samtidig Axios/React Query/Radix/React-avhengigheter, React-typecheck og React-lintplugins; kjør
   `npm install` for en konsistent lockfil.
5. **WP-7 CSS- og driftsopprydding.** Fjern beviselig ubrukte legacyselektorer og
   `shadcn/tailwind.css`, deretter `shadcn` og resterende ubrukte pakker. Oppdater utviklings- og
   driftsinstruksjoner og kjør endelig kvalitetsport.

Hvert checkpoint skal kjøre `npm test`, `npm run check`, Cloudflare Pages-build,
GitHub Pages-build og `git diff --check`. Fra React-fjerningscheckpointet skal en maskinell kontroll
i tillegg avvise React-kilde, React-runtime, Axios, React Query, Radix og midlertidige broer.
