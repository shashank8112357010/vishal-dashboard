import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const base = env.VITE_APP_PUBLIC_PATH || "/";
	const isProduction = mode === "production";

	// Optional plugins
	const plugins = [
		react(),
		vanillaExtractPlugin({
			identifiers: ({ debugId }) => `${debugId}`,
		}),
		tailwindcss(),
		tsconfigPaths(),
	];

	// Add visualizer only if package is available (for local development)
	if (isProduction && process.env.ENABLE_BUNDLE_ANALYZER === "true") {
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { visualizer } = require("rollup-plugin-visualizer");
			plugins.push(
				visualizer({
					open: true,
					gzipSize: true,
					brotliSize: true,
					template: "treemap",
				}),
			);
		} catch {
			// Visualizer not available, skip it
		}
	}

	return {
		base,
		plugins,

		server: {
			open: true,
			host: true,
			port: 5173,
			hmr: {
				overlay: false, // Disable error overlay to reduce CPU
			},
			watch: {
				// Reduce file watching overhead
				ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
			},
			proxy: {
				"/api": {
					target: "http://localhost:3002",
					changeOrigin: true,
					secure: false,
				},
			},
		},

		build: {
			outDir: "dist/client",
			target: "esnext",
			minify: "esbuild",
			sourcemap: !isProduction,
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					manualChunks: {
						"vendor-core": ["react", "react-dom", "react-router"],
						"vendor-ui": ["antd", "@ant-design/cssinjs", "styled-components"],
						"vendor-utils": ["axios", "dayjs", "i18next", "zustand", "@iconify/react"],
						"vendor-charts": ["apexcharts", "react-apexcharts"],
					},
				},
			},
		},

		optimizeDeps: {
			include: ["react", "react-dom", "react-router", "antd", "axios", "dayjs"],
			exclude: ["@iconify/react"],
		},

		esbuild: {
			drop: isProduction ? ["console", "debugger"] : [],
			legalComments: "none",
			target: "esnext",
		},
	};
});
