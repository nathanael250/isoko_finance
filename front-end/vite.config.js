import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This was missing in your second config
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Important for Render deployment
    port: process.env.PORT || 6000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0', // Important for Render deployment
    port: process.env.PORT || 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'isoko-finance-1.onrender.com',
      '.onrender.com'
    ],
  },
})
