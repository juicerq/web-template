import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { db } from "./db/client.ts";
import { counters } from "./db/schema/counters.ts";
import { env } from "./env.ts";
import { obs } from "./observability.ts";
import { appRouter } from "./router.ts";

async function seedCounter() {
	const existing = await db.select({ id: counters.id }).from(counters).limit(1);

	if (existing.length > 0) return;

	await db.insert(counters).values({ value: 0 });

	console.log("[db] counters semeado (value=0)");
}

await seedCounter();

const app = new Hono();

app.use("*", obs.hono);

const handler = new RPCHandler(appRouter);

app.use("/orpc/*", async (c, next) => {
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/orpc",
		context: { user: null },
	});

	if (matched) return c.newResponse(response.body, response);

	return next();
});

setInterval(() => obs.cleanup(), 60 * 60 * 1000);

console.log(`[api] Ouvindo em http://localhost:${env.PORT}`);

export default { port: env.PORT, fetch: app.fetch };
