import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression(),],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.slice(-2) === 'js') {
            if (id.includes('node_modules')) {
              if (id.includes('pnpm/antd@5.2')) {
                return 'a'
              } else if (id.includes('pnpm/react')) {
                return 'b'
              } else {
                return 'c'
              }
            }
          }
          return null
        }
      }
    }
  }
})

