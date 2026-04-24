import { describe, expect, test } from "bun:test";
import { withRollback } from "./utils/db.ts";
import { createTestClient } from "./utils/orpc.ts";

describe("counter", () => {
	test(
		"get retorna valor semeado (0)",
		withRollback(async (tx) => {
			const client = createTestClient(tx);

			const result = await client.counter.get();

			expect(result.value).toBe(0);
		}),
	);

	test(
		"increment retorna valor + 1",
		withRollback(async (tx) => {
			const client = createTestClient(tx);

			const result = await client.counter.increment();

			expect(result.value).toBe(1);
		}),
	);

	test(
		"live emite valor atual e próximos increments",
		withRollback(async (tx) => {
			const client = createTestClient(tx);
			const live = await client.counter.live();

			try {
				const initial = await live.next();
				expect(initial.done).toBe(false);
				if (initial.done) throw new Error("Iterator encerrou antes do valor inicial");
				expect(initial.value.value).toBe(0);

				await client.counter.increment();

				const updated = await live.next();
				expect(updated.done).toBe(false);
				if (updated.done) throw new Error("Iterator encerrou antes do evento de update");
				expect(updated.value.value).toBe(1);
			} finally {
				await live.return(undefined);
			}
		}),
	);

	test(
		"events acumula increments publicados após inscrição",
		withRollback(async (tx) => {
			const client = createTestClient(tx);
			const events = await client.counter.events();

			try {
				const firstPromise = events.next();
				await client.counter.increment();
				const secondPromise = events.next();
				await client.counter.increment();

				const first = await firstPromise;
				const second = await secondPromise;

				expect(first.done).toBe(false);
				if (first.done) throw new Error("Iterator encerrou antes do primeiro evento");
				expect(first.value.value).toBe(1);
				expect(second.done).toBe(false);
				if (second.done) throw new Error("Iterator encerrou antes do segundo evento");
				expect(second.value.value).toBe(2);
			} finally {
				await events.return(undefined);
			}
		}),
	);

	test(
		"increments consecutivos no mesmo tx acumulam",
		withRollback(async (tx) => {
			const client = createTestClient(tx);

			const first = await client.counter.increment();
			const second = await client.counter.increment();

			expect(first.value).toBe(1);
			expect(second.value).toBe(2);
		}),
	);
});
