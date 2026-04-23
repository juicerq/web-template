import type { Db, Tx } from "@juicerq/api/src/db/client.ts";
import { appRouter } from "@juicerq/api/src/router.ts";
import { createRouterClient } from "@orpc/server";

export function createTestClient(db: Db | Tx) {
	return createRouterClient(appRouter, { context: { user: null, db } });
}
