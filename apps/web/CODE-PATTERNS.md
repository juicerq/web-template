# CODE-PATTERNS.md — apps/web

> Antes de mudança visual, consultar a skill `frontend-design`.

## Co-location

Código local da rota fica em pastas prefixadas com `-` (ignoradas pelo TanStack Router). Exemplo `apps/web/src/routes/login/`:

- `index.tsx` — componente principal da rota
- `-components/` — componentes só dessa rota
- `-hooks/` — hooks só dessa rota
- `-consts/` — constantes só dessa rota
- `types.ts` — tipos reusados entre arquivos da rota (se só um arquivo usa, fica nele)

Elevação: quando passa a ser usado por mais de uma rota, mover pro nível do app:

- `apps/web/src/hooks/`
- `apps/web/src/components/`
- `apps/web/src/types/`
- `apps/web/src/consts/`

## Estrutura do componente

Um componente exportado por arquivo. Subcomponente privado no mesmo file só se trivial (sem hooks, sem state próprio).

### Custom hooks por contexto

Múltiplos concerns num componente (form + query, filtros + mutation, etc) devem ser extraídos em custom hooks nomeados pelo contexto (`useProfileForm`, `useUserFilters`). O corpo do componente exportado foca em orquestração + JSX.

Localização: sempre em `-hooks/` da rota.

### Props typing

`type Props = {...}` local ao arquivo, sem export. Só exportar como `FooProps` se outro módulo realmente consumir (raro — geralmente Props muda junto com o componente).

```tsx
type Props = { user: User; onSelect: (id: string) => void };

export function UserCard({ user, onSelect }: Props) {
	return <article onClick={() => onSelect(user.id)}>{user.name}</article>;
}
```

Exportado só quando reusado externamente:

```tsx
export type UserCardProps = { user: User; onSelect: (id: string) => void };
```

### Handler naming

- Função local do componente: prefixo `handle` (`handleClick`, `handleSubmit`).
- Prop que recebe handler externo: prefixo `on` (`onDelete`, `onSelect`).

```tsx
type Props = { user: User; onDelete: (id: string) => void };

export function UserRow({ user, onDelete }: Props) {
	const handleClick = () => onDelete(user.id);
	return <button onClick={handleClick}>Deletar</button>;
}
```

### Render condicional

`condicao && <JSX/>`. Nunca usar ternário em JSX.

## Queries e mutations (oRPC + Query)

### Invalidation

`queryClient.invalidateQueries({ queryKey: orpc.x.key() })` para namespace inteiro, `orpc.x.y.queryKey({ input })` para key específica.

### Tipos

Tipos derivados via `RouterOutputs` / `RouterInputs` de `@/lib/orpc`. Nunca redeclarar shapes que já existem no backend.

### Loading / error / empty

Early return antes do JSX principal. TypeScript narrow-ifica `query.data` após os guards — o JSX nunca lida com `undefined`.

```tsx
export function UserList() {
	const query = useQuery(orpc.users.list.queryOptions());

	if (query.isPending) return <Skeleton className="h-20" />;
	if (query.data.length === 0)
		return <p className="text-muted-foreground">Nenhum usuário encontrado.</p>;

	return (
		<ul>
			{query.data.map((u) => (
				<li key={u.id}>{u.name}</li>
			))}
		</ul>
	);
}
```

Nunca tratar `undefined`/`isPending` inline no JSX principal (`{query.data?.map(...)}`).

### Erros

- Typed errors: `if (isDefinedError(error) && error.code === "NOT_FOUND") {...}`. Nunca string-matching em `error.data.code`.
- Errors de mutation/query exibidos via `toast.error(...)` do `sonner`, mensagem em pt-br.

## Forms

`react-hook-form` + `@hookform/resolvers/arktype`. Nunca TanStack Form, nunca Zod.

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

- Atoms em `src/state/<feature>.ts`, declarados module-level. `useState` só para estado isolado do componente.
- Para persistência, `atomWithStorage` do `jotai/utils`.
- Sem `<JotaiProvider>` no root — atoms globais funcionam sem Provider.

## Classes condicionais: `cn()`

Sempre `cn()` de `@/lib/cn`. Nunca template string em `className`.

```tsx
<div
	className={cn("rounded-md p-2", isActive && "bg-primary text-primary-foreground", className)}
/>
```

Errado:

```tsx
<div className={`rounded-md p-2 ${isActive ? "bg-primary" : ""} ${className ?? ""}`} />
```

## Ícones

SEMPRE de `lucide-react`. Nunca outra lib de ícone ou ícones que não é de lucide-react.

## Dark mode

- `useTheme()` de `next-themes` para toggle.
- Classes Tailwind dark-aware (`dark:bg-foo`) via `@custom-variant dark` declarado em `index.css`.
