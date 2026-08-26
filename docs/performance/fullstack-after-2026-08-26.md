# Fullstack-sluttkontroll 2026-08-26

> **Frontendcommit:** `ca504706750f0affb5cdb2a52e2cc095909c9855`
>
> **Backendcommit:** `97fc0c6d2be6c0bcb789df9520b4d8067fff2ed1`
>
> **Resultat:** De tre valgte fullstackkontraktene er levert og godkjent

Sluttkontrollen brukte samme lokale Chromium-, Vite-, Development-backend- og
PostgreSQL-oppsett som [`baselineprotokollen`](./baseline-protocol.md). Kalenderintervallet var
forkortet til to sekunder fordi 60-sekunderspollingen allerede var godkjent i den fulle
[`frontend-ettermålingen`](./frontend-after-2026-08-26.md). Denne kjøringen er derfor en
kontraktsharness, ikke en ny ti-minutters ettermåling.

## Resultat for de endrede flytene

| Flyt                          | API før FS | API etter FS | DB før FS | DB etter FS | Bytes før FS | Bytes etter FS |
| ----------------------------- | ---------: | -----------: | --------: | ----------: | -----------: | -------------: |
| Kald anonym oppstart          |          2 |            2 |         1 |           1 |        9 510 |          9 271 |
| Kald medlem, vilkår akseptert |          3 |            3 |        10 |           7 |       10 784 |         10 000 |
| Kald medlem, vilkår mangler   |          5 |            4 |        16 |          12 |       11 300 |         10 516 |
| Rediger arrangementsbooking   |          3 |            2 |        11 |           8 |        8 654 |          8 574 |

`Før FS` er den fulle frontend-ettermålingen på commit `5708bbc`. Lokale millisekunder er ikke
brukt som beslutningsgrunnlag; request-, DB- og byteantall er stabile strukturelle signaler.

Kontrollflytene for arrangementmetadata, oppretting og sletting av booking samt banelagring beholdt
samme request- og DB-antall som frontend-ettermålingen. Den korte kalenderflyten utførte ingen
pollingrequests, som forventet før det nye 60-sekundersintervallet.

## Leveranser

1. `booking-bootstrap` returnerer bare bookingressurser. Full klubb- og brukerprofil har fortsatt
   hver sin kanoniske sessionquery. Dette fjernet tre DB-kommandoer fra innlogget kaldstart og
   reduserte responsen uten å endre anonym funksjon.
2. `POST /bruker/vilkaar` returnerer den oppdaterte `BrukerRespons`. Klienten bruker dette svaret
   direkte, så førstegangsforløpet trenger ikke en ny `GET /bruker`.
3. `PUT /arrangement/{arrangementId}/bookinger/{bookingId}` validerer klubb, arrangement, gren,
   bane og overlapp før én databaseoppdatering. Booking-ID-en beholdes, og frontend erstatter
   objektet direkte i bookingcachen før én avledet invalidasjon.

Den atomiske oppdateringen er dekket av tjenestetester for suksess, opptatt slot og feil klubb.
Ved konflikt blir den opprinnelige bookingen stående urørt. Backendens databaseconstraint er
fortsatt siste vern mot samtidige overlappende writes.

## Verifikasjon

- Backend: `dotnet test banebooking-voyager.sln --no-restore` — 508 av 508 tester passerte.
- Backend: `dotnet format banebooking-voyager.sln --no-restore --verify-no-changes` passerte.
- Frontend: `npm test` — 362 av 362 tester passerte.
- Frontend: `npm run check` passerte alle type-, arkitektur-, styling-, lint- og formatporter.
- Kort fullstackharness: 1 av 1 Playwright-test passerte mot ekte PostgreSQL.

Policycache og selektiv HTTP-caching er fortsatt bevisst ikke valgt. De leverte kontraktene tok den
dokumenterte kostnaden uten et nytt generelt cachelag, og sluttkontrollen viser ingen resterende
grunn til å utvide dette initiativet.
