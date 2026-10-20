# Hurtigoppretting og kontrakter – lokal leveranse oktober 2026

> **Status:** Historisk leveranse- og verifikasjonsnotat, nedtegnet 2026-10-20.
> Kjøringer og tidligere observasjoner er skilt i seksjonene under.
> Aktiv status står i [current-work.md](../current-work.md).

## Levert og rapportert verifikasjon

Kalenderens hurtigdialog bruker type som automatisk tittel, valgfri beskrivelse og flere tider på
samme bane/dato. Eksisterende POST-kontrakt, API-klient, queryinvalidering og offentlig UI brukes.
Arrangementadministrasjonen kan redigere tittelen. Profil-, brukeradmin- og bookingtester
verifiserer at serveravslag beholder utkast uten å vise suksess.

- Senest rapporterte frontendkjøring: 436 enhetstester og hele `npm run check` passerer.
- Den samlede lokale porten med 8 reelle API-/UI-tester passerte før siste navnebytte til
  backendens `IBookingTransaksjon`. Booking og avbestilling ble deretter kontrollert igjen.
- Featurefasen hadde beståtte 24 visuelle tester, 8 produksjonsroutetester og begge produksjonsbygg,
  samt manuell dialogkontroll på desktop og 390 px mobilbredde. Disse er tidligere kontroller,
  ikke nye kjøringer etter den senere backendoppryddingen.
- Backend rapporterte separat 763 Release-tester med PostgreSQL og ingen hoppet over før siste
  kodegjennomgang. Ny sluttsuite må dokumenteres etter eventuelle videre rettinger.

Arbeidskopiene var ukommitterte ved nedtegning. Lokal testing brukte frontendens arbeidskopi;
backendens låste frontendref måtte fortsatt oppdateres før verifikasjon av leveransen i CI.
Ingen commit, merge, push eller deploy bekreftes av dette notatet.

## Tidligere avhengighetsobservasjon

`npm audit` 2026-09-22 rapporterte 32 funn: 1 høy, 25 moderate og 6 lave. Avhengighetsfilene
var da uendret mot `origin/main`. Det høye funnet gjaldt Tiptap og Markdown-attributtparsing
([GHSA-j95f-988m-3j2f](https://github.com/advisories/GHSA-j95f-988m-3j2f)).

Dette er en historisk observasjon, ikke en oppdatert sikkerhetsstatus. Auditen er ikke kjørt om
igjen i dokumentasjonsrunden. Ved senere avhengighetsarbeid eller publisering må gjeldende graf
kontrolleres på nytt etter [driftsinstruksen](../development-and-operations.md).

## Supplerende konsistenskontroll, 2026-10-20

Backendens tjeneste- og dokumentgjennomgang er fullført. Etter rettingene passerer alle
8 reelle frontend/API-tester mot det nye bygget, inkludert profilvalidering, booking og
arrangementer. Ingen produksjonskode eller styling i frontend ble endret i denne kontrollen.
De tidligere 436 enhetstestene og øvrige featureporter over er ikke nye kjøringer.
Aktiv status og ventende manuell test står i [current-work](../current-work.md).

## Flervalg ved kobling til eksisterende arrangement, 2026-10-20

Koblings- og opprettingsdialogen deler tidsvalgstate og komponent. Kobling bruker eksisterende
batchendepunkt for én eller flere ledige tider på samme bane/dato. Feil og null suksess beholder
valgene; positivt resultat viser antall og konflikter uten ny innsending. Kalender, arrangementer
og arrangementets bookingdetaljer invalideres for aktuell klubb. Backend er uendret i denne runden.

- Alle 447 enhetstester og hele `npm run check` passerer.
- Den samlede porten med 10 reelle API-/UI-tester passerer. De fire opprettings- og koblingstestene
  ble kjørt på nytt etter siste justering av tidsvalgstate og passerer også.
- Begge produksjonsbygg og artefaktkontrollen passerer; 8 produksjonsroutetester passerer.
- Nye skjermtester dekker forhåndsvalg, avgrensning, feil, delvis/null suksess, pending og foreldede
  tider. Reelle koblingstester kontrollerer beholdte metadata og kalenderoppdatering, med visuell
  kontroll av dialogen på desktop og 390 px mobilbredde.
- En separat kodegjennomgang bekreftet mønster- og kontraktbruk; funnet om manglende invalidering
  av bookingdetaljer er rettet og testet. Ingen ny styling eller direkte HTTP-kall er innført.

Arbeidskopiene er fortsatt ukommitterte. Lokal manuell test og brukerens tilbakemelding gjenstår
før commit, merge eller push.

## Publiseringsgrunnlag, 2026-10-20

Brukeren godkjente commit, merge og produksjonsdeploy av begge repoer etter lokal testing.
De 24 visuelle testene ble kjørt på nytt og passerer med uendrede referanser. Øvrig verifikasjon
for denne kildeversjonen er 447 enhetstester, hele `npm run check`, 10 reelle API-/UI-tester,
8 produksjonsroutetester og begge produksjonsbygg med artefaktkontroll.

Ny `npm audit` rapporterte 39 funn: 6 høye, 27 moderate og 6 lave. Høye funn gjaldt
`@tiptap/core`, `brace-expansion`, `devalue`, `prosemirror-view`, `source-map-js` og `undici`.
`package.json` og `package-lock.json` er uendret i leveransen. Dette er en datert observasjon og
gjenstående avhengighetsarbeid; ingen pakkeoppgradering inngår i publiseringen.

Frontendens kildecommit brukes som låst kontraktsreferanse i backend før produksjonsutrulling.
CI- og deployresultater må verifiseres i de respektive GitHub-/Cloudflare-kjøringene; godkjenningen
alene er ikke en bekreftelse på vellykket deploy.
