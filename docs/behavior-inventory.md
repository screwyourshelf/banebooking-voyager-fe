# Observerbar adferdskontrakt

> **Status:** React-baseline for SvelteKit-migreringen
>
> **Sist oppdatert:** 2026-08-22

## Formål og avgrensning

Dette dokumentet beskriver produktadferden som skal bevares gjennom lift-and-shift: URL-er,
tenantformer, tilgang, sentrale backendkall, kritiske states og brukerflyter. Det beskriver ikke
React-komponenter, hooks eller dagens filstruktur.

Backend er autoritativ for roller og kapabiliteter. Klienten bruker kapabiliteter til å vise eller
skjule handlinger og til å presentere blokkerte flater; routebeskyttelse er ikke en
sikkerhetsgrense.

## URL- og tenantkontrakt

Alle app-URL-er fungerer under en konfigurerbar hosting-base path.

| Driftsform     | Tenantrot                   | Eksempel på booking | Eksempel på administrasjon |
| -------------- | --------------------------- | ------------------- | -------------------------- |
| Multi-tenant   | `/{slug}`                   | `/{slug}`           | `/{slug}/admin/baner`      |
| Dedikert build | slug fra buildkonfigurasjon | `/`                 | `/admin/baner`             |

I multi-tenantmodus sender `/` brukeren til sist brukte slug når den finnes i lokal lagring,
ellers til konfigurert standardslug. En gyldig slug lagres lokalt etter at klubben er lastet.
Dedikert build viser de samme app-rutene uten slugsegment. `auth/callback` ligger alltid utenfor
tenanttreet og må fungere både på root og under hostingens base path.

Direkte lasting, refresh, tilbake/frem og ukjente URL-er er del av routekontrakten. En ukjent route
viser «Siden finnes ikke»; en ukjent tenant viser «Fant ikke klubben» med råd om å kontrollere
adressen.

## Routeinventar

`{tenant}` under betyr enten `/{slug}` i multi-tenantmodus eller tomt segment i dedikert build.

| URL                            | Flate                           | Tilgang og kapabilitet                                      | Viktig URL-state                                       |
| ------------------------------ | ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `{tenant}`                     | Book bane                       | Offentlig lesing; handlinger bestemmes per slot             | Ingen; gren, bane og dato er lokal state               |
| `{tenant}/vilkaar`             | Vilkår                          | Offentlig                                                   | Ingen                                                  |
| `{tenant}/login`               | Logg inn                        | Offentlig; innlogget bruker sendes til opprinnelig mål/root | Opprinnelig mål bevares gjennom login                  |
| `{tenant}/minside`             | Min side                        | Innlogging                                                  | `?tab=profil` eller `?tab=persondata` velger startfane |
| `{tenant}/bookinger`           | Mine tider                      | Innlogging                                                  | Ingen; historikkvalg er lokal state                    |
| `{tenant}/arrangementer`       | Arrangementer                   | Offentlig; innlogget svar kan inneholde flere handlinger    | `?arrangement={id}` åpner detaljrad                    |
| `{tenant}/nyheter`             | Nyheter                         | Offentlig                                                   | Ingen                                                  |
| `{tenant}/arrangement`         | Administrer arrangementer       | Innlogging + `arrangement:se`                               | Ingen; editor og steg er lokal state                   |
| `{tenant}/admin/klubb`         | Klubbinnstillinger              | Innlogging + `klubb:admin`                                  | Ingen; seksjon er lokal state                          |
| `{tenant}/admin/baner`         | Baner i felles arbeidsområde    | Innlogging + `baner:admin`                                  | Ingen                                                  |
| `{tenant}/admin/grener`        | Grener i felles arbeidsområde   | Innlogging + `grener:admin`                                 | Ingen                                                  |
| `{tenant}/admin/brukere`       | Brukere                         | Innlogging + `brukere:lese` eller `brukere:admin`           | Ingen; søk/filter er lokal state                       |
| `{tenant}/admin/kunngjøringer` | Kunngjøringer                   | Innlogging + `kunngjøring:admin`                            | Ingen                                                  |
| `{tenant}/admin/statistikk`    | Statistikk                      | Innlogging + `statistikk:lese`                              | Ingen; periode/filter er lokal state                   |
| `{tenant}/bekreft-medlemskap`  | Obligatorisk medlemsbekreftelse | Innlogget bruker som er flagget av backend                  | Guardstyrt                                             |
| `{tenant}/kunngjøring`         | Obligatorisk kunngjøring        | Innlogget bruker med ulest obligatorisk kunngjøring         | Guardstyrt                                             |
| `{tenant}/sperret`             | Sperret konto                   | Innlogget bruker som backend markerer sperret               | Guardstyrt                                             |
| `/auth/callback`               | Innloggingscallback             | Offentlig teknisk route                                     | OAuth/OTP-parametere fra leverandør                    |

