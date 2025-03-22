import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import crypto from 'crypto'

function cryptPwd(s: string): string {
  const md5 = crypto.createHash('md5')
  return md5.update(s).digest('hex')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.slice(-2) === 'js') {
            if (['5'].includes(cryptPwd(id).at(-1) ?? '')) {
              return 'a'
            }
            if (['0', 'd', '2', '6', 'e'].includes(cryptPwd(id).at(-1) ?? '')) {
              return 'b'
            }
            return 'c'
          }
          return null
        }
      }
    }
  }
})

