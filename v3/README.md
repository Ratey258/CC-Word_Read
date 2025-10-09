# CC-Word_Read v3.0

> 基于 Vue 3 + TypeScript + Tauri 的现代化 Word 风格小说阅读伪装工具

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)
[![Tauri](https://img.shields.io/badge/Tauri-2.8-FFC131.svg)](https://tauri.app/)

---

## ✨ 特性

### 核心功能
- 🎭 **完美伪装**: 1:1 还原 Microsoft Word 2022 界面
- ⌨️ **智能输入**: 任意按键输出小说内容，支持中文输入法
- 📖 **多格式支持**: TXT / DOCX / Markdown
- 💾 **自动保存**: 智能保存阅读进度
- 🔖 **书签管理**: 随时标记重要位置
- 📊 **阅读统计**: 实时字数、进度、速度统计
- 🎨 **主题切换**: 亮色/暗色/自动模式

### 技术特性
- ⚡️ **极速启动**: Vite 7.1 + Vue 3.5 性能优化
- 🔐 **类型安全**: 100% TypeScript 覆盖
- 🧪 **测试完备**: Vitest + Playwright 双重保障
- 🎯 **响应式设计**: Pinia 状态管理
- 🛠️ **开发体验**: ESLint + Prettier + HMR

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0
- npm >= 9.0
- Rust >= 1.70（Tauri 构建）

### 安装依赖

```bash
cd v3
npm install
```

### 开发模式

```bash
# Web 开发模式
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev
```

### 构建生产版本

```bash
# Web 构建
npm run build

# Tauri 桌面构建
npm run tauri:build
```

---

## 📦 技术栈

### 前端框架
- **Vue 3.5**: Composition API + `<script setup>`
- **Pinia 3.0**: 状态管理
- **Vue Router 4.5**: 路由管理
- **TypeScript 5.9**: 类型系统

### 构建工具
- **Vite 7.1**: 极速构建工具
- **Tauri 2.8**: 桌面应用框架

### 测试框架
- **Vitest 3.2**: 单元测试
- **Playwright 1.56**: E2E 测试
- **@vue/test-utils**: Vue 组件测试

### 代码质量
- **ESLint 9.37**: 代码检查
- **Prettier 3.6**: 代码格式化
- **TypeScript**: 类型检查

---

## 📁 项目结构

```
v3/
├── src/
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── stores/          # Pinia 状态管理
│   ├── composables/     # 组合式函数
│   ├── components/      # Vue 组件
│   ├── views/           # 页面视图
│   ├── assets/          # 静态资源
│   ├── router/          # 路由配置
│   └── main.ts          # 入口文件
│
├── tests/               # 测试文件
│   ├── unit/            # 单元测试
│   └── e2e/             # E2E 测试
│
├── public/              # 公共资源
└── src-tauri/           # Tauri 后端（Rust）
```

---

## 🧪 测试

### 单元测试

```bash
# 运行测试
npm run test:unit

# 测试覆盖率
npm run test:unit -- --coverage

# 测试 UI
npm run test:unit -- --ui
```

### E2E 测试

```bash
# 运行 E2E 测试
npm run test:e2e

# 指定浏览器
npm run test:e2e -- --project=chromium
```

---

## 🔧 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run tauri:dev        # Tauri 开发模式

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览生产构建
npm run tauri:build      # Tauri 生产构建

# 测试
npm run test:unit        # 单元测试
npm run test:e2e         # E2E 测试

# 代码质量
npm run lint             # ESLint 检查
npm run lint:fix         # ESLint 自动修复
npm run format           # Prettier 格式化
npm run type-check       # TypeScript 类型检查
```

---

## 📖 使用指南

### 1. 导入小说

- **方式一**: 点击 Ribbon 上的"导入"按钮
- **方式二**: 使用快捷键 `Ctrl+O`
- **方式三**: 拖放文件到窗口

### 2. 开始阅读

1. 导入小说后，点击"开始阅读"
2. 在编辑器中按任意键，小说内容会自动输出
3. 支持中文输入法，输入法文本会被替换为小说内容
4. 按 `Backspace` 删除字符

### 3. 进度管理

- **自动保存**: 默认每 5 秒自动保存进度
- **手动保存**: `Ctrl+S` 保存当前进度
- **跳转**: `Ctrl+G` 跳转到指定位置
- **书签**: 点击工具栏添加书签

### 4. 快捷键

| 功能 | 快捷键 |
|------|--------|
| 导入文件 | `Ctrl+O` |
| 保存进度 | `Ctrl+S` |
| 暂停/继续 | `Ctrl+P` |
| 跳转 | `Ctrl+G` |
| 清空内容 | `Ctrl+L` |

---

## 🏗️ 架构设计

### 状态管理（Pinia Stores）

- **novel.ts**: 小说内容、进度、书签
- **reader.ts**: 阅读器配置、统计
- **settings.ts**: 用户设置、主题
- **ui.ts**: UI 状态、对话框、通知

### 业务逻辑（Composables）

- **useNovelReader**: 阅读核心逻辑
- **useFileImporter**: 文件导入
- **useProgress**: 进度管理

### 工具函数（Utils）

- **constants**: 常量定义
- **dom**: DOM 操作
- **cursor**: 光标控制
- **formatter**: 格式化工具
- **validator**: 验证器

---

## 🎨 样式系统

- CSS Variables 主题变量
- CSS Modules 样式隔离
- Word 2022 样式还原
- 响应式布局

---

## 🔐 类型安全

项目使用 TypeScript 实现 100% 类型覆盖：

- `types/novel.d.ts`: 小说相关类型
- `types/reader.d.ts`: 阅读器相关类型
- `types/settings.d.ts`: 设置相关类型
- `types/global.d.ts`: 全局类型定义

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

### 代码规范

- 遵循 ESLint 配置
- 使用 Allman 大括号风格
- 编写有意义的提交信息
- 添加必要的注释

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Tauri](https://tauri.app/) - 构建桌面应用
- [Vite](https://vitejs.dev/) - 下一代前端工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理

---

## 📞 联系方式

- 项目主页: [CC-Word_Read](https://github.com/yourusername/CC-Word_Read)
- 问题反馈: [Issues](https://github.com/yourusername/CC-Word_Read/issues)

---

**开发中... 🚧**

当前版本: v3.0.0-alpha  
最后更新: 2025-10-09

---

## 📚 相关文档

- 📊 **[项目状态](./PROJECT_STATUS.md)** - 实时开发进度、技术栈、构建信息
- 📈 **[开发进度](../DEVELOPMENT_PROGRESS.md)** - 整体项目进度追踪  
- 🔄 **[升级计划](../UPGRADE_PLAN.md)** - 技术栈升级详解
- 📑 **[文档索引](../DOCS_INDEX.md)** - 所有文档统一入口

## 开发进度

- [x] Phase 1: 基础设施搭建 ✅ (100%)
- [x] Phase 2: 样式迁移 ✅ (100%)
- [x] Phase 3: 组件化重构 🚧 (80%)
- [ ] Phase 4: 功能集成 (20%)
- [ ] Phase 5: 测试与优化 (0%)
- [ ] Phase 6: 收尾与发布 (0%)

> 💡 查看详细状态和下一步计划: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
