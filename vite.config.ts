import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',  // Using 5001 to avoid conflict with macOS AirPlay
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
