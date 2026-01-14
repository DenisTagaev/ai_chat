import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
});
