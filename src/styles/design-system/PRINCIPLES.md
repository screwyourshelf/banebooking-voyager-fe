# Ås Banebooking designsystem

Designsystemet skal gjøre den naturlige løsningen til den riktige løsningen. En feature skal beskrive innhold og tilstand, ikke konstruere sin egen visuelle grammatikk.

## Det offentlige API-et

Nye sider starter her:

```tsx
import { Collection, Dialog, Document, Form, Page, Section, Settings } from "@/components";
```

- `Page` eier sidebredde, header, beskrivelse, sidehandling og sidetilstander.
- `Collection` eier vanlige entitetsoversikter, lister og rader.
- `Section` er den eneste generelle innholdsseksjonen. `soft`, `surface` og `plain` er sentrale uttrykk, ikke lokale komponenter.
- `Settings` eier innstillingsseksjoner, rader og valggrupper.
- `Form` eier skjema, feltgrupper, felt, trinn, handlingsfelt og submit-knapp.
- `Dialog` eier vanlig dialog og `Dialog.Editor`.
- `Document` eier lengre leseinnhold med intro, seksjoner og fakta.

Underkomponenter brukes gjennom familien, for eksempel `Page.Loading`, `Form.Field`, `Form.Steps`, `Settings.Row` og `Collection.Row`. Det gjør sammenhengen synlig uten at utvikleren må velge mellom parallelle navn.

## En normal ny side

```tsx
export default function BaneoversiktPage() {
  return (
    <Page
      eyebrow="Administrasjon"
      title="Baner"
      description="Administrer klubbens baner."
      createAction={{ label: "Ny bane", onClick: openCreate }}
    >
      <Collection icon={<MapPin />} title="6 baner" scope="Aktive baner i klubben">
        <Collection.List>{/* rader */}</Collection.List>
      </Collection>
    </Page>
  );
}
```

Det skal ikke opprettes en egen header, create-knapp, card-wrapper eller feature-CSS for denne siden.

## Regler som ikke kan brytes

1. `src/components/ui` er urørte shadcn-primitiver. Produktuttrykket legges utenfor disse filene.
2. Feature-sider bruker `Page`; de lager ikke egne side-headere eller page shells.
3. Sidens primære opprettelseshandling bruker `createAction` på `Page`. `Collection` brukes til oversikt, filtre og kontekstuelle samlingshandlinger, ikke en parallell opprettelsesknapp. Feature-kode importerer ikke `Plus` for å lage sin egen variant.
4. Feature-kode importerer de offentlige familiene fra `@/components`, ikke interne filer under `admin`, `forms`, `settings`, `section`, `collection` eller `dialogs`.
5. `Admin` er en tilgangs- og domeneegenskap, ikke et visuelt designsystem. Det finnes derfor ikke parallelle adminvarianter av Page, Form, Section eller Collection.
6. Farger, typografi, radius, avstander, sidebredder og responsive skifter defineres i `tokens.css` og de sentrale mønsterfilene.
7. Features har ingen egne CSS-filer, utility-klasser, inline-styling eller dynamisk sammensatte stylingvarianter. De eksplisitte statistikkvisualiseringene er eneste datadrevne unntak.
8. Rå `Card`, `Dialog`, `Tabs`, `ToggleGroup`, `Accordion` og `Sheet` brukes ikke til feature-komposisjon. Den relevante designsystemfamilien eier strukturen.
9. En ny variant må løse samme problem for minst to reelle konsumenter. Ellers brukes eksisterende struktur.
10. Unntakslisten i designsystemkontrollen er lukket teknisk gjeld og skal bare reduseres.
11. `Page`, `Dialog` og `Dialog.Editor` eier sin egen standardstørrelse. Feature-kode velger ikke bredde eller høyde; lesebredde og spesielle innholdslayouter løses inne i den relevante delte komponenten.
12. Redigerbare felt bygges med `Form.Fields` og `Form.Field`, slik at label, hjelpetekst, kontroll og feil alltid er én vertikal enhet. `Form.Field` kan teknisk ikke brukes utenfor `Form.Fields`, og feature-kode får verken importere rå `Field`/`Label` eller legge redigerbare kontroller i `Settings.Row`. `Settings.Row` brukes til innstillinger, status og brytere, ikke som en alternativ feltlayout.
13. Sekvensielle redigeringsforløp bruker `Form.Steps`, ikke `Tabs`. Trinnnummeret finnes i trinnnavigasjonen og gjentas ikke som «Steg N» i seksjonsoverskriften.
14. `Settings.Section` har ett headinguttrykk: obligatorisk eyebrow, tittel og valgfri beskrivelse i samme venstrejusterte anatomi. Seksjonsikoner og lokale headingvarianter finnes ikke i API-et, slik at vanlige dialoger og flertrinnsskjemaer ikke kan drifte fra hverandre.
15. Statistikk bruker fire typografiroller: `key-value`, `chart-value`, `chart-label` og `chart-meta`. Diagrammer velger ikke størrelser fra den generelle typografiskalaen lokalt. Datadrevet inline-styling er begrenset til diagramgeometri, og SVG-koordinater skal følge faktisk pikselbredde slik at tekst, punkter og streker aldri skaleres med flaten.
16. `Collection.Row` er appens eneste offentlige listerad. Innholdet har én fast betydning: `leading` er en valgfri, funksjonell identifikator som tid, dato, et faktisk profilbilde eller et meningsbærende ikon; det utelates når det bare er dekorasjon. `title` identifiserer objektet; `category` er en valgfri klassifiserende badge foran tittelen; `description` forklarer objektet; `meta` gir lavprioritert kontekst; og `status` uttrykker bare faktisk tilstand. Relative tider som «Starter om 3 dager» er `meta`, aldri status. Vanlige entitetsrader plasserer status ved tittelen; features kan ikke velge en annen plassering. Feature-kode bygger ikke badges manuelt inne i `title`. Eyebrow finnes ikke i listerader. Raden får nøyaktig én typesikker `interaction`: `static`, `open`, `action`, `actions`, `expand` eller `reorder`. `open` brukes når hele raden åpner editor eller side, `expand` når raden viser detaljer og eventuelle redigeringshandlinger ligger i detaljområdet, og `action`/`actions` brukes når eksplisitte knapper er selve handlingen. Tidslister bruker den sentrale `layout="schedule"`, som automatisk legger sluttid under starttid, uttrykker tilgjengelighet konsekvent som «Ledig» eller «Opptatt», og bruker sekundærlinjen til å identifisere hvem eller hva som opptar tiden. Arrangement markeres i sekundærlinjen med `category` etterfulgt av typen. Features kan ikke kombinere mønstrene eller endre plasseringen lokalt. Utvidet innhold gjentar ikke informasjon som allerede er synlig i den lukkede raden og lager ikke et nytt ekspanderingsnivå inne i raden. `scope` beskriver hva listen viser, mens `notice` er en kort operativ beskjed.
17. Datogrupper bruker `Collection.Group` og `Collection.GroupHeading`. Den delte typografien og avstanden er eneste dagsseparator; features lager ikke egne markører, kantlinjer eller datobånd. Relative datoer som «I dag» er et aksentfarget tekstprefiks, ikke en badge. En tidsrad kan bare ekspanderes når detaljområdet inneholder informasjon eller handlinger som ikke allerede finnes i sammendraget.

