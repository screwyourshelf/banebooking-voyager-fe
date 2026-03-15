# API-kallkonsolidering: turnering-featuren

## Bakgrunn

Ved ett enkelt knappetrykk («Legg til deltaker» med seed) sendes **5 HTTP-kall** mot backend:

| #   | Metode | Endepunkt                    | Trigger                                                                |
| --- | ------ | ---------------------------- | ---------------------------------------------------------------------- |
| 1   | `POST` | `.../klasse/{id}/paamelding` | Brukerhandling                                                         |
| 2   | `GET`  | `.../klasse/{id}/paamelding` | `useMeldPaaKlasse.onSuccess` → invaliderer `["paameldinger"]`          |
| 3   | `GET`  | `.../turnering/{id}`         | `useMeldPaaKlasse.onSuccess` → invaliderer `["turnering"]`             |
| 4   | `PUT`  | `.../paamelding/{id}/seed`   | Call-site kjeder seed-mutasjon etter paamelding                        |
| 5   | `GET`  | `.../klasse/{id}/paamelding` | `useOppdaterPaameldingSeed.onSuccess` → invaliderer `["paameldinger"]` |

Forventet minimum: **2 kall** (POST + GET etter seed er satt).

---

## Rotårsaker

### Rotårsak 1 — Seed-vaterfallet (kall 2 + 5)

```
POST paamelding
  └─ hook.onSuccess → invalidate ["paameldinger"] → GET #2 (prematur, data endres straks)
       └─ call-site.onSuccess → PUT seed
            └─ hook.onSuccess → invalidate ["paameldinger"] → GET #5 (nødvendig)
```

`useMeldPaaKlasse.onSuccess` invaliderer `["paameldinger"]` umiddelbart, selv om et seed-kall
følger rett etter. GET #2 er bortkastet — dataene endres av PUT seed uansett.

**Berørte filer:**

- `hooks/paamelding/useMeldPaaKlasse.ts`
- `hooks/paamelding/useOppdaterPaameldingSeed.ts`
- `views/admin/AdminPaameldingView.tsx` (call-site for kjeding)

---

### Rotårsak 2 — Unødvendig `["turnering"]`-invalidering (kall 3)

Følgende hooks invaliderer **alltid** `["turnering"]` etter en vellykket mutasjon:

| Hook                            | Endrer `TurneringKlasseRespons`-teller?  | Trengs av admin-view?                                    |
| ------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| `useMeldPaaKlasse`              | Ja (`antallSokt` ↑)                      | **Nei** — admin bruker `TurneringPaameldingListeRespons` |
| `useTrekkPaamelding`            | Ja (teller ↓)                            | **Nei** — samme                                          |
| `useOppdaterPaameldingStatus`   | Ja (`antallGodkjente` / `antallReserve`) | **Nei** — samme                                          |
| `useOppdaterPaameldingDetaljer` | **Nei** (kun makker-navn etc.)           | **Nei**                                                  |

`TurneringPaameldingListeRespons` (returnert av `usePaameldinger`) inneholder sine egne
`antallGodkjente`, `antallSokt`, `antallReserve`-felt. `GenererDrawDialog` bruker
`data?.antallGodkjente` fra **paamelding-listen**, ikke fra turnering-responsen.

Ingen admin-komponent rendrer `turnering.klasser[n].antallGodkjente` e.l. under
`PaameldingAapen`-fasen. Invalideringen er defensiv og uten faktisk UI-effekt.

**Konsekvens:** 1 unødvendig `GET /turnering/{id}` per påmeldingsoperasjon.

---

### Rotårsak 3 — `useOppdaterPaameldingDetaljer` invaliderer `["turnering"]` uten grunn

Å endre detaljer (f.eks. makker-bruker for dobbel) påvirker **ikke** noen felt i
`TurneringRespons`. Invalideringen er en kopi-paste-feil.

---

## Nåværende kall-profil

| Handling                      | Nå     | Etter refaktor |
| ----------------------------- | ------ | -------------- |
| Legg til deltaker (uten seed) | 3 kall | 2 kall         |
| Legg til deltaker (med seed)  | 5 kall | 2 kall         |
| Trekk påmelding               | 3 kall | 2 kall         |
| Endre status på påmelding     | 3 kall | 2 kall         |
| Oppdater seed (alene)         | 2 kall | 2 kall         |
| Oppdater detaljer             | 3 kall | 2 kall         |

