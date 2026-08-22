# Migreringsstatus

> **Status:** Aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** WP-1 — SvelteKit build- og routefundament
>
> **Sist oppdatert:** 2026-08-22

## Mål for aktiv arbeidspakke

Etabler Svelte 5 og SvelteKit med statisk SPA-hosting, base path, fallback, rootgrenser, tenanttre,
tomme routeinnganger og maskinelt kontrollerte arkitekturgrenser uten React-runtime i bundlen.

## Fullført

- Feature-branchen `feature/sveltekit-lift-and-shift` er opprettet.
- SvelteKit-målarkitektur er dokumentert.
- Fire ADR-er er godkjent for rendering, state/data, auth/tenant og UI/Bits UI.
- Rammeverksnøytrale produkt- og designregler er konsolidert.
- Gamle React-planer, PR-handover og arkivdokumenter er fjernet fra arbeidskopien.
- Migreringsplan, denne statusfilen og Codex-protokoll i `AGENTS.md` er etablert.
- React-referansens test-, check- og buildbaseline er grønn.
- Alle eksisterende routes, tenantformer, tilgangsnivåer, sentrale API-er, kapabiliteter og kritiske
  states er dokumentert i `docs/behavior-inventory.md`.
- WP-0-kvalitetsporten er nådd.

## Nåtilstand

- Produksjonskoden er fortsatt React/Vite; ingen SvelteKit-kode er opprettet.
- Frontendfunksjonalitet er ikke endret.
- Dokumentgrunnlaget og den observerbare React-baselinen er komplett.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                                 |
| ------------------------------------- | -------------------------------------------------- |
| Base branch                           | `main`                                             |
| Fastslått basecommit                  | `5287c5e`                                          |
| Siste semantiske checkpoint           | `docs: document WP-0 behavior inventory`           |
| Lokale commits foran base             | 2                                                  |
| Forventede ucommitterte frontendfiler | Ingen                                              |
| Neste planlagte checkpoint            | `feat(sveltekit): establish WP-1 route foundation` |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Etabler WP-1-fundamentet:

1. Erstatt React/Vite-entrypointet som aktiv build med SvelteKit, Svelte 5, TypeScript strict og
   `adapter-static`.
2. Implementer root layout/error, statisk `auth/callback`, valgfri tenant-route med matcher og
   tomme routekomposisjoner for hele URL-kontrakten.
3. Bevar root- og base-path-hosting med måltilpasset fallback og validerte offentlige miljøverdier.
4. Tilpass lint, format, `svelte-check`, tester og første arkitekturkontroller og kjør WP-1-porten.

## Arbeidspakkeregister

| Arbeidspakke                     | Status       | Port/resultat                                                |
| -------------------------------- | ------------ | ------------------------------------------------------------ |
| WP-0 Styring og baseline         | Fullført     | Dokumentgrunnlag, React-baseline og komplett adferdsinventar |
| WP-1 Build og routes             | Pågår        | Eksakt scaffold- og routefundament er neste steg             |
| WP-2 Contracts/domain/platform   | Ikke startet | —                                                            |
| WP-3 Auth/tenant/serverdata      | Ikke startet | —                                                            |
| WP-4 UI-fundament                | Ikke startet | —                                                            |
| WP-5 App-shell                   | Ikke startet | —                                                            |
| WP-6 Featuremigrering            | Ikke startet | —                                                            |
| WP-7 Paritet og produksjonsbytte | Ikke startet | —                                                            |

## Featureregister

| Gruppe                       | Status   | Merknad                           |
| ---------------------------- | -------- | --------------------------------- |
| Auth, policy, feil og guards | Kartlagt | Første featuregruppe i WP-6       |
| Booking og bootstrap         | Kartlagt | Kjerneflyt                        |
| Mine tider og Min side       | Kartlagt | Beskyttet kontoflyt               |
| Arrangementer og Nyheter     | Kartlagt | Offentlig/innlogget innhold       |
| Baner og Grener              | Kartlagt | Delt adminarbeidsområde           |
| Klubb og medlemskap          | Kartlagt | Admininnstillinger                |
| Arrangementadministrasjon    | Kartlagt | Sammensatt editor og bookinger    |
| Brukere og sperre            | Kartlagt | Rolle- og kapabilitetsstyrt admin |
| Kunngjøringer og editor      | Kartlagt | Riktekst og obligatorisk flyt     |
| Statistikk                   | Kartlagt | Datavisualisering                 |

## Åpne blokkeringer

Ingen kjente blokkeringer. WP-1 kan utføres uten backendendringer eller ny brukerbeslutning.

## Midlertidig kode og kjente avvik

- Hele React-applikasjonen er midlertidig produksjonsreferanse på migreringsbranchen.
- SvelteKit-målstrukturen finnes foreløpig bare i dokumentasjonen.

## Siste verifikasjon

| Kontroll                             | Resultat                                                     |
| ------------------------------------ | ------------------------------------------------------------ |
| Prettier på aktive dokumenter        | Bestått 2026-08-22                                           |
| Relative dokumentlenker              | Bestått 2026-08-22                                           |
| Utdaterte frontenddokumentreferanser | Ingen funnet 2026-08-22                                      |
| `git diff --check`                   | Bestått 2026-08-22                                           |
| `npm test`                           | Bestått 2026-08-22: 8 filer, 25 tester                       |
| `npm run check`                      | Bestått 2026-08-22: typecheck, designgrenser, lint og format |
| `npm run build`                      | Bestått 2026-08-22: Vite-produksjonsbuild                    |
| WP-0 route-/featureinventar          | Komplett 2026-08-22                                          |

## Filer i siste checkpoint

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `docs/README.md`
- `docs/sveltekit-architecture.md`
- `docs/product-design-rules.md`
- `docs/migration-plan.md`
- `docs/migration-status.md`
- `docs/behavior-inventory.md`
- `docs/adr/`
- `src/styles/design-system/PRINCIPLES.md`
- slettede historiske React-planer, arkiv og PR-handover

Denne listen beskriver checkpointets leveranse. `/start` bruker commit-diffen som autoritativ kilde
for nøyaktig innhold og `git status` for eventuelt pågående arbeid etter checkpointet.
