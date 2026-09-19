import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed as a GitHub Pages project site, so assets are served from /algos_structs/.
// Dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/algos_structs/' : '/',
  plugins: [react(), tailwindcss()],
}))
