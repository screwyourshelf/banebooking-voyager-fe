# Spesifikasjon: `tillattHandlinger` — Backend-styrt handlingskontroll

## Sammendrag

Alle API-responser som representerer entiteter brukeren kan interagere med skal inkludere et `tillattHandlinger`-felt. Dette feltet er en string-array som eksplisitt lister opp hvilke handlinger den autentiserte brukeren har lov til å utføre på akkurat denne entiteten, i denne konteksten.

Frontend skal **aldri** tolke roller, sjekke tilstander, eller utlede tillatelser. Den skal kun rendre handlinger som finnes i `tillattHandlinger`.

---

## Motivasjon

### Nåværende situasjon

Autorisasjonslogikk er spredt mellom backend og frontend på inkonsistente måter:

| Entitet         | Hvordan handlinger styres i dag                                                                                        | Problem                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **BookingSlot** | Backend sender `kanBookes`, `kanAvbestille`, `kanSlette` som separate boolean-felter                                   | Fungerer, men frontend utleder `kanMeldePåAv` selv fra `tillaterPaamelding` + `harArrangement` |
| **Arrangement** | Backend sender `kanAvlyse: boolean`, men frontend sjekker `tillaterPaamelding` + `erPaameldt` for meld på/av           | Blanding av backend-flagg og frontend-logikk                                                   |
| **BookingView** | Frontend sjekker `bruker.roller.some(r => r === "KlubbAdmin" \|\| r === "Utvidet")` for å vise "Koble til arrangement" | Rolle-tolkning i frontend                                                                      |
| **Navbar**      | Frontend sjekker `bruker.roller.includes("KlubbAdmin")` og `bruker.roller.includes("Utvidet")` for å vise admin-menyer | Rolle-tolkning i frontend                                                                      |
| **Bane**        | Ingen handlingsflagg — hele admin-siden er tilgangsstyrt via meny                                                      | Ingen entitets-nivå kontroll                                                                   |
| **Klubb**       | Ingen handlingsflagg — styres via navigasjon                                                                           | Ingen entitets-nivå kontroll                                                                   |
| **Brukere**     | Frontend sjekker `bruker.roller.includes("KlubbAdmin")`                                                                | Rolle-tolkning i frontend                                                                      |

### Problemer dette skaper

1. **Duplisert autorisasjonslogikk** — Backend sjekker tilgang i controllere, men frontend gjetter seg til samme regler via rolle-sjekker
2. **Drift-risiko** — Hvis backend endrer regler (f.eks. ny rolle, nye betingelser), må frontend også oppdateres
3. **Inkonsistens** — Noen entiteter bruker flagg, andre bruker roller, noen bruker ingen ting
4. **Falske knapper** — Frontend kan vise en knapp brukeren ikke har tilgang til, og brukeren får en feilmelding først ved klikk

### Mål

- **Én kilde til sannhet**: Backend eier all autorisasjonslogikk
- **Frontend er ren UI**: Viser handlinger som finnes i `tillattHandlinger`, ingenting mer
- **Konsistens**: Samme mønster på tvers av alle entiteter
- **Utvidbarhet**: Nye handlinger kan legges til uten frontend-endringer i logikken

---

## Teknisk spesifikasjon

### Feltet `tillattHandlinger`

Hver entitets-respons som brukeren kan utføre handlinger på får feltet:

```csharp
public List<string> TillattHandlinger { get; set; } = [];
```

Serialiseres som **camelCase string-array** i JSON:

```json
{
  "tillattHandlinger": ["book", "kobleTilArrangement"]
}
```

### Regler for populering

- Backend evaluerer handlinger basert på **autentisert bruker** (fra JWT), **entitetens tilstand**, og **forretningsregler**
- Hvis brukeren ikke er autentisert → tom array `[]`
- Hvis entiteten er i en tilstand som ikke tillater handlinger (f.eks. passert) → tom array `[]`
- Handlinger som krever spesifikk tilstand inkluderes kun når tilstanden er oppfylt (f.eks. `"meldAv"` kun når brukeren er påmeldt)

---

## Per entitet

### 1. BookingSlot (`GET /klubb/{slug}/booking/slots`)

**Erstatter:** `kanBookes`, `kanAvbestille`, `kanSlette` (fjernes)

