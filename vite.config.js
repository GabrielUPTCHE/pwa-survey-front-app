import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Definimos el puerto donde corre el frontend (por defecto Vite usa el 5173)
    port: 5173,
    proxy: {
      // Le decimos a Vite: "Cualquier petición que empiece con /api..."
      '/api': {
        // "...mándala a este destino (tu servidor Node.js)"
        //target: 'https://172.20.1.34',
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})