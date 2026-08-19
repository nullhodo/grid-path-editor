import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": [
            "react",
            "react-dom",
            "jotai",
            "framer-motion",
            "lucide-react",
          ],
          "vendor-p5": ["p5", "p5.js-svg"],
          "vendor-recorder": ["mp4-muxer"],
        },
      },
    },
  },
});
