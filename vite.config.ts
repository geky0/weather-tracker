import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.GITHUB_PAGES === 'true' ? '/weather-tracker/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Weather Tracker',
        short_name: 'Weather',
        description:
          'Liquid glass weather tracker with NASA EONET natural events and Open-Meteo forecasts.',
        theme_color: '#1a0508',
        background_color: '#1a0508',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/eonet\.gsfc\.nasa\.gov\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'eonet-api',
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 10 },
              networkTimeoutSeconds: 8,
            },
          },
          {
            urlPattern: /^https:\/\/api\.rainviewer\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rainviewer-api',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 8,
            },
          },
          {
            urlPattern: /^https:\/\/.*basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
