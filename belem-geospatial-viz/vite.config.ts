import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/belem-geospatial-viz/', // Important for GitHub Pages
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['react-leaflet', 'leaflet'],
          echarts: ['echarts', 'echarts-for-react'],
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
  },
})
