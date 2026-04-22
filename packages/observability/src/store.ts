import { Database } from "bun:sqlite";
import {
	and,
	count,
	desc,
	eq,
	getTableColumns,
	gte,
	inArray,
	isNull,
	like,
	lt,
	lte,
	not,
	or,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { mkdirSync } from "node:fs";
import { hostname } from "node:os";
import path from "node:path";
import type { EventFilters, EventQueryOptions, WideEvent } from "./schema.ts";

const events = sqliteTable(
	"events",
	{
		id: text().primaryKey(),
		type: text({ enum: ["request", "job"] }).notNull(),
		severity: text({ enum: ["info", "warn", "error"] }).notNull(),
		timestamp: text().notNull(),
		service: text().notNull(),
		hostname: text().notNull(),

		request_id: text(),
		method: text(),
		path: text(),
		procedure: text(),
		status_code: int(),
		duration_ms: int(),
		input_size: int(),
		user_id: text(),

		error_code: text(),

		job_id: text(),
		job_name: text(),
		queue: text(),
		attempt: int(),
		job_status: text(),
		items_processed: int(),
		items_failed: int(),

		extra: text(),
	},
	(table) => [
		index("idx_events_severity").on(table.severity),
		index("idx_events_timestamp").on(table.timestamp),
		index("idx_events_procedure").on(table.procedure),
		index("idx_events_user_id").on(table.user_id),
		index("idx_events_job_name").on(table.job_name),
		index("idx_events_type").on(table.type),
	],
);

const KNOWN_FIELDS = new Set(Object.keys(getTableColumns(events)));

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  service TEXT NOT NULL,
  hostname TEXT NOT NULL,
  request_id TEXT,
  method TEXT,
  path TEXT,
  procedure TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  input_size INTEGER,
  user_id TEXT,
  error_code TEXT,
  job_id TEXT,
  job_name TEXT,
  queue TEXT,
  attempt INTEGER,
  job_status TEXT,
  items_processed INTEGER,
  items_failed INTEGER,
  extra TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_procedure ON events(procedure);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_job_name ON events(job_name);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
`;

function splitEvent(event: WideEvent) {
	const known: Record<string, unknown> = {};
	const extra: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(event)) {
		if (value === undefined) continue;

		if (KNOWN_FIELDS.has(key)) {
			known[key] = value;
		} else {
			extra[key] = value;
		}
	}

	return { known, extra };
}

function buildWhereConditions(filters: EventFilters) {
	const conditions = [];

	if (filters.severity) conditions.push(eq(events.severity, filters.severity));
	if (filters.type) conditions.push(eq(events.type, filters.type));
	if (filters.procedure) conditions.push(eq(events.procedure, filters.procedure));
	if (filters.job_name) conditions.push(eq(events.job_name, filters.job_name));
	if (filters.user_id) conditions.push(eq(events.user_id, filters.user_id));
	if (filters.error_code) conditions.push(eq(events.error_code, filters.error_code));
	if (filters.min_duration_ms !== undefined) {
		conditions.push(gte(events.duration_ms, filters.min_duration_ms));
	}
	if (filters.from) conditions.push(gte(events.timestamp, filters.from));
	if (filters.to) conditions.push(lte(events.timestamp, filters.to));

	if (conditions.length === 0) return undefined;

	return and(...conditions);
}

function deserializeRow(row: Record<string, unknown>) {
	const event: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(row)) {
		if (key === "extra") continue;
		if (value !== null) event[key] = value;
	}

	if (row.extra && typeof row.extra === "string") {
		Object.assign(event, JSON.parse(row.extra));
	}

	return event as WideEvent;
}

export function createStore(config: { service: string; dbPath: string }) {
	if (config.dbPath !== ":memory:") {
		mkdirSync(path.dirname(config.dbPath), { recursive: true });
	}

	const sqlite = new Database(config.dbPath);

	sqlite.exec("PRAGMA journal_mode = WAL");
	sqlite.exec("PRAGMA synchronous = NORMAL");
	sqlite.exec(INIT_SQL);

	const db = drizzle(sqlite);

	const host = hostname();

	function write(event: WideEvent) {
		try {
			const { known, extra } = splitEvent(event);

			db.insert(events)
				.values({
					...known,
					extra: Object.keys(extra).length > 0 ? JSON.stringify(extra) : null,
				} as typeof events.$inferInsert)
				.run();
		} catch (err) {
			console.error("[obs] falha ao persistir evento", err);
		}
	}

	function query(options: EventQueryOptions = {}) {
		const { filters = {}, limit = 50, offset = 0 } = options;

		const where = buildWhereConditions(filters);

		const [countResult] = db.select({ total: count() }).from(events).where(where).all();

		const rows = db
			.select()
			.from(events)
			.where(where)
			.orderBy(desc(events.timestamp))
			.limit(limit)
			.offset(offset)
			.all();

		return {
			events: rows.map((row) => deserializeRow(row as Record<string, unknown>)),
			total: countResult?.total ?? 0,
			limit,
			offset,
		};
	}

	function cleanup(now = Date.now()) {
		const cutoff90d = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();
		const cutoff30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
		const cutoff3d = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

		db.delete(events)
			.where(and(inArray(events.severity, ["error", "warn"]), lt(events.timestamp, cutoff90d)))
			.run();

		db.delete(events)
			.where(
				and(
					eq(events.severity, "info"),
					like(events.procedure, "ai.%"),
					lt(events.timestamp, cutoff30d),
				),
			)
			.run();

		db.delete(events)
			.where(
				and(
					eq(events.severity, "info"),
					or(isNull(events.procedure), not(like(events.procedure, "ai.%"))),
					lt(events.timestamp, cutoff3d),
				),
			)
			.run();
	}

	function getServiceInfo() {
		return { service: config.service, hostname: host };
	}

	return { write, query, cleanup, getServiceInfo };
}

export type Store = ReturnType<typeof createStore>;