## CSS-språket i hele appen

Samme grammatikk gjelder for alle delte produktkomponenter, ikke bare `Page`:

```tsx
<section data-ui="section" data-variant="surface">
  <header data-part="header">
    <div data-part="intro">
      <h2 data-part="title">Baner</h2>
    </div>
    <div data-part="actions">...</div>
  </header>
</section>
```

- `data-ui` identifiserer den delte komponenten, for eksempel `page`, `section`, `form` eller `record-card`.
- `data-part` beskriver en reell del i komponentens anatomi, for eksempel `intro`, `content`, `title`, `description` eller `actions`.
- En `data-part`-regel bindes til komponentens faktiske barnestruktur med `>`. En generell etterkommerselektor som `[data-ui="page"] [data-part="title"]` er forbudt fordi den også treffer titler i nestede komponenter.
- `data-variant`, `data-state`, `data-density` og tilsvarende beskriver forskjeller uten modifier-klasser.
- `data-surface` og `data-layout` brukes bare når det faktisk er flate eller layout som beskrives.
- `className` er kun en ekstern hook der en konsument trenger det. Intern produktstyling skal ikke bygges med utility-klasser.
- Ett element har ikke flere produktklasser, og vi bruker ikke uklare navn som `copy`, `wrapper` eller `container`.
- Feature-kode setter ikke `data-ui` eller `data-part`; den uttrykker strukturen gjennom delte React-komponenter.
- Shadcn-filene beholder sitt opprinnelige `data-slot`-API og endres ikke for å passe produktlaget.

Designsystemkontrollen avviser lokale UI-slots i features, ubundet komponentanatomi, flere klasser
på samme element, utility-klasser, modifier-klasser og uklare delnavn. Dermed er regelen teknisk
håndhevet og ikke bare en konvensjon i dokumentasjonen.

## Interne byggeklosser

`records`, `rows`, `controls`, navigasjon, feedback, loading og editor inneholder lavere byggeklosser for eksisterende avanserte flater. De er ikke alternative sidetyper. Hvis en ny side ikke kan uttrykkes med det offentlige API-et, forbedres den relevante familien først.

`npm run design-system:check` håndhever grensene og avviser de utgåtte parallelle komponentene.
