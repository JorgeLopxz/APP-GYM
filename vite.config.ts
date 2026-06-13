import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Content-Security-Policy solo en producción (en dev rompería el HMR de Vite).
 * GitHub Pages no permite cabeceras HTTP, así que va como <meta>.
 */
const csp = (): Plugin => ({
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml(html) {
    const policy = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      'frame-src https://www.youtube-nocookie.com',
      "connect-src 'self' https://hierro-push.dawn-dust-950a.workers.dev",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
    return html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`
    )
  }
})

export default defineConfig({
  base: '/APP-GYM/',
  plugins: [
    csp(),
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
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: '/APP-GYM/index.html',
        importScripts: ['push-sw.js']
      }
    })
  ]
})
