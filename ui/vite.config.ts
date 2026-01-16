import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "favicon-96x96.png",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "AI Assistant Chat",
        short_name: "AI Chat",
        description: "Your personal AI assistant",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
            },
          },

          {
            urlPattern: ({ request }) => request.destination === "script",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "scripts",
            },
          },

          {
            urlPattern: ({ request }) => request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "styles",
            },
          },

          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },

          {
            urlPattern: /\/api\//,
            handler: "NetworkOnly",
            options: {
              cacheName: "api",
            },
          },
        ],
      },
    }),
  ],
  build: {
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue")) return "vue-vendor";
            if (id.includes("axios")) return "http-vendor";
            return "vendor";
          }
        },
      },
    },

    chunkSizeWarningLimit: 500,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },

  server: {
    hmr: true,
  },

  preview: {
    port: 4173,
  },
});
