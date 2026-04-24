import { CounterManager } from "../features/counter/manager.ts";
import { pub } from "../orpc.ts";

export const counterRouter = {
	get: pub.handler(async ({ context }) => new CounterManager(context.db).get()),
	live: pub.handler(async function* ({ context, signal }) {
		yield* new CounterManager(context.db).live(signal);
	}),
	events: pub.handler(async function* ({ context, signal }) {
		yield* new CounterManager(context.db).events(signal);
	}),
	increment: pub.handler(async ({ context }) => new CounterManager(context.db).increment()),
};
