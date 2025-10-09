import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 开发服务器配置
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 避免监视 rust 编译输出
      ignored: ['**/src-tauri/**']
    }
  },

  // 生产构建配置
  build: {
    // Tauri 使用 Chromium，支持现代 ES 特性
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    // 输出到 dist 目录
    outDir: 'dist',
    // 清空输出目录
    emptyOutDir: true
  },

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // 环境变量前缀
  envPrefix: ['VITE_', 'TAURI_'],

  // 清除控制台
  clearScreen: false
})

