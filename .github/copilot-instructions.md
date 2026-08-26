# Frontend instructions

## Autoritative kilder

Les disse før frontendarbeid:

1. [`AGENTS.md`](../AGENTS.md)
2. [`docs/migration-status.md`](../docs/migration-status.md)
3. [`docs/migration-plan.md`](../docs/migration-plan.md)
4. [`docs/sveltekit-architecture.md`](../docs/sveltekit-architecture.md)
5. [`docs/product-design-rules.md`](../docs/product-design-rules.md)
6. [`docs/adr/`](../docs/adr/README.md)

## Grunnregel

Migreringen bevarer produktadferd, URL-er og API-kontrakter, men nyimplementerer frontend i
idiomatisk Svelte 5 og SvelteKit. Eksisterende React-struktur er bare en kilde til observerbar
adferd. Den er ikke en mal for komponenter, state eller filstruktur.

## Svelte 5 og SvelteKit

- Bruk runes-modus: `$props`, `$state`, `$derived` og målrettet `$effect`.
- Bruk snippets for komposisjon og typed callback-props for domenehendelser.
- La routes og layouts eie URL, tenant, guards og route data.
- Legg serverdata i TanStack Svelte Query, lokal arbeidsflyt i runes og delbar state i URL.
- Bruk typed context for auth, tenant og andre treomspennende instanser.
- Hold `load` fri for sideeffekter og unngå modulglobal bruker- eller requeststate.
- Bruk native `fetch` gjennom platformlaget. Komponenter gjør ikke HTTP-kall.

## Grenser

- Routes importerer bare offentlige feature-API-er.
- Features importerer ikke andre features.
- Bare `lib/ui/primitives` kan importere Bits UI.
- Bare platformlaget kan importere Supabase, Sentry og browser storage direkte.
- Featurekode bruker offentlig UI-API og lager ikke lokale designvarianter.
- Rammeverksuavhengig domenelogikk skal være ren TypeScript uten Svelte- eller browseravhengighet.

## Arbeidsform

Kartlegg først adferd, states, API-kall, roller og responsive krav. Design deretter løsningen ut fra
SvelteKits naturlige eierskap. Ikke opprett en Svelte-ekvivalent bare fordi React-versjonen har en
hook, provider, guard, container, view eller wrapper.

Et nytt delt pattern eller arkitekturvalg skal løses sentralt og gjenbrukes. Hvis det bryter en
godkjent ADR, må beslutningen erstattes av en ny ADR før implementering.
