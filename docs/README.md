# Frontenddokumentasjon

Start alltid med [`current-work.md`](./current-work.md). Tabellen under ruter videre til dokumentene
som er relevante for oppgaven; hele dokumentsettet skal ikke leses som standard.

| Oppgave                                       | Les                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Aktiv leveranse og neste steg                 | [`current-work.md`](./current-work.md)                                                                 |
| API-, query- eller ytelsesarbeid              | [`performance/README.md`](./performance/README.md), deretter relevante funn                            |
| Arkitektur, lagdeling eller dataeierskap      | [`architecture.md`](./architecture.md) og relevante [`ADR-er`](./adr/README.md)                        |
| Routes, roller eller produktadferd            | [`product-behavior.md`](./product-behavior.md)                                                         |
| UI, responsivitet eller visuell kontrakt      | [`product-design-rules.md`](./product-design-rules.md)                                                 |
| Lokal utvikling, kvalitetsporter eller build  | [`development-and-operations.md`](./development-and-operations.md)                                     |
| Playwright, testdata eller visuelle snapshots | [`e2e-harness.md`](./e2e-harness.md) og [`visual-regression-matrix.md`](./visual-regression-matrix.md) |

## Dokumentroller

- `current-work.md` er kort aktiv status, ikke historikk eller dagbok.
- Arkitektur, produktkontrakter og ADR-er beskriver varige regler.
- Utviklings- og testdokumenter beskriver kjørbare arbeidsformer.
- Detaljerte performancefunn er referansegrunnlag og leses bare for kandidaten som undersøkes.
- Fullførte prosjektforløp og mellomtilstander ligger i git-historikken, ikke i aktiv dokumentasjon.

Maskinelle baselines og guardkontrakter eies av `scripts/`; de er ikke dokumentkontekst.
