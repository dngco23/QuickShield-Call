import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import base44 from '@base44/vite-plugin'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [
    react(),
    base44(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
})
