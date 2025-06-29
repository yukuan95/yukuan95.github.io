import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  base: 'https://bucket-20250629.oss-cn-shanghai.aliyuncs.com',
  plugins: [react(), viteCompression(),],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.slice(-2) === 'js') {
            if (id.includes('node_modules')) {
              if (id.includes('pnpm/antd')) {
                return 'a'
              } else if (id.includes('pnpm/react')) {
                return 'b'
              }
            }
          }
          return null
        }
      }
    }
  }
})

