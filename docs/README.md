# Frontenddokumentasjon

## Normative dokumenter

| Dokument                                                           | Formål                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [`migration-status.md`](./migration-status.md)                     | Kort nåtilstand, verifikasjon og eventuelt neste vedlikeholdssteg |
| [`development-and-operations.md`](./development-and-operations.md) | Lokal utvikling, kvalitetsporter, bygg og hosting                 |
| [`sveltekit-architecture.md`](./sveltekit-architecture.md)         | Aktiv SvelteKit-arkitektur og laggrenser                          |
| [`product-design-rules.md`](./product-design-rules.md)             | Produktets visuelle, semantiske og responsive regler              |
| [`behavior-inventory.md`](./behavior-inventory.md)                 | Observerbar route-, rolle- og produktkontrakt                     |
| [`e2e-harness.md`](./e2e-harness.md)                               | Lokal Playwright-auth, prosesser og testdata                      |
| [`adr/`](./adr/README.md)                                          | Bindende arkitekturbeslutninger                                   |

## Historisk migreringsbevis

`migration-plan.md`, `styling-lift-and-shift-plan.md`, `architecture-conformance-review.md`,
`wp-7-*`, `styling-*-evidence/matrix` og `swp-*-audit` dokumenterer fullførte checkpoints. De er
referansemateriale, ikke aktive planer eller instruksjonskilder. `styling-baseline.json` er et
generert kontrollartefakt som leses av `npm run check`, ikke en håndskrevet styringsfil.

Vedlikeholds- og handoverprotokollen ligger i [`../AGENTS.md`](../AGENTS.md). Git bevarer den
detaljerte migreringshistorikken; `migration-status.md` skal bare beskrive sann nåtilstand.

## Parkerte oppfølgingsnotater

| Dokument                                                         | Formål                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`api-performance-follow-up.md`](./api-performance-follow-up.md) | Førstegjennomgang av API-/fullstackytelse etter migreringen; ikke aktiv |

Parkerte notater er ikke en arbeidskø og startes ikke automatisk av `/start`. De aktiveres bare
etter en eksplisitt brukerbeslutning og må valideres mot gjeldende kode før de brukes som plan.
