# CODE-PATTERNS.md — apps/api/src/features

## Managers

- Cada feature é uma pasta com `manager.ts`. Pode ter nested por domínio (ex: `notifications/local/manager.ts`, `notifications/emails/manager.ts`).
- `manager.ts` exporta `class <PascalCase>Manager` (ex: `CounterManager`) com `constructor(private db: Db | Tx)`.
- Todos os métodos usam `this.db`. Nunca importar o `db` singleton de `src/db/client.ts` — tx dos testes (`withRollback`) não isola se manager usar singleton.
- Manager concentra lógica de negócio + acesso ao banco.
- Router instancia por request: `new FooManager(context.db).method(...)`. `context.db` é `Db` em prod e `Tx` em testes.
- Errors via `throw new ORPCError("CODE", { message: "..." })` do `@orpc/server`. Mensagem em pt-br.
- Eventos de subscription usam `createRealtimeChannel` de `src/realtime.ts`, com `id` automático por evento.
- Cada feature cria um `realtime.ts` pequeno com o canal tipado, ex: `export const counterRealtime = createRealtimeChannel<{ value: number }>()`.
- Mutation que altera estado publica evento dentro do manager, depois da escrita no banco.
- Manager expõe `live(signal)` e `events(signal)`. `live` emite estado atual + próximos eventos mapeados. `events` emite eventos incrementais com `id`.
