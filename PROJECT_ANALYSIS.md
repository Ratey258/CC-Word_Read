# CC-Word_Read 项目分析报告

## 1. 项目概览
- 项目定位为“基于 Vue 3、TypeScript 与 Tauri 的 Word 风格小说阅读伪装工具”，具备多格式导入、智能按键输出、历史记录、字号调整与自动更新等功能，核心目标是在办公场景下伪装成 Word 文档以隐秘阅读小说。@README.md#1-87
- 技术栈覆盖 Web 与桌面端：前端使用 Vue 3 + Pinia + Vite，桌面端通过 Tauri 2.x 封装，并配套 Vitest/Playwright 测试、ESLint/Prettier 规范和版本同步脚本。@README.md#56-90 @package.json#1-63
- 项目结构分为 `src`（前端）、`src-tauri`（Rust 后端）、`tests` 等目录，职责划分清晰，利于并行开发。@README.md#63-75

## 2. 当前架构与模块
- 前端启动流：`src/main.ts` 中创建 Vue 应用、注册 Pinia/Router，并在挂载前通过 `fetch('/src/assets/icons/icons.svg')` 方式动态注入 SVG 图标。@src/main.ts#1-31
- 核心页面由 `App.vue` 组合 TitleBar、Ribbon、Editor、StatusBar 等模块，并在根组件级别监听书签、关于、更新等自定义事件，负责顶层 UI 流程。@src/App.vue#1-158
- 阅读体验依赖多个 Pinia store：`useNovelStore` 负责小说内容、章节与本地持久化，`useReaderStore` 管理阅读状态与自动保存定时器，`useHistoryStore` 追踪阅读历史并在浏览器环境缓存正文，`useSettingsStore`/`useUIStore` 则提供界面与偏好控制。@src/stores/novel.ts#13-508 @src/stores/reader.ts#10-310 @src/stores/history.ts#1-400 @src/stores/settings.ts#10-285 @src/stores/ui.ts#5-350
- 桌面端由 `src-tauri/src/main.rs` 负责初始化窗口、注册对话框/文件/终端/更新插件，并暴露 `check_for_updates`、`download_and_install_update` 等命令供前端调用。@src-tauri/src/main.rs#1-227

## 3. 主要问题与风险
### 3.1 资源路径硬编码导致构建环境不兼容
- `loadSvgIcons()` 在运行时通过 `window.fetch('/src/assets/icons/icons.svg')` 直接读取源码目录。构建后静态资源会被 Vite/rollup 哈希并放入 `dist/assets`，Tauri 生产包也无法访问 `/src` 路径，导致图标注入在生产环境失效。@src/main.ts#9-24

### 3.2 编辑器按键监听存在内存泄漏与不可预测行为
- `Editor.vue` 顶部定义了一个 `handleAutoStart` 函数（用于首次按键即开始阅读），同时在 `onMounted` 内部又声明了同名常量并注册 `document.addEventListener('keydown', handleAutoStart)`。卸载时调用的 `document.removeEventListener('keydown', handleAutoStart)` 指向外部函数，与实际注册的内部函数并非同一引用，导致监听器无法移除并重复触发。@src/components/Editor.vue#265-333

### 3.3 自动保存定时器未真正触发保存逻辑
- `useReaderStore` 在 `startAutoSave()` 中启动 `setInterval`，但回调内仅保留注释“触发保存事件”，未调用 `novelStore.saveProgress()` 或分发任何事件；因此无论自动保存开关如何，阅读进度都不会被周期性持久化。@src/stores/reader.ts#202-211

### 3.4 本地存储过度依赖且缺乏容量控制
- 小说全文、章节、历史记录乃至正文缓存均直接存入 `localStorage`，如 `useNovelStore.saveToStorage()` 与 `useHistoryStore.saveToStorage()`。在浏览器环境下多本小说会迅速达到 `localStorage` 5-10MB 限制，造成写入失败或数据被覆盖；同时缺乏淘汰策略与异常处理。@src/stores/novel.ts#297-351 @src/stores/history.ts#342-357

### 3.5 Store 初始化阶段依赖浏览器全局对象，影响 SSR/测试与可移植性
- `useHistoryStore` 的 `DEFAULT_CONFIG` 在模块加载时直接访问 `window.__TAURI__` 判断环境；`useSettingsStore` 也在定义时调用 `document.documentElement.setAttribute`、`window.matchMedia` 等 API。若未来需要在 SSR、Vitest 单元测试或命令行脚本环境运行，这些未做存在性检查的引用会导致初始化报错。@src/stores/history.ts#14-25 @src/stores/settings.ts#55-70 @src/stores/settings.ts#250-261

## 4. 改进建议
1. **改造静态资源注入机制**：使用 Vite 的 `import icons from '@/assets/icons/icons.svg?raw'` 或在构建时将 SVG sprite 打包到 `public/`，避免运行时 fetch 源码路径；在 Tauri 中可改为 `new URL('../assets/icons/icons.svg', import.meta.url)` 以兼容 file:// 协议。@src/main.ts#9-24
2. **修复编辑器事件监听**：统一 `handleAutoStart` 的定义与注册，或使用 `useEventListener` 工具在组件卸载时自动清理，防止内容泄漏及重复触发。@src/components/Editor.vue#265-333
3. **实现自动保存回调**：在 `startAutoSave()` 的定时器中调用 `novelStore.saveProgress()`，或通过 `window.dispatchEvent(new CustomEvent('autosave'))` 与小说 store 解耦，确保配置项生效并在暂停/停止时清理定时器。@src/stores/reader.ts#202-257
4. **优化本地存储策略**：
   - 使用 IndexedDB（如 `idb-keyval`）存储大文本，或仅缓存最近阅读片段，`localStorage` 只保存 metadata 与指针。
   - 为 `saveToStorage()`/`saveHistory()` 增加 try-catch 与容量检测，失败时给出 UI 提示，避免静默丢失。@src/stores/novel.ts#297-351 @src/stores/history.ts#342-357
5. **隔离浏览器 API 访问**：将 `window`/`document` 调用延迟到 `onMounted` 或通过 `typeof window !== 'undefined'` 守卫；对 `DEFAULT_CONFIG` 使用工厂函数在运行时注入环境信息，这样测试/SSR 可通过 mock 提供依赖。@src/stores/history.ts#14-25 @src/stores/settings.ts#55-70
6. **补充持久化与自动化测试**：编写针对 store 的单元测试（Vitest）验证自动保存、历史记录去重与章节跳转逻辑，结合 Playwright 回归“显示全部内容”等高风险功能，确保后续重构安全。@package.json#8-26

## 5. 后续工作建议（按优先级）
1. **P0：线上功能保障** — 尽快修复 SVG 资源加载与自动保存逻辑，避免生产包异常或用户进度丢失。
2. **P1：体验与稳定性** — 调整编辑器监听、健全本地存储策略，并在 UI 中暴露存储异常提示。
3. **P2：工程可维护性** — 引入环境守卫、拆分 store 初始化逻辑、补充单元/端到端测试，为后续功能迭代（如更多伪装模板）打下基础。
