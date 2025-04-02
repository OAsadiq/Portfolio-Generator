import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['5173-oasadiq-portfoliogenera-7zyfem6vogh.ws-eu118.gitpod.io'],
  },
})