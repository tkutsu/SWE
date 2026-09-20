import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed as a GitHub Pages project site, so assets are served from /swe/.
// Dev stays at the root.
//
// Keyed on mode rather than command, because `vite preview` serves the build
// output but runs as `serve`: keying on command gave preview a base of '/'
// against a bundle that asks for '/swe/', so every asset 404'd and the page
// came up blank.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/swe/' : '/',
  plugins: [react(), tailwindcss()],
  // Split per page, via React.lazy in App.tsx. This was tried once and
  // reverted, because it cost a hand-maintained lazy registry and index files
  // that could drift from the data they mirrored. Both objections are now
  // answered: src/lib/labels.ts is generated rather than written, and smoke.ts
  // fails if any label disagrees with the item it names. The bundle had also
  // grown past 800 kB by then, which is a different trade from the 190 kB it
  // was when the split came out.
}))
