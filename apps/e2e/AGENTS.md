# AGENTS.md — apps/e2e

## Padrão

E2E testa fluxo completo: browser → Vite → proxy → API → Postgres. Isolamento entre testes via `TRUNCATE + seed` na fixture auto-aplicada.

## Regras

- Importar `test` e `expect` de `../playwright/fixtures.ts`. NUNCA de `@playwright/test`.
- Fixture `cleanDb` é `{ auto: true }` — truncate + seed roda automático. Não registrar `beforeEach(truncateAndSeed)`.
- Fixture `api` (cliente oRPC tipado) pra setup rápido ou verificação. Padrão híbrido: setup via `api`, ação+verificação via UI. Ver `tests/counter-api.spec.ts`.
- Assertions Playwright são sempre awaitadas no locator: `await expect(locator).toHaveText(...)`. Nunca `expect(await locator.textContent()).toBe(...)` — perde retry automático.
- Selectors por `getByRole`, `getByText`, `getByLabel`. Evitar CSS selectors frágeis.
- Quando adicionar spec novo, criar em arquivo próprio — Playwright shard divide por arquivo.

## Setup

- `bun run test:e2e` sobe Postgres (compose de `apps/tests/`), cria DB `template_e2e`, migra, seeda, sobe api em `:3001` e web em `:5174`. Tudo via `playwright/api-boot.ts`.
- CI paraleliza via shards (`.github/workflows/e2e.yml`).

## Comandos

- `bun run test:e2e` — suite completa.
- `bun run test:e2e:ui` — modo interativo (Playwright UI).
