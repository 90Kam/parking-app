import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Kto mnie zastawia',
        short_name: 'Parking',
        description: 'Aplikacja do oznaczania zajętych miejsc parkingowych',
        theme_color: '#ffffff',
        background_color: '#f0f0f0',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      srcDir: 'src',
      filename: 'service-worker.js',
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
});
