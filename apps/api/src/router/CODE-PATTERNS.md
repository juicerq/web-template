# CODE-PATTERNS.md — apps/api/src/router

## Router

- Rota é delegação pura. Zero lógica. Formato: `get: pub.handler(async ({ context }) => new CounterManager(context.db).get())`.
- Um arquivo por feature (ex: `counter.ts`). Exporta `<feature>Router`.
- Lógica fica em `src/features/<feature>/manager.ts`. Router instancia o manager por request passando `context.db` pro constructor.
- Subscription SSE usa Event Iterator no mesmo router oRPC. Formato: `live: pub.handler(async function* ({ context, signal }) { yield* new FooManager(context.db).live(signal); })`.
- Não usar WebSocket como padrão. WebSocket só quando o client precisa enviar mensagens pela mesma conexão.
