import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { test as base } from "@playwright/test";
import type { AppRouter } from "@juicerq/api/src/router.ts";
import { truncateAndSeed } from "./truncate.ts";

type Fixtures = {
	cleanDb: void;
	api: RouterClient<AppRouter>;
};

export const test = base.extend<Fixtures>({
	cleanDb: [
		// oxlint-disable-next-line no-empty-pattern -- Playwright fixture requires destructuring pattern
		async ({}, use) => {
			await truncateAndSeed();
			await use();
		},
		{ auto: true },
	],
	api: async ({ baseURL }, use) => {
		const link = new RPCLink({ url: `${baseURL}/orpc` });
		const client: RouterClient<AppRouter> = createORPCClient(link);
		await use(client);
	},
});

export { expect } from "@playwright/test";
