import { createHonoMiddleware } from "./hono-middleware.ts";
import { createOrpcMiddleware } from "./orpc-middleware.ts";
import { createStore } from "./store.ts";

type CreateObservabilityConfig = {
	service: string;
	dbPath: string;
	suppressedProcedures?: readonly string[];
	expectedErrorCodes?: readonly string[];
};

export function createObservability(config: CreateObservabilityConfig) {
	const store = createStore({ service: config.service, dbPath: config.dbPath });

	const hono = createHonoMiddleware(store);
	const orpc = createOrpcMiddleware({
		suppressedProcedures: config.suppressedProcedures,
		expectedErrorCodes: config.expectedErrorCodes,
	});

	return {
		hono,
		orpc,
		query: store.query,
		cleanup: store.cleanup,
		store,
	};
}

export { createHonoMiddleware } from "./hono-middleware.ts";
export { createOrpcMiddleware } from "./orpc-middleware.ts";
export { createStore } from "./store.ts";
export {
	createEventContext,
	enrich,
	escalate,
	flush,
	runWithContext,
	suppress,
} from "./context.ts";

export type { EventContext } from "./context.ts";
export type { EventFilters, EventQueryOptions, EventType, Severity, WideEvent } from "./schema.ts";
export type { Store } from "./store.ts";
