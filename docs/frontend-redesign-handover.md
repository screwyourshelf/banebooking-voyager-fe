# Frontend-redesign: handover til neste Codex-task

> **Status:** POC-milepæl klar
> **Sist oppdatert:** 2026-07-31
> **Repo:** `/Users/andreas/Dev/banebooking/frontend`
> **Branch:** `feature/frontend-design-poc`
> **Utgangspunkt:** `main` på `dbf08f5`

## Start her

1. Les `docs/frontend-redesign-plan.md` før nye UI-endringer.
2. Bekreft branch og ren arbeidsflate med `git status --short`.
3. Start frontend med `npm run dev -- --host 0.0.0.0` hvis den ikke allerede kjører.
4. Bruk utviklingsinnloggingen i innloggingsmenyen for å teste Admin, Utvidet og Bruker.
5. Gjør neste arbeid som en avgrenset slice; ikke redesign flere ubeslektede sider samtidig.

Dokumenter i `docs/archive/` er historiske og skal ikke brukes som gjeldende plan.

## Hva POC-en har etablert

### Appskall og navigasjon

- Desktop har fast sidenavigasjon og bred arbeidsflate.
- Mobil har toppfelt, fast bunnnavigasjon og samlet `Mer`-/kontomeny.
- Lyst/mørkt tema er alltid tilgjengelig som ikonverktøy.
- Navigasjonsmodell og labels er samlet, slik at mobil og desktop bruker samme struktur.

Sentrale filer:

- `src/app/AppShell.tsx`
- `src/components/navigation/AppSidebar.tsx`
- `src/components/navigation/MobileBottomNav.tsx`
- `src/components/navigation/navigationModel.ts`
- `src/components/navigation/LoginPanel.tsx`

### Innlogging for lokal POC

- Vanlig Supabase-innlogging er beholdt.
- I `DEV` finnes testinnlogging for `admin`, `utvidet` og `medlem` uten Supabase-brukere.
- Frontend kaller `POST /api/dev-auth/login`, lagrer en lokal utviklingssession og bruker
  `DevelopmentBearer` mot API-et.
- Testinnloggingen avhenger av at backendens dev-auth-endepunkt kjører.

Sentrale filer:

- `src/auth/`
- `src/providers/AuthProvider.tsx`
- `src/hooks/useAuth.ts`
- `src/api/api.ts`
- `src/utils/authUtils.ts`

### Book bane

- Mobilens grønne kontrollflate inneholder aktivitet, hurtigdato og banevalg.
- Valgt aktivitet styrer understrek på alle bookingvalg:
  - tennis: oransje;
  - padel: grønn;
  - bordtennis: blågrå.
- Banevalg viser ledige tider i parentes med statusprikk.
- Slots viser starttid, kompakt vær, hovedstatus og eventuell sekundær forklaring.
- `Ledig` og `Opptatt` er hovedstatus; eier, navn og arrangement er forklarende varianter.
- Slot-handlinger bruker felles hierarki og flyter til høyre.
- Varsler fra feed/RSS er tilbake i appskallet og på bookingsiden.

Sentrale filer:

- `src/features/booking/views/booking/BookingContent.tsx`
- `src/features/booking/components/BookingMobileControls.tsx`
- `src/features/booking/components/BookingCourtSwitcher.tsx`
- `src/features/booking/components/BookingSlotListAccordion.tsx`
- `src/features/booking/activityTheme.ts`
- `src/features/feed/components/FeedNotice.tsx`

### Brukeradministrasjon

- Mobil har grønn kontrollflate med nøytralt søkefelt og sammenleggbare filtre.
- Desktop har bredt søk/filterområde og tabellorientert informasjon.
- Brukertreff bruker samme listekort-ramme som booking-slots.
- Medlemskap uten bekreftelse heter `Ikke bekreftet`.
- Redigeringsdialog og destruktive handlinger følger nye designroller.

Sentrale filer:

- `src/features/brukere/views/brukere-liste/BrukerFilterPanel.tsx`
- `src/features/brukere/views/brukere-liste/BrukerListeRad.tsx`
- `src/features/brukere/views/brukere-liste/BrukereListeContent.tsx`
- `src/features/brukere/views/brukere-liste/RedigerBrukerDialog.tsx`

### Delte designmønstre

