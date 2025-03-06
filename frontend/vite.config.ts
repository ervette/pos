import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:5000', // use http://192.168.0.3:5000 for later 
    },
    hmr: {
      clientPort: 5173, // Hot Module Reload for external devices
    }
  },
});
