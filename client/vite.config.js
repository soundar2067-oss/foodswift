import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI icons
          'icons-vendor': ['lucide-react'],
          // Data & networking
          'data-vendor': ['axios', 'socket.io-client'],
          // Maps (heavy — only loaded on order tracking page)
          'map-vendor': ['leaflet', 'react-leaflet'],
          // Toast notifications
          'toast-vendor': ['react-toastify'],
        }
      }
    }
  }
});
