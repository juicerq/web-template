import { createOrpcMiddleware } from "@juicerq/trail/orpc";
import { os } from "@orpc/server";
import type { Db, Tx } from "./db/client.ts";
import { type AppEvent, obs } from "./observability.ts";

export type Context = { user: null; db: Db | Tx };

const REDACTION_THRESHOLD = 512;

function redactLargeStrings(input: unknown): unknown {
	if (typeof input === "string") {
		if (input.length <= REDACTION_THRESHOLD) return input;
		return `<redacted:${input.length}ch>`;
	}

	if (input === null || typeof input !== "object") return input;

	if (Array.isArray(input)) return input.map((item) => redactLargeStrings(item));

	const out: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
		out[key] = redactLargeStrings(value);
	}

	return out;
}

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
});

// roda dentro do scope aberto por trailMiddleware — enrich captura input sem boilerplate no handler
const inputCaptureMiddleware = base.middleware(async ({ next }, input) => {
	if (input !== undefined) {
		try {
			const serialized = JSON.stringify(input);
			obs.enrich({ input: redactLargeStrings(input), input_size: serialized.length });
		} catch {}
	}

	return await next();
});

export const pub = base.use(trailMiddleware).use(inputCaptureMiddleware);
