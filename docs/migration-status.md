# Migreringsstatus

> **Status:** Aktiv
>
> **Branch:** `feature/sveltekit-lift-and-shift`
>
> **Aktiv arbeidspakke:** WP-0 — Styring og baseline
>
> **Sist oppdatert:** 2026-08-22

## Mål for aktiv arbeidspakke

Etabler en komplett, entydig og selv-dokumenterende migreringskontrakt. Dokumenter deretter dagens
React-baseline og observerbare route-/featurekontrakt før SvelteKit-scaffoldingen starter.

## Fullført

- Feature-branchen `feature/sveltekit-lift-and-shift` er opprettet.
- SvelteKit-målarkitektur er dokumentert.
- Fire ADR-er er godkjent for rendering, state/data, auth/tenant og UI/Bits UI.
- Rammeverksnøytrale produkt- og designregler er konsolidert.
- Gamle React-planer, PR-handover og arkivdokumenter er fjernet fra arbeidskopien.
- Migreringsplan, denne statusfilen og Codex-protokoll i `AGENTS.md` er etablert.
- React-referansens test-, check- og buildbaseline er grønn.

## Nåtilstand

- Produksjonskoden er fortsatt React/Vite; ingen SvelteKit-kode er opprettet.
- Frontendfunksjonalitet er ikke endret.
- Dokumentgrunnlaget er samlet i migreringens første lokale checkpoint.
- Backend-repoet er urørt.

## Git-checkpoint

| Felt                                  | Forventet tilstand                              |
| ------------------------------------- | ----------------------------------------------- |
| Base branch                           | `main`                                          |
| Fastslått basecommit                  | `5287c5e`                                       |
| Siste semantiske checkpoint           | `docs: establish SvelteKit migration framework` |
| Lokale commits foran base             | 1                                               |
| Forventede ucommitterte frontendfiler | Ingen                                           |
| Neste planlagte checkpoint            | `docs: document WP-0 behavior inventory`        |

`/start` beregner gjeldende `HEAD`, merge-base og commit-rekke direkte fra git. `HEAD`-hashen
lagres ikke her fordi committen som inneholder statusfilen ellers ville gjort feltet
selvrefererende og umiddelbart utdatert. Hvis tabellen og git avviker, er differ og kode
autoritativt bevis; statusfilen korrigeres før arbeidet fortsetter.

## Neste eksakte steg

Fullfør WP-0-baseline:

1. Lag et observerbart inventar over alle routes og featuregrupper med tilgangsnivå, sentrale API-er
   og kritiske states. Inventaret skal beskrive adferd, ikke React-filer.
2. Oppdater registeret under og marker WP-0-porten først når inventaret er komplett.
3. Start deretter WP-1 med SvelteKit build- og routefundamentet.

## Arbeidspakkeregister

| Arbeidspakke                     | Status       | Port/resultat                                                     |
| -------------------------------- | ------------ | ----------------------------------------------------------------- |
| WP-0 Styring og baseline         | Pågår        | Dokumentgrunnlag og testbaseline ferdig; adferdsinventar gjenstår |
| WP-1 Build og routes             | Ikke startet | —                                                                 |
| WP-2 Contracts/domain/platform   | Ikke startet | —                                                                 |
| WP-3 Auth/tenant/serverdata      | Ikke startet | —                                                                 |
| WP-4 UI-fundament                | Ikke startet | —                                                                 |
| WP-5 App-shell                   | Ikke startet | —                                                                 |
| WP-6 Featuremigrering            | Ikke startet | —                                                                 |
| WP-7 Paritet og produksjonsbytte | Ikke startet | —                                                                 |

## Featureregister

| Gruppe                       | Status        | Merknad                           |
| ---------------------------- | ------------- | --------------------------------- |
| Auth, policy, feil og guards | Ikke kartlagt | Første featuregruppe i WP-6       |
| Booking og bootstrap         | Ikke kartlagt | Kjerneflyt                        |
| Mine tider og Min side       | Ikke kartlagt | Beskyttet kontoflyt               |
| Arrangementer og Nyheter     | Ikke kartlagt | Offentlig/innlogget innhold       |
| Baner og Grener              | Ikke kartlagt | Delt adminarbeidsområde           |
| Klubb og medlemskap          | Ikke kartlagt | Admininnstillinger                |
| Arrangementadministrasjon    | Ikke kartlagt | Sammensatt editor og bookinger    |
| Brukere og sperre            | Ikke kartlagt | Rolle- og kapabilitetsstyrt admin |
| Kunngjøringer og editor      | Ikke kartlagt | Riktekst og obligatorisk flyt     |
| Statistikk                   | Ikke kartlagt | Datavisualisering                 |

## Åpne blokkeringer

Ingen kjente blokkeringer. WP-0-gjenstående arbeid kan utføres fra repoet uten ny
brukerbeslutning.

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

## Filer i siste checkpoint

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `docs/README.md`
- `docs/sveltekit-architecture.md`
- `docs/product-design-rules.md`
- `docs/migration-plan.md`
- `docs/migration-status.md`
- `docs/adr/`
- `src/styles/design-system/PRINCIPLES.md`
- slettede historiske React-planer, arkiv og PR-handover

Denne listen beskriver checkpointets leveranse. `/start` bruker commit-diffen som autoritativ kilde
for nøyaktig innhold og `git status` for eventuelt pågående arbeid etter checkpointet.
