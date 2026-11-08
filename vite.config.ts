import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/icon.svg'],
    manifest: {
      name: '外贸单证系统',
      short_name: '外贸单证系统',
      description: '资料复用、五类外贸单证、A4 实时预览与 PDF 下载。',
      lang: 'zh-CN',
      start_url: './',
      display: 'standalone',
      background_color: '#F5F7FA',
      theme_color: '#1D4ED8',
      icons: [
        { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,svg,woff2}'],
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      navigateFallback: undefined,
      runtimeCaching: [{ urlPattern: ({ request }) => request.mode === 'navigate', handler: 'NetworkOnly' }],
    },
  })],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
