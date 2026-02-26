import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "bundle-analysis.html", // Build শেষে report file
      open: true,                       // Automatically browser open
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: true,
    port: 8000
  },
  optimizeDeps: {
    include: ["xlsx"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
  },
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true,
//   },
//   optimizeDeps: {
//     include: ["xlsx"],
//   },
// });
