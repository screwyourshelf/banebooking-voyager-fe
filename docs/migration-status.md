# Migreringsstatus

> **Status:** Aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** WP-4 — UI-fundament og designsystem (pågår)
>
> **Sist oppdatert:** 2026-08-22

## Mål for aktiv arbeidspakke

Etabler sentrale tokens, tema, font og produktets offentlige UI-familier over et minimalt sett native
eller Bits-baserte primitives. Features skal deretter kunne uttrykke loading, feedback, forms,
samlinger og dialogs uten lokal produktstyling eller direkte Bits UI-import.

## Fullført

- Feature-branchen `feature/sveltekit-lift-and-shift` er opprettet.
- SvelteKit-målarkitektur er dokumentert.
- Fire ADR-er er godkjent for rendering, state/data, auth/tenant og UI/Bits UI.
- Rammeverksnøytrale produkt- og designregler er konsolidert.
- Gamle React-planer, PR-handover og arkivdokumenter er fjernet fra arbeidskopien.
- Migreringsplan, denne statusfilen og Codex-protokoll i `AGENTS.md` er etablert.
- React-referansens test-, check- og buildbaseline er grønn.
- Alle eksisterende routes, tenantformer, tilgangsnivåer, sentrale API-er, kapabiliteter og kritiske
  states er dokumentert i `docs/behavior-inventory.md`.
- WP-0-kvalitetsporten er nådd.
- Svelte 5 og SvelteKit er aktivt buildfundament med TypeScript strict, Svelte-aware lint, Prettier,
  `svelte-check` og `adapter-static`.
- Cloudflare Pages bygges med `index.html`-fallback; GitHub Pages bygges med `404.html`-fallback og
  verifisert base path.
- Root layout, root error boundary, statisk `auth/callback`, valgfri tenant-route med matcher og
  tomme routekomposisjoner for hele URL-kontrakten er etablert.
- Offentlig buildkonfigurasjon normaliseres og valideres i platformlaget.
- Første maskinelle SvelteKit-grenser håndhever offentlige featureinnganger, featureisolasjon,
  Bits-/Supabase-/Sentry-eierskap, komponenters HTTP-grense og forbud mot legacy Svelte-syntaks.
- WP-1-kvalitetsporten er nådd uten backendendringer.
- Alle eksisterende backend-DTO-er ligger i `lib/contracts`; React-referansen bruker midlertidige,
  tynne re-exports uten dupliserte transporttyper.
- Ren dato-, booking-, presentasjons- og kapabilitetslogikk ligger i `lib/domain` og testes uten DOM.
- Platformlaget har injiserbar native `fetch`-klient med base URL, auth-header, JSON/body,
  timeout/abort og normalisert `ApiError` uten sensitiv responsbody.
- Samtidige 401-responser samles i én rammeverksnøytral effekt; storage er isolert i en
  browser-only adapter og observability filtrerer sensitive kontekstfelter.
- Arkitekturkontrollen håndhever rene contracts/domain, storage-eierskap og at universal kode ikke
  importerer `*.client`-moduler.
- WP-2-kvalitetsporten er nådd uten funksjonell kontraktendring eller backendendringer.
- `/start` er avgrenset til én aktiv arbeidspakke og normalt ett verifiserbart checkpoint per
  AI-sesjon; fullført arbeidspakke skal overleveres før neste startes.
- AI-first lesbarhet er et bindende styrings- og arkitekturkrav med eksplisitt checkpointport i
  `AGENTS.md`, migreringsplanen og målarkitekturen.
- Authplattformen eksponerer diskriminerte initializing-, anonymous- og authenticated-states gjennom
  ett rammeverksnøytralt grensesnitt, typed Svelte-context og testet controller.
- Supabase- og utviklingsauth ligger bak adapters med deterministisk prioritet, sesjonsgjenoppretting,
  callback, tokenhåndtering og idempotent utlogging.
- Browser-runtime eier auth-SDK, native fetch og 401-navigasjon; Svelte-provideren publiserer bare
  stabile context-fasader og tømmer Query-cachen ved utlogging.
- Tenant fra route og dedikert build normaliseres til samme kontrakt. Build-tenant er autoritativ,
  lagrede callback-slugs valideres og alle interne navigasjoner fungerer under base path.
