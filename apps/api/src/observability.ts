import { createObservability } from "@juicerq/observability";
import { env } from "./env.ts";

export const obs = createObservability({
	service: "api",
	dbPath: env.OBSERVABILITY_DB_PATH,
});
