# Migreringsplan: SvelteKit lift-and-shift

> **Status:** Fullført historisk utførelsesplan for WP-0–WP-7
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Sist oppdatert:** 2026-08-23

SvelteKit-lift-and-shift-en og den etterfølgende stylingmigreringen er fullført. Dette dokumentet
beholdes som historisk metode og kvalitetsport for WP-0–WP-7; det oppretter ikke nye arbeidspakker.
Aktiv vedlikeholdsstatus ligger i [`migration-status.md`](./migration-status.md).

## Mål

Lever én komplett Svelte 5/SvelteKit-frontend med funksjonell og visuell paritet før
produksjonsbytte. React-produksjonen forblir referanse under arbeidet, men målarkitekturen bygges
idiomatisk i SvelteKit.

Dette er en lift-and-shift av produktadferd, ikke en konstruksjonsmapping. Hver arbeidsflate
kartlegges som kontrakt før den designes på nytt etter SvelteKits naturlige eierskap.

## Regler for rekkefølge

- En arbeidspakke starter ikke før inngangsporten er oppfylt.
- En arbeidspakke avsluttes først når kvalitetsporten er verifisert.
- Én AI-sesjon arbeider innenfor én aktiv arbeidspakke og normalt ett avgrenset checkpoint. Når
  checkpointet eller arbeidspakken er ferdig, gjøres handover før mer omfang tas inn.
- `/start` gjenopptar neste dokumenterte checkpoint; kommandoen autoriserer ikke automatisk
  gjennomføring av alle gjenværende arbeidspakker.
- En sesjon som fullfører en arbeidspakke oppdaterer statusen til neste arbeidspakke, men starter
  ikke den nye arbeidspakken i samme sesjon uten en ny, eksplisitt brukerbeskjed.
- Featurearbeid starter ikke før platform-, auth-, data- og UI-fundamentet er stabilt.
- Nye patterns etableres sentralt før features som trenger dem fortsetter.
- Midlertidig ufullstendig Svelte-funksjonalitet er tillatt på feature-branchen.
- React og Svelte skal ikke kobles sammen med en runtime-bro eller microfrontend.
- React-filer fjernes når ansvaret er erstattet og verifisert. `main` og produksjonsdeploy er
  referansen dersom gammel implementasjon må inspiseres senere.
- Hver commit skal bygge eller tydelig tilhøre en kort, dokumentert overgang der neste commit
  gjenoppretter build. Arbeidssesjonen skal normalt avsluttes med grønn build.

## Git og lokale checkpoints

Lokale commits på migreringsbranchen er en del av den varige handoveren, ikke bare teknisk
historikk:

- `/start` finner merge-base mot `main` og leser alle commits og den samlede diffen foran basen før
  nytt arbeid starter.
- En komplett, atomisk og verifisert leveranse committes lokalt sammen med oppdatert
  `migration-status.md`. Det pushes aldri automatisk.
- Statusfilen beskriver semantisk checkpoint, forventet commit-antall foran base og forventet
  arbeidskopi. Nåværende `HEAD`-hash beregnes fra git og lagres ikke i commitens egen statusfil.
- Ufullstendig arbeid beholdes ucommittet. Statusfilen skal da navngi forventede ucommitterte
  endringer, årsak og neste utførbare steg.
- En WIP-commit brukes bare som et bevisst gjenopprettingspunkt og skal merkes tydelig; den teller
  ikke som bestått kvalitetsport.
- Tidligere commits skal ikke amend-es, rebase-es, squash-es eller fjernes som rutine. De gir neste
  AI-sesjon nøyaktig kontekst om rekkefølge og avgrensning.
- Commitmeldinger skal beskrive leveransen, for eksempel
  `feat(sveltekit): establish WP-1 route foundation` eller
  `docs: document WP-0 behavior inventory`.

Git forteller eksakt hva som ble endret. Statusfilen forteller hvorfor tilstanden er gyldig, hva
som er verifisert og hvilket steg som følger. Begge må samsvare før neste checkpoint.

## AI-first kode som styringskrav

AI-agenter er primære kodekonsumenter under migreringen. Kodekvalitet omfatter derfor hvor sikkert
en ny agent kan forstå og endre løsningen fra repository, typer, tester og styringsdokumenter uten
tilgang til tidligere samtalehistorikk.

Bindende regler:

- Ansvar og eierskap skal være synlig i mapper, filnavn, typer og offentlige innganger.
- Hver modul skal ha ett sammenhengende ansvar og færrest mulig implisitte avhengigheter.
- Typed contracts, diskriminerte states og smale adapters foretrekkes fremfor konvensjoner som bare
  finnes i hodet til forrige utvikler eller agent.
- Implementasjon og kontrakttester samlokaliseres. Testnavn skal uttrykke invariant og observerbar
  adferd, ikke intern implementasjonsrekkefølge.