`/admin` har ingen egen produktside. Den er bare URL-prefiks for adminflatene.

## Oppstart, auth og guardrekkefølge

1. Appen gjenoppretter utviklingssession eller Supabase-session. Mens utfallet er ukjent reserveres
   appgeometrien med en tydelig innloggings-/boottilstand.
2. På bookingroten forsøkes ett samlet `booking-bootstrap`-kall for dagens dato og aktuell
   brukeridentitet. `404` eller `405` betyr at klienten bruker de eksisterende enkeltkallene;
   andre feil gir en retrybar bootstrapfeil.
3. Klubben lastes før appskallet regnes som klart. Manglende klubb gir en tenantfeil uten blank
   mellomflate.
4. For innloggede brukere hentes brukerprofilen. Guardene håndheves i denne rekkefølgen:
   sperret konto, obligatorisk kunngjøring, obligatorisk medlemsbekreftelse, deretter ordinær route.
5. En beskyttet route uten session sender brukeren til tenantens login og bevarer opprinnelig
   pathname, query og hash. Etter vellykket login returneres brukeren dit.
6. En backend-`401` håndteres sentralt og idempotent: lokal auth ryddes, sessionutløp varsles én
   gang og brukeren sendes til login.

Supabase støtter Google OAuth, e-post/sekssifret OTP og valgfri Idrettens ID. Utviklingsmodus kan
bruke ferdige utviklingsprofiler gjennom `POST /api/dev-auth/login`. Innlogging krever tilgjengelig
lokal lagring; offentlige flater gjør ikke det. Callbacken venter på eksisterende eller ny session
og har et femsekunders redirect-sikkerhetsnett. Målet er tenantrot basert på buildkonfigurasjon
eller sist brukte slug.

## Roller og kapabiliteter

Backend returnerer rollene `Medlem`, `Utvidet` og `KlubbAdmin`, men handlinger styres av følgende
kapabiliteter:

| Domene         | Kapabiliteter                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Booking        | `booking:book`, `booking:fjern`, `booking:kobleTilArrangement`                                            |
| Arrangement    | `arrangement:se`, `arrangement:avlys`                                                                     |
| Klubb          | `klubb:admin`                                                                                             |
| Baner/grener   | `baner:admin`, `grener:admin`                                                                             |
| Brukere/sperre | `brukere:lese`, `brukere:admin`, `bruker:slett`, `bruker:sperr`, `bruker:seSperre`, `bruker:opphevSperre` |
| Medlemskap     | `medlemskap:aktiver`                                                                                      |
| Kunngjøringer  | `kunngjøring:admin`                                                                                       |
| Statistikk     | `statistikk:lese`                                                                                         |

Navigasjonen viser offentlige flater til alle, kontoflater bare til innloggede og adminflater når
minst én relevant kapabilitet finnes. Et manuelt URL-besøk uten kapabilitet beholder sidekonteksten
og viser en forklarende tilgangstilstand. Backend avgjør fortsatt om hvert kall og hver mutasjon er
tillatt.

## Featurekontrakter

### Auth, policy, feil og guards

- Login bevarer tiltenkt mål og viser egne sending-, verifisering-, fullført- og feiltilstander.
- Vilkår er offentlig leseinnhold tilpasset klubbdata. Første innloggede brukerlast uten registrert
  aksept poster aktiv vilkårsversjon og henter brukerdata på nytt.
- Sperret konto kan bare lese sperreinformasjon og kontakte klubben; booking og arrangementhandlinger
  er utilgjengelige.
- Obligatorisk kunngjøring må leses og bekreftes før ordinære appflater åpnes.
- Obligatorisk medlemsbekreftelse krever fullt navn og medlemskapstype og lenker til vilkår og
  klubbens medlemskapsside.
- Alle guardflater skiller mellom avklaring/loading, retrybar brukerdatafeil, blokkert state og
  normal videreføring.

Sentrale API-er: `GET /klubb/{slug}`, `GET /klubb/{slug}/bruker`,
`POST /klubb/{slug}/bruker/vilkaar`, `POST /klubb/{slug}/bruker/bekreft-medlemskap` og
`POST /klubb/{slug}/kunngjøringer/{id}/bekreft`.

### Booking og bootstrap

- Bookingroten viser aktive grener, tilhørende baner og kalender for valgt dato. Første gren med
  bane, første bane i grenen og dagens dato velges som standard.
- Offentlige brukere kan lese fysisk tilgjengelighet, arrangementinformasjon, vær og reglement.
  Innlogging endrer tilgjengelige handlinger, ikke statusordene `Ledig` og `Opptatt`.
