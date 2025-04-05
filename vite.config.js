import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 若有需要可自行指定 port 或 proxy
    // port: 3000,
    // proxy: {
    //   '/api': {
    //     target: 'http://140.112.27.83:11434',
    //     changeOrigin: true
    //   }
    // }
  }
})
