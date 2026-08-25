# SWP-0 visuell og interaktiv referansematrise

> **Status:** Frosset referanse for styling lift-and-shift
>
> **Checkpoint:** SWP-0.2
>
> **Fast tid:** 2026-08-23 kl. 12:00, Europe/Oslo

## Formål

Matrisen fryser det observerbare uttrykket før første Tailwind-konvertering. Den kjører de
faktiske SvelteKit-routene gjennom den eksisterende Playwright-authharnessen og bruker
deterministiske, test-eide API-svar. Det finnes ingen separat testapp, alternativ komponentmarkup
eller produkt-CSS for referansene.

Hvert bilde har en navngitt route, rolle, data/state, viewport og theme. Samlet dekker matrisen
app-shell/navigation, Page/Section, Collection, Form/Settings, Dialog/Select/Calendar,
rikteksteditor og statistikk.

## Skjermbilder

| ID      | Referanse                 | Route/state                                | Rolle         | Viewport    | Theme | PNG                                             |
| ------- | ------------------------- | ------------------------------------------ | ------------- | ----------- | ----- | ----------------------------------------------- |
| SWP-V01 | Anonym innlogging         | `/login`, e-postflaten                     | Anonym        | 390 × 844   | Lys   | `anonymous-login-mobile-light`                  |
| SWP-V02 | Offentlige vilkår         | `/vilkaar`, komplett dokument              | Offentlig     | 1440 × 1000 | Mørk  | `public-terms-desktop-dark`                     |
| SWP-V03 | Min side                  | `/minside`, profilfanen                    | Medlem        | 1440 × 1000 | Lys   | `member-account-desktop-light`                  |
| SWP-V04 | Klubbens medlemskap       | `/admin/klubb`, medlemskapsfanen           | Administrator | 390 × 844   | Mørk  | `club-administrator-mobile-dark`                |
| SWP-V05 | Bookingliste              | `/`, fire representative slotstates        | Medlem        | 1440 × 1000 | Mørk  | `member-booking-collection-desktop-dark`        |
| SWP-V06 | Bookingkalender           | `/`, åpen datopopover                      | Medlem        | 390 × 844   | Lys   | `member-booking-calendar-mobile-light`          |
| SWP-V07 | Bookingregler             | `/`, åpen standarddialog                   | Medlem        | 1440 × 1000 | Lys   | `member-booking-rules-dialog-desktop-light`     |
| SWP-V08 | Brukereditor og rollevalg | `/admin/brukere`, editor med åpen Select   | Administrator | 1440 × 1000 | Mørk  | `user-administrator-editor-select-desktop-dark` |
| SWP-V09 | Kunngjøringseditor        | `/admin/kunngjøringer`, tom rikteksteditor | Administrator | 390 × 844   | Lys   | `announcement-editor-mobile-light`              |
| SWP-V10 | Statistikk for banebruk   | `/admin/statistikk`, banebrukfanen         | Administrator | 1440 × 1000 | Mørk  | `statistics-court-usage-desktop-dark`           |
| SWP-V11 | Statistikk for medlemmer  | `/admin/statistikk`, medlemsfanen          | Administrator | 390 × 844   | Lys   | `statistics-members-mobile-light`               |

Routene i tabellen er relative til `/banebooking/aas-tennisklubb`. Snapshotfilene har Playwrights
plattformendelse og ligger ved `e2e/visual-regressions.spec.ts`.

## Dekning per UI-familie

| Familie                     | Primære referanser        | Hva som fryses                                                                      |
| --------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| App-shell og navigation     | SWP-V01–SWP-V11           | Mobil topp/bunn, desktoprekkefølge og fast bunnområde, aktiv route, tenant og theme |
| Page, Section og Document   | SWP-V02, SWP-V04, SWP-V10 | Sideintro, headings, leseinnhold, settingsseksjoner og statistikkseksjoner          |
| Collection og rows          | SWP-V05, SWP-V08, SWP-V09 | Header, selection/filter, statuser, schedule- og ekspanderbar rad                   |
| Form og Settings            | SWP-V01, SWP-V03, SWP-V04 | Felt, paneler, tabs, label/hjelpetekst og mobile handlinger                         |
| Dialog, Select og Calendar  | SWP-V06, SWP-V07, SWP-V08 | Portal, overlay, standard-/editorgeometri, liste og kalender                        |
| Rich-text-editor            | SWP-V09                   | Mobil editorflate, toolbar, skriveflate, feltkobling og sticky submit               |
| Statistikk og visualisering | SWP-V10, SWP-V11          | Filtre, nøkkeltall, grafer, medlemskort og responsivt skifte                        |

## Interaktiv kontrakt

Alle elleve tester krever før snapshot:

- nøyaktig ett `main`-landmark og en synlig `h1` på den underliggende routen
- ingen horisontal overflow i `html` eller `body`
- ferdig fontlasting, fjernet bootflate og skjult utviklingsdevtools ved testgrensen
- ingen `console.warning`, `console.error` eller ukontrollert `pageerror`

De sammensatte kontrollene har i tillegg disse eksplisitte tastatur- og fokusforløpene:

| Referanse | Forløp                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------- |
| SWP-V06   | Åpning fokuserer valgt dato; høyrepil flytter én dag; Escape lukker og returnerer fokus til trigger |
| SWP-V07   | Dialogen starter på lukkeknappen; Tab beholdes i fokusfellen; Escape returnerer fokus til åpneren   |
| SWP-V08   | Editor starter på tilbakeknappen; pil åpner Select; Escape returnerer først til Select og så åpner  |
| SWP-V09   | Editor starter på tilbakeknappen; riktekstgrensen må være `ready`; Escape returnerer til åpneren    |
| SWP-V11   | Høyre-/venstrepil flytter fokus og aktiverer medlems-/banebrukfanen automatisk                      |

## Determinisme og eierskap

`e2e/styling-reference-fixtures.ts` eier bare referansedata for denne matrisen:

- tenant, klubb, sessionbrukere og kapabiliteter er faste
- bookingdato, slotstates, medlemskap, brukerliste og statistikk er faste
- nettleserklokken fryses før første navigasjon
- API-svar under den navngitte test-tenanten oppfylles ved Playwright-grensen
- utviklingsinnlogging går fortsatt gjennom den eksisterende authharnessen og lokale backenden
- redusert bevegelse, skjult caret og skjult Query-devtools fjerner teststøy uten produktendring

Et ukjent tenant-API-kall avvises i stedet for å falle gjennom til skiftende utviklingsdata. Vanlig
dev-, preview- og produksjonstrafikk bruker fortsatt de autoritative API- og authkontraktene.

## Kjøring og endring

Kjør hele referansen med:

```bash
npx playwright test e2e/visual-regressions.spec.ts
```

Snapshotene oppdateres bare etter en bevisst, godkjent visuell endring:

```bash
npx playwright test e2e/visual-regressions.spec.ts --update-snapshots
```

Et snapshotavvik er ikke i seg selv godkjenning til å regenerere referansen. Før oppdatering skal
avviket klassifiseres som forventet produktbeslutning eller regresjon mot denne matrisen.
