import { defineConfig } from 'vite';

export default defineConfig({
  base: '/welcome/',
  server: {
    port: 3002,
    host: true
  }
});
