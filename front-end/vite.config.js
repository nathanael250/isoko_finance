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
    host: 'localhost', // Changed from '0.0.0.0' to 'localhost' for development
    port: 5173, // Set default port to 5173
    open: true, // Automatically open browser
    strictPort: false, // Allow port fallback if 5173 is busy
  },
  preview: {
    host: '0.0.0.0', // Keep this for production preview
    port: process.env.PORT || 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'isoko-finance-1.onrender.com',
      '.onrender.com'
    ],
  },
})
