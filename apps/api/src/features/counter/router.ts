import { sql } from "drizzle-orm";
import { counters } from "../../db/schema/counters.ts";
import { pub } from "../../orpc.ts";

export const counterRouter = {
	get: pub.handler(async ({ context, errors }) => {
		const rows = await context.db.select({ value: counters.value }).from(counters).limit(1);
		const row = rows[0];

		if (!row) throw errors.NOT_FOUND({ message: "Counter não semeado" });

		return { value: row.value };
	}),

	increment: pub.handler(async ({ context, errors }) => {
		const rows = await context.db
			.update(counters)
			.set({ value: sql`${counters.value} + 1`, updated_at: new Date() })
			.returning({ value: counters.value });

		const row = rows[0];

		if (!row) throw errors.NOT_FOUND({ message: "Counter não semeado" });

		return { value: row.value };
	}),
};
