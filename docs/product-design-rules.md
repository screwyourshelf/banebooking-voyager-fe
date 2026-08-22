# Produkt- og designregler

> **Status:** Bindende produktkontrakt
>
> **Sist oppdatert:** 2026-08-22

## Formål

Dette dokumentet beskriver Banebookings visuelle språk, informasjonssemantikk og offentlige
UI-mønstre uavhengig av frontendrammeverk. Det skal brukes sammen med
[`sveltekit-architecture.md`](./sveltekit-architecture.md) og
[`ADR-004`](./adr/004-ui-and-component-boundaries.md).

Designsystemet skal gjøre den naturlige løsningen til den riktige løsningen. En feature beskriver
innhold, tilstand og handlinger; den konstruerer ikke sin egen visuelle grammatikk.

## Produktmål

- Banebooking skal ha en tydelig identitet og ikke fremstå som et generisk dashboard.
- Handlinger, status, navigasjon og listevisninger skal være gjenkjennelige i hele appen.
- Mobil og desktop skal løse arbeidsformen på sin flate uten å bli to ulike designsystemer.
- Farger, typografi, avstand, radius og komponentvarianter skal eies sentralt.
- Features skal komponere semantiske produktmønstre fremfor å definere lokale varianter.

## Offentlig produktvokabular

Produktlaget skal tilby disse familiene. Eksakt Svelte-API fastsettes i implementasjonen, men
ansvaret er bindende:

- `Page` eier sidebredde, introduksjon, beskrivelse, primær sidehandling og sidetilstander.
- `Collection` eier entitetsoversikter, filtre, lister, grupper og rader.
- `Section` er den generelle innholdsseksjonen. `soft`, `surface` og `plain` er sentrale uttrykk.
- `Settings` eier innstillingsseksjoner, statusrader, brytere og valggrupper.
- `Form` eier feltgrupper, felt, hjelpetekst, valideringsfeil, trinn og handlinger.
- `Dialog` eier vanlig dialog og en fokusert editorvariant.
- `Document` eier lengre leseinnhold med intro, seksjoner og fakta.

Navigasjon, feedback, loading og editor er delte produktbyggesteiner. De er ikke alternative
sidetyper. Hvis en feature ikke kan uttrykkes med det offentlige vokabularet, forbedres riktig
familie før det lages lokal struktur.

## Bindende komponentgrenser

1. Feature-sider bruker `Page` og lager ikke egne sidehoder eller page shells.
2. Sidens primære opprettelseshandling eies av `Page`. `Collection` brukes til oversikt, filtre og
   kontekstuelle samlingshandlinger, ikke en parallell opprettelsesknapp.
3. Featurekode bruker det offentlige UI-API-et og importerer ikke interne pattern- eller
   primitivefiler.
4. Admin er tilgang og domene, ikke et visuelt designsystem. Det finnes ikke parallelle
   adminvarianter av `Page`, `Form`, `Section` eller `Collection`.
5. Farger, typografi, radius, avstander, sidebredder og responsive skifter defineres i tokens og
   sentrale patternfiler.
6. Features har ingen egne CSS-filer, utilitykomposisjoner eller inline produktstyling. Eksplisitte
   datavisualiseringer er eneste datadrevne unntak.
7. Rå primitives brukes ikke til featurekomposisjon når et produktpattern eier problemet.
8. En ny variant må løse samme problem for minst to reelle konsumenter.
9. Unntakslisten i designsystemkontrollen er lukket teknisk gjeld og skal bare reduseres.
10. `Page`, vanlig `Dialog` og editorvarianten eier standardstørrelsen. Featurekode velger ikke
    lokal bredde eller høyde.

## Farger og status

- Grønt er produktets strukturfarge for navigasjon, kontrollflater og positive hovedhandlinger.
- Oransje er standard markør for valgte alternativer utenfor en aktivitetskontekst.
- Bookingvalg følger valgt aktivitet: tennis er oransje, padel er grønn og bordtennis er blågrå.
- Aktivitetsfarger endrer bare farge, aldri struktur, størrelse eller oppførsel.
- Statusfarger brukes bare for faktisk status.
- Destruktive handlinger bruker én felles lysrød variant med rød tekst.
- Slotstatus beskriver fysisk tilgjengelighet, ikke brukerens handlingsrettighet. En ledig tid
  forblir `Ledig` selv om brukeren mangler kapabilitet til å booke den.
