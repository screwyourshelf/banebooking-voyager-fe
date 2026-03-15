# Turnering frontend — full oversikt over problemer og muligheter

> Analyse av alle API-kall, invalidering, kodeduplisering og arkitektursvakheter.
> Grunnlag for prioritert refaktorering.

---

## 1. Komplett API-inventar

### Queries (GET)

| Query-nøkkel                                            | Endepunkt                                 | Hook                     | staleTime | Brukt av                                                                                              |
| ------------------------------------------------------- | ----------------------------------------- | ------------------------ | --------- | ----------------------------------------------------------------------------------------------------- |
| `["turnering", slug, id]`                               | `GET /turnering/{id}`                     | `useTurnering`           | 30s       | `TurneringView` → prop-drilled til alle views                                                         |
| `["paameldinger", slug, id, klasseId]`                  | `GET .../klasse/{id}/paamelding`          | `usePaameldinger`        | 30s       | `AdminPaameldingKlasseTab`, `SpillerPaameldingKlasseTab`                                              |
| `["draw", slug, id, klasseId]`                          | `GET .../klasse/{id}/draw`                | `useDraw`                | 30s       | `AdminKampKlasseTab`, `ResultatansvarligKlasseTab`, `SpillerDrawKlasseTab`, `AdminAvsluttetKlasseTab` |
| `["turneringAnsvarlige", slug, id]`                     | `GET .../turnering/{id}/ansvarlig`        | `useAnsvarlige`          | 60s       | `AdminOppsettView`                                                                                    |
| `["stillingsForklaring", slug, id, klasseId, gruppeId]` | `GET .../gruppe/{id}/stilling/forklaring` | `useStillingsForklaring` | 30s       | `GruppeStillingTabellMedForklaring`                                                                   |

**5 distinct query-nøkler** — alle per-klasse-queries er separate cache-entries.

---

### Mutations — full oversikt med invalidering

| Hook                                           | Metode | Endepunkt                                                  | Invaliderer                          | Vurdering |
| ---------------------------------------------- | ------ | ---------------------------------------------------------- | ------------------------------------ | --------- |
| `useOpprettTurnering`                          | POST   | `/turnering`                                               | `["arrangementer"]`                  | ✅        |
| `useOppdaterTurneringStatus`                   | PUT    | `/turnering/{id}/status`                                   | `["turnering"]`                      | ✅        |
| `useLeggTilKlasse`                             | POST   | `/turnering/{id}/klasse`                                   | `["turnering"]`                      | ✅        |
| `useFjernKlasse`                               | DELETE | `/turnering/{id}/klasse/{id}`                              | `["turnering"]`                      | ✅        |
| `useAnsvarligMutations.leggTil`                | POST   | `/turnering/{id}/ansvarlig`                                | `["turneringAnsvarlige"]`            | ✅        |
| `useAnsvarligMutations.fjern`                  | DELETE | `/turnering/{id}/ansvarlig/{id}`                           | `["turneringAnsvarlige"]`            | ✅        |
| `useMeldPaaKlasse`                             | POST   | `/turnering/{id}/klasse/{id}/paamelding`                   | `["paameldinger"]` + `["turnering"]` | ⚠️        |
| `useTrekkPaamelding`                           | DELETE | `/turnering/{id}/klasse/{id}/paamelding/{id}`              | `["paameldinger"]` + `["turnering"]` | ⚠️        |
| `useOppdaterPaameldingStatus`                  | PUT    | `/turnering/{id}/klasse/{id}/paamelding/{id}/status`       | `["paameldinger"]` + `["turnering"]` | ⚠️        |
| `useOppdaterPaameldingSeed`                    | PUT    | `/turnering/{id}/klasse/{id}/paamelding/{id}/seed`         | `["paameldinger"]`                   | ✅        |
| `useOppdaterPaameldingDetaljer`                | PUT    | `/turnering/{id}/klasse/{id}/paamelding/{id}/detaljer`     | `["paameldinger"]` + `["turnering"]` | ❌        |
| `useGenererDraw`                               | POST   | `/turnering/{id}/klasse/{id}/draw`                         | `["draw"]` + `["turnering"]`         | ✅        |
| `useGenererKampplan`                           | POST   | `/turnering/{id}/klasse/{id}/kampplan`                     | `["draw"]` + `["turnering"]`         | ⚠️?       |
| `useRegistrerResultat.registrerGruppekamp`     | PUT    | `/turnering/{id}/klasse/{id}/kamp/{id}/resultat`           | `["draw"]`                           | ✅        |
| `useRegistrerResultat.registrerSluttspillkamp` | PUT    | `/turnering/{id}/klasse/{id}/sluttspillkamp/{id}/resultat` | `["draw"]`                           | ✅        |
| `useFrøSluttspill`                             | POST   | `/turnering/{id}/klasse/{id}/sluttspill/frø`               | `["draw"]` + `["turnering"]`         | ⚠️?       |

