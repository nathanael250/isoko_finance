import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 6000,
    strictPort: true,
    // ✅ REMOVE THE PROXY COMPLETELY - No proxy needed for production
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'isoko-finance-1.onrender.com',
      '.onrender.com'
    ],
  },
})