- Kapabiliteter styrer hvilke handlinger som vises. En detaljforklaring beskriver begrensningen.

Aktivitetsfarger løses foreløpig fra aktivitetens slug. En eventuell backendkontrakt for
aktivitetsmetadata krever en separat beslutning.

## Handlinger og ikoner

- Primær positiv handling er fylt grønn, for eksempel `Book` og `Lagre`.
- Sekundær handling er nøytral outline, for eksempel `Koble til arrangement` og `Avbryt`.
- Destruktiv handling bruker felles destruktiv variant, for eksempel `Avbestill`, `Sperr` og
  `Slett`.
- Handlinger i en tidsrad har innholdsbestemt bredde og plasseres ved handlingsenden.
- Tekstknapper bruker normalt ikke dekorative ikoner.
- Ikoner beholdes når de tydeliggjør navigasjon, datavisning, leverandøridentitet, status eller en
  ren ikonhandling.
- Nye Svelte-flater bruker Hugeicons Free gjennom den offentlige `Icon`-primitiven. Features lager
  ikke lokale SVG-wrappers og blander ikke inn en ny ikonfamilie.
- `Icon` er dekorativ og skjult for hjelpemidler. Den omsluttende knappen, lenken eller synlige
  teksten eier alltid det tilgjengelige navnet og produktbetydningen.
- Patterns velger faste kontrollikoner selv. Konsumenter leverer bare ikon-snippets når betydningen
  faktisk eies av app-shellen eller produktinnholdet, som en navigasjonsdestinasjon.
- Seksjonsfaner og vanlige innstillingsoverskrifter skal normalt stole på teksthierarkiet.

## Skjema og innstillinger

- Redigerbare felt bygges gjennom `Form.Fields` og `Form.Field`, slik at label, hjelpetekst,
  kontroll og feil er én vertikal enhet.
- Et formfelt kan ikke brukes utenfor feltgruppen.
- `Settings.Row` brukes til innstillinger, status og brytere, ikke som alternativ feltlayout.
- Sekvensielle redigeringsforløp bruker `Form.Steps`, ikke faner.
- Trinnnummeret finnes i trinnnavigasjonen og gjentas ikke som «Steg N» i seksjonstittelen.
- `Settings.Section` har ett headinguttrykk: obligatorisk eyebrow, tittel og valgfri beskrivelse i
  samme venstrejusterte anatomi.
- Innstillingsseksjoner får ikke lokale headingvarianter eller dekorative seksjonsikoner.

## Dato og kalender

- Enkeltstående datofelt bruker produktets felles datovelger med norsk kalender.
- Booking kan bruke en egen semantisk valgknapp fordi datoen inngår i bookingpanelet, men kalender,
  locale og valgoppførsel er felles.
- Flervalg av dato bruker en egen felles flervelger. Forskjellen er funksjonell, ikke visuell.
- Features pakker ikke kalenderprimitiven lokalt og lager ikke egne date-input-varianter.
- Datoer som sendes til API følger eksisterende kontrakt.
- Visning av lagrede datoer går gjennom delte, rene formatteringsfunksjoner.

Den observerte konsumentkontrakten er:

| Presentasjon | Reelle flater                                                     | Ansvar                                                     |
| ------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `field`      | Sperring, kunngjøring, medlemskap, banetid og gjentakende oppsett | Full feltverdi og valgfri forrige-/neste-dag-navigasjon    |
| `filter`     | Egendefinert statistikkperiode og andre avgrensningsflater        | Kompakt dato med år i en filterkontroll                    |
| `booking`    | Bookingpanelets valg mellom i dag, i morgen og annen dato         | Kompakt semantisk valgknapp i den eksisterende valggruppen |

- Det offentlige kontroll-API-et bruker lokal ISO-dato `YYYY-MM-DD`, samme format som booking-,
  kalender- og arrangementkontraktene. En feature som sender et tidspunkt, som en utløpsdato, eier
  den eksplisitte konverteringen fra valgt dato til endpointets tidskontrakt.
- `DatePicker` eier trigger, portal, norsk `nb-NO`-locale, mandag som første ukedag,
  månedsnavigasjon, enkeltvalg, min-/maksgrenser, åpning, lukking og fokusretur. `field`, `filter` og
  `booking` velger bare sentralt format og geometri; featurekode formaterer ikke triggeren selv.
