import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import crypto from 'crypto'
import viteCompression from "vite-plugin-compression";

function cryptPwd(s: string): string {
  const md5 = crypto.createHash('md5')
  return md5.update(s).digest('hex')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression(),],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.slice(-2) === 'js') {
            const hash = cryptPwd(id).at(-1) ?? ''
            if (['c'].includes(hash)) {
              return 'a'
            }
            if (['d', '4', '0'].includes(hash)) {
              return 'b'
            }
            if (['2', 'e', '8', 'b'].includes(hash)) {
              return 'c'
            }
            if (['f', '9', '7', 'a'].includes(hash)) {
              return 'd'
            }
            return 'e'
          }
          return null
        }
      }
    }
  }
})

