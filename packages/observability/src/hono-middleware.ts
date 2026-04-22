import { createEventContext, enrich, escalate, flush, runWithContext } from "./context.ts";
import type { Store } from "./store.ts";

const SLOW_REQUEST_THRESHOLD_MS = 3000;

type HonoLike = {
	req: { method: string; path: string };
	res: { status: number };
};

type HonoNext = () => Promise<void>;

function deriveSeverity(statusCode: number) {
	if (statusCode < 400) return "info" as const;
	if (statusCode < 500) return "warn" as const;
	return "error" as const;
}

export function createHonoMiddleware(store: Store) {
	return async (c: HonoLike, next: HonoNext) => {
		const ctx = createEventContext(
			{
				type: "request",
				method: c.req.method,
				path: c.req.path,
			},
			store.getServiceInfo(),
		);

		await runWithContext(ctx, async () => {
			await next();

			enrich({ status_code: c.res.status });

			const statusSeverity = deriveSeverity(c.res.status);

			if (statusSeverity !== "info") escalate(statusSeverity);

			const durationMs = Math.round(performance.now() - ctx.startTime);

			if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) escalate("warn");

			flush(store.write);
		});
	};
}
