# CODE-PATTERNS.md — apps/api/src/router

## Router

- Rota é delegação pura. Zero lógica. Formato: `get: pub.handler(async ({ context }) => new CounterManager(context.db).get())`.
- Um arquivo por feature (ex: `counter.ts`). Exporta `<feature>Router`.
- Lógica fica em `src/features/<feature>/manager.ts`. Router instancia o manager por request passando `context.db` pro constructor.
