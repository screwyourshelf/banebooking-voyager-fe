# Banebooking frontend

Svelte 5/SvelteKit-klient for Banebooking. Backend ligger i det separate
[backend-repoet](https://github.com/screwyourshelf/banebooking-voyager-be).

## Start lokalt

Bruk Node 24 LTS (`fnm use`) og prosjektets npm 10.9.9 til installasjonen. Bootstrapen endrer
ikke global npm:

```bash
npm exec --yes --package=npm@10.9.9 -- npm ci
npm run dev
```

Frontend bruker `/api` via Vites proxy til `http://localhost:5015`. Start backend og lokal
PostgreSQL fra backend-repoet. Se [utviklings- og driftsinstruksen](./docs/development-and-operations.md)
for konfigurasjon, testing via lokal IP og produksjonsbuild.

## Dokumentasjon og verifikasjon

- [Dokumentruting](./docs/README.md)
- [Aktiv status](./docs/current-work.md)
- [Arkitektur](./docs/architecture.md)
- [Produktadferd](./docs/product-behavior.md)
- [Lokal E2E-harness](./docs/e2e-harness.md)

```bash
npm test
npm run check
```

Backendintegrasjon og produksjonsruter har egne testkommandoer i driftsinstruksen.
