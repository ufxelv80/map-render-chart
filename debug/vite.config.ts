import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'url'
import viteCommonjs from 'vite-plugin-commonjs'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    viteCommonjs()
  ],
  build: {
    sourcemap: true,
  }
})