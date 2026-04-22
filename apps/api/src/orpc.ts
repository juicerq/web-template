import { enrich, escalate } from "@juicerq/observability";
import { os } from "@orpc/server";

export type Context = { user: null };

const EXPECTED_ERROR_CODES = new Set([
	"UNAUTHORIZED",
	"FORBIDDEN",
	"NOT_FOUND",
	"CONFLICT",
	"BAD_REQUEST",
	"RATE_LIMITED",
]);

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

function extractErrorCode(err: unknown) {
	if (err && typeof err === "object" && "code" in err) {
		const code = (err as { code: unknown }).code;
		if (typeof code === "string") return code;
	}

	return "INTERNAL_SERVER_ERROR";
}

const base = os.$context<Context>().errors({
	UNAUTHORIZED: { status: 401, message: "Não autenticado" },
	FORBIDDEN: { status: 403, message: "Sem permissão" },
	NOT_FOUND: { status: 404, message: "Não encontrado" },
	CONFLICT: { status: 409, message: "Conflito" },
	RATE_LIMITED: { status: 429, message: "Muitas requisições" },
});

const observabilityMiddleware = base.middleware(async ({ path, next }, input) => {
	const procedure = path.join(".");

	enrich({ procedure });

	if (input !== undefined) {
		try {
			const serialized = JSON.stringify(input);
			enrich({ input: redactLargeStrings(input), input_size: serialized.length });
		} catch {}
	}

	try {
		return await next();
	} catch (err) {
		const code = extractErrorCode(err);
		const isError = err instanceof Error;
		const isExpected = EXPECTED_ERROR_CODES.has(code);

		const errorInfo: Record<string, string> = {
			type: isError ? err.constructor.name : "Unknown",
			code,
			message: isError ? err.message : String(err),
		};

		if (!isExpected && isError && err.stack) errorInfo.stack = err.stack;

		enrich({ error: errorInfo, error_code: code });
		escalate(isExpected ? "warn" : "error");

		throw err;
	}
});

export const pub = base.use(observabilityMiddleware);