---

## Steg-for-steg plan

Hvert steg er uavhengig og kan landes separat.

---

### Steg 1 — Fjern `["turnering"]`-invalidering fra `useOppdaterPaameldingDetaljer`

**Omfang:** 1 linje fjernes i `hooks/paamelding/useOppdaterPaameldingDetaljer.ts`.

```ts
// FØR
const invalidate = () => {
  void queryClient.invalidateQueries({ queryKey: ["paameldinger", slug, turneringId, klasseId] });
  void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] }); // ← fjernes
};

// ETTER
const invalidate = () => {
  void queryClient.invalidateQueries({ queryKey: ["paameldinger", slug, turneringId, klasseId] });
};
```

**Risiko:** Ingen. Detaljeroppdatering endrer ikke noe i `TurneringRespons`.  
**Gevinst:** 1 færre GET per detaljerendring.

---

### Steg 2 — Fjern `["turnering"]`-invalidering fra `useMeldPaaKlasse`, `useTrekkPaamelding`, `useOppdaterPaameldingStatus`

**Omfang:** Fjern `invalidateQueries(["turnering", ...])` fra `invalidate()`-funksjonen i de tre hookene.

**Forutsetning:** Ingen admin-komponent displayer `TurneringKlasseRespons.antallGodkjente` /
`antallSokt` / `antallReserve` direkte fra `turnering`-propen under `PaameldingAapen`-fasen.
Bekreft med visuell gjennomgang av `AdminPaameldingContent` og `AdminOppsettContent`.

`staleTime: 30_000` på `useTurnering` sørger for at spillervisningens tallerventende konsekvens
er at data er opptil 30 sek gammelt — akseptabelt.

**Risiko:** Lav. Verifiser at tallvisninger som bruker `useTurnering` ikke vises i admin-admin-views  
**Gevinst:** 1 færre GET per påmeldingsoperasjon (eliminererer kall #3 i sporet over).

---

### Steg 3 — Fiks seed-vaterfallet i `AdminPaameldingView`

**Problem:** Kjeden `POST paamelding → (invalidate) → PUT seed → (invalidate)` gir to `GET paamelding`.

**Løsning:** Opprett `useMeldPaaKlasseOgSeed`-hook som håndterer begge mutasjoner og
invaliderer paamelding-lista **én gang** etter at begge er ferdige.

```ts
// hooks/paamelding/useMeldPaaKlasseOgSeed.ts
export function useMeldPaaKlasseOgSeed(turneringId: string, klasseId: string) {
  // Intern sekvens:
  // 1. POST paamelding
  // 2. Hvis seed ≠ null → PUT seed
  // 3. invalidate ["paameldinger"] én gang
  // Eksponerer isPending, error, mutate({ payload, seed })
}
```

`useMeldPaaKlasse` beholdes uendret for andre call-sites (f.eks. spillervisning).  
`AdminPaameldingView` bytter kun `meldPaaMutation` + `seedMutation`-kjeden med den nye hooken.

**Risiko:** Medium — ny hook med intern async-sekvens.  
**Gevinst:** Reduserer fra 5 → 2 kall per «legg til med seed»-handling.

---

### Steg 4 — Vurder `["turnering"]`-invalidering i draw-hooks (lav prioritet)

`useGenererDraw`, `useGenererKampplan`, `useFrøSluttspill` invaliderer alle `["turnering"]`.

Disse operasjonene **kan** endre status-relevante felter i `TurneringKlasseRespons`
(f.eks. triggers status-overgang som admin ser). Invalideringen er **trolig berettiget**
her, men bør verifiseres mot backend-svar om `TurneringRespons` faktisk oppdateres.

Dersom `TurneringRespons` ikke endres av disse operasjonene → fjern invalideringen.  
Dersom den endres (f.eks. ny status) → behold.

**Risiko:** Lav  
**Gevinst:** 1 færre GET per draw/kampplan-generering dersom invalideringen fjernes.

---

## Avhengighetsrekkefølge

```
Steg 1  →  ingen avhengigheter
Steg 2  →  ingen avhengigheter (men naturlig å gjøre etter Steg 1)
Steg 3  →  Steg 2 bør være ferdig (siden Steg 3 endrer call-site)
Steg 4  →  uavhengig, krever backend-verifisering
```
