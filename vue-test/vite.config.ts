import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from "vite-plugin-compression";
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression(),
    ElementPlus({}),
  ],
})