- `MultiDatePicker` eier inline kalender, deterministisk sortert flervalg og valgfri min-, maks- og
  antallsgrense. Den bruker samme dag-, måneds-, locale- og fokuskontrakt som enkeltvalg.
- `name` kobler enkeltvalg som én ISO-verdi og flervalg som gjentatte ISO-verdier til native
  `FormData`. I `Form.Field` arver kontrollene label, beskrivelse, required og feiltilstand.
- `disabled` uttrykker varig utilgjengelighet. `pending` låser den samme kontrollen midlertidig,
  beholder valgt verdi og eksponerer busy state.
- Åpning flytter fokus til valgt dato, piltaster flytter dagfokus, `Enter` velger, `Escape` lukker,
  og både valg og lukking returnerer fokus til triggeren. Månedsnavigasjonen har norske navn.
- Popoveren kollisjonstilpasses viewporten. Inline flervalg beholder kalendergeometrien og kan
  skrolle horisontalt på smale flater uten at featurekode lager en mobilvariant.

## Select og valglister

- `Select` brukes for ett valg fra en avgrenset liste. Søkbare eller frie valg hører til et senere
  combobox-mønster; datoer bruker kalenderfamilien.
- Optionen består av typed `value`, synlig `label` og valgfri `disabled`. Features komponerer ikke
  Bits-delene eller sender DOM-hendelser gjennom det offentlige API-et.
- Placeholder beskriver forventet valg når ingen verdi finnes. En tom liste åpner en eksplisitt
  «Ingen valg tilgjengelig»-tilstand og later ikke som placeholderen er et gyldig valg.
- `disabled` uttrykker varig utilgjengelighet. `pending` låser samme kontroll midlertidig og
  eksponerer busy state uten å skjule den valgte verdien.
- I `Form.Field` arver kontrollen id, beskrivelse, required og feiltilstand. `name` må oppgis når
  verdien skal inngå i native formdata eller native required-validering.
- Triggeren åpnes med pekeren, `Enter`, `Space` eller piltast. Pilene navigerer, typeahead finner
  etiketter, `Enter` velger og `Escape` lukker med fokus tilbake på triggeren.
- Portal, tastaturnavigasjon, typeahead, fokusretur, standardbredde og mobil tilpasning eies av
  Select-primitiven. Featurekode velger ikke lokal trigger- eller listebredde.

## Dialoger og fokuserte editorer

- Vanlig `Dialog` brukes til avgrenset lesing eller en kort handling i konteksten brukeren allerede
  står i. Den har kompakt standardbredde, skrollbart innhold og valgfritt handlingsområde.
- Editorvarianten brukes for sammensatte redigeringsforløp som brukerredigering og opprettelse av
  kunngjøringer. Den er fullskjerm på mobil og en fokusert, størrelsesstyrt flate på desktop.
- Åpning flytter fokus inn i dialogen, fokus holdes i den aktive dialogen, og lukking returnerer
  fokus til kontrollen som åpnet den.
- `Escape`, en eksplisitt lukke-/tilbakehandling og klikk utenfor lukker dialogen. Når en mutasjon
  pågår, er alle tre lukkemåtene blokkert til mutasjonen er ferdig eller har feilet.
- Dialoginnholdet skroller uten å flytte bakgrunnsflaten. Mobil editor tar hensyn til safe areas,
  og editorens handlinger kan være sticky når innholdet er lengre enn viewporten.
- Features styrer åpen tilstand og reagerer på det semantiske `onClose`. Portal, overlay,
  fokusfelle, fokusretur, standardstørrelse og dismiss-atferd eies av dialogfamilien.
- Dialoghandlinger følger de vanlige primær-, sekundær- og destruktivrollene. Pending state
  deaktiverer handlinger som ikke kan gjentas og eksponeres som busy state til hjelpemidler.

## Rikteksteditor

Rikteksteditoren har to observerte konsumenter: oppretting og redigering av arrangementets
publiserte nettsidepresentasjon. Begge bruker samme kontrakt og skal ikke bygge egne verktøylinjer
eller Tiptap-adapters.

- Det offentlige `RichTextEditor`-API-et bruker en serialisert Tiptap JSON-streng. Dette er samme
  verdi som lagres i `nettsideBeskrivelse`; featurelaget eier publiseringsvalg, skjemautkast og
  API-lagring, men tolker ikke editorens dokumenttre.