**Forklaring:**

- ✅ Korrekt — invaliderer det som faktisk endres
- ⚠️ Mulig overskudd — invaliderer mer enn nødvendig
- ❌ Feil — invaliderer noe som ikke endres
- ⚠️? Krever backend-verifisering

---

## 2. Identifiserte problemer

### Kategori A — Unødvendige nettverkskall

---

#### A1 · Seed-vaterfallet (høy prioritet)

Én brukerhandling («Legg til deltaker med seed») genererer **5 HTTP-kall**:

```
POST  .../paamelding          ← selve handlingen
GET   .../paamelding          ← useMeldPaaKlasse.onSuccess → invalidate ["paameldinger"]
GET   .../turnering/{id}      ← useMeldPaaKlasse.onSuccess → invalidate ["turnering"]
PUT   .../paamelding/{id}/seed ← chained i call-site onSuccess
GET   .../paamelding          ← useOppdaterPaameldingSeed.onSuccess → invalidate ["paameldinger"]
```

Forventet minimum: **2 kall** (POST + GET etter seed er satt).
GET #2 er bortkastet — dataene endres av seed-PUT umiddelbart etter.

**Berørt kode:**

- `hooks/paamelding/useMeldPaaKlasse.ts` — auto-invaliderer for tidlig
- `hooks/paamelding/useOppdaterPaameldingSeed.ts` — invaliderer en gang til
- `views/admin/AdminPaameldingView.tsx` — kjeder mutasjonene i call-site

---

#### A2 · `["turnering"]` invalideres unødvendig av paamelding-hooks (høy prioritet)

`useMeldPaaKlasse`, `useTrekkPaamelding`, `useOppdaterPaameldingStatus` invaliderer alle `["turnering"]` — men:

- Paamelding-mutations skjer i `PaameldingAapen`-fasen → `AdminPaameldingView` er aktiv
- `AdminPaameldingView` bruker **ikke** `TurneringKlasseRespons.antallGodkjente/antallSokt/antallReserve` fra turnering-responsen
- `GenererDrawDialog.antallGodkjente` hentes fra `usePaameldinger`-data (`TurneringPaameldingListeRespons`), ikke fra turnering
- `AdminOppsettContent` viser disse tellerne, men oppsett-fasen er adskilt fra paamelding-fasen (forskjellige views)
- `staleTime: 30_000` sørger for at spillervisningens teller oppdateres innen 30 sek uansett

**Resultat:** 1 unødvendig `GET /turnering/{id}` per påmeldingsoperasjon.

---

#### A3 · `useOppdaterPaameldingDetaljer` invaliderer `["turnering"]` uten noen grunn (lav prioritet)

Å oppdatere detaljer (f.eks. makker-bruker for dobbel) endrer **ingen felt** i `TurneringRespons`.  
`antallGodkjente/antallSokt/antallReserve` forblir uendret. Klassen forsvinner ikke.

**Resultat:** 1 unødvendig `GET /turnering/{id}` per detaljeroppdatering. Trolig copy-paste fra lignende hooks.

---

#### A4 · `["turnering"]` i `useGenererKampplan` og `useFrøSluttspill` — uklar nødvendighet (krever verifisering)

Begge hooks invaliderer `["draw"]` + `["turnering"]`.

- `useGenererKampplan` setter tidspunkter på kamper → disse er i draw-responsen, ikke i turnering-responsen
- `useFrøSluttspill` frø sluttspill-bracket → dette er i draw-strukturen

Spørsmål: **endrer disse operasjonene noe i `TurneringRespons`?**  
Dersom svaret er nei → fjern `["turnering"]`-invalideringen.

---

#### A5 · Dobbel toast ved paamelding med seed (lav prioritet, UX-sak)

Kjeden POST paamelding → PUT seed gir to separate toast-varsler:

1. `useMeldPaaKlasse.onSuccess` → _"Påmelding registrert!"_
2. `useOppdaterPaameldingSeed.onSuccess` → _"Seed oppdatert"_

To varsler for én sammenhengende brukerhandling.

---

### Kategori B — Kodeduplisering

---

#### B1 · `AdminKampgjennomforingView` vs `ResultatansvarligKampView` (~90% identiske filer)

Disse to filene deler nesten all logikk og struktur:

