import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Louis & die Sternenreiter",
        short_name: "Sternenreiter",
        description: "Kindgerechtes Sci-Fi-Abenteuer mit Louis und den Sternenreitern.",
        theme_color: "#11131a",
        background_color: "#11131a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg}"],
        cleanupOutdatedCaches: true
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    sourcemap: true
  }
});