- TanStack Svelte Query-klient, tenant-key-konvensjon og lazy utviklings-devtools er koblet til den
  typed API-klienten.
- Session bootstrap, protected guards, fail-closed adminregler og backendstyrte kapabiliteter er
  etablert med eksplisitte loading-, error-, redirect- og blocked-states.
- WP-3-kvalitetsporten er nådd uten backendendringer.
- Den eksisterende rammeverksnøytrale token-, font- og temapaletten er bekreftet som autoritativ
  visuell kontrakt for SvelteKit; Figtree har eksplisitte systemfallbacks.
- Root layout eier en typed Svelte-temaprovider over en browser-only adapter med validert
  `light`/`dark`-kontrakt, eksisterende lagringsnøkkel og trygg storage-grense.
- `lib/ui` er offentlig UI-inngang, og første native primitive er en typed `Button` med sentrale
  produktvarianter, størrelser og fokusatferd. Guardflatene bruker den i reelle retry-forløp.
- Arkitekturkontrollen håndhever offentlig UI-import i features, sentral primitive-CSS og at
  primitiveanatomi bare defineres i `ui/primitives`.
- Første avgrensede WP-4-checkpoint for tokens, tema og primitivegrense er fullført uten Bits UI
  fordi checkpointets faktiske kontrollbehov dekkes tryggere av native HTML.
- Offentlige Svelte-patterns for `Page`, `Section`, `PageLoading`, `Feedback` og `ErrorState` eier
  nå sideanatomi, seksjoner og delte loading-, status-, warning- og errorstates gjennom `lib/ui`.
- Routeplaceholder, auth callback, root error boundary og session-/access-guards komponerer de
  offentlige patternene uten lokal produktanatomi eller komponent-CSS. En native `ButtonLink`
  dekker lenkehandlingen i routefeilflaten.
- Patternkontraktene har komponent- og axe-tester for landmarks, headinghierarki, seksjonsnavn,
  live regions, retry og loadinggeometri. Arkitekturkontrollen avviser nå `data-ui`/`data-part`
  direkte i routes og features.
- Andre avgrensede WP-4-checkpoint for Page-, Section- og feedbackpatterns er fullført uten app-shell,
  featuremigrering, Bits UI eller backendendringer.
- Offentlige Collection-patterns eier nå header, scope, collection-filterplassering, footer,
  liste-/datogruppeanatomi og entity-/schedule-rader gjennom `lib/ui`.
- `CollectionRow` bruker en eksplisitt diskriminert interaction-kontrakt. De første verifiserte
  variantene er `static`, helradsknappen `open` og den eksplisitte `action`-handlingen; category og
  faktisk status plasseres av patternet fremfor å bygges manuelt i featureinnhold.
- `CollectionLoading`, `CollectionEmpty` og `CollectionError` eier collection-spesifikk geometri,
  live-/alertsemantikk og retry. Liste- og gruppestrukturen har eksplisitte ARIA-listroller og
  navngitte datogrupper.
- Collection-kontraktene har komponent- og axe-tester for filter-/footerplassering, grouped lists,
  statiske og interaktive rader, status, loading, empty, error og retry. Designsystemkontrollen
  inkluderer nå `.svelte` når den validerer at offentlig produktanatomi og sentral CSS samsvarer.
- Tredje avgrensede WP-4-checkpoint for Collection-, row- og collection-statepatterns er fullført
  uten featuremigrering, Bits UI eller backendendringer.

## Nåtilstand

- SvelteKit er den aktive dev-, test-, preview- og produksjonsbuilden.
- Alle produkt-URL-er rendrer foreløpige Svelte-routeflater; featureadferd er ikke migrert ennå.
- React-kilden er fortsatt produksjonsreferanse i arbeidskopien, men er ikke koblet til eller bundlet
  av SvelteKit.
- Contracts, ren domenelogikk og platformkjerne er nå autoritative for både videre Svelte-arbeid og
  de midlertidige React-broene.
- Auth, tenant, Query og session guards er autoritativt SvelteKit-fundament. Login- og øvrige
  featureflater er fortsatt route-placeholdere frem til WP-4–WP-6.