- Tom streng er gyldig tomt innhold. Når brukeren redigerer, leveres et komplett serialisert
  dokument gjennom bindbar `value` og det semantiske `onValueChange`-callbacket.
- En ny ekstern `value`, for eksempel ved bytte av arrangement eller reset, erstatter editorinnholdet
  uten å sende en konkurrerende change-hendelse. Markør- og formateringsstate kopieres ikke ut i
  featurelaget.
- Verktøylinjen dekker fet, kursiv, overskrift nivå 2 og 3, punktliste, nummerert liste, sitat og
  innsetting/sletting av tabell. Når markøren står i en tabell, vises også legg til/slett kolonne,
  legg til/slett rad og eksplisitt slett tabell.
- Verktøylinjekontroller er navngitte knapper med pressed state. Vanlige Tiptap-/ProseMirror-
  tastatursnarveier beholdes, og en verktøylinjehandling returnerer fokus til skriveflaten.
- Editorens innhold lastes bare i browseren. Loading reserverer sluttgeometrien. Oppstartsfeil fanges
  i en navngitt feilflate med retry; ugyldig lagret JSON feiler lukket uten å tilby en meningsløs
  retry eller overskrive originalverdien.
- `disabled` uttrykker varig låsing. `pending` låser editor og verktøylinje midlertidig, bevarer
  innholdet og eksponerer busy state.
- I `Form.Field` arver editoren kontroll-ID, label, beskrivelse, required og invalid state. `name`
  speiler den serialiserte JSON-strengen i native `FormData` når konsumenten trenger det.
- På mobil brytes verktøylinjen over flere linjer og skriveflaten beholder samme innholdsrekkefølge.
  Brede tabeller skroller inne i editoren; de utvider ikke side- eller dialogbredden.

## Samlinger og listerader

`Collection.Row` er appens eneste offentlige entitetsrad. Feltene har fast betydning:

| Felt          | Betydning                                                                           |
| ------------- | ----------------------------------------------------------------------------------- |
| `leading`     | Valgfri funksjonell identifikator: tid, dato, profilbilde eller meningsbærende ikon |
| `title`       | Identifiserer objektet                                                              |
| `category`    | Valgfri klassifisering foran tittelen                                               |
| `description` | Forklarer objektet                                                                  |
| `meta`        | Lavprioritert kontekst, inkludert relative tider                                    |
| `status`      | Faktisk tilstand, aldri lavprioritert metadata                                      |

Regler:

- Dekorativ `leading` utelates.
- Vanlige entitetsrader plasserer status ved tittelen.
- Features bygger ikke badges manuelt inne i tittelen.
- Eyebrow brukes ikke i listerader.
- En rad har nøyaktig én interaction: `static`, `open`, `action`, `actions`, `expand` eller
  `reorder`.
- `open` brukes når hele raden åpner editor eller side.
- `expand` brukes når raden viser nye detaljer; redigeringshandlinger ligger i detaljområdet.
- `action` og `actions` brukes når eksplisitte knapper er selve handlingen.
- Hele sammendragsflaten er trigger for ekspanderbare rader. Hurtighandlinger er separate
  søskenkontroller.
- En samling har høyst én åpen detaljrad. En forhåndsvalgt rad kan styres fra featurestate, og
  fokus forblir på sammendragstriggeren når raden åpnes eller lukkes. Opp-/nedpil flytter fokus
  mellom ekspanderbare sammendrag uten å aktivere dem.
- Utvidet innhold gjentar ikke informasjon som allerede er synlig og lager ikke et nytt
  ekspanderingsnivå.
- `reorder` bruker en egen åpnehandling og navngitte opp-/nedknapper i vanlig fokusrekkefølge.
  Første og siste kant deaktiverer den utilgjengelige retningen; en pågående flytting deaktiverer
  åpning og begge flyttehandlingene. Dagens konsument trenger ikke drag-and-drop eller meny.
- `scope` beskriver hva listen viser. `notice` er en kort operativ beskjed.
- Rader fyller beholderens bredde. Avstand legges mellom rader, ikke som tilfeldig horisontal marg.
- Radius, ramme, flate og skygge kommer fra felles tokens.
- Listepresentasjonen kan skifte fra kort til kompakte rader ut fra beholderbredde.

### Tidslister

