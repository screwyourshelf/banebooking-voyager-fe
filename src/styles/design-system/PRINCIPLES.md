# Frontendens designsystemprinsipper

Disse reglene er arkitektur, ikke anbefalinger.

1. `src/components/ui` er utskiftbare shadcn-primitiver og skal ikke endres for å forme produktets uttrykk.
2. Sider bygges med `Page` og `PageHeader` eller `RecordCollectionPage`. Feature-kode lager ikke egne page shells.
3. Oversikter bygges med `RecordCollection`, `RecordCollectionHeader` og `RecordCollectionBody`.
4. Filter, tabs og eksklusive valg i oversikter går gjennom `RecordCollectionHeader` og det beskyttede kontrollmønsteret. Feature-kode lager ikke lokale segmented controls.
5. Lister og rader bygges med `RecordList`, `RecordAccordionList`, `RecordCard` og tilhørende record-komponenter.
6. Farger, radius, typografi, avstander og responsive skifter eies av tokens og de delte mønstrene i `src/styles/design-system`.
7. Feature-kode leverer innhold, tilstand og handlinger. Den eier ikke den overordnede visuelle grammatikken.
8. Nye varianter opprettes først i det delte mønsteret og må fungere for minst to reelle konsumenter.
9. Unntakslisten i designsystemkontrollen er lukket teknisk gjeld. Den skal bare reduseres, aldri utvides for å få en lokal løsning gjennom.
10. Alle features er beskyttet mot lokale utility-klasser, dynamisk sammensatte stylingvarianter, rå komposisjonsprimitiver, rå dato-/tidfelt og feature-recipes.
11. Semantiske feature-klasser må starte med `app-`, `statistics-` eller `tournament-` og ha sin eneste definisjon i `src/styles/design-system`. Feature-koden kan velge et godkjent mønster, men kan ikke definere uttrykket.
12. Arrangementadministrasjonen, booking og mine bookinger har strengeste nivå: ingen lokale `className` eller `style` i det hele tatt.
13. Inline `style` er bare tillatt for datadrevne CSS-variabler i de tre sentralt kontrollerte statistikkvisualiseringene. Unntakslisten er eksplisitt og skal ikke utvides.
14. Dialog, Card, Tabs, ToggleGroup, Accordion og Sheet importeres ikke som rå komposisjonsprimitiver i features. Delte komponenter eier struktur, spacing og responsiv oppførsel.

`npm run design-system:check` håndhever grensene. En endring som trenger å bryte dem, skal i stedet forbedre den delte komponenten eller tokenmodellen.