- WP-4 pågår. Tokens, font, lyst/mørkt tema, offentlige native handlinger samt Page-, Section-,
  feedback- og de første Collection-patternene er autoritative. Form-, Settings-, Dialog-,
  Document-, navigation-, dato-/kalender- og editorfamiliene er ikke migrert ennå; mer sammensatte
  row interactions og faktiske filterkontroller gjenstår innen WP-4.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                    |
| ------------------------------------- | ----------------------------------------------------- |
| Base branch                           | `main`                                                |
| Fastslått basecommit                  | `5287c5e`                                             |
| Siste semantiske checkpoint           | `feat(sveltekit): establish WP-4 collection patterns` |
| Lokale commits foran base             | 9                                                     |
| Forventede ucommitterte frontendfiler | Ingen etter checkpoint-commit                         |
| Neste planlagte checkpoint            | WP-4 Form-, field- og valideringspatterns             |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Neste `/start` skal bare starte neste avgrensede WP-4-checkpoint:

1. Kaldkartlegg React-referansens `Form.Fields`, `Form.Field`, label-, hjelpe-/feiltekst-,
   input-/textarea- og form-actionanatomi mot produktreglene og minst to konkrete skjemaer. Hold
   `Settings.Row`, select, kalender, editor og dialog utenfor checkpointet.
2. Etabler native, typed input-/textarea-primitives og de offentlige Form-/Fields-/Field-/Actions-
   kontraktene som de kartlagte skjemaene trenger, inkludert feltvalidering, disabled/pending og
   stabil ID-/ARIA-kobling. Ikke start featuremigrering.
3. Legg komponent- og tilgjengelighetstester for normale, obligatoriske, disabled og ugyldige felt
   samt handlinger; kontroller mobil/desktop og lyst/mørkt tema, og kjør full check/test samt begge
   hostingbuildene.

## Arbeidspakkeregister

| Arbeidspakke                     | Status       | Port/resultat                                                |
| -------------------------------- | ------------ | ------------------------------------------------------------ |
| WP-0 Styring og baseline         | Fullført     | Dokumentgrunnlag, React-baseline og komplett adferdsinventar |
| WP-1 Build og routes             | Fullført     | Build, routes, hostingvarianter og arkitekturkontroll grønn  |
| WP-2 Contracts/domain/platform   | Fullført     | Contracts, ren domain, fetch/API, 401 og adapters grønne     |
| WP-3 Auth/tenant/serverdata      | Fullført     | Auth, tenant, Query, guards, 401 og base path grønne         |
| WP-4 UI-fundament                | Pågår        | Page, feedback og første Collection-kontrakter er grønne     |
| WP-5 App-shell                   | Ikke startet | —                                                            |
| WP-6 Featuremigrering            | Ikke startet | —                                                            |
| WP-7 Paritet og produksjonsbytte | Ikke startet | —                                                            |

## Featureregister

| Gruppe                       | Status   | Merknad                           |
| ---------------------------- | -------- | --------------------------------- |
| Auth, policy, feil og guards | Kartlagt | Første featuregruppe i WP-6       |
| Booking og bootstrap         | Kartlagt | Kjerneflyt                        |
| Mine tider og Min side       | Kartlagt | Beskyttet kontoflyt               |
| Arrangementer og Nyheter     | Kartlagt | Offentlig/innlogget innhold       |
| Baner og Grener              | Kartlagt | Delt adminarbeidsområde           |
| Klubb og medlemskap          | Kartlagt | Admininnstillinger                |
| Arrangementadministrasjon    | Kartlagt | Sammensatt editor og bookinger    |
| Brukere og sperre            | Kartlagt | Rolle- og kapabilitetsstyrt admin |
| Kunngjøringer og editor      | Kartlagt | Riktekst og obligatorisk flyt     |
| Statistikk                   | Kartlagt | Datavisualisering                 |

## Åpne blokkeringer

Ingen kjente blokkeringer. Neste Form-checkpoint kan gjennomføres mot eksisterende visuell baseline,
native HTML og de godkjente produkt-/arkitekturreglene uten backendendringer eller ny
brukerbeslutning.

## Midlertidig kode og kjente avvik

- React-kilde og React-avhengigheter er midlertidig referanse og skal fjernes etter hvert som
  ansvaret erstattes; de er ikke del av SvelteKit-bundlen.
