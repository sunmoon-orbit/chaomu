import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function zhaohuaAssets() {
  return {
    name: 'zhaohua-assets',
    transformIndexHtml(html) {
      return html
    },
    generateBundle() {
      this.emitFile({
        type: 'asset', fileName: 'manifest.json',
        source: JSON.stringify({
          id: '/chaomu/zhaohua/', name: '昭华记忆库', short_name: '昭华', description: 'ChatGPT 与 Codex 的共同记忆',
          start_url: '/chaomu/zhaohua/', scope: '/chaomu/zhaohua/', display: 'standalone', orientation: 'portrait',
          background_color: '#F7F2EA', theme_color: '#F7F2EA',
          icons: [
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        }, null, 2),
      })
      this.emitFile({
        type: 'asset', fileName: 'sw.js',
        source: "const CACHE='zhaohua-v2';self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('zhaohua-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))})",
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), zhaohuaAssets()],
  base: '/chaomu/zhaohua/',
  build: {
    outDir: '../zhaohua',
    emptyOutDir: true,
  },
})
