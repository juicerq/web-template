import { AsyncLocalStorage } from "node:async_hooks";
import type { WideEvent } from "./schema.ts";

export type EventContext = {
	event: Partial<WideEvent>;
	startTime: number;
	suppressed: boolean;
};

const storage = new AsyncLocalStorage<EventContext>();

const SEVERITY_RANK = { info: 0, warn: 1, error: 2 } as const;

export function createEventContext(
	base: Pick<WideEvent, "type"> & Partial<WideEvent>,
	info: { service: string; hostname: string },
) {
	const context: EventContext = {
		event: {
			id: Bun.randomUUIDv7(),
			timestamp: new Date().toISOString(),
			service: info.service,
			hostname: info.hostname,
			severity: "info",
			...base,
		},
		startTime: performance.now(),
		suppressed: false,
	};

	return context;
}

export function runWithContext<T>(context: EventContext, fn: () => T) {
	return storage.run(context, fn);
}

export function enrich(fields: Record<string, unknown>) {
	const context = storage.getStore();

	if (!context) return;

	Object.assign(context.event, fields);
}

export function suppress() {
	const context = storage.getStore();

	if (!context) return;

	context.suppressed = true;
}

export function escalate(target: "warn" | "error") {
	const context = storage.getStore();

	if (!context) return;

	const current = (context.event.severity ?? "info") as keyof typeof SEVERITY_RANK;

	if (SEVERITY_RANK[target] > SEVERITY_RANK[current]) {
		context.event.severity = target;
	}
}

export function flush(write: (event: WideEvent) => void, explicit?: EventContext) {
	const context = explicit ?? storage.getStore();

	if (!context) return;
	if (context.suppressed) return;

	const durationMs = Math.round(performance.now() - context.startTime);

	if (context.event.duration_ms === undefined) {
		context.event.duration_ms = durationMs;
	}

	write(context.event as WideEvent);
}
