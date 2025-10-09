import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  test: {
    // 使用 jsdom 环境模拟浏览器
    environment: 'jsdom',
    
    // 全局 API
    globals: true,
    
    // 测试覆盖率
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src-tauri/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/types/**'
      ]
    },
    
    // 设置文件
    setupFiles: ['./src/test/setup.ts']
  },
  
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
  }
})

