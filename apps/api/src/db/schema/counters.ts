import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const counters = pgTable("counters", {
	id: serial("id").primaryKey(),
	value: integer("value").notNull().default(0),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});
