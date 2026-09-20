import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed as a GitHub Pages project site, so assets are served from /swe/.
// Dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/swe/' : '/',
  plugins: [react(), tailwindcss()],
  // Split per page, via React.lazy in App.tsx. This was tried once and
  // reverted, because it cost a hand-maintained lazy registry and index files
  // that could drift from the data they mirrored. Both objections are now
  // answered: src/lib/labels.ts is generated rather than written, and smoke.ts
  // fails if any label disagrees with the item it names. The bundle had also
  // grown past 800 kB by then, which is a different trade from the 190 kB it
  // was when the split came out.
}))