- `src/types/` og de flyttede filene i `src/utils/` er midlertidige React-re-exports til autoritativ
  kode i `src/lib/contracts`, `src/lib/domain` og `src/lib/platform`.
- Alle Svelte-featureflater er bevisst midlertidige route-placeholdere frem til WP-4–WP-6 gir
  contracts, data, auth, UI og app-shell.
- Eksisterende globale token-, font-, theme- og primitivefiler er autoritative. Eldre React-patterns
  og featurekomposisjoner i samme CSS-kjede er fortsatt visuell referanse og konsolideres når de
  respektive WP-4-patterns og WP-6-features erstatter dem.
- Auth-, tenant-, callback- og guardflatene bruker offentlige Page-, loading-, feedback- og
  errorpatterns. Deres adferds- og datakontrakter fra WP-3 er fortsatt autoritative.
- Collection eier nå hvor filtre og footer rendres, men faktiske søk-, valg-, sorterings- og
  togglekontroller venter på Form-/Settings-/select-primitives. Featurekode er ikke flyttet til den
  nye Collection-familien i dette WP-4-checkpointet.
- `CollectionRow` har foreløpig de tre interaction-variantene `static`, `open` og `action` som dekker
  flere kartlagte konsumenter. `actions`, `expand` og `reorder` etableres først sammen med reelle
  primitive- og fokusbehov senere i WP-4; de eksponeres ikke som uimplementerte offentlige typer.
- Temakontrakten og persistens er på plass. En brukerrettet temabryter kommer med delt navigasjon;
  det finnes ingen midlertidig route- eller featurelokal temakontroll.
- Bits UI er bevisst ikke installert i dette checkpointet. Første primitive har enkel native
  atferd; Bits wrappers opprettes først når dialog, select, menu, popover eller kalender gir en
  faktisk konsument.

## Siste verifikasjon

| Kontroll                             | Resultat                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| Prettier på aktiv kode og dokumenter | Bestått 2026-08-22                                                                      |
| Relative dokumentlenker              | Bestått 2026-08-22                                                                      |
| `git diff --check`                   | Bestått 2026-08-22                                                                      |
| `npm test`                           | Bestått 2026-08-22: 27 filer, 88 tester                                                 |
| `npm run check`                      | Bestått 2026-08-22: Svelte/React-typecheck, arkitektur, design, lint og format          |
| Cloudflare Pages-build               | Bestått 2026-08-22: root path og `index.html`-fallback                                  |
| GitHub Pages-build                   | Bestått 2026-08-22: eksplisitt `/banebooking` og `404.html`-fallback                    |
| Dev og preview                       | Bestått 2026-08-22: previewbase samt dev i multi-/dedikert tenant                       |
| Nettleserrender                      | Bestått 2026-08-22: 390×844 og 1440×900, Collection/rows/states, lyst/mørkt, ingen feil |
| SvelteKit-bundle                     | Verifisert 2026-08-22: ingen React-runtime                                              |
| WP-0 route-/featureinventar          | Komplett 2026-08-22                                                                     |
| WP-4 fokustester                     | Bestått 2026-08-22: 2 filer, 6 tester for tema, storage og DOM-applikasjon              |
| WP-4 pattern-/a11y-tester            | Bestått 2026-08-22: 1 fil, 6 tester for semantikk, states, retry og axe                 |
| WP-4 collection-/a11y-tester         | Bestått 2026-08-22: 1 fil, 6 tester for anatomy, rows, groups, states, retry og axe     |

## Filer i siste checkpoint

- offentlige Collection-, List-, Group-, Row-, Loading-, Empty- og Errorpatterns med tester i
  `src/lib/ui/patterns/`
- offentlig Collection-API og interaction-/layout-/statuskontrakter i `src/lib/ui/`
- sentral collection-, row-, group-, state-, loading- og containerresponsiv CSS i
  `src/styles/design-system/patterns.css`
- `.svelte`-aware sammenhengskontroll mellom produktanatomi og sentral CSS i
  `scripts/check-design-system-boundaries.mjs`
- `docs/migration-status.md`

`/start` bruker commit-diffen som autoritativ kilde for nøyaktig innhold og `git status` for
pågående arbeid etter checkpointet.
