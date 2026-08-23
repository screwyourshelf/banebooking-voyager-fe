# Frontenddokumentasjon

## Gjeldende dokumenter

| Dokument                                                                         | Formål                                          |
| -------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`migration-status.md`](./migration-status.md)                                   | Nåtilstand og neste eksakte steg                |
| [`styling-lift-and-shift-plan.md`](./styling-lift-and-shift-plan.md)             | Aktiv Tailwind-/themeplan og kvalitetsporter    |
| [`migration-plan.md`](./migration-plan.md)                                       | Arbeidsrekkefølge, metode og kvalitetsporter    |
| [`behavior-inventory.md`](./behavior-inventory.md)                               | Observerbar React-baseline og routekontrakt     |
| [`wp-7-parity-and-cleanup-inventory.md`](./wp-7-parity-and-cleanup-inventory.md) | Bevist paritet og fjerningskart for WP-7        |
| [`wp-7-production-evidence.md`](./wp-7-production-evidence.md)                   | Route-, skjermbilde- og bundlebevis for WP-7    |
| [`e2e-harness.md`](./e2e-harness.md)                                             | Lokal Playwright-auth, prosesser og testdata    |
| [`styling-reference-matrix.md`](./styling-reference-matrix.md)                   | Frosset SWP-0 styling- og interaksjonsreferanse |
| [`development-and-operations.md`](./development-and-operations.md)               | Lokal utvikling, bygg og hostingkontrakt        |
| [`sveltekit-architecture.md`](./sveltekit-architecture.md)                       | Målarkitektur for SvelteKit-migreringen         |
| [`architecture-conformance-review.md`](./architecture-conformance-review.md)     | Etterreview av Svelte-/SvelteKit-konformitet    |
| [`product-design-rules.md`](./product-design-rules.md)                           | Produktets visuelle og semantiske UI-regler     |
| [`adr/`](./adr/README.md)                                                        | Bindende arkitekturbeslutninger                 |

Disse dokumentene er den komplette aktive instruksjonsflaten. Den opprinnelige
rammeverksmigreringen er fullført; stylingplanen eier den aktive Tailwind-/theme-lift-and-shift-en.
Historiske React-planer og PR-handover er fjernet fra arbeidskopien; nødvendig sporbarhet finnes i
git-historikken.

Codex fortsetter arbeidet gjennom start- og handoverprotokollen i [`../AGENTS.md`](../AGENTS.md).
Protokollen og migreringsplanen gjør AI-first lesbarhet og avgrensede sesjonshandoffs til bindende
kvalitetskrav for hele lift-and-shift-en.