| Handling              | Nøkkel                  | Betingelse                                                                            |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| Book slot             | `"book"`                | Slot er ledig, bruker er innlogget, ikke passert, innenfor bookinggrenser             |
| Avbestill booking     | `"avbestill"`           | Bruker eier bookingen, ikke passert                                                   |
| Slett booking (admin) | `"slett"`               | Bruker er KlubbAdmin, slot er booket, ikke passert                                    |
| Meld på arrangement   | `"meldPaa"`             | Slot har arrangement, arrangement tillater påmelding, bruker er IKKE allerede påmeldt |
| Meld av arrangement   | `"meldAv"`              | Slot har arrangement, arrangement tillater påmelding, bruker ER påmeldt               |
| Koble til arrangement | `"kobleTilArrangement"` | Slot er ledig (ingen arrangement), bruker er KlubbAdmin eller Utvidet, ikke passert   |

**Eksempel-respons:**

```json
{
  "baneId": "abc-123",
  "baneNavn": "Bane 1",
  "dato": "2025-06-15",
  "startTid": "10:00:00",
  "sluttTid": "11:00:00",
  "booketAv": null,
  "erEier": false,
  "erPassert": false,
  "arrangementTittel": null,
  "arrangementBeskrivelse": null,
  "arrangementId": null,
  "erPaameldt": false,
  "antallPaameldte": null,
  "værSymbol": "clearsky_day",
  "temperatur": 18,
  "vind": 3.2,
  "tillattHandlinger": ["book", "kobleTilArrangement"]
}
```

**Felter som FJERNES fra responsen:**

- `kanBookes` → erstattes av `"book"` i `tillattHandlinger`
- `kanAvbestille` → erstattes av `"avbestill"` i `tillattHandlinger`
- `kanSlette` → erstattes av `"slett"` i `tillattHandlinger`
- `tillaterPaamelding` → ikke lenger nødvendig for handlingslogikk (beholdes kun for visning dersom ønsket, se avsnittet "Visningshint")

---

### 2. KommendeArrangement (`GET /klubb/{slug}/arrangement/kommende`)

**Erstatter:** `kanAvlyse` (fjernes), frontend-sjekk av `tillaterPaamelding` + `erPaameldt`

| Handling          | Nøkkel          | Betingelse                                                   |
| ----------------- | --------------- | ------------------------------------------------------------ |
| Avlys arrangement | `"avlys"`       | Bruker er KlubbAdmin eller Utvidet, arrangement ikke passert |
| Meld på           | `"meldPaa"`     | Arrangement tillater påmelding, bruker er IKKE påmeldt       |
| Meld av           | `"meldAv"`      | Arrangement tillater påmelding, bruker ER påmeldt            |
| Kopier lenke      | `"kopierLenke"` | Bruker er KlubbAdmin eller Utvidet                           |

**Eksempel-respons:**

```json
{
  "id": "arr-456",
  "tittel": "Onsdagstrening",
  "beskrivelse": "Trening for alle nivåer",
  "kategori": "Trening",
  "startDato": "2025-06-18",
  "sluttDato": "2025-08-20",
  "baner": ["Bane 1", "Bane 2"],
  "ukedager": ["Wednesday"],
  "tidspunkter": ["18:00"],
  "slotLengdeMinutter": 60,
  "tillaterPaamelding": true,
  "antallPaameldte": 8,
  "erPaameldt": true,
  "tillattHandlinger": ["avlys", "meldAv", "kopierLenke"]
}
```

**Felter som FJERNES:**

- `kanAvlyse` → erstattes av `"avlys"` i `tillattHandlinger`

---

### 3. Bane (`GET /klubb/{slug}/baner`)

**Nytt felt** — finnes ikke i dagens respons.

| Handling               | Nøkkel        | Betingelse           |
| ---------------------- | ------------- | -------------------- |
| Rediger bane           | `"rediger"`   | Bruker er KlubbAdmin |
| Deaktiver/aktiver bane | `"deaktiver"` | Bruker er KlubbAdmin |

**Eksempel-respons:**

```json
{
  "id": "bane-789",
  "navn": "Bane 1",
  "beskrivelse": "Hovedbane med flombelysning",
  "aktiv": true,
  "tillattHandlinger": ["rediger", "deaktiver"]
}
```

---

### 4. Bruker — admin-liste (`GET /klubb/{slug}/brukere`)

**Nytt felt** — finnes ikke i dagens respons.

| Handling           | Nøkkel                | Betingelse                                                      |
| ------------------ | --------------------- | --------------------------------------------------------------- |
| Endre rolle        | `"endreRolle"`        | Innlogget bruker er KlubbAdmin, og målbrukeren er ikke seg selv |
| Endre visningsnavn | `"endreVisningsnavn"` | Innlogget bruker er KlubbAdmin                                  |