| Delt                                                      | Unikt admin                              | Unikt resultatansvarlig                  |
| --------------------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `GruppeDrawTab`-subkomponent (copy-paste med nytt navn)   | `useGenererDraw`                         | —                                        |
| `resultatKampId` + `resultatErSluttspill` state           | `useFrøSluttspill`                       | —                                        |
| `åpneResultatFor*`-funksjoner                             | Dropdown-meny med ekstra handlinger      | Kampplan-knapp direkte (ikke i dropdown) |
| `håndterResultatSubmit`                                   | `NesteStatusKnapp`                       | —                                        |
| `useDraw` + `useRegistrerResultat` + `useGenererKampplan` | `klasse.antallGodkjente` til draw-dialog | —                                        |
| `ResultatDialog` og `GenererKampplanDialog`               | `arrangementStartDato` til kampplan      | —                                        |
| `alleKamper`/`resultatKamp`/`erGruppeKamp`-utledning      |                                          |                                          |
| Kampformat-logikk til `ResultatDialog`                    |                                          |                                          |

**Konsekvens:** En bugretting i resultat-dialogen krever endring i to filer.

---

#### B2 · Fire nesten-identiske gruppe-subkomponenter

| Komponent (lokal i fil)          | Fil                          | `kanRegistrere`          | `onRegistrer` |
| -------------------------------- | ---------------------------- | ------------------------ | ------------- |
| `AdminGruppeDrawTab`             | `AdminKampgjennomforingView` | ✓ fra draw-kapabiliteter | ✓             |
| `ResultatansvarligGruppeDrawTab` | `ResultatansvarligKampView`  | ✓ fra draw-kapabiliteter | ✓             |
| `GruppeDrawTab`                  | `TurneringSpillerView`       | `false` hardkodet        | —             |
| `AdminAvsluttetGruppeTab`        | `AdminAvsluttetView`         | `false` hardkodet        | —             |

Alle fire rendrer identisk stilling-tabell + kamp-liste struktur. Eneste variabel er registrering-props.

---

#### B3 · Kampformat-logikk duplisert i to filer

Identisk kode i `AdminKampgjennomforingView.tsx` og `ResultatansvarligKampView.tsx`:

```tsx
antallSett={erGruppeKamp && klasse.gruppespillKampFormat
  ? klasse.gruppespillKampFormat.antallSett
  : klasse.sluttspillKampFormat.antallSett}
superTiebreak={erGruppeKamp && klasse.gruppespillKampFormat
  ? klasse.gruppespillKampFormat.superTiebreak
  : klasse.sluttspillKampFormat.superTiebreak}
```

---

#### B4 · Fire nesten-identiske Content-komponenter

`AdminKampgjennomforingContent`, `AdminPaameldingContent`, `AdminAvsluttetContent`, `TurneringSpillerContent` — alle er: header + klasse-tabs. Eneste variasjon er tilstedeværelse av `NesteStatusKnapp` i header-actions.

---

### Kategori C — Arkitektur og datahenting

---

#### C1 · `Tabs`-komponenten renderer alle tab-innhold i DOM (potensiell fremtidig risiko)

```tsx
{
  items.map((item) => (
    <TabsContent key={item.value} value={item.value}>
      {item.content} {/* ← alle items rendres i TabsContent */}
    </TabsContent>
  ));
}
```

Radix UI avmonterer inaktive tabs som standard — hooks firer kun for aktiv tab. **I dag er dette OK.**  
Men `TabsLazyMount` eksisterer allerede i kodebasen og er eksplisitt om atferden.  
Ingen turnering-views bruker `TabsLazyMount` — det er inkonsistent med det som er tilgjengelig.

---

#### C2 · `useStillingsForklaring` fetcher alltid på mount

`GruppeStillingTabellMedForklaring` kaller `useStillingsForklaring(…, enabled: true)` unconditionally.  
Denne komponenten er standard (første) tab-innhold i alle gruppe-tabs.  
Firer umiddelbart for aktiv gruppe på sideopplasting — uten brukerinteraksjon.

Spørsmål: er stilling/forklaring nødvendig før brukeren eksplisitt ber om det (f.eks. klikker på en rad)?

---

#### C3 · `TurneringResultatansvarligView` faller tilbake til `TurneringSpillerView`

```tsx
export default function TurneringResultatansvarligView({ turnering }: Props) {
  if (status === "DrawPublisert" || status === "Pagaar")
    return <ResultatansvarligKampView turnering={turnering} />;
  return <TurneringSpillerView turnering={turnering} />; // ← bruker spillerens view
}
```

En resultatansvarlig i `Oppsett`- eller `PaameldingAapen`-fasen ser spillerens påmeldingsvisning — inkludert "Meld på"-knappen dersom spillere kan melde seg på. Semantisk feil.

---

#### C4 · `paamelding`-listen er per-klasse, ikke per-turnering

