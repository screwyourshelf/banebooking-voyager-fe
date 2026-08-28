# Visuell og interaktiv referansematrise

> **Status:** Aktiv snapshotkontrakt
>
> **Fast tid:** 2026-08-23 kl. 12:00, Europe/Oslo

## Formål

Matrisen låser det observerbare uttrykket for sentrale produktflater. Den kjører de faktiske
SvelteKit-routene gjennom Playwright-authharnessen og bruker deterministiske, test-eide API-svar.
Det finnes ingen separat testapp, alternativ komponentmarkup eller produkt-CSS for referansene.

Hvert bilde har en navngitt route, rolle, data/state, viewport og theme. Samlet dekker matrisen
app-shell/navigation, Page/Section, Collection, Form/Settings, Dialog/Select/Calendar,
rikteksteditor og statistikk.

## Skjermbilder

| ID    | Referanse                 | Route/state                                | Rolle         | Viewport    | Theme | PNG                                             |
| ----- | ------------------------- | ------------------------------------------ | ------------- | ----------- | ----- | ----------------------------------------------- |
| VR-01 | Anonym innlogging         | `/login`, e-postflaten                     | Anonym        | 390 × 844   | Lys   | `anonymous-login-mobile-light`                  |
| VR-02 | Offentlige vilkår         | `/vilkaar`, komplett dokument              | Offentlig     | 1440 × 1000 | Mørk  | `public-terms-desktop-dark`                     |
| VR-03 | Min side                  | `/minside`, profilfanen                    | Medlem        | 1440 × 1000 | Lys   | `member-account-desktop-light`                  |
| VR-04 | Klubbens medlemskap       | `/admin/klubb`, medlemskapsfanen           | Administrator | 390 × 844   | Mørk  | `club-administrator-mobile-dark`                |
| VR-05 | Bookingliste              | `/`, fire representative slotstates        | Medlem        | 1440 × 1000 | Mørk  | `member-booking-collection-desktop-dark`        |
| VR-06 | Bookingkalender           | `/`, åpen datopopover                      | Medlem        | 390 × 844   | Lys   | `member-booking-calendar-mobile-light`          |
| VR-07 | Grenser og tider          | `/`, åpen status- og innstillingsdialog    | Medlem        | 1440 × 1000 | Lys   | `member-booking-limits-dialog-desktop-light`    |
| VR-08 | Brukereditor og rollevalg | `/admin/brukere`, editor med åpen Select   | Administrator | 1440 × 1000 | Mørk  | `user-administrator-editor-select-desktop-dark` |
| VR-09 | Kunngjøringseditor        | `/admin/kunngjøringer`, tom rikteksteditor | Administrator | 390 × 844   | Lys   | `announcement-editor-mobile-light`              |
| VR-10 | Statistikk for banebruk   | `/admin/statistikk`, banebrukfanen         | Administrator | 1440 × 1000 | Mørk  | `statistics-court-usage-desktop-dark`           |
| VR-11 | Statistikk for medlemmer  | `/admin/statistikk`, medlemsfanen          | Administrator | 390 × 844   | Lys   | `statistics-members-mobile-light`               |
| VR-12 | Anonym innlogging desktop | `/login`, fokusert e-postflate             | Anonym        | 1440 × 1000 | Mørk  | `anonymous-login-desktop-dark`                  |

Routene i tabellen er relative til `/banebooking/aas-tennisklubb`. Snapshotfilene har Playwrights
plattformendelse og ligger ved `e2e/visual-regressions.spec.ts`.

## Dekning per UI-familie

| Familie                     | Primære referanser         | Hva som låses                                                                                |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| App-shell og navigation     | VR-01–VR-12                | Mobil topp/bunn, desktoprekkefølge og fast bunnområde, aktiv route, tenant og theme          |
| Page, Section og Document   | VR-02, VR-04, VR-10, VR-12 | Sideintro, headings, fokuserte flater, leseinnhold, settingsseksjoner og statistikkseksjoner |
| Collection og rows          | VR-05, VR-08, VR-09        | Header, selection/filter, statuser, schedule- og ekspanderbar rad                            |
| Form og Settings            | VR-01, VR-03, VR-04, VR-12 | Felt, paneler, tabs, label/hjelpetekst og responsive handlinger                              |
| Dialog, Select og Calendar  | VR-06, VR-07, VR-08        | Portal, overlay, standard-/editorgeometri, liste og kalender                                 |
| Rich-text-editor            | VR-09                      | Mobil editorflate, toolbar, skriveflate, feltkobling og sticky submit                        |
| Statistikk og visualisering | VR-10, VR-11               | Filtre, nøkkeltall, grafer, medlemskort og responsivt skifte                                 |

## Interaktiv kontrakt

Alle referansetestene krever før snapshot:

- nøyaktig ett `main`-landmark og en synlig `h1` på den underliggende routen
- ingen horisontal overflow i `html` eller `body`
- ferdig fontlasting, fjernet bootflate og skjult utviklingsdevtools ved testgrensen
- ingen `console.warning`, `console.error` eller ukontrollert `pageerror`

De sammensatte kontrollene har i tillegg disse eksplisitte tastatur- og fokusforløpene:

| Referanse | Forløp                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------- |
| VR-06     | Åpning fokuserer valgt dato; høyrepil flytter én dag; Escape lukker og returnerer fokus til trigger |
| VR-07     | Dialogen starter på lukkeknappen; Tab beholdes i fokusfellen; Escape returnerer fokus til åpneren   |
| VR-08     | Editor starter på tilbakeknappen; pil åpner Select; Escape returnerer først til Select og så åpner  |
| VR-09     | Editor starter på tilbakeknappen; riktekstgrensen må være `ready`; Escape returnerer til åpneren    |
| VR-11     | Høyre-/venstrepil flytter fokus og aktiverer medlems-/banebrukfanen automatisk                      |

## Determinisme og eierskap

`e2e/styling-reference-fixtures.ts` eier bare referansedata for denne matrisen:

- tenant, klubb, sessionbrukere og kapabiliteter er faste
- bookingdato, slotstates, medlemskap, brukerliste og statistikk er faste
- nettleserklokken fryses før første navigasjon
- API-svar under den navngitte test-tenanten oppfylles ved Playwright-grensen
- utviklingsinnlogging går gjennom authharnessen og lokale backenden
- redusert bevegelse, skjult caret og skjult Query-devtools fjerner teststøy uten produktendring

Et ukjent tenant-API-kall avvises i stedet for å falle gjennom til skiftende utviklingsdata. Vanlig
dev-, preview- og produksjonstrafikk bruker fortsatt de autoritative API- og authkontraktene.

## Kjøring og endring

Kjør hele referansen med:

```bash
npm run test:e2e:visual
```

Snapshotene oppdateres bare etter en bevisst, godkjent visuell endring:

```bash
npm run test:e2e:visual -- --update-snapshots
```

Et snapshotavvik er ikke i seg selv godkjenning til å regenerere referansen. Før oppdatering skal
avviket klassifiseres som forventet produktbeslutning eller regresjon mot denne matrisen.
