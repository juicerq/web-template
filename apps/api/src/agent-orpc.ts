import { createRouterClient } from "@orpc/server";
import { db } from "./db/client.ts";
import { appRouter } from "./router.ts";

const args = process.argv.slice(2);
const procedurePath = args[0];

if (!procedurePath) {
	console.error("Uso: bun agent-orpc <procedure> [--input '<json>']");
	process.exit(1);
}

let input: unknown;

const inputIdx = args.indexOf("--input");

if (inputIdx !== -1) {
	const raw = args[inputIdx + 1];

	if (!raw) {
		console.error("--input requer argumento JSON");
		process.exit(1);
	}

	try {
		input = JSON.parse(raw);
	} catch (err) {
		console.error("JSON inválido em --input:", err instanceof Error ? err.message : String(err));
		process.exit(1);
	}
}

const client = createRouterClient(appRouter, { context: { user: null, db } });

const parts = procedurePath.split(".");

let target: unknown = client;

for (const part of parts) {
	if (target === null || typeof target !== "object") {
		console.error(`Procedure não encontrada: ${procedurePath}`);
		process.exit(1);
	}

	target = (target as Record<string, unknown>)[part];
}

if (typeof target !== "function") {
	console.error(`Procedure não é callable: ${procedurePath}`);
	process.exit(1);
}

const procedure = target as (input?: unknown) => Promise<unknown>;

try {
	const result = await procedure(input);
	console.log(JSON.stringify(result, null, 2));
	process.exit(0);
} catch (err) {
	const serialized =
		err instanceof Error
			? { name: err.name, message: err.message, ...(err as unknown as Record<string, unknown>) }
			: err;
	console.error(JSON.stringify(serialized, null, 2));
	process.exit(1);
}