- Standard SvelteKit-, Svelte- og TypeScript-mønstre foretrekkes. Egen metaprogrammering, skjulte
  registries, magiske sideeffekter og unødvendig generiske abstraksjoner krever dokumentert grunn.
- Kommentarer beskriver hvorfor, sikkerhetsgrenser og uventede avveininger; presise navn og typer
  beskriver hva.
- Midlertidige kompatibilitetsbroer skal peke på én autoritativ implementasjon og registreres i
  `migration-status.md`.
- Maskinelle arkitekturkontroller utvides når en viktig grense kan håndheves automatisk.

### AI-first checkpointport

Før hver lokal checkpoint-commit skal agenten gjøre en kaldlesing av endringen og kunne fastslå:

1. hvilken modul som eier ansvaret
2. hvilken offentlig inngang konsumenter skal bruke
3. hvilke typer og tester som uttrykker kontrakten
4. hvilke sideeffekter og plattformgrenser som finnes
5. hvor neste agent skal fortsette eller fjerne midlertidig kode

Hvis dette bare kan forklares med samtalehistorikk eller en lang handovertekst, skal koden eller den
varige dokumentasjonen forbedres før checkpointet godkjennes.

## WP-0 — Styring og baseline

### Leveranser

- målarkitektur og bindende ADR-er
- rammeverksnøytrale produktregler
- denne migreringsplanen og løpende status/handover
- `AGENTS.md` med start- og avslutningsprotokoll
- bindende AI-first kodekontrakt og checkpointport
- inventar over routes, features, roller, kritiske states og brukerflyter
- dokumentert React-baseline for test, check og build

### Kvalitetsport

- aktiv dokumentflate har ingen instruks om å kopiere React-struktur
- hver eksisterende route og feature finnes i statusregisteret
- React-baseline er kjørt og resultatet er dokumentert
- neste arbeidspakke har ett eksakt startpunkt
- en ny AI-agent kan fastslå ansvar, kontrakter, tester og neste steg uten samtalehistorikk

## WP-1 — SvelteKit build- og routefundament

### Leveranser

- Svelte 5 og SvelteKit med TypeScript strict mode
- `adapter-static` med riktig fallback for GitHub Pages og Cloudflare Pages
- base path, asset paths og offentlige miljøvariabler
- root layout, root error boundary og tom routekomposisjon
- valgfri tenant-route med matcher og statisk `auth/callback`
- lint, format, `svelte-check`, test og build scripts
- første arkitekturkontroller for importgrenser

### Kvalitetsport

- dev og preview starter
- direkte route-load og refresh fungerer med og uten base path
- fallbackartefakten er korrekt
- `npm run check`, `npm test` og `npm run build` passerer
- ingen React-runtime er del av SvelteKit-bundlen

## WP-2 — Contracts, domain og platform

### Leveranser

- eksisterende API-kontrakter flyttet til `lib/contracts`
- ren domenelogikk og formattering i `lib/domain`
- validert offentlig konfigurasjon
- typed `fetch`-basert API-klient og normalisert `ApiError`
- sikre storage-, observability- og browser-adapters
- sentral 401-kontrakt uten UI- eller Supabase-kobling

### Kvalitetsport

- endpoint- og domenetester kjører uten DOM
- ingen komponent gjør HTTP-kall
- universal kode importerer ikke browser-only moduler
- kontraktene dekker dagens backendresponser uten funksjonell endring

## WP-3 — Auth, tenant og serverdata

### Leveranser

- typed auth-context og felles authgrensesnitt
- Supabase- og utviklingsadapter
- auth callback og sesjonsgjenoppretting
- normalisert tenant-context for slug og dedikert build
- TanStack Svelte Query-klient, key-konvensjon og devtools i utvikling
- protected/admin route groups og guardtilstander
- idempotent utlogging og 401-flyt

### Kvalitetsport

- hard refresh med gyldig sesjon gir ikke falsk redirect
- anonym, initializing og authenticated state er deterministiske
- dedikert tenant og slug-basert tenant gir samme interne kontrakt
- auth fungerer med base path
- backend forblir autoritativ for alle kapabiliteter

## WP-4 — UI-fundament og designsystem

### Leveranser

- tokens, globale stilfiler, tema og font
- primitive wrappers for faktiske behov; Bits UI bare der kompleks atferd krever det
- produktfamiliene `Page`, `Collection`, `Section`, `Settings`, `Form`, `Dialog` og `Document`
- navigation-, feedback-, loading- og errorpatterns
- dato-/kalenderpatterns, editorgrense og ikonkonvensjon
- komponenttester, tilgjengelighetstester og designsystemkontroll

### Kvalitetsport

- ingen Bits UI-import utenfor primitives
- patterns dekker alle identifiserte featurebehov uten lokale varianter
- dialog, select, menu, popover og kalender har verifisert fokus- og tastaturatferd
- mobil/desktop og lyst/mørkt tema er kontrollert på representative patterns
- features kan implementeres uten feature-CSS

