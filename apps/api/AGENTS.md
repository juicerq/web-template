# AGENTS.md — apps/api

Apenas quando for implementar, ler o `CODE-PATTERNS.md` da área:

- Router (delegators): [`src/router/CODE-PATTERNS.md`](./src/router/CODE-PATTERNS.md)
- Features (lógica/managers): [`src/features/CODE-PATTERNS.md`](./src/features/CODE-PATTERNS.md)
- Banco de dados: [`src/db/CODE-PATTERNS.md`](./src/db/CODE-PATTERNS.md)

## Observability

- `enrich/escalate/suppress` do `@juicerq/observability` preferido sobre `console.log`.
- Request context já está populado pelo middleware do Hono. Procedures só precisam `enrich({...})` campos custom.
- `escalate("warn" | "error")` para subir severidade quando a lógica detectar algo pior do que o HTTP status indica.
- `suppress()` para eventos que não devem ser persistidos (polling ruidoso).