**Eksempel-respons:**

```json
{
  "id": "usr-101",
  "epost": "ola@example.com",
  "visningsnavn": "Ola Nordmann",
  "roller": ["Medlem"],
  "tillattHandlinger": ["endreRolle", "endreVisningsnavn"]
}
```

---

### 5. Bruker — meg selv (`GET /klubb/{slug}/bruker/meg`)

**Nytt felt** — erstatter frontend rolle-sjekker for navigasjon og sidetilgang.

| Handling                      | Nøkkel                          | Betingelse                         |
| ----------------------------- | ------------------------------- | ---------------------------------- |
| Se admin: Klubb               | `"admin:klubb"`                 | Bruker er KlubbAdmin               |
| Se admin: Baner               | `"admin:baner"`                 | Bruker er KlubbAdmin               |
| Se admin: Brukere             | `"admin:brukere"`               | Bruker er KlubbAdmin               |
| Opprette arrangement          | `"arrangement:opprett"`         | Bruker er KlubbAdmin eller Utvidet |
| Se kommende arrangementer     | `"arrangement:se"`              | Bruker er KlubbAdmin eller Utvidet |
| Koble booking til arrangement | `"booking:kobleTilArrangement"` | Bruker er KlubbAdmin eller Utvidet |
| Oppdater visningsnavn         | `"profil:oppdater"`             | Alltid (innlogget)                 |
| Slett min bruker              | `"profil:slett"`                | Alltid (innlogget)                 |
| Last ned egen data            | `"profil:lastNedData"`          | Alltid (innlogget)                 |

**Eksempel-respons:**

```json
{
  "id": "usr-001",
  "epost": "admin@klubben.no",
  "visningsnavn": "Admin",
  "roller": ["KlubbAdmin"],
  "vilkårAkseptertDato": "2025-01-15T10:00:00Z",
  "vilkårVersjon": "1.0",
  "tillattHandlinger": [
    "admin:klubb",
    "admin:baner",
    "admin:brukere",
    "arrangement:opprett",
    "arrangement:se",
    "booking:kobleTilArrangement",
    "profil:oppdater",
    "profil:slett",
    "profil:lastNedData"
  ]
}
```

**Brukes i frontend til:**

- Navbar: Vise/skjule admin-menyer basert på `"admin:*"` handlinger
- BookingView: Prop `kanKobleTilArrangement` basert på `"booking:kobleTilArrangement"`
- ArrangementPage: Vise/skjule opprett-tab basert på `"arrangement:opprett"`

**Felter som BEHOLDES (uendret):**

- `roller` — beholdes i responsen for eventuell visning (badge i UI), men frontend skal **ikke** bruke den til autorisasjonslogikk

---

### 6. Klubb (`GET /klubb/{slug}`)

Klubb-responsen er offentlig (brukes for visning av navn, logo etc.). Handlingskontroll for klubb-administrasjon dekkes av `"admin:klubb"` i bruker-meg-responsen.

**Ingen endring nødvendig.**

---

## Visningshint vs handlinger

Noen felter brukes for **visning** (ikke handlinger). Disse beholdes som separate felter:

| Felt                 | Beholdes | Brukes til                                                                 |
| -------------------- | -------- | -------------------------------------------------------------------------- |
| `erEier`             | ✅       | Vise "Din booking"-badge, UserCheck-ikon                                   |
| `erPaameldt`         | ✅       | Vise UserCheck-ikon, grønn farge på "Påmeldte"                             |
| `erPassert`          | ✅       | Dimme slot-raden (opacity)                                                 |
| `booketAv`           | ✅       | Vise hvem som har booket                                                   |
| `tillaterPaamelding` | ✅       | Vise "Påmeldte"-rad i detaljer (uavhengig av om brukeren kan melde seg på) |
| `antallPaameldte`    | ✅       | Vise antall påmeldte                                                       |
| `arrangementTittel`  | ✅       | Vise arrangement-info                                                      |

**Prinsippet:** Visningshint forteller frontend _hva den skal vise_. `tillattHandlinger` forteller frontend _hva brukeren kan gjøre_.

---

## Implementasjonsguide for backend

### 1. Opprett en felles hjelpeklasse

