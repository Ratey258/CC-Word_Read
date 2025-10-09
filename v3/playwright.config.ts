import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',
  
  // 测试文件匹配模式
  testMatch: '**/*.spec.ts',
  
  // 完全并行运行测试
  fullyParallel: true,
  
  // CI 环境下禁止使用 test.only
  forbidOnly: !!process.env.CI,
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 并发工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // 测试报告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  // 共享设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:1420',
    
    // 失败时记录追踪
    trace: 'on-first-retry',
    
    // 截图设置
    screenshot: 'only-on-failure',
    
    // 视频录制
    video: 'retain-on-failure',
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // 可选：其他浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分钟超时
  },
})

