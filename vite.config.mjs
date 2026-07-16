// DELETE THIS FILE.
//
// It was an attempt to work around the antivirus lock on node_modules/.vite-temp that
// stops `npm run dev` from starting. It does NOT work: Vite bundles its config through
// that temp directory whatever the extension, so .mjs fails exactly like .ts did.
//
// It's kept here only because file deletion is blocked on this machine. It is identical
// to vite.config.ts and takes precedence over it, so it's harmless — but it's redundant
// and confusing. Delete it and keep vite.config.ts.
//
// The real fix for the dev server is an antivirus exclusion for this repo's
// node_modules directory (or moving the repo outside the scanned path).
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
