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
          orientation: 'any',
          scope: '/',
          start_url: '/?utm_source=pwa',
          categories: [
            'education',
            'utilities',
            'productivity'
          ],
          icons: [
            {
              src: 'logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable'
            },
            {
              src: 'android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: 'screenshot-desktop.png',
              sizes: '1920x1080',
              type: 'image/png',
              form_factor: 'wide',
              label: 'EasyAssess Academic Rating Dashboard'
            },
            {
              src: 'screenshot-mobile.png',
              sizes: '1080x1920',
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
              icons: [{ 'src': 'android-chrome-192x192.png', 'sizes': '192x192' }]
            },
            {
              name: 'Settings',
              short_name: 'Settings',
              description: 'Adjust assessment criteria settings',
              url: '/?shortcut=settings',
              icons: [{ 'src': 'android-chrome-192x192.png', 'sizes': '192x192' }]
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
