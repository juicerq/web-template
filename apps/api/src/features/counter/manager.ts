import { ORPCError } from "@orpc/server";
import { sql } from "drizzle-orm";
import type { Db, Tx } from "../../db/client.ts";
import { counters } from "../../db/schema/counters.ts";

export class CounterManager {
	constructor(private db: Db | Tx) {}

	async get() {
		const rows = await this.db.select({ value: counters.value }).from(counters).limit(1);
		const row = rows[0];

		if (!row) throw new ORPCError("NOT_FOUND", { message: "Counter não semeado" });

		return { value: row.value };
	}

	async increment() {
		const rows = await this.db
			.update(counters)
			.set({ value: sql`${counters.value} + 1` })
			.returning({ value: counters.value });

		const row = rows[0];

		if (!row) throw new ORPCError("NOT_FOUND", { message: "Counter não semeado" });

		return { value: row.value };
	}
}
