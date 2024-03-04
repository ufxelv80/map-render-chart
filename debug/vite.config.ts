import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'url'
import viteCommonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    viteCommonjs()
  ],
  build: {
    sourcemap: true,
  }
})