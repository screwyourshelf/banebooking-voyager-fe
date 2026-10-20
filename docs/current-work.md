# Aktivt arbeid

> **Status:** Utvikling avsluttet og lokal verifikasjon bestått; publisering godkjent 2026-10-20
>
> **Hovedbranch:** `main` · **Arbeidsbranch:** `codex/quick-arrangement`

## Mål og omfang

Fullstackleveransen gir «Opprett nytt arrangement» ved siden av «Koble til arrangement» i
bookingkalenderen. Dialogen bruker type som automatisk tittel, valgfri beskrivelse og flere tider
på samme bane/dato. Delvis suksess vises uten en ny opprettelseshandling; tittel kan senere redigeres
i administrasjonen. Se [produktkontrakten](./product-behavior.md).

Kobling til eksisterende arrangement bruker den samme tidsvelgeren og eksisterende batchendepunkt,
med samlet resultat for vellykkede og avviste tider. Backendkontrakten er uendret.

Backend samler tjenesteflyter og viderefører profilvalideringsfeil. Frontend bruker eksisterende
API-, query-, feil- og stylingmønstre; kontrakttester dekker samspillet.

## Publisering og oppfølging

- Test fra samme lokalnett på [192.168.68.64:5173/aas-tennisklubb](http://192.168.68.64:5173/aas-tennisklubb).
  Bruk Testinnlogging som Utvidet eller administrator. Vite videresender `/api` til lokal
  Development-backend på port 5015.
- Brukeren har godkjent commit, merge og deploy av begge repoer. Frontend publiseres fra `main`
  gjennom Cloudflare Pages; backend publiseres fra `master` gjennom GitHub Actions.
- Backendens låste `frontend_ref` skal peke på denne leveransens verifiserte frontendcommit.
  Backend publiseres før den nye frontenden. Gjeldende utrullingsstatus eies av GitHub Actions og
  Cloudflare Pages, ikke av dette dokumentet.
- Avhengighetskontrollen ved publisering er dokumentert i leveransenotatet og krever egen oppfølging.
- Utskilling av backendens turneringstrekkingsalgoritmer er utsatt som egen oppgave.

Tidligere rapportert verifikasjon og datert avhengighetsobservasjon står i
[leveransenotatet](./archive/hurtigoppretting-og-kontrakter-2026-10.md).
Oppstart, kvalitetsporter og publisering eies av [driftsinstruksen](./development-and-operations.md).
