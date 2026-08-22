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
- Utvidet innhold gjentar ikke informasjon som allerede er synlig og lager ikke et nytt
  ekspanderingsnivå.
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

## Dokumentinnhold

`Document` brukes for vilkår, obligatoriske kunngjøringer, reglement og annet strukturert innhold
som skal leses fremfor redigeres. Det er en avgrenset leseflate, ikke en generell kortvariant.

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
