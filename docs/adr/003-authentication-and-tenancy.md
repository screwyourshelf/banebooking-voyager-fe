# ADR-003: Autentisering og tenant-routing

> **Status:** Godkjent
>
> **Dato:** 2026-08-22

## Kontekst

Frontend støtter Supabase OAuth/OTP, utviklingsinnlogging, root-level auth callback og to former
for tenant-routing: slug i URL eller tenant fastsatt ved build. Auth må være tilgjengelig for
API-klienten og guards uten at Supabase sprer seg gjennom features.

## Beslutning

1. `platform/auth` eksponerer ett typed `AuthState`-grensesnitt for sesjonsstatus, bruker, token og
   utlogging.
2. Supabase- og utviklingsinnlogging implementeres som adapters bak samme grensesnitt.
3. Supabase importeres ikke fra routes, features, domain eller UI.
4. Auth-context opprettes per applikasjonstre med `createContext<T>()` og eier ingen global
   requestspesifikk state.
5. API-klienten får token gjennom `AuthState.getAccessToken`; endpointfunksjoner kjenner ikke
   Supabase.
6. `auth/callback` er en eksplisitt route utenfor tenant-treet og bruker samme base path-verktøy
   som login.
7. Tenant normaliseres i `[[slug=tenant]]/+layout.ts`. En param matcher avviser reserverte
   segmenter, og build-konfigurasjon leverer slug når URL-en ikke gjør det.
8. Route groups for protected/admin gir loading, redirect og riktig brukerflyt. De er ikke en
   sikkerhetsgrense; backendkapabiliteter er autoritative.
9. En 401 håndteres sentralt og idempotent: cache/session ryddes, feedback sendes én gang og
   brukeren navigeres kontrollert til login.

## Konsekvenser

- Features kan testes uten Supabase.
- Utviklingsauth og produksjonsauth får samme konsumentkontrakt.
- Tenant- og authlogikk blir layoutansvar fremfor guards rundt hver komponent.
- En fremtidig cookie-/SSR-adapter kan implementere samme grensesnitt, men krever en ny ADR.

## Verifikasjon

- OAuth-callback fungerer på root og under base path.
- Hard refresh med gyldig Supabase-sesjon gir ikke falsk redirect til login.
- Dedikert tenant-build og slug-basert build gir identisk normalisert tenant-context.
- Protected routes viser deterministisk initializing-, anonymous- og authenticated-state.
- Backend avviser fortsatt uautoriserte kall uavhengig av klientguard.

## Referanser

- [Svelte: Context](https://svelte.dev/docs/svelte/context)
- [SvelteKit: Advanced routing](https://svelte.dev/docs/kit/advanced-routing)
- [SvelteKit: State management](https://svelte.dev/docs/kit/state-management)
