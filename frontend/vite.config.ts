import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 127.0.0.1, not localhost: Node may resolve localhost to IPv6 (::1) while uvicorn listens on IPv4.
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