- Slotkapabiliteter styrer hurtigbooking, avbestilling og kobling til et aktivt arrangement.
- Booking og avbestilling oppdaterer sloten optimistisk, ruller tilbake ved feil og invaliderer
  kalender og Mine tider etterpå.
- Kritiske states er bootstrap/loading med bevart appgeometri, manglende bookingoppsett, manglende
  baner, tom slotliste, nettverks-/API-feil med retry, pågående refresh og inline mutasjonsfeil.

Sentrale API-er: `GET /klubb/{slug}/booking-bootstrap?dato=`,
`GET /klubb/{slug}/grener`, `GET /klubb/{slug}/baner`,
`GET /klubb/{slug}/kalender?baneId=&dato=`, `POST /klubb/{slug}/bookinger`,
`DELETE /klubb/{slug}/bookinger/{id}` og `GET /klubb/{slug}/arrangement/aktive?grenId=`.

### Mine tider og Min side

- Mine tider viser kommende bookinger, kan inkludere historikk, grupperer/sorterer etter relevans
  og viser avbestilling bare når bookingen har `booking:fjern`.
- Min side har profil og persondata. Profilen kan bruke e-post eller validert visningsnavn, viser
  roller og medlemsstatus og kan slette egen konto.
- Persondata viser vilkårssamtykke, laster ned en JSON-eksport og tilbyr kontosletting.
- Kritiske states er profil-/listeloading, tom bookingliste, retrybar lesefeil, feltvalidering,
  pågående mutasjon, lagret state, nedlastingsfeil og bekreftet destruktiv handling.

Sentrale API-er: `GET /klubb/{slug}/bookinger/mine?inkluderHistoriske=`,
`DELETE /klubb/{slug}/bookinger/{id}`, `GET|PATCH|DELETE /klubb/{slug}/bruker/meg` og
`GET /klubb/{slug}/bruker/meg/egen-data`.

### Arrangementer og nyheter

- Arrangementer bruker offentlig endpoint anonymt og innlogget endpoint med kapabiliteter når en
  session finnes. Listen kan vise historikk, filtrere på gren, åpne en detalj fra
  `?arrangement={id}` og paginerer lokalt i puljer på ti.
- Avlysning vises bare med `arrangement:avlys` og oppdaterer arrangementlisten etter resultatet.
- Nyheter er en offentlig, lokalt paginert feed. Eksterne lenker åpnes i ny fane med sikker
  relasjon.
- Begge flater har geometribevarende loading, retrybar feil, tomtilstand og bakgrunnsrefresh.
  Arrangementfilter har i tillegg en egen filtrert tomtilstand med nullstilling.

Sentrale API-er: `GET /offentlig/klubb/{slug}/arrangementer/visning`,
`GET /klubb/{slug}/arrangementer`, `DELETE /klubb/{slug}/arrangement/{id}` og
`GET /klubb/{slug}/feed`.

### Baner og grener

- `/admin/baner` og `/admin/grener` er samme arbeidsområde med kapabilitetsstyrte seksjonslenker.
- Baner kan opprettes og redigeres, aktiveres/deaktiveres gjennom objektets state og overstyre
  bookinginnstillinger per bane.
- Grener kan opprettes, redigeres, aktiveres/deaktiveres og eier standard bookingregler og
  banereglement.
- Valgt bane/gren kan huskes lokalt, men er ikke en del av URL-kontrakten.
- Kritiske states er tilgangskontroll, lasting, tom samling, retrybar feil, åpen editor,
  feltvalidering, ulagret utkast, lagring, lagret bekreftelse og mutasjonsfeil.

Sentrale API-er: `GET|POST /klubb/{slug}/baner`, `PUT /klubb/{slug}/baner/{id}`,
`PUT /klubb/{slug}/baner/{id}/booking-innstillinger`, `GET|POST /klubb/{slug}/grener`,
`PUT|DELETE /klubb/{slug}/grener/{id}` og `PUT /klubb/{slug}/grener/{id}/aktiver`.

### Klubb og medlemskap

- Klubbprofilen redigerer navn, kontakt, nettside, posisjon og feedinnstillinger med feltvalidering
  og dirty-state.
- Medlemskapsseksjonen viser antall bekreftede/totale og kan aktivere en merket
  bekreftelsesperiode med gyldighetsdato eller deaktivere den aktive perioden.
- Kritiske states er tilgangskontroll, loading, retrybar feil, ugyldig/urørt skjema, pågående
  lagring, lagret state og separate feil for aktivering/deaktivering.

Sentrale API-er: `GET|PUT /klubb/{slug}`, `GET /klubb/{slug}/medlemskap/status` og
`POST|DELETE /klubb/{slug}/medlemskap/aktiver`.

### Arrangementadministrasjon

