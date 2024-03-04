import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'url'
import viteCommonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    viteCommonjs(),
    vueJsx()
  ],
  build: {
    sourcemap: true,
  }
})