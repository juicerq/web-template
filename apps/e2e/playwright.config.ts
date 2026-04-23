import { defineConfig, devices } from "@playwright/test";

const API_PORT = 3001;
const WEB_PORT = 5174;
const API_URL = `http://localhost:${API_PORT}`;
const WEB_URL = `http://localhost:${WEB_PORT}`;
const DATABASE_URL = "postgres://postgres:postgres@localhost:5433/template_e2e";

process.env.DATABASE_URL = DATABASE_URL;
process.env.NODE_ENV = "test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",

	use: {
		baseURL: WEB_URL,
		trace: "retain-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: [
		{
			command: `bun ./playwright/api-boot.ts`,
			port: API_PORT,
			reuseExistingServer: !process.env.CI,
			timeout: 60_000,
			stdout: "pipe",
			stderr: "pipe",
			env: {
				PORT: String(API_PORT),
				NODE_ENV: "test",
				DATABASE_URL,
			},
		},
		{
			command: `bun --cwd ../web vite --port ${WEB_PORT}`,
			port: WEB_PORT,
			reuseExistingServer: !process.env.CI,
			timeout: 60_000,
			stdout: "pipe",
			stderr: "pipe",
			env: {
				API_PROXY_TARGET: API_URL,
			},
		},
	],
});
