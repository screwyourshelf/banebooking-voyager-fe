# Turnering — steg-for-steg refaktoreringsplan

Hvert steg er **uavhengig** og kan landes som en egen commit.  
Rekkefølgen er basert på risiko og avhengigheter — start fra toppen.

---

## Oversikt

| Steg         | Tittel                                                                                    | Risiko                   | Filer berørt |
| ------------ | ----------------------------------------------------------------------------------------- | ------------------------ | ------------ |
| [1](#steg-1) | Fjern ugyldig turnering-invalidering i `useOppdaterPaameldingDetaljer`                    | 🟢 Ingen                 | 1            |
| [2](#steg-2) | Fjern unødvendig turnering-invalidering fra tre paamelding-hooks                          | 🟢 Lav                   | 3            |
| [3](#steg-3) | Trekk ut kampformat-hjelpefunksjon                                                        | 🟢 Lav                   | 3            |
| [4](#steg-4) | Ny `useMeldPaaKlasseOgSeed`-hook — fjern seed-vaterfallet                                 | 🟡 Medium                | 2            |
| [5](#steg-5) | Delt `GruppeDrawTab`-komponent                                                            | 🟡 Medium                | 5            |
| [6](#steg-6) | Verifiser og fjern turnering-invalidering i draw-hooks                                    | 🟡 Krever backend-sjekk  | 2            |
| [7](#steg-7) | Felles `KlasseKampTab`-komponent — eliminer duplisering mellom admin og resultatansvarlig | 🔴 Stor                  | 3            |
| [8](#steg-8) | Korriger `TurneringResultatansvarligView` — eget view for passive faser                   | 🟢 Lav                   | 1            |
| [9](#steg-9) | Verifiser `DrawPublisert` i `adminStatusUtils`                                            | 🟢 Ingen (dokumentasjon) | 1            |

---

## Steg 1

### Fjern ugyldig turnering-invalidering i `useOppdaterPaameldingDetaljer`

**Problem:** Å oppdatere paamelding-detaljer (f.eks. makker-navn for dobbel) endrer ingen felt  
i `TurneringRespons`. Invalideringen er en copy-paste-feil fra andre hooks.

**Fil:** `src/features/turnering/hooks/paamelding/useOppdaterPaameldingDetaljer.ts`

```diff
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
-   void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };
```

**Verifisering:** Oppdater detaljer på en påmelding → kun én GET til `/paamelding` skal vises i nettverket. Ingen GET til `/turnering/{id}`.

---

## Steg 2

### Fjern unødvendig turnering-invalidering fra tre paamelding-hooks

**Problem:** `useMeldPaaKlasse`, `useTrekkPaamelding` og `useOppdaterPaameldingStatus` invaliderer alle `["turnering"]`. Men:

- Disse mutasjonene skjer i `PaameldingAapen`-fasen → `AdminPaameldingView` er aktivt
- `AdminPaameldingView` bruker **ikke** `TurneringKlasseRespons.antallGodkjente/antallSokt/antallReserve` fra turnering-responsen
- Tallene som trengs (f.eks. til `GenererDrawDialog`) hentes fra `usePaameldinger`-responsen (`TurneringPaameldingListeRespons`)
- `AdminOppsettContent` viser disse tellerne, men oppsett-fasen og paamelding-fasen er gjensidig utelukkende

**Resultat:** Én unødvendig GET til `/turnering/{id}` per påmeldingsoperasjon spares.

---

**Fil 1:** `src/features/turnering/hooks/paamelding/useMeldPaaKlasse.ts`

```diff
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
-   void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };
```

---

**Fil 2:** `src/features/turnering/hooks/paamelding/useTrekkPaamelding.ts`

```diff
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
-   void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };
```

---

**Fil 3:** `src/features/turnering/hooks/paamelding/useOppdaterPaameldingStatus.ts`

```diff
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
-   void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };
```

**Verifisering:** Legg til / trekk / endre status på en påmelding → kun én GET til `/paamelding` skal vises. Ingen GET til `/turnering/{id}`.

---

## Steg 3

### Trekk ut kampformat-hjelpefunksjon

**Problem:** Identisk kampformat-logikk er kopiert i to filer:

```tsx
// finnes i AdminKampgjennomforingView.tsx OG ResultatansvarligKampView.tsx
antallSett={
  erGruppeKamp && klasse.gruppespillKampFormat
    ? klasse.gruppespillKampFormat.antallSett
    : klasse.sluttspillKampFormat.antallSett
}
superTiebreak={
  erGruppeKamp && klasse.gruppespillKampFormat
    ? klasse.gruppespillKampFormat.superTiebreak
    : klasse.sluttspillKampFormat.superTiebreak
}
```

**Ny fil:** `src/features/turnering/utils/kampformatUtils.ts`

```ts
import type { TurneringKlasseRespons, KampFormat } from "@/types";

export function velgKampformat(klasse: TurneringKlasseRespons, erGruppeKamp: boolean): KampFormat {
  return erGruppeKamp && klasse.gruppespillKampFormat
    ? klasse.gruppespillKampFormat
    : klasse.sluttspillKampFormat;
}
```

**Bruk i begge filer:**

```tsx
import { velgKampformat } from "../../utils/kampformatUtils";

// ...
const format = velgKampformat(klasse, erGruppeKamp);

<ResultatDialog
  antallSett={format.antallSett}
  superTiebreak={format.superTiebreak}
  // ...
/>;
```

**Verifisering:** Bygg. Ingen funksjonell endring.

---

## Steg 4

### Ny `useMeldPaaKlasseOgSeed`-hook — fjern seed-vaterfallet

**Problem:** «Legg til deltaker med seed» gir i dag **5 HTTP-kall**:

```
POST  .../paamelding           ← handlingen
GET   .../paamelding           ← useMeldPaaKlasse.onSuccess invaliderer
GET   .../turnering/{id}       ← fjernet etter steg 2
PUT   .../paamelding/{id}/seed ← chained i call-site
GET   .../paamelding           ← useOppdaterPaameldingSeed.onSuccess invaliderer
```

Etter steg 2 er GET turnering borte. Men den doble paamelding-fetchen gjenstår.  
Målet etter dette steget: **2 kall** (POST + GET etter seed er satt, eller POST + GET uten seed).

---

**Ny fil:** `src/features/turnering/hooks/paamelding/useMeldPaaKlasseOgSeed.ts`

```ts
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { MeldPaaKlasseForespørsel, TurneringPaameldingRespons } from "@/types";
import api from "@/api/api";

type Payload = MeldPaaKlasseForespørsel & { seed?: number | null };

export function useMeldPaaKlasseOgSeed(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidatePaameldinger = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
  };

  return useApiMutation<Payload, TurneringPaameldingRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding`,
    {
      getBody: ({ seed: _seed, ...rest }) => rest,
      onSuccess: async (data, payload) => {
        if (payload.seed != null) {
          await api.put(
            `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding/${data.id}/seed`,
            { seed: payload.seed },
            { requireAuth: true }
          );
          toast.success("Deltaker lagt til");
        } else {
          toast.success("Påmelding registrert!");
        }
        invalidatePaameldinger();
      },
    }
  );
}
```

**Endring i:** `src/features/turnering/views/admin/AdminPaameldingView.tsx`

Erstatt:

```tsx
const meldPaaMutation = useMeldPaaKlasse(turneringId, klasse.id);
const seedMutation = useOppdaterPaameldingSeed(turneringId, klasse.id);
```

Med:

```tsx
const meldPaaOgSeedMutation = useMeldPaaKlasseOgSeed(turneringId, klasse.id);
```

Erstatt `onMeldPaa`-håndteringen:

```tsx
// FØR
onMeldPaa={(payload, seed) => {
  meldPaaMutation.mutate(payload, {
    onSuccess: (data) => {
      if (seed != null) {
        seedMutation.mutate(
          { paameldingId: data.id, seed },
          { onSuccess: () => setMeldPaaDialogOpen(false) }
        );
      } else {
        setMeldPaaDialogOpen(false);
      }
    },
  });
}}
isPending={meldPaaMutation.isPending || seedMutation.isPending}
serverFeil={meldPaaMutation.error?.message ?? null}

// ETTER
onMeldPaa={(payload, seed) => {
  meldPaaOgSeedMutation.mutate(
    { ...payload, seed },
    { onSuccess: () => setMeldPaaDialogOpen(false) }
  );
}}
isPending={meldPaaOgSeedMutation.isPending}
serverFeil={meldPaaOgSeedMutation.error?.message ?? null}
```

`useMeldPaaKlasse` og `useOppdaterPaameldingSeed` beholdes uendret —  
de brukes i andre kontekster (spillervisning og `PaameldingStatusDialog`).

**Verifisering:** Legg til deltaker med seed → 2 nettverkskall (POST + GET). Legg til uten seed → 2 nettverkskall. Én toast i begge tilfeller.

---

## Steg 5

### Delt `GruppeDrawTab`-komponent

**Problem:** Fire nesten-identiske lokale subkomponenter gjør samme jobb:

| Lokal komponent                  | Fil                              |
| -------------------------------- | -------------------------------- |
| `AdminGruppeDrawTab`             | `AdminKampgjennomforingView.tsx` |
| `ResultatansvarligGruppeDrawTab` | `ResultatansvarligKampView.tsx`  |
| `GruppeDrawTab`                  | `TurneringSpillerView.tsx`       |
| `AdminAvsluttetGruppeTab`        | `AdminAvsluttetView.tsx`         |

Alle rendrer stilling-tabell + kampkort-liste for en gruppe.  
Eneste variasjon: om registrering er mulig og hvilken callback som brukes.

---

**Ny fil:** `src/features/turnering/components/draw/GruppeTab.tsx`

```tsx
import Tabs from "@/components/navigation/Tabs";
import { GruppeStillingTabellMedForklaring } from "./GruppeStillingTabellMedForklaring";
import { GruppeStillingTabell } from "./GruppeStillingTabell";
import { KampKort } from "./KampKort";
import type { TurneringGruppeVisning } from "@/types";

type Props = {
  gruppe: TurneringGruppeVisning;
  turneringId: string;
  klasseId: string;
  kanRegistrere?: boolean;
  onRegistrer?: (kampId: string) => void;
  visForklaring?: boolean;
};

export function GruppeTab({
  gruppe,
  turneringId,
  klasseId,
  kanRegistrere = false,
  onRegistrer,
  visForklaring = false,
}: Props) {
  const items = [
    {
      value: "stilling",
      label: "Stilling",
      content: visForklaring ? (
        <GruppeStillingTabellMedForklaring
          deltakere={gruppe.deltakere}
          turneringId={turneringId}
          klasseId={klasseId}
          gruppeId={gruppe.id}
        />
      ) : (
        <GruppeStillingTabell deltakere={gruppe.deltakere} />
      ),
    },
    {
      value: "kamper",
      label: "Kamper",
      content: (
        <div className="space-y-2">
          {gruppe.kamper.map((kamp) => (
            <KampKort
              key={kamp.id}
              kamp={kamp}
              kanRegistrere={kanRegistrere}
              onRegistrer={onRegistrer}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {gruppe.foreslåttBane && (
        <p className="text-sm text-muted-foreground">Bane: {gruppe.foreslåttBane}</p>
      )}
      <Tabs items={items} />
    </div>
  );
}
```

Eksporter fra `components/index.ts`:

```ts
export { GruppeTab } from "./draw/GruppeTab";
```

**Erstatt i alle fire filer** den lokale subkomponenten med `<GruppeTab ... />`.

Eksempel for `AdminKampgjennomforingView`:

```tsx
// FØR: lokal AdminGruppeDrawTab
// ETTER:
import { GruppeTab } from "../../components";

// i gruppeTabs.map():
content: (
  <GruppeTab
    gruppe={gruppe}
    turneringId={turneringId}
    klasseId={klasse.id}
    kanRegistrere={kanRegistrere}
    onRegistrer={åpneResultatForGruppe}
    visForklaring
  />
),
```

**Verifisering:** Bygg. Naviger til alle fire visningstyper og verifiser at stilling + kamper vises korrekt.

---

## Steg 6

### Verifiser og fjern turnering-invalidering i draw-hooks

**Konklusjon etter analyse av `TurneringKlasseRespons`:**

- **`useGenererKampplan`** → `["turnering"]`-invalidering **beholdes**.  
  Kampplan-generering setter `TurneringKlasseRespons.foreslåttStartTid`, som vises direkte i  
  `AdminKampgjennomforingView`, `ResultatansvarligKampView` og `AdminAvsluttetView` som klasse-starttid.

- **`useFrøSluttspill`** → `["turnering"]`-invalidering **fjernet** ✅  
  Frø sluttspill endrer kun `DrawVisningRespons.sluttspill`-strukturen. Ingenting i  
  `TurneringKlasseRespons` berøres.

**Utført endring — `src/features/turnering/hooks/draw/useFrøSluttspill.ts`:**

```diff
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["draw", slug, turneringId, klasseId] });
-   void queryClient.invalidateQueries({ queryKey: ["turnering", slug, turneringId] });
  };
```

---

## Steg 7

### Felles `KlasseKampTab`-komponent — eliminer duplisering mellom admin og resultatansvarlig

**Problem:** `AdminKampKlasseTab` (i `AdminKampgjennomforingView`) og  
`ResultatansvarligKlasseTab` (i `ResultatansvarligKampView`) er ~90% identiske.

Delt logikk som bør trekkes ut:

- `useDraw` + `useRegistrerResultat` + `useGenererKampplan`
- `resultatKampId` / `resultatErSluttspill` state
- `åpneResultatFor*`-funksjoner og `håndterResultatSubmit`
- `alleKamper` / `resultatKamp` / `erGruppeKamp`-utledning
- `ResultatDialog` og `GenererKampplanDialog`
- Bygging av `gruppeTabs` + `sluttspillTabs`

---

**Ny fil:** `src/features/turnering/components/draw/KlasseKampTab.tsx`

```tsx
type Props = {
  turneringId: string;
  klasse: TurneringKlasseRespons;
  arrangementStartDato?: string | null;
  ekstraHandlinger?: ReactNode; // admin-dropdown, resultatansvarlig-knapp
};

export function KlasseKampTab({
  turneringId,
  klasse,
  arrangementStartDato,
  ekstraHandlinger,
}: Props) {
  // all delt logikk her
}
```

`ekstraHandlinger` rendres som `PageSection.actions` — admin sender dropdown-menyen,  
resultatansvarlig sender kampplan-knappen, avsluttet sender `undefined`.

**Oppdater:**

- `AdminKampgjennomforingView` — bytt `AdminKampKlasseTab` med `<KlasseKampTab ekstraHandlinger={<AdminDropdown .../>} />`
- `ResultatansvarligKampView` — bytt `ResultatansvarligKlasseTab` med `<KlasseKampTab ekstraHandlinger={<KampplanKnapp .../>} />`
- `AdminAvsluttetView` — kan også bruke `KlasseKampTab` uten `ekstraHandlinger`

**Verifisering:** Naviger gjennom alle tre roller (admin, resultatansvarlig, avsluttet) og verifiser at draw, resultater og dialoder fungerer identisk som før.

---

## Steg 8

### Korriger `TurneringResultatansvarligView` — eget view for passive faser

**Problem:** En resultatansvarlig i `Oppsett`- eller `PaameldingAapen`-fasen ser  
`TurneringSpillerView` — inkludert «Meld på»-knapper.

**Fil:** `src/features/turnering/views/resultatansvarlig/TurneringResultatansvarligView.tsx`

```tsx
// FØR
export default function TurneringResultatansvarligView({ turnering }: Props) {
  const { status } = turnering;
  if (status === "DrawPublisert" || status === "Pagaar")
    return <ResultatansvarligKampView turnering={turnering} />;
  return <TurneringSpillerView turnering={turnering} />;
}

// ETTER
export default function TurneringResultatansvarligView({ turnering }: Props) {
  const { status } = turnering;
  if (status === "DrawPublisert" || status === "Pagaar")
    return <ResultatansvarligKampView turnering={turnering} />;
  return <ResultatansvarligVenterView turnering={turnering} />;
}
```

**Ny fil:** `src/features/turnering/views/resultatansvarlig/ResultatansvarligVenterView.tsx`

```tsx
import PageSection from "@/components/sections/PageSection";
import { TurneringHeaderSection } from "../../components";
import type { TurneringRespons } from "@/types";

type Props = { turnering: TurneringRespons };

export default function ResultatansvarligVenterView({ turnering }: Props) {
  return (
    <div className="space-y-4">
      <TurneringHeaderSection
        tittel={turnering.arrangementTittel}
        status={turnering.status}
        startDato={turnering.arrangementStartDato}
        sluttDato={turnering.arrangementSluttDato}
      />
      <PageSection>
        <p className="text-sm text-muted-foreground italic">
          Kampregistrering er tilgjengelig når draw er klart.
        </p>
      </PageSection>
    </div>
  );
}
```

**Verifisering:** Logg inn som resultatansvarlig i oppsett- og påmeldingsfasen — skal se informasjonsside, ikke spillerens påmeldingsvisning.

---

## Steg 9

### Verifiser `DrawPublisert` i `adminStatusUtils`

**Bakgrunn:** `DrawPublisert` mangler fra `STATUS_REKKEFOLGE` og er heller ikke i `STATUS_LABELS`.

**Fil:** `src/features/turnering/views/admin/adminStatusUtils.ts`

Avklar med backend: settes `DrawPublisert` automatisk av backend ved draw-generering,  
eller skal admin manuelt trykke en knapp for å publisere draw?

**Dersom automatisk (status quo er korrekt):** Legg til kommentar:

```ts
export const STATUS_REKKEFOLGE: TurneringStatus[] = [
  "Oppsett",
  "PaameldingAapen",
  // "DrawPublisert" utelatt — settes automatisk av backend ved draw-generering
  "Pagaar",
  "Avsluttet",
];
```

**Dersom manuell overgang ønskes:** Legg til `"DrawPublisert"` i sekvensen og i `STATUS_LABELS`.

---

## Resultat etter alle steg

| Handling                      | Kall før            | Kall etter | Diff |
| ----------------------------- | ------------------- | ---------- | ---- |
| Legg til deltaker (uten seed) | 3                   | 2          | −1   |
| Legg til deltaker (med seed)  | 5                   | 2          | −3   |
| Trekk påmelding               | 3                   | 2          | −1   |
| Endre status på påmelding     | 3                   | 2          | −1   |
| Oppdater detaljer             | 3                   | 2          | −1   |
| Generer kampplan              | 2 (→1 etter steg 6) | 1          | −1   |
| Frø sluttspill                | 2 (→1 etter steg 6) | 1          | −1   |

**Kodeduplisering fjernet:**

- 1 `GruppeDrawTab`-komponent erstatter 4 kopier
- 1 `KlasseKampTab`-komponent halverer to store filer
- 1 `velgKampformat`-funksjon erstatter to kopierte blokker
