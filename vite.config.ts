import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seo } from './vite-plugins/seo.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seo()],
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      // Duas páginas estáticas: a loja do livro (/) e o convite de lançamento (/convidados),
      // cada uma com seu próprio <title>/Open Graph — essencial para a prévia do WhatsApp.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        convidados: resolve(import.meta.dirname, 'convidados/index.html'),
      },
    },
  },
})
