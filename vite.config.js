import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4050",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/completions": {
        target: "http://localhost:4050",
        changeOrigin: true,
      },
      "/register": {
        target: "http://localhost:4050",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:4050",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://localhost:4050",
        changeOrigin: true,
      },
      "/profile": {
        target: "http://localhost:4050",
        changeOrigin: true,
      },
    },
  },
});