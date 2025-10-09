import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/index.css'

// 加载 SVG 图标
async function loadSvgIcons() {
  const response = await fetch('/src/assets/icons/icons.svg')
  const svgText = await response.text()
  const div = document.createElement('div')
  div.innerHTML = svgText
  div.style.display = 'none'
  document.body.insertBefore(div, document.body.firstChild)
}

loadSvgIcons()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
