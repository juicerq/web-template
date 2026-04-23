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
