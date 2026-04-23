import { CounterManager } from "../features/counter/manager.ts";
import { pub } from "../orpc.ts";

export const counterRouter = {
	get: pub.handler(async ({ context }) => new CounterManager(context.db).get()),
	increment: pub.handler(async ({ context }) => new CounterManager(context.db).increment()),
};
