# AGENTS.md — apps/web

## Regras

- Ícones SEMPRE de `lucide-react`. Nunca outra lib de ícone.
- Máximo 200 linhas por componente — se passar, quebrar em subcomponentes.
- Tipos derivados do router oRPC via `RouterOutputs` / `RouterInputs` de `@/lib/orpc`. Nunca redeclarar shapes que já existem no backend.
- Antes de mudança visual, consultar a skill `frontend-design`.
- Render condicional: `condicao && <JSX/>`. Ternário só quando `else` tem JSX.
- Estado compartilhado em Jotai (`atom()` module-level). `useState` só para estado isolado do componente.
- Errors de mutation/query exibidos via `toast.error(...)` do `sonner`, mensagem em pt-br.

## useEffect

`useEffect` é proibido em código novo para derivar estado, reagir a evento ou buscar dados. Tabela "não faça / faça":

| Problema                         | ❌ Não faça                                   | ✅ Faça                                              |
| -------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Derivar valor a partir de props  | `useEffect(() => setX(f(prop)), [prop])`      | `const x = f(prop)` direto no render                 |
| Reagir a click / submit          | `useEffect` disparado por flag em state       | Handler `onClick` / `onSubmit` chama a lógica direto |
| Buscar dados ao montar           | `useEffect(() => fetch(...), [])`             | `useQuery(orpc.x.y.queryOptions())`                  |
| Sincronizar após mutação         | `useEffect(() => refetch(), [mutation.data])` | `onSuccess` do `useMutation` invalida a query        |
| Reset de form ao trocar entidade | `useEffect(() => form.reset(x), [x])`         | `useForm({ values: x })` (RHF reage automático)      |
| Escutar mudança de rota          | `useEffect` com `location.pathname`           | `useRouterState` / loader da rota                    |
| Persistir estado em localStorage | `useEffect` escrevendo `localStorage`         | `atomWithStorage` do `jotai/utils`                   |
| Debounce de input                | `useEffect` + `setTimeout`                    | Hook dedicado (`useDebouncedValue`)                  |

Exceções legítimas para `useEffect`: integração com API imperativa (focus, scroll, canvas, WebSocket, subscribe de event emitter externo). Nesses casos, comentar o WHY.

## Jotai

- Atoms declarados module-level em `src/state/<feature>.ts`. Sem `<JotaiProvider>` no root — atoms globais funcionam sem Provider.
- `useAtom` / `useAtomValue` / `useSetAtom` no componente.
- Para persistência, `atomWithStorage` do `jotai/utils`.

## oRPC + Query

- Import de `orpc`, `orpcClient`, `queryClient` de `@/lib/orpc`.
- `useQuery(orpc.x.y.queryOptions({ input: {...} }))`.
- `useMutation(orpc.x.y.mutationOptions({ onSuccess: () => invalidate }))`.
- Invalidate via `queryClient.invalidateQueries({ queryKey: orpc.x.key() })` para namespace ou `orpc.x.y.queryKey({ input })` para key específica.
- Typed errors: `if (isDefinedError(error) && error.code === "NOT_FOUND") {...}`. Nunca string-matching em `error.data.code`.

## Forms

- `react-hook-form` + `@hookform/resolvers/arktype`. Nunca TanStack Form, nunca Zod.
- Componentes `Form`, `FormField`, `FormItem`, etc. de `@/components/ui/form`.

## Dark mode

- `useTheme()` de `next-themes` para toggle. Valores possíveis: `"light" | "dark" | "system"`.
- Classes Tailwind dark-aware (`dark:bg-foo`) via `@custom-variant dark` declarado em `index.css`.
