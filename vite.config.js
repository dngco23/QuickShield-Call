import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Supabase-backed config — Base44 plugin and proxy removed.
export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
  },
  plugins: [react()],
});
