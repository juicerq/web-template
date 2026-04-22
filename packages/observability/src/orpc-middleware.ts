import { enrich, escalate, suppress } from "./context.ts";

const DEFAULT_EXPECTED_ERROR_CODES = [
	"UNAUTHORIZED",
	"NOT_FOUND",
	"FORBIDDEN",
	"CONFLICT",
	"BAD_REQUEST",
	"VALIDATION",
] as const;

const REDACTION_BYTE_THRESHOLD = 512;

type OrpcUser = { id?: string; uuid?: string } | null | undefined;

type OrpcContext = { user?: OrpcUser } | null | undefined;

type OrpcMiddlewareOptions = {
	context: OrpcContext;
	path: readonly string[];
	next: (...args: unknown[]) => Promise<unknown>;
};

type OrpcMiddlewareConfig = {
	suppressedProcedures?: readonly string[];
	expectedErrorCodes?: readonly string[];
};

function isSuppressed(path: string, patterns: readonly string[]) {
	return patterns.some((pattern) => path === pattern || path.startsWith(`${pattern}.`));
}

function redactLargeStrings(input: unknown): unknown {
	if (typeof input === "string") {
		if (input.length <= REDACTION_BYTE_THRESHOLD) return input;
		return `<redacted:${input.length}ch>`;
	}

	if (input === null || typeof input !== "object") return input;

	if (Array.isArray(input)) {
		return input.map((item) => redactLargeStrings(item));
	}

	const out: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
		out[key] = redactLargeStrings(value);
	}

	return out;
}

function extractUserId(context: OrpcContext) {
	if (!context || typeof context !== "object") return undefined;

	const user = context.user;

	if (!user || typeof user !== "object") return undefined;

	return user.uuid ?? user.id;
}

function extractErrorCode(err: unknown) {
	if (err && typeof err === "object" && "code" in err) {
		const code = (err as { code: unknown }).code;
		if (typeof code === "string") return code;
	}

	return "INTERNAL_SERVER_ERROR";
}

function enrichFromError(err: unknown, expected: readonly string[]) {
	const code = extractErrorCode(err);

	const isExpected = expected.includes(code);

	const isError = err instanceof Error;

	const error: Record<string, string> = {
		type: isError ? err.constructor.name : "Unknown",
		code,
		message: isError ? err.message : String(err),
	};

	if (!isExpected && isError && err.stack) {
		error.stack = err.stack;
	}

	enrich({ error, error_code: code });

	escalate(isExpected ? "warn" : "error");
}

export function createOrpcMiddleware(config: OrpcMiddlewareConfig = {}) {
	const suppressedProcedures = config.suppressedProcedures ?? [];
	const expectedErrorCodes = config.expectedErrorCodes ?? DEFAULT_EXPECTED_ERROR_CODES;

	return async (options: OrpcMiddlewareOptions, input: unknown) => {
		const procedurePath = options.path.join(".");

		enrich({ procedure: procedurePath });

		if (isSuppressed(procedurePath, suppressedProcedures)) {
			suppress();
		}

		const userId = extractUserId(options.context);

		if (userId) enrich({ user_id: userId });

		if (input !== undefined) {
			try {
				const serialized = JSON.stringify(input);

				enrich({
					input: redactLargeStrings(input),
					input_size: serialized.length,
				});
			} catch {}
		}

		try {
			return await options.next();
		} catch (err) {
			enrichFromError(err, expectedErrorCodes);
			throw err;
		}
	};
}
