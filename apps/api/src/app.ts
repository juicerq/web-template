import { db } from "./db/client.ts";
import { seedCounter } from "./db/seed-counter.ts";
import { env } from "./env.ts";
import { createApiApp } from "./http.ts";
import { obs } from "./observability.ts";

await seedCounter();

const app = createApiApp({ db });

setInterval(() => void obs.cleanup(), 60 * 60 * 1000);

console.log(`[api] Ouvindo em http://localhost:${env.PORT}`);

export default { port: env.PORT, fetch: app.fetch };
