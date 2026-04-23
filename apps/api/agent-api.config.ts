import { defineConfig } from "@juicerq/agent-api";
import { db } from "./src/db/client.ts";
import { appRouter } from "./src/router.ts";

export default defineConfig({
	router: appRouter,
	context: () => ({ user: null, db }),
});