- Tidslister bruker den sentrale schedule-layouten.
- Sluttid plasseres under starttid.
- Tilgjengelighet uttrykkes konsekvent som `Ledig` eller `Opptatt`.
- Sekundærlinjen identifiserer hvem eller hva som opptar tiden.
- Arrangement markeres med kategori etterfulgt av typen.
- En tidsrad ekspanderes bare når detaljområdet tilfører informasjon eller handlinger.

### Datogrupper

- Datogrupper bruker produktets felles gruppe og gruppeoverskrift.
- Typografi og avstand er den eneste dagsseparatoren.
- Features lager ikke egne datobånd, markører eller kantlinjer.
- Relative datoer som `I dag` er et aksentfarget tekstprefiks, ikke en badge.

### Samlingskontroller

`Collection` eier toggle, selection, filtergrupper, søk, sortering og sammensatte filterfelt. Den
offentlige grensen er typed filterstate og semantiske callbacks; features bygger ikke header- eller
filteranatomi med snippets eller lokal CSS. Et eksplisitt custom choice-snippet finnes bare for en
kontroll som allerede eies av designsystemet, som bookingpresentasjonen av `DatePicker`.

React-referansens reelle konsumenter er kaldkartlagt slik:

| Kontrollkombinasjon                | Flater                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Header-toggle                      | Arrangementer, arrangementadmin, mine bookinger og brukerlisten                               |
| Flervalgsfilter                    | Grenfilter i arrangementer, arrangementadmin, baner og mine bookinger; status i bookinglisten |
| Søk, to filtergrupper og sortering | Brukerlisten                                                                                  |
| Alltid synlig selection            | Bookingens gren/dag/bane og statistikkens bookingtype/gren/bane                               |
| Typed select-, switch- og datofelt | Statistikkens periode, sammenligning og egendefinerte fra-/til-datoer                         |

- Header-toggle forblir en navngitt switch ved samlingsoppsummeringen på mobil og desktop. Den
  skjules ikke under et generelt filterpanel, og pending beholder etikett og valgt state mens
  kontrollen låses.
- Selection er alltid inline fordi den endrer selve arbeidsutvalget. Filterdetaljer er lukket bak
  en navngitt disclosure på mobil; på desktop vises de inline uten en ekstra meny eller popover.
  Søkefeltet forblir synlig når filterdetaljene er lukket.
- Disclosure-knappen viser antall valgte filterverdier. Valgene er datadrevne, brytes over flere
  linjer og har ingen kunstig maksimumsgrense i patternet. Enkeltvalg og flervalg bruker samme
  native choice-knapp; featurestate avgjør om ett eller flere verdier er valgt.
- Reset vises når søk eller filtergrupper er aktive og leverer én semantisk callback. Sortering er
  en presentasjonsrekkefølge og gjør ikke alene filteret aktivt. Tømmeknappen i søket nuller bare
  søket.
- Filterfelt er en diskriminert kontrakt for `select`, `date` og `switch`. De komponerer de
  eksisterende offentlige kontrollene med sentral label, bredde, disabled og pending; features
  sender ikke rå DOM-hendelser eller Bits-deler.
- Disclosure, choice, toggle og reset er native knapper i vanlig dokumentrekkefølge. Åpning og
  lukking beholder fokus på disclosure-knappen. Select og kalender beholder sine etablerte
  tastatur-, portal- og fokusreturkontrakter; ingen ny menu-/popover-primitive er nødvendig.
- Pending setter busy state på kontrollgruppen og deaktiverer alle tilhørende fokusmål uten å
  skjule valgt state. En filtrert tom liste presenteres med `CollectionEmpty` og kan komponere en
  eksplisitt reset-handling; tomt resultat er ikke loading.

## Dokumentinnhold

`Document` brukes for vilkår, obligatoriske kunngjøringer, reglement og annet strukturert innhold
som skal leses fremfor redigeres. Det er en avgrenset leseflate, ikke en generell kortvariant.

- `Document.Intro` prioriterer kort kontekst før hovedinnholdet og bevarer avsnitt eller
  linjeskift i kunngjøringstekst.
- `Document.Section` eier navngitte innholdsseksjoner på nivået under sidens hovedoverskrift.
  Features lager ikke lokal seksjonsanatomi eller hopper over headingnivåer.
