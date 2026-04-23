import { sql } from "@juicerq/api/src/db/client.ts";
import { seedCounter } from "@juicerq/api/src/db/seed-counter.ts";

export async function truncateAndSeed() {
	const rows = await sql<{ tablename: string }[]>`
		SELECT tablename FROM pg_tables
		WHERE schemaname = 'public' AND tablename <> '__drizzle_migrations'
	`;

	if (rows.length > 0) {
		const names = rows.map((r) => `"${r.tablename}"`).join(", ");
		await sql.unsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
	}

	await seedCounter();
}
