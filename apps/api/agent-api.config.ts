import { defineOrpcConfig } from "@juicerq/agent-api/orpc";
import { db } from "./src/db/client.ts";
import { appRouter } from "./src/router.ts";

export default defineOrpcConfig({
	router: appRouter,
	context: () => ({ user: null, db }),
});
