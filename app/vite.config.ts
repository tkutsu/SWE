import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed as a GitHub Pages project site, so assets are served from /swe/.
// Dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/swe/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    // One bundle on purpose. Splitting it halved the first load but cost a lazy
    // registry, two index files that could drift from their data, loading
    // states and a prefetcher. For an app you open repeatedly on the same
    // device the bundle is cached after the first visit, so that machinery was
    // buying very little. Raised rather than left to warn on every build.
    chunkSizeWarningLimit: 900,
  },
}))