```csharp
public static class HandlingBuilder
{
    public static List<string> ByggBookingSlotHandlinger(
        BookingSlot slot,
        string? brukerIdFraToken,
        IEnumerable<string> brukerRoller,
        BookingRegel regler)
    {
        var handlinger = new List<string>();

        if (string.IsNullOrEmpty(brukerIdFraToken))
            return handlinger; // Anonym → ingen handlinger

        if (slot.ErPassert)
            return handlinger; // Passert → ingen handlinger

        var erAdmin = brukerRoller.Contains("KlubbAdmin");
        var erUtvidet = brukerRoller.Contains("Utvidet");
        var erEier = slot.BrukerIdBooketAv == brukerIdFraToken;

        // Book
        if (slot.ErLedig && /* innenfor bookinggrenser */ true)
            handlinger.Add("book");

        // Avbestill
        if (erEier && slot.ErBooket)
            handlinger.Add("avbestill");

        // Slett (admin)
        if (erAdmin && slot.ErBooket)
            handlinger.Add("slett");

        // Arrangement-påmelding
        if (slot.HarArrangement && slot.Arrangement.TillaterPaamelding)
        {
            var erPaameldt = /* sjekk påmelding */ false;
            handlinger.Add(erPaameldt ? "meldAv" : "meldPaa");
        }

        // Koble til arrangement
        if ((erAdmin || erUtvidet) && !slot.HarArrangement && slot.ErLedig)
            handlinger.Add("kobleTilArrangement");

        return handlinger;
    }
}
```

### 2. Sett feltet i DTO-mappingen

```csharp
new BookingSlotRespons
{
    BaneId = slot.BaneId,
    Dato = slot.Dato,
    // ... andre felter ...
    TillattHandlinger = HandlingBuilder.ByggBookingSlotHandlinger(slot, brukerId, roller, regler)
}
```

### 3. Gjenta for alle entiteter

Lag tilsvarende `ByggArrangementHandlinger(...)`, `ByggBaneHandlinger(...)`, `ByggBrukerHandlinger(...)`, `ByggMegHandlinger(...)`.

---

## Migrasjonsplan

### Fase 1: Legg til `tillattHandlinger` (ikke-breaking)

- Backend legger til `tillattHandlinger` på alle responser
- De gamle feltene (`kanBookes`, `kanAvbestille`, `kanSlette`, `kanAvlyse`) beholdes midlertidig
- Frontend migreres til å bruke `tillattHandlinger`

### Fase 2: Fjern gamle felter (breaking)

- Backend fjerner `kanBookes`, `kanAvbestille`, `kanSlette`, `kanAvlyse`
- Frontend fjerner all rolle-sjekking (`bruker.roller.includes(...)`)

### Fase 3: Frontend-opprydding

- Fjern `kanKobleTilArrangement`-prop (erstattes av sjekk i `tillattHandlinger` fra meg-endepunktet eller direkte på slot)
- Fjern `erAdmin` / `harUtvidetTilgang` i Navbar (erstattes av `tillattHandlinger` fra meg-endepunktet)

---

## Oppsummering av endringer per endepunkt

| Endepunkt                                | Nytt felt           | Fjernede felter                           | Maks antall handlinger |
| ---------------------------------------- | ------------------- | ----------------------------------------- | ---------------------- |
| `GET /klubb/{slug}/booking/slots`        | `tillattHandlinger` | `kanBookes`, `kanAvbestille`, `kanSlette` | 6                      |
| `GET /klubb/{slug}/arrangement/kommende` | `tillattHandlinger` | `kanAvlyse`                               | 4                      |
| `GET /klubb/{slug}/baner`                | `tillattHandlinger` | _(ingen)_                                 | 2                      |
| `GET /klubb/{slug}/brukere`              | `tillattHandlinger` | _(ingen)_                                 | 2                      |
| `GET /klubb/{slug}/bruker/meg`           | `tillattHandlinger` | _(ingen)_                                 | 9                      |
| `GET /klubb/{slug}`                      | _(ingen endring)_   | _(ingen)_                                 | —                      |

---

## Validering

For å verifisere at implementasjonen er korrekt:

1. **Anonym bruker** → Alle `tillattHandlinger` er tomme arrays `[]`
2. **Vanlig medlem** → Ser `"book"` på ledige slots, `"avbestill"` på egne bookinger, `"meldPaa"`/`"meldAv"` på arrangementer
3. **Utvidet-bruker** → I tillegg: `"kobleTilArrangement"` på slots, `"avlys"` + `"kopierLenke"` på arrangementer, `"arrangement:opprett"` på meg
4. **KlubbAdmin** → Alt over + `"slett"` på bookinger, `"admin:*"` på meg, `"endreRolle"` + `"endreVisningsnavn"` på brukere, `"rediger"` + `"deaktiver"` på baner
5. **Passert slot** → `tillattHandlinger` er `[]` uansett rolle