- Alle globale visuelle roller ligger foreløpig i `src/styles/design-system.css`.
- `ControlChoice` gir felles geometri og valgtilstand.
- `record-list` og `record-card` gir felles ramme for slots og søkeresultater.
- `PageHeader` gir felles sidehierarki.
- Shadcn/Radix-primitiver er beholdt i `src/components/ui/`.

Sentrale filer:

- `src/styles/design-system.css`
- `src/components/controls/ControlChoice.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/accordion.tsx`

## Beslutninger som skal bevares

- Grønt betyr struktur og positiv hovedhandling.
- Oransje er generell valgmarkør; booking overstyrer alle valg med aktivitetsfargen.
- `Book`/`Lagre` er primær grønn.
- `Koble til arrangement`/`Avbryt` er nøytral sekundær.
- `Avbestill`/`Sperr`/`Slett` bruker samme destruktive variant.
- Tekstknapper har normalt ikke dekorative ikoner.
- Slots og resultatrader fyller hele beholderbredden; luft legges kun mellom radene.
- Mobil og desktop skal løses bevisst, ikke som skalerte kopier.
- Sider skal ikke innføre nye tilfeldige farger eller lange lokale Tailwind-varianter.

## Verifisert ved handover

- `npm run check` passerer.
- `npm run build` passerer.
- `git diff --check` passerer.
- Booking og brukeradmin er visuelt kontrollert på mobil og desktop.
- Lyst og mørkt tema er kontrollert.
- Aktivitetsoverstyring er kontrollert for tennis, padel og bordtennis.
- Ingen feil eller advarsler fra appen ble observert i nettleserkonsollen.

Vite viser fortsatt et ikke-blokkerende varsel om at React-chunken er større enn 500 kB.
Dette er ikke introdusert som en funksjonell feil i redesignarbeidet.

## Kjent gjeld og avgrensninger

- `design-system.css` er stor og bør deles etter ansvar i neste fundament-slice. Ikke del
  per side, og ikke gjør en mekanisk omskriving uten visuell kontroll.
- Flere gamle sider bruker fortsatt lokale Tailwind-klasser og direkte shadcn-varianter.
- Desktop er kontrollert, men mobil har fått mest produktdesignarbeid i POC-en.
- Aktivitetsfarger er foreløpig mappet fra slug i frontend.
- Det finnes ingen automatisert visuell regresjonstest ennå.
- Resterende sider er ikke migrert og kan derfor avvike tydelig fra appskallet.
- Backendens planlagte overgang bort fra flere klubber/tenants inngår ikke i denne branchen.

## Anbefalt neste oppgave

### Mål

Konsolider redesignfundamentet uten å endre funksjonalitet, og migrer deretter `Mine tider`
som neste vertikale slice.

### Foreslått rekkefølge

1. Kartlegg hvilke deler av `design-system.css` som er tokens, primitiver og delte mønstre.
2. Del filen forsiktig etter disse ansvarsgrensene og behold importrekkefølgen stabil.
3. Kartlegg dagens `MineBookingerPage`, alle tilstander og handlinger.
4. Gjenbruk `record-list`, `record-card`, bookingstatus og destruktiv knapp.
5. Lag bevisst mobil- og desktopvisning.
6. Kontroller admin, utvidet og vanlig bruker der rollene påvirker siden.
7. Kontroller lyst/mørkt tema, tomtilstand, lasting og API-feil.
8. Kjør tekniske kontroller og visuell nettleserkontroll.

### Ikke gjør i samme task

- Ikke start arrangement-, turnering- eller backend-redesign samtidig.
- Ikke fjern Radix/shadcn-primitiver som fortsatt gir tilgjengelig interaksjon.
- Ikke koble aktivitetsfarger til en ny backend-kontrakt uten en separat beslutning.
- Ikke endre booking- eller autorisasjonsregler som del av den visuelle migreringen.

## Nyttige kommandoer

```bash
npm run dev -- --host 0.0.0.0
npm run typecheck
npm run check
npm run build
git diff --check
```

Lokal app brukes normalt på `http://localhost:5173/aas-tennisklubb`. Ved testing på telefon
må Vite kjøre med `--host 0.0.0.0`, og telefonen må bruke Macens aktive Wi-Fi-adresse.