- `Document.Facts` brukes for korte label/verdi-fakta som bookinggrenser og åpningstid. Løpende
  tekst eller redigerbare felt uttrykkes ikke som fakta.
- Lenkene bruker native lenkesemantikk og det sentrale dokumentuttrykket. Eksterne lenker beholder
  sikker `rel`; kontaktlenker bruker riktig `mailto:`- eller `tel:`-mål.
- Metadata for hele dokumentflaten, som vilkårsversjon eller «må bekreftes», plasseres i `Page` eller
  dialoghodet. Dokumentnære label/verdi-data plasseres i `Document.Facts`.
- Loading og lesefeil eies av `Page`/`PageLoading`/`ErrorState` før dokumentet rendres. En tom
  dokumentflate brukes ikke som loadingstate.
- Obligatoriske lesehandlinger komponerer `Form.Actions` etter innholdet. `Document` eier ikke
  mutasjonsstate eller bekreftelseslogikk.
- Vilkår dekker intro, nummererte seksjoner, oppdatert-metadata og kontaktlenke. Obligatoriske
  kunngjøringer dekker bevart kunngjøringstekst, status og bekreftelse. Bookingreglement dekker
  grupperte fakta i dialog. Sperre- og medlemskapsflyter kombinerer intro og lenker med delte
  Settings-/Form-patterns.
- Lesebredden, typografien, avstanden og mobiltilpasningen er sentral. Mobil og desktop beholder
  samme innholdsrekkefølge og headinghierarki.

## Navigasjon

Navigation-familien eier semantikk, aktiv state, fokusuttrykk og den indre geometrien for
sidefelt, mobil bunnnavigasjon, seksjonslenker og navigasjonsnære handlinger. App-shellen i WP-5
eier hvilke av disse flatene som rendres, plasseringen rundt arbeidsområdet og koblingen til
SvelteKit-routes, auth, tenant og serverdata.

Den observerte produktkontrakten er:

- Desktop-sidefeltet viser tenantidentitet, tema og konto sammen med grupperte hoved-, person- og
  adminlenker. Mobil viser samme produktvokabular som tenantidentitet, tema og nyheter i toppfeltet,
  tre prioriterte lenker i bunnfeltet og resten i «Mer»; primærlenker dupliseres ikke i menyen.
- Routeaktivitet uttrykkes med `aria-current="page"` og ett sentralt visuelt uttrykk. Sammensatte
  arbeidsområder som Baner og grener kan markere samme hovedlenke for flere routes. App-shellen
  beregner aktiv state fra normalisert SvelteKit-URL; patternet gjetter ikke route.
- Innlogging og backendstyrte kapabiliteter avgjør hvilke lenker og seksjoner som finnes. En tom
  seksjon rendres ikke, og utilgjengelige routes vises ikke som disabled lokkemat.
- Tenantidentiteten er en hjemlenke med klubbnavn og valgfri logo eller sekundærtekst. Manglende
  tenantdata bruker en stabil tekstlig fallback uten at navigasjonsgeometrien kollapser.
- Tema, konto, «Mer» og lokal tilbakehandling er native knapper. Pending kan deaktivere en handling
  og eksponerer busy state uten å fjerne etiketten eller flytte fokusmålet.
- Badges er korte tilstander eller tellinger med eksplisitt tilgjengelig navn når tallet alene ikke
  forklarer betydningen. De endrer ikke lenkens størrelse eller plass i tastaturrekkefølgen.
- Seksjonsnavigasjon mellom routes bruker native lenker, ikke tabs. Tabs er for lokal visningsstate
  på samme route. Begge bruker samme teksthierarki, men har forskjellige websemantiske kontrakter.
- Lenker aktiveres med native lenketastatur, handlinger med native knappetastatur, og alle synlige
  kontroller har sentralt fokusuttrykk. Patternet innfører ikke piltastnavigasjon der vanlig
  dokumentrekkefølge er riktig.
- Før route-, auth- og tenantgrunnlaget er avklart, reserverer `NavigationLoading` sidefeltets eller
  bunnfeltets sluttgeometri. Loading er navngitt status; blankt shell eller hoppende navigasjon er
  ikke gyldig oppstartstilstand.
- Mobil bunnnavigasjon tar hensyn til safe area og har tommelvennlige mål. Desktop-sidefelt,
  mobilbunn og horisontale seksjonslenker bruker samme `NavigationLink`, badge- og fokuskontrakt;
  responsive skifter lager ikke parallelle itemvarianter.

