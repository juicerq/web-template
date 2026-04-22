# AGENTS.md — apps/api

Regras específicas para mexer em `apps/api`. Herdam tudo de `../../AGENTS.md`.

## Regras

- Errors em procedures SEMPRE via `errors.XXX({ message })` do oRPC. Nunca `throw new Error()` genérico.
- Contexto multi-user nas queries (quando auth existir). Hoje `context.user` é `null`.
- Lógica em interface/função separada, não inline no handler. Handler delega.
- Output type inferido — nunca anotar return.
- Nunca `.query.X.findMany()` / API relational do Drizzle. Query builder (`db.select()`, `db.insert()`, `db.update()`) sempre.
- Nunca `bun db:push`. Só `db:generate` + `db:migrate`. Schema history existe no git.
- Se `drizzle-kit generate` criar DROP+ADD por rename, editar o `.sql` à mão para virar `RENAME`.
- `enrich/escalate/suppress` do `@juicerq/observability` para enriquecer eventos — preferido sobre `console.log`.

## Banco de dados

- Schemas em `src/db/schema/*.ts`, um arquivo por feature.
- Migrations versionadas em `drizzle/`. Commit obrigatório junto com mudança de schema.
- `updated_at` em toda tabela que é mutável, com `defaultNow()`.

## Observability

- Request context já está populado pelo middleware do Hono. Procedures só precisam `enrich({...})` campos custom.
- `escalate("warn" | "error")` para subir severidade quando a lógica detectar algo pior do que o HTTP status indica.
- `suppress()` para eventos que não devem ser persistidos (polling ruidoso).
