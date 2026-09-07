import { defineConfig } from 'vite';

export default defineConfig({
  base: '/landing/',
  server: {
    port: 3002,
    host: true
  }
});
