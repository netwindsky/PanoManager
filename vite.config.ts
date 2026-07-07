import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5003,
    proxy: {
      '/api': {
        target: 'http://localhost:15088',
        changeOrigin: true,
        timeout: 300000,
      },
      '/uploads': {
        target: 'http://localhost:15088',
        changeOrigin: true,
        timeout: 300000,
      },
    },
  },
})
