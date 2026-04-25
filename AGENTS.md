# AGENTS.md

## Regras locais

- Mensagens de erro em pt-br: toasts, oRPC errors e logs do observability.

## Comandos

- `bun check` — typecheck de todos os workspaces (tsgo).
- `bun lint` — oxlint no repo inteiro.
- `bun format` — oxfmt escreve mudanças.
- `bun test` — integration tests (tx rollback, workspace `@juicerq/tests`).
- `bun test:e2e` — E2E browser tests (Playwright, workspace `@juicerq/e2e`).
- `bun check:lobomfz` — runner extra com tsgo, oxlint custom, knip, jscpd e checks `@lobomfz/check`.
- `bun agent-api <list|show|call> <path> [--input '<json>'] [--as <id>] [--pretty]` — invoca procedures oRPC in-process (sem HTTP, sem auth). Via [@juicerq/agent-api](https://github.com/juicerq/agent-api); config em `apps/api/agent-api.config.ts`.
