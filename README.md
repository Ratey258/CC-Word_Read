# CC-Word_Read

> 基于 Vue 3 + TypeScript + Tauri 的上班摸鱼小说阅读器

[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.8-FFC131.svg)](https://tauri.app/)

## ✨ 特性

- 🎭 **完美伪装**: 还原 Microsoft Word 2021 界面
- ⌨️ **智能输入**: 任意按键输出小说(文件)内容，支持中文输入法
- 📖 **多格式支持**: TXT / DOCX / Markdown
- 💾 **自动保存**: 智能保存阅读进度
- 📜 **历史记录**: 自动记录阅读历史，快速切换书籍
- 🔤 **字号调整**: 支持多种字号切换，舒适阅读体验
- 🔄 **自动更新**: 内置自动更新功能，始终保持最新版本

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

- 点击左上角"文件"菜单，选择"打开文件"
- 支持拖放文件到窗口

### 开始阅读

1. 导入小说文件
2. 在编辑区按任意键，小说内容会自动输出
3. 支持中文输入法
4. 按 `Backspace` 删除字符

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

- [更新日志](CHANGELOG.md)

## 📄 许可证

MIT License
