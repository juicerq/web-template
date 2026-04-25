import { createHonoMiddleware } from "@juicerq/trail/hono";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import type { Db } from "./db/client.ts";
import { obs } from "./observability.ts";
import { appRouter } from "./router.ts";

type CreateApiAppOptions = {
	db: Db;
};

export function createApiApp(options: CreateApiAppOptions) {
	const app = new Hono();

	app.use(
		"*",
		createHonoMiddleware(obs, {
			slowRequestMs: 3000,
			maxFieldBytes: 512,
		}),
	);

	const handler = new RPCHandler(appRouter);

	app.use("/orpc/*", async (c, next) => {
		const { matched, response } = await handler.handle(c.req.raw, {
			prefix: "/orpc",
			context: { user: null, db: options.db },
		});

		if (matched) return c.newResponse(response.body, response);

		return next();
	});

	return app;
}
