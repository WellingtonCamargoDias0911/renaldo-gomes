import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seo } from './vite-plugins/seo.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seo()],
  build: { target: 'es2022', sourcemap: false },
})
