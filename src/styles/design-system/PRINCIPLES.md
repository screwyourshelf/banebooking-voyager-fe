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

`npm run design-system:check` håndhever grensene. En endring som trenger å bryte dem, skal i stedet forbedre den delte komponenten eller tokenmodellen.
