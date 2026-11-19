import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Public URL: https://www.luizduarte.pt/icpc/.
// Vite emits /icpc/assets/... links in the production bundle.
export default defineConfig({
  base: '/icpc/',
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': 'http://api:8000' },
  },
});