- Oversikten kan opprette, velge, redigere og slette arrangementer. Editorforløpet skiller
  informasjon/metadata fra banetider.
- Banetider kan foreslås gjentakende eller manuelt. Backend forhåndsviser ledige tider og
  konflikter; klienten beholder et lokalt stagingutkast og sender bare gyldige forslag.
- Eksisterende arrangement kan endre metadata, legge til enkelttider eller batch, fjerne tider og
  avlyses. Delvis batchsuksess beholder feilede forslag og forklarer resultatet.
- Kritiske states er tilgangskontroll, tom arrangementliste, loading av oppsett/arrangement/tider,
  validering, ingen forslag, konflikter, staging, lagring, delvis suksess, full suksess,
  retrybar lesefeil og lokale mutasjonsfeil.

Sentrale API-er: `GET /klubb/{slug}/arrangementer`,
`POST /klubb/{slug}/arrangement/forhandsvis`, `POST /klubb/{slug}/arrangement`,
`PUT /klubb/{slug}/arrangement/{id}/forhandsvis`, `PUT|DELETE /klubb/{slug}/arrangement/{id}`,
`PATCH /klubb/{slug}/arrangement/{id}/metadata` og
`GET|POST|DELETE /klubb/{slug}/arrangement/{id}/bookinger[/{bookingId}]` med eget
`POST .../bookinger/batch`.

### Brukere og sperre

- Lesetilgang viser en søkbar og filtrerbar brukerliste. `brukere:admin` gir redigering av rolle og
  visningsnavn; egen eller slettet bruker kan ikke redigeres.
- Objektkapabiliteter styrer sletting, sperring, visning av sperrehistorikk og oppheving av aktiv
  sperre.
- Kritiske states er tilgangskontroll, loading, tom/filtrert tom liste, retrybar feil, åpen editor
  eller destruktiv bekreftelse, felt-/serverfeil, pågående mutasjon og oppdatert liste.

Sentrale API-er: `GET /klubb/{slug}/bruker/admin/bruker`,
`PUT|DELETE /klubb/{slug}/bruker/admin/bruker/{id}`,
`GET|POST /klubb/{slug}/bruker/admin/bruker/{id}/sperr` og
`DELETE /klubb/{slug}/bruker/admin/bruker/{id}/sperr/{sperreId}`.

### Kunngjøringsadministrasjon

- Flaten viser aktiv obligatorisk kunngjøring, oppretter en ny med tittel, riktekst og
  utløpstidspunkt og kan deaktivere den aktive.
- Kritiske states er tilgangskontroll, loading, ingen aktiv kunngjøring, aktiv kunngjøring,
  editorvalidering, pågående mutasjon, suksess, retrybar lesefeil og mutasjonsfeil.

Sentrale API-er: `GET /klubb/{slug}/kunngjøringer/aktiv`,
`POST /klubb/{slug}/kunngjøringer` og `DELETE /klubb/{slug}/kunngjøringer/{id}`.

### Statistikk

- Flaten viser nøkkeltall, medlemsstatistikk, bookingtype, måned, tidspunkt og banefordeling for en
  valgt periode. Filter kan sammenligne med forrige år og avgrense gren og bane.
- Tidligere data beholdes synlig mens et nytt filterresultat lastes.
- Kritiske states er tilgangskontroll, førstegangsloading, bakgrunnsrefresh med forrige data,
  manglende datagrunnlag, retrybar feil og full datavisning.

Sentralt API: `GET /klubb/{slug}/statistikk/bookinger?fra=&til=&sammenlignMedForrigeÅr=&grenId=&baneId=`.

## Felles presentasjons- og tilgjengelighetskontrakt

- Appskallet reserverer geometri under boot og routebytte; sentrale arbeidsflater returnerer ikke
  blankt innhold som loadingtilstand.
- Desktop bruker sidefelt, mobil bruker klubbidentitet i toppfelt og primærnavigasjon nederst.
- Queryfeil beholder side-/samlingskontekst og tilbyr retry når kallet kan gjentas.
- Feltfeil vises ved feltet, mutasjonsfeil ved handlingen og globale sessionhendelser som toast.
- Dialoger, editorer, filtre, kalender og ekspanderbare rader må bevare tastaturbruk, fokusretur,
  labels og live-/alertsemantikk.
- Mobil og desktop bruker samme ordlyd, status og informasjonsrekkefølge. Lyst og mørkt tema er del
  av alle flater.

## Baselinebevis

Inventaret er utledet fra den kjørbare React-referansen, routekonfigurasjonen, tilgangsmodellene,
endpointkontraktene, testene og den sentrale produkt- og designkontrakten. Det er autoritativt for
hva som skal observeres under featureparitet, mens backendresponsene er autoritative for konkrete
kapabiliteter og transportdata.
