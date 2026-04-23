# @juicerq/web-template

Template web com Bun, Hono, oRPC, Arktype, Drizzle, React 19, TanStack Router, TanStack Query, Jotai, shadcn e Tailwind v4.

## Comandos

- `bun install` — instala dependências.
- `bun db:up` — sobe Postgres local.
- `bun db:migrate` — aplica migrations.
- `bun dev` — roda API e web em modo desenvolvimento.
- `bun check` — typecheck de todos os workspaces.
- `bun lint` — lint do repo.
- `bun format` — formata o repo.
- `bun run test` — testes de integração.
- `bun run test:e2e` — testes E2E.

## Desenvolvimento

```sh
bun install
bun db:up
bun db:migrate
bun dev
```

## Estrutura

- `apps/api` — API Hono + oRPC, banco com Drizzle e observability com `@juicerq/trail`.
- `apps/web` — React + Vite + TanStack Router + TanStack Query.
- `apps/tests` — testes de integração in-process com rollback por transação.
- `apps/e2e` — testes Playwright com browser, API e Postgres reais.
