# Backend-endringer: Arrangementer

## 1. Nytt endepunkt

Erstatt `GET /klubb/{slug}/arrangement/kommende` med:

```
GET /klubb/{slug}/arrangementer
GET /klubb/{slug}/arrangementer?inkluderHistoriske=true
```

Controller-parameter: `[FromQuery] bool inkluderHistoriske = false`

### Query-logikk

```csharp
if (inkluderHistoriske)
    // returner alle arrangementer
else
    // returner kun der sluttDato >= DateTime.Today
```

Sortering skjer på frontend (`startDato` ascending), så backend trenger ikke sortere.

---

## 2. Rename responsobjekt

`KommendeArrangementRespons` → `ArrangementRespons`

Samme felter som før, pluss nytt felt `ErPassert`:

```csharp
public class ArrangementRespons
{
    public string Id { get; set; }
    public string Tittel { get; set; }
    public string? Beskrivelse { get; set; }
    public string Kategori { get; set; }
    public string StartDato { get; set; }
    public string SluttDato { get; set; }
    public string[] Baner { get; set; }
    public string[] Ukedager { get; set; }
    public string[] Tidspunkter { get; set; }
    public int SlotLengdeMinutter { get; set; }
    public bool TillaterPaamelding { get; set; }
    public int AntallPaameldte { get; set; }
    public bool ErPaameldt { get; set; }
    public bool ErPassert { get; set; }          // NYTT — true når sluttDato < DateTime.Today
    public string[] TillattHandlinger { get; set; }
}
```

---

## 3. Uendrede endepunkter

Disse er som før — ingen endring:

- `POST /klubb/{slug}/arrangement/{id}/paamelding`
- `DELETE /klubb/{slug}/arrangement/{id}/paamelding`
- `DELETE /klubb/{slug}/arrangement/{id}`

---

## 4. Kan fjernes

- `GET /klubb/{slug}/arrangement/kommende` — brukes ikke lenger av frontend
