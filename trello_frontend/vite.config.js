import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const frontendReactPath = fileURLToPath(new URL('./node_modules/react', import.meta.url))
const frontendReactDomPath = fileURLToPath(new URL('./node_modules/react-dom', import.meta.url))

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  resolve: {
    alias: {
      react: frontendReactPath,
      'react-dom': frontendReactDomPath,
    },
    dedupe: ['react', 'react-dom'],
  },
})