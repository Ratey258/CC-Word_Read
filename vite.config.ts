import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import pkg from './package.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 定义全局常量
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  
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
    // 统一输出到 build 目录
    outDir: 'build/dist',
    // 清空输出目录
    emptyOutDir: true,
    // 资源文件输出目录
    assetsDir: 'assets',
    // 构建信息输出
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
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

