import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Where the assets are served from, which depends on how Pages is reached.
//
// A project site lives under https://tkutsu.github.io/swe/. A custom domain
// serves the same content from the root of that domain instead, so a base of
// '/swe/' would 404 every asset on it. public/CNAME is what switches Pages to
// the custom domain, so its presence is what switches the base here too: one
// file decides both, and they cannot disagree.
//
// Keyed on mode rather than command, because `vite preview` serves the build
// output but runs as `serve`: keying on command gave preview a base of '/'
// against a bundle that asks for '/swe/', so every asset 404'd and the page
// came up blank.
const customDomain = existsSync(fileURLToPath(new URL('./public/CNAME', import.meta.url)))

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? (customDomain ? '/' : '/swe/') : '/',
  plugins: [react(), tailwindcss()],
  // Split per page, via React.lazy in App.tsx. This was tried once and
  // reverted, because it cost a hand-maintained lazy registry and index files
  // that could drift from the data they mirrored. Both objections are now
  // answered: src/lib/labels.ts is generated rather than written, and smoke.ts
  // fails if any label disagrees with the item it names. The bundle had also
  // grown past 800 kB by then, which is a different trade from the 190 kB it
  // was when the split came out.
}))
