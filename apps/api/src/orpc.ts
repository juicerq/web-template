import { createOrpcMiddleware } from "@juicerq/trail/orpc";
import { os } from "@orpc/server";
import type { Db, Tx } from "./db/client.ts";
import { type AppEvent, obs } from "./observability.ts";

export type Context = { user: null; db: Db | Tx };

const base = os.$context<Context>().errors({
	UNAUTHORIZED: { status: 401, message: "Não autenticado" },
	FORBIDDEN: { status: 403, message: "Sem permissão" },
	NOT_FOUND: { status: 404, message: "Não encontrado" },
	CONFLICT: { status: 409, message: "Conflito" },
	RATE_LIMITED: { status: 429, message: "Muitas requisições" },
});

const trailMiddleware = createOrpcMiddleware<AppEvent>(obs, {
	slowRequestMs: 3000,
	expectedErrorCodes: [
		"UNAUTHORIZED",
		"FORBIDDEN",
		"NOT_FOUND",
		"CONFLICT",
		"BAD_REQUEST",
		"RATE_LIMITED",
	],
	captureInput: true,
});

export const pub = base.use(trailMiddleware);
