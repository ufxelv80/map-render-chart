import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'url'
import viteCommonjs from 'vite-plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'node:fs'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    viteCommonjs(),
    vueJsx(),
    {
      name: 'pbf',
      transform: (code, id) =>{
        if (id.endsWith('.pbf')) {
          return `export default ${JSON.stringify(fs.readFileSync(id))}`;
        }
      }
    }
  ],
  build: {
    sourcemap: true,
  }
})
