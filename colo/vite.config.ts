import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base relativa: o mesmo build funciona na raiz do domínio, em subpasta e empacotado como TWA.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'COLO — Plataforma de Cuidado',
        short_name: 'colo',
        description:
          'Cuidado em conjunto: psicologia, educação física e nutrição acompanhando a mesma pessoa.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAF4F0',
        theme_color: '#FAF4F0',
        categories: ['health', 'lifestyle'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // pt-BR só precisa do subconjunto latino: os outros ficam fora do cache inicial
        globIgnores: ['**/*vietnamese*', '**/*latin-ext*'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
