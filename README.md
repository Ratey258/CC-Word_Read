# CC-Word_Read

> 基于 Vue 3 + TypeScript + Tauri 的 Word 风格小说阅读工具

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.8-FFC131.svg)](https://tauri.app/)

## ✨ 特性

- 🎭 **完美伪装**: 还原 Microsoft Word 2022 界面
- ⌨️ **智能输入**: 任意按键输出小说内容，支持中文输入法
- 📖 **多格式支持**: TXT / DOCX / Markdown
- 💾 **自动保存**: 智能保存阅读进度
- 🔖 **书签管理**: 随时标记重要位置
- 🎨 **主题切换**: 亮色/暗色/自动模式

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0
- Rust >= 1.70（Tauri 构建）

### 安装与运行

```bash
# 安装依赖
npm install

# Web 开发模式
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev

# Tauri 桌面构建
npm run tauri:build
```

## 📖 使用指南

### 导入小说

- 点击"导入"按钮或使用 `Ctrl+O`
- 支持拖放文件到窗口

### 开始阅读

1. 导入小说后，点击"开始阅读"
2. 在编辑器中按任意键，小说内容会自动输出
3. 支持中文输入法
4. 按 `Backspace` 删除字符

### 常用快捷键

| 功能 | 快捷键 |
|------|--------|
| 导入文件 | `Ctrl+O` |
| 保存进度 | `Ctrl+S` |
| 暂停/继续 | `Ctrl+P` |
| 跳转 | `Ctrl+G` |
| 清空内容 | `Ctrl+L` |

## 📦 技术栈

- **Vue 3.5** + **TypeScript 5.9** + **Pinia 3.0**
- **Vite 7.1** + **Tauri 2.8**
- **Vitest** + **Playwright**

## 📁 项目结构

```
CC-Word_Read/
├── src/
│   ├── components/      # Vue 组件
│   ├── composables/     # 组合式函数
│   ├── stores/          # Pinia 状态管理
│   ├── types/           # TypeScript 类型
│   └── utils/           # 工具函数
├── src-tauri/           # Tauri 后端（Rust）
└── tests/               # 测试文件
```

## 🔧 开发命令

```bash
npm run dev              # Web 开发服务器
npm run tauri:dev        # Tauri 开发模式
npm run build            # 构建生产版本
npm run tauri:build      # Tauri 生产构建
npm run test:unit        # 单元测试
npm run lint             # ESLint 检查
npm run format           # 代码格式化
```

## 📚 文档

- [开发进度](DEVELOPMENT_PROGRESS.md)
- [升级计划](UPGRADE_PLAN.md)
- [文档索引](DOCS_INDEX.md)

## 📄 许可证

MIT License

---

**当前版本**: v0.3.0-alpha  
**最后更新**: 2025-10-09
