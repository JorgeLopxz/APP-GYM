import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/APP-GYM/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'HIERRO — Diario de gimnasio',
        short_name: 'HIERRO',
        description:
          'Registra tus pesos, mide tu progreso y domina tu semana de entreno.',
        lang: 'es',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/APP-GYM/',
        scope: '/APP-GYM/',
        background_color: '#0a0a0c',
        theme_color: '#0a0a0c',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: '/APP-GYM/index.html'
      }
    })
  ]
})
