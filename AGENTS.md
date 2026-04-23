# AGENTS.md

Regras que todo agente (Claude Code, Cursor, Codex, etc.) deve seguir ao mexer neste repo.

## Regras

- Mensagens de erro em pt-br (toasts, oRPC errors, logs do observability).
- Named exports apenas. Nunca `export default`.
- Sem comentários. Código deve se explicar. Exceção: WHY não óbvio (invariante sutil, workaround específico).
- Sem barrel exports (`index.ts` re-exportando módulos). Import direto do arquivo.
- Early return. Nunca `if/else` aninhado quando `return` resolve.
- Nunca anotar type em return de função — inferência total.
- Nunca `as X as Y`, nunca `@ts-ignore`, nunca `any` sem motivo documentado.
- Procurar utils existentes antes de escrever novo. Reuso > duplicação.

## Comandos

- `bun check` — typecheck de todos os workspaces (tsgo).
- `bun lint` — oxlint no repo inteiro.
- `bun format` — oxfmt escreve mudanças.
- `bun test` — integration tests (tx rollback, workspace `@juicerq/tests`).
- `bun test:e2e` — E2E browser tests (Playwright, workspace `@juicerq/e2e`).
- `bun agent-orpc <procedure> [--input '<json>']` — invoca procedure oRPC in-process (sem HTTP, sem auth).
