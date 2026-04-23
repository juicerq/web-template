import { db } from "./client.ts";
import { counters } from "./schema/counters.ts";

export async function seedCounter() {
	const existing = await db.select({ id: counters.id }).from(counters).limit(1);

	if (existing.length > 0) return;

	await db.insert(counters).values({ value: 0 });

	console.log("[db] counters semeado (value=0)");
}