## WP-5 — App-shell og navigasjon

### Leveranser

- desktop-sidefelt
- mobil topp- og bunnnavigasjon
- konto, tema, tenantidentitet og routeaktivitet
- boot-, loading- og recoveryforløp uten blanke mellomflater
- route metadata og lokal tilbakehandling der den trengs

### Kvalitetsport

- shellgeometri er stabil under boot og navigasjon
- direkte lenker, tilbake/frem og mobile/desktop-ruter fungerer
- navigasjon følger kapabiliteter og innloggingsstatus
- visuell referansekontroll er gjennomført

## WP-6 — Featuremigrering

Features migreres i denne avhengighetsrekkefølgen:

1. authside, policy, feil og guardflater
2. booking og bookingbootstrap
3. Mine tider og Min side
4. Arrangementer og Nyheter
5. Baner, Grener og felles arbeidsområde
6. Klubb- og medlemskapsinnstillinger
7. Arrangementadministrasjon
8. Brukere og brukersperre
9. Kunngjøringsadministrasjon og rikteksteditor
10. Statistikk

Rekkefølgen kan bare endres når en dokumentert avhengighet gjør en senere gruppe nødvendig først.
Statusregisteret oppdateres da, men featurearkitekturen endres ikke lokalt.

### Fast featureoppskrift

#### A. Adferdskontrakt

Dokumenter før kode:

- routes og søkeparametere
- offentlige og beskyttede API-kall
- roller og kapabiliteter
- loading, empty, error, success og blocked states
- mutations, feedback og invalidation
- mobil, desktop, lyst og mørkt tema
- tastatur- og fokusforløp

Dette er en observasjon av produktet, ikke et inventar over React-komponenter.

#### B. SvelteKit-design

Fordel ansvar eksplisitt:

- URL og navigasjon: route params/search params
- route- og tenantdata: layouts/`load`
- serverdata: TanStack Svelte Query
- lokal arbeidsflyt: `$state` og `$derived`
- treomspennende instanser: typed context
- ren beregning: TypeScript i domain/feature model
- tilgjengelig UI-atferd: offentlig pattern over primitive/Bits UI

#### C. Implementasjon

- flytt eller skriv ren kontrakt og domenelogikk
- implementer endpoint- og querykontrakt
- implementer bare nødvendig reaktiv arbeidsflyt
- bygg feature-UI med offentlige patterns
- koble en tynn route til featureens offentlige inngang

#### D. Paritetsport

- adferdskontrakten er oppfylt
- relevante tester passerer
- mobil og desktop er visuelt kontrollert
- tilgjengelighet og fokus er kontrollert
- ingen direkte Bits-, Supabase-, storage- eller HTTP-kobling finnes i featurekode
- erstattet React-kode er fjernet
- statusregisteret viser faktisk resultat og neste feature

## WP-7 — Samlet paritet og produksjonsbytte

### Leveranser

- full route- og featureparitet
- kritiske Playwright-flyter for login, booking, avbestilling og adminendringer
- visuell kontroll på avtalte viewporter, roller og tema
- bundle-, ytelses- og lazy-loading-gjennomgang
- produksjonslik deploytest på målhostene
- fjerning av React, Axios, React Query, shadcn/Radix og øvrige ubrukte avhengigheter
- oppdaterte drifts- og utviklingsinstruksjoner

### Kvalitetsport

- ingen React-runtime eller React-kilde gjenstår
- alle routes kan lastes direkte i produksjonslik hosting
- test, check og build er grønne
- ingen midlertidige adapters, TODO-er eller statusavvik står åpne
- backend- og authkontrakter er verifisert mot produksjonslikt miljø
- `migration-status.md` kan markeres fullført

## Stoppregler

Arbeidet stoppes for brukerbeslutning når:

- paritet krever en backend- eller produktendring utenfor godkjent omfang
- et valg endrer en godkjent ADR eller den visuelle produktkontrakten
- produksjonsdata, ekstern deploy eller destruktiv handling krever ny autoritet
- sann adferd ikke kan fastslås fra kode, tester eller kjørbar referanse

Vanlig implementasjonsusikkerhet er ikke en stoppgrunn. Inspiser kode og referanse, velg løsningen
som følger arkitekturen, og dokumenter resultatet.

## Handoverregel

[`migration-status.md`](./migration-status.md) oppdateres ved slutten av hver arbeidsøkt og ved alle
arbeidspakkeskifter. Dokumentet overskriver gammel nåsituasjon; det vokser ikke som dagbok.

Handover er forventet mellom AI-sesjoner også når arbeidet går normalt. En aktiv arbeidspakke kan
deles i flere atomiske checkpoints. Sesjonen som fullfører en arbeidspakke registrerer neste
arbeidspakke og stopper; neste `/start` leser repoet og starter den.
