import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { db } from "./db/client.ts";
import { seedCounter } from "./db/seed-counter.ts";
import { env } from "./env.ts";
import { obs } from "./observability.ts";
import { appRouter } from "./router.ts";

await seedCounter();

const app = new Hono();

app.use("*", obs.hono);

const handler = new RPCHandler(appRouter);

app.use("/orpc/*", async (c, next) => {
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/orpc",
		context: { user: null, db },
	});

	if (matched) return c.newResponse(response.body, response);

	return next();
});

setInterval(() => obs.cleanup(), 60 * 60 * 1000);

console.log(`[api] Ouvindo em http://localhost:${env.PORT}`);

export default { port: env.PORT, fetch: app.fetch };
