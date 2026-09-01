//* vitest.config.ts

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "jsdom",

		// One jsdom environment per worker is memory-hungry, so one worker per
		// core oversubscribes a loaded machine: environment setup slows ~6x and
		// blows the findBy* deadline. Half the cores is reliable AND faster.
		maxWorkers: "50%",

		// Memory pressure can slow a jsdom environment ~5x, pushing a correct
		// test past the 5s default. Must stay ABOVE the 5s asyncUtilTimeout in
		// tests/setup.ts so a missing element reports as findBy's DOM dump
		// rather than an opaque test timeout.
		testTimeout: 20000,
		hookTimeout: 20000,
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.d.ts",
				"src/main.tsx",
				"src/vite-env.d.ts",
				"src/components/ui/**",
			],
		},
	},
});
