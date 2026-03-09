# Backend-endring: Fleksibelt kampformat per klasse

I dag har en `TurneringKlasse` ett enkelt `kampFormat` som brukes for alle kamper i klassen — både gruppespill og sluttspill. Dette er for rigid. Typisk ønsker man kortere kamper i gruppespill (f.eks. 1 sett til 10, eller best av 3 uten tiebreak) og lengre i sluttspill (best av 3 med super-tiebreak, eller best av 5). Endringen under løser dette ved å splitte `kampFormat` i to separate felter, ett for gruppespill og ett for sluttspill.

## Endring i request — `POST /turnering/{id}/klasse`

`kampFormat` og `malNavn` fjernes og erstattes med to separate format-felter:

```
// Før
kampFormat: KampFormat;
malNavn?: string;

// Etter
gruppespillKampFormat?: KampFormat;  // Kun påkrevd når struktur = "GruppeMedSluttspill"
sluttspillKampFormat: KampFormat;    // Alltid påkrevd
```

For `RoundRobin` og `Utslagning` sendes kun `sluttspillKampFormat`. `gruppespillKampFormat` er kun relevant og påkrevd når `struktur = "GruppeMedSluttspill"`.

## Endring i respons — `TurneringKlasseRespons`

Tilsvarende endring i responsen slik at frontend kan vise riktig format per fase:

```
// Før
kampFormat: KampFormat;
malNavn: string | null;

// Etter
gruppespillKampFormat: KampFormat | null;  // null hvis ikke GruppeMedSluttspill
sluttspillKampFormat: KampFormat;
```

## Endring i kampgenerering (backend-logikk)

Når draw genereres og kamper opprettes skal backend velge format basert på kamptype:

| Kamptype                    | Format som brukes       |
| --------------------------- | ----------------------- |
| Gruppespill-kamp            | `gruppespillKampFormat` |
| Sluttspill-kamp (QF, SF, F) | `sluttspillKampFormat`  |
| RoundRobin-kamp             | `sluttspillKampFormat`  |
| Utslagningskamp             | `sluttspillKampFormat`  |

## Tilhørende frontend-endringer (`src/types/Turnering.ts`)

Disse endres parallelt på frontend-siden når backend er på plass:

```
// LeggTilKlasseForespørsel
- kampFormat: KampFormat;
- malNavn?: string;
+ gruppespillKampFormat?: KampFormat;
+ sluttspillKampFormat: KampFormat;

// TurneringKlasseRespons
- kampFormat: KampFormat;
- malNavn: string | null;
+ gruppespillKampFormat: KampFormat | null;
+ sluttspillKampFormat: KampFormat;
```

`LeggTilKlasseDialog` erstattes samtidig med en komposisjon-UI der bruker selv velger `struktur`, `poengSystem` og fyller inn `kampFormat`-felter direkte — i stedet for faste maler.

## Ingen andre endringer påkrevd

Feltene `antallGrupper`, `antallSomGaarViderePerGruppe`, `maxDeltakere`, `paameldingFrist`, `autoGodkjenn` og `poengSystem` er allerede fleksible og beholdes uendret.
