# Lokal ytelsesmåling og utsatte kandidater

Det er ingen aktiv ytelsesoppgave. Bruk [måleprotokollen](./baseline-protocol.md) når en ny,
avgrenset undersøkelse er bestilt. Dagens API-, cache- og dataeierskap står i
[arkitekturen](../architecture.md), og kjørbare porter står i
[driftsinstruksen](../development-and-operations.md) og [E2E-harnessen](../e2e-harness.md).

## Utsatte kandidater

Disse kandidatene er bevart fra den fullførte ytelsesgjennomgangen, uten bestilt implementering:

- **Kalenderpolling:** Videre reduksjon krever produksjonsmålinger som veier ressursbruk mot
  konfliktferskhet.
- **Smal arrangementsoppsummering:** En ny kontrakt må dokumentere gevinst som forsvarer risikoen
  for feil avledede datoer, mønstre og cachedata.
- **Rutesplittet CSS:** En prototype må vise lavere mobil-LCP uten FOUC, layoutskift eller duplisert
  stylingeierskap.

Begrunnelse og tidligere målinger finnes i den arkiverte
[fullstack-iterasjonen](../archive/performance/fullstack-iteration-2026-08-26.md). De øvrige
[historiske rapportene](../archive/performance/README.md) er referanser, ikke dagens kjøre- eller
produktkontrakt. Nye tiltak krever et nytt eksplisitt mål og oppdatert evidens.