`usePaameldinger` er ett kall per klasse. Ingen aggregert endepunkt for alle klasser i en turnering.  
Med 4 klasser og aktiv admin = potensielt 4 parallelle GET-kall ved tab-navigering.  
Dette er en **backend-API-begrensning** like mye som en frontend-sak, men bør dokumenteres.

---

#### C5 · `TurneringSpillerView` har intern fas-switch med mye logikk

Én komponent håndterer PaameldingAapen-vis og DrawPublisert/Pagaar/Avsluttet-vis.  
`visDrawFaser` og `visPaamelding` flags spredt gjennom komponenten.  
Jf. `turnering-refaktor.md` — dette er dokumentert og planlagt splittet.

---

### Kategori D — Typer og kontrakts-avvik

---

#### D1 · `DrawPublisert` mangler i `STATUS_REKKEFOLGE`

```ts
// adminStatusUtils.ts
export const STATUS_REKKEFOLGE: TurneringStatus[] = [
  "Oppsett",
  "PaameldingAapen",
  // "DrawPublisert" mangler
  "Pagaar",
  "Avsluttet",
];
```

`nesteStatus("DrawPublisert")` returnerer `null` — ingen "Neste status"-knapp vises i draw-fasen.  
Sannsynlig intensjon: draw-generering setter status til `DrawPublisert` automatisk i backend,  
og admin går manuelt fra `PaameldingAapen` til `Pagaar` (hopper over DrawPublisert i sekvensen).  
**Bør bekreftes/kommenteres** for å unngå fremtidig forvirring.

---

#### D2 · `TurneringStatus`-type mangler `PaameldingLukket`

Fra `turnering-refaktor.md` er `PaameldingLukket` dokumentert som en fase.  
Typen har kun 5 verdier — `PaameldingLukket` finnes ikke.  
Enten er planen endret, eller denne fasen er ennå ikke implementert i backend.

---

## 3. Oppsummering — prioritert handlingsliste

### Umiddelbar gevinst (lavrisiko, enkle endringer)

| #   | Problem | Endring                                                                                           | Gevinst                        |
| --- | ------- | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | A3      | Fjern `["turnering"]` fra `useOppdaterPaameldingDetaljer.invalidate()`                            | −1 GET per detaljeroppdatering |
| 2   | A2      | Fjern `["turnering"]` fra `useMeldPaaKlasse`, `useTrekkPaamelding`, `useOppdaterPaameldingStatus` | −1 GET per påmeldingsoperasjon |
| 3   | B3      | Trekk ut `velgKampformat(klasse, erGruppeKamp)`-hjelpefunksjon i delt util                        | Én endring, to filer fikset    |

### Middels omfang

| #   | Problem | Endring                                                                                                     | Gevinst                 |
| --- | ------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| 4   | A1 + A5 | Ny `useMeldPaaKlasseOgSeed`-hook — POST + (PUT) + én invalidering + én toast                                | 5 → 2 kall, 2 → 1 toast |
| 5   | B2      | Trekk ut `GruppeDrawTab`-komponent til `components/draw/` med `kanRegistrere` + `onRegistrer?`-props        | Fjerner 4 kopier        |
| 6   | A4      | Verifiser mot backend: fjern `["turnering"]` fra `useGenererKampplan` og `useFrøSluttspill` hvis unødvendig | −1 GET per operasjon    |

### Større refaktorering

| #   | Problem | Endring                                                                                                                                                   | Gevinst                                                  |
| --- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 7   | B1      | Trekk ut delt `KlasseKampTab`-logikk (resultat-flow, grup/sluttspill-tabs) til felles komponent/hook; admin og resultatansvarlig wrapper med sin kontekst | Halverer størrelse på to store filer                     |
| 8   | C3      | Gi resultatansvarlig eget informasjons-view for ikke-aktive faser                                                                                         | Korrekt semantikk, ingen spillerUI for resultatansvarlig |
| 9   | B4      | Vurder felles `TurneringLayout`-komponent for header + klasse-tabs + optional `NesteStatusKnapp`                                                          | Fjerner 4 nesten-identiske Content-filer                 |

### Behov for avklaring

| #   | Problem                                 | Spørsmål                                                        |
| --- | --------------------------------------- | --------------------------------------------------------------- |
| A4  | `useGenererKampplan`/`useFrøSluttspill` | Endrer backend `TurneringRespons` ved disse operasjonene?       |
| D1  | `DrawPublisert` ikke i sekvens          | Intensjonelt? Bør kommenteres i `adminStatusUtils.ts`           |
| D2  | `PaameldingLukket`                      | Er denne fasen utgått eller ikke implementert ennå?             |
| C2  | `useStillingsForklaring` alltid enabled | Bør forklaring lastes ved mount eller on-demand (klikk på rad)? |
