import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'




export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      "/api": {
  // Backend runs on the port configured in backend .env (default in this repo is 5005)
  target: "http://localhost:5005",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});