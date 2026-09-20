import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed as a GitHub Pages project site, so assets are served from /swe/.
// Dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/swe/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React barely changes between deploys, so keeping it separate means
          // a content change does not invalidate it in anyone's cache.
          react: ['react', 'react-dom', 'react-dom/client'],
        },
      },
    },
  },
}))
