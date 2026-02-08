# Copilot Instructions

## Project Guidelines
- Frontend-utvikler retningslinjer for React (Vite + TypeScript):

GRUNNPRINSIPP: All frontend-kode skal være konsistent i struktur, ansvar og "feel". Ikke introduser nye varianter eller mønstre hvis tilsvarende allerede finnes.

KONSISTENS: Samme type side/komponent/hook skal løses likt overalt. Finn eksisterende kode som gjør "samme sak" og kopier mønsteret. Favoriser eksisterende praksis fremfor nye forbedringer.

FRONTEND-SOLID:
- S: Komponenter gjør én ting. Container/page henter data, holder state, kobler hooks og UI. Presentational components rendrer UI uten datahenting/sideeffekter. Hooks har én bekymring.
- O: Utvid ved å legge til nye komponenter/hooks. Bruk komposisjon fremfor conditionals.
- L: Props skal være konsistente og forutsigbare.
- I: Props-typer skal være små og fokuserte.
- D: UI avhenger av abstractions (hooks, adapters). API-kall i dedikerte hooks/services. Komponenter skal ikke kjenne Axios/fetch direkte.

DATAHENTING: Bruk React Query konsekvent. Queries (GET) = idempotent, cache-vennlig, stabile query keys. Mutations invalidate/refetch etter etablert mønster. Unngå duplisering av server-state i local state.

FORMER: Følg eksisterende form-pattern slavisk. Samme validering → samme løsning.

UI-KONSISTENS: Samme type side = samme layout, spacing, komponentbruk. Samme type handling = samme knapper, loading-indikator, feilmelding-presentasjon.

STYLING: Følg etablert styling-system (CSS/Tailwind/shadcn). Samme komponent → samme styling overalt.

TYPESCRIPT: Type safety viktigere enn kort kode. Unngå `any`. Eksplisitte typer for props og hooks. Delte typer gjenbrukes.

ARBEIDSFLYT: 1) Finn eksisterende lignende komponent/hook. 2) Følg samme struktur og navngiving. 3) Implementer med minst mulig ansvar per komponent. 4) Verifiser at løsningen "føles lik" resten. 5) Ikke introduser nye mønstre uten eksplisitt behov.

IKKE GJØR: Ikke hent data direkte i presentational components. Ikke bland UI, data og sideeffekter i samme komponent. Ikke introduser nye patterns "fordi det er enklere". Ikke variér naming, casing eller struktur.
