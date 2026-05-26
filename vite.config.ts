import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        includeAssets: [
          'logo.svg', 
          'favicon.ico', 
          'apple-touch-icon.png', 
          'favicon-32x32.png', 
          'favicon-16x16.png', 
          'android-chrome-192x192.png', 
          'android-chrome-512x512.png',
          'screenshot-desktop.png',
          'screenshot-mobile.png'
        ],
        manifest: {
          id: '/?utm_source=pwa',
          name: 'EasyAssess Platform',
          short_name: 'EasyAssess',
          description: 'Next-Gen Academic Assessment & Review Engine',
          theme_color: '#020202',
          background_color: '#020202',
          display: 'standalone',
          display_override: [
            'standalone',
            'window-controls-overlay',
            'minimal-ui'
          ],
          lang: 'en',
          dir: 'ltr',
          orientation: 'any',
          scope: '/',
          start_url: '/?utm_source=pwa',
          prefer_related_applications: false,
          related_applications: [],
          categories: [
            'education',
            'utilities',
            'productivity'
          ],
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: '/logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshot-desktop.png',
              sizes: '1408x768',
              type: 'image/png',
              form_factor: 'wide',
              label: 'EasyAssess Academic Rating Dashboard'
            },
            {
              src: '/screenshot-mobile.png',
              sizes: '768x1376',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'EasyAssess Mobile Book Review Portal'
            }
          ],
          shortcuts: [
            {
              name: 'Dashboard',
              short_name: 'Dashboard',
              description: 'Go to academic book evaluation dashboard',
              url: '/?shortcut=dashboard',
              icons: [{ 'src': '/android-chrome-192x192.png', 'sizes': '192x192', 'type': 'image/png' }]
            },
            {
              name: 'Settings',
              short_name: 'Settings',
              description: 'Adjust academic assessment settings',
              url: '/?shortcut=settings',
              icons: [{ 'src': '/android-chrome-192x192.png', 'sizes': '192x192', 'type': 'image/png' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
          navigateFallback: '/index.html',
          maximumFileSizeToCacheInBytes: 5242880,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
