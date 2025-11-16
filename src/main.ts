import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/index.css'

// 导入服务
import { initStorage } from './services/storage'
import { logger, LogLevel } from './services/logger'
import { errorHandler } from './services/errorHandler'

const appLogger = logger.createContextLogger('Main')

// 配置日志系统
logger.configure({
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  enableConsole: true,
  enableTimestamp: true,
  prefix: 'CC-Word'
})

// 配置错误处理
errorHandler.configure({
  enableNotification: true,
  enableLogging: true,
  enableReporting: false
})

// 加载 SVG 图标
async function loadSvgIcons() {
  try {
    const response = await window.fetch('/src/assets/icons/icons.svg')
    const svgText = await response.text()
    const div = document.createElement('div')
    div.innerHTML = svgText
    div.style.display = 'none'
    // 安全地插入到 body 的第一个位置
    if (document.body.firstChild) {
      document.body.insertBefore(div, document.body.firstChild)
    } else {
      document.body.appendChild(div)
    }
    appLogger.info('SVG 图标加载成功')
  } catch (error) {
    appLogger.error('SVG 图标加载失败', error)
  }
}

// 初始化应用
async function initApp() {
  try {
    // 创建 Vue 应用（先创建，避免白屏）
    const app = createApp(App)

    // 配置 Pinia
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    
    app.use(pinia)
    app.use(router)

    // 全局错误处理
    app.config.errorHandler = (err, _instance, info) => {
      appLogger.error('Vue 错误', err, { info })
      errorHandler.handle(err, 'Vue')
    }

    // 挂载应用（先挂载，避免白屏）
    app.mount('#app')
    appLogger.info('应用启动成功')

    // 后台初始化存储服务（不阻塞 UI）
    initStorage()
      .then(() => {
        appLogger.info('存储服务初始化成功')
      })
      .catch((error) => {
        appLogger.warn('存储服务初始化失败，将使用 localStorage 降级方案', error)
      })

    // 后台加载 SVG 图标（不阻塞 UI）
    loadSvgIcons()
  } catch (error) {
    appLogger.error('应用初始化失败', error)
    errorHandler.handle(error, 'AppInit')
    
    // 即使出错也尝试显示基本界面
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center;">
          <h1>应用启动失败</h1>
          <p>请刷新页面重试</p>
          <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px;">${error}</pre>
        </div>
      </div>
    `
  }
}

// 启动应用
initApp()
