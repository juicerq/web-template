import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	envPrefix: ["IS_"],
	plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "./src"),
			"@api": resolve(import.meta.dirname, "../api/src"),
		},
	},
	server: {
		port: 5173,
		strictPort: true,
		proxy: {
			"/orpc": "http://localhost:3000",
		},
	},
});
