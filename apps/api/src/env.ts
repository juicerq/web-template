import { type } from "arktype";

const envSchema = type({
	"PORT?": "string.numeric.parse",
	"NODE_ENV?": "'development' | 'production' | 'test'",
	DATABASE_URL: "string > 0",
	"OBSERVABILITY_DB_PATH?": "string > 0",
});

const parsed = envSchema(process.env);

if (parsed instanceof type.errors) {
	console.error("[env] Configuração inválida:");
	console.error(parsed.summary);
	process.exit(1);
}

export const env = {
	PORT: parsed.PORT ?? 3000,
	NODE_ENV: parsed.NODE_ENV ?? "development",
	DATABASE_URL: parsed.DATABASE_URL,
	OBSERVABILITY_DB_PATH: parsed.OBSERVABILITY_DB_PATH ?? "./data/observability.db",
};