## Feedback, feil og lasting

- Oppdatert innhold er primær bekreftelse etter en vellykket endring.
- Uklare mutasjonsresultater får vedvarende inline-feedback ved handlingen.
- Query- og autorisasjonsfeil beholder kontekst og tilbyr retry når det er meningsfullt.
- Toast brukes bare for globale hendelser uten lokal eier, som utløpt sesjon.
- Feltvalidering vises ved feltet.
- Loadingflater reserverer appskallets og sluttinnholdets geometri.
- `null`, blank flate eller en generisk sentrert skeleton er ikke gyldig førstegangsloading for en
  sentral arbeidsflyt.

## Responsivitet og app-shell

- Mobil prioriterer dagens tilgjengelighet, korte valgveier og tommelvennlige handlinger.
- Mobil og desktop bruker samme visuelle vokabular, ordlyd og informasjonsrekkefølge.
- Desktop bruker ekstra plass til rom og funksjonelt begrunnede kolonner, ikke til egen semantikk.
- Responsive forskjeller løser arbeidsform eller plassbehov; de innfører ikke en separat
  desktopvariant av produktmønstrene.
- Mobil og desktop ferdigstilles og kontrolleres sammen.
- Typografien er kompakt på mobil og kontrollert ett trinn større i arbeidsflater på desktop.
- Appskallet har ikke global breadcrumb-rad. Hovednavigasjon og sidetittel gir orientering; dype
  editorflater bruker lokal tilbakehandling ved behov.
- Desktop bruker sidefelt som samlet navigasjonsflate uten separat toppbar. Tema og konto ligger
  før hovednavigasjonen.
- Mobil bruker toppfelt for klubbidentitet, tema og nyheter samt bunnnavigasjon.
- Desktopbakgrunnen kan bruke klubbens bilde med mørkt scrim og retningsgradient. Innholdsflater
  eier sin egen kontrast, og mobil laster ikke bakgrunnsressursen.

## Statistikk og datavisualisering

- Statistikk bruker rollene `key-value`, `chart-value`, `chart-label` og `chart-meta`.
- Diagrammer velger ikke typografistørrelser lokalt fra den generelle skalaen.
- Datadrevet inline-styling er begrenset til faktisk diagramgeometri.
- SVG-koordinater følger faktisk pikselbredde slik at tekst, punkter og streker ikke skaleres med
  flaten.

## CSS-grammatikk

Delte produktkomponenter uttrykker anatomi med dataattributter:

```html
<section data-ui="section" data-variant="surface">
  <header data-part="header">
    <div data-part="intro">
      <h2 data-part="title">Baner</h2>
    </div>
    <div data-part="actions">...</div>
  </header>
</section>
```

- `data-ui` identifiserer produktkomponenten.
- `data-part` beskriver en faktisk del som `intro`, `content`, `title`, `description` eller
  `actions`.
- En partselektor bindes til faktisk barnestruktur med `>`; generelle etterkommerselektorer som kan
  treffe nestede komponenter er forbudt.
- `data-variant`, `data-state` og `data-density` beskriver forskjeller uten modifier-klasser.
- `data-surface` og `data-layout` brukes bare når de beskriver faktisk flate eller layout.
- Uklare navn som `copy`, `wrapper` og `container` brukes ikke som anatomi.
- Featurekode setter ikke `data-ui` eller `data-part`; offentlig produkt-UI uttrykker strukturen.
- Bits UI sine egne tilstandsattributter er primitive detaljer og blir ikke produktets offentlige
  kontrakt.

## Ferdigkriterier

En migrert arbeidsflate er ferdig når:

- funksjonalitet, URL-er og backendautorisasjon er bevart eller eksplisitt avtalt endret
- mobil og desktop er bevisst utformet og kontrollert
- lyst og mørkt tema fungerer
- loading, tomtilstand, feil, suksess og relevante roller er kontrollert
- handlinger og status følger de semantiske rollene
- arbeidsflaten bruker offentlige patterns uten lokal styling eller varianter
- tastaturnavigasjon og fokusoppførsel er kontrollert
- arkitekturkontroll, tester, build og visuell kontroll passerer

React-versjonen brukes bare til å observere produktadferd og visuell referanse. Dens komponenttre,
hooks, providers og filstruktur er ikke en del av ferdigkriteriene.
