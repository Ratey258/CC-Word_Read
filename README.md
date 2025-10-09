# Word小说阅读器 📖

> 像素级还原Microsoft Word界面的隐蔽式小说阅读器

[![GitHub Pages](https://img.shields.io/badge/demo-online-brightgreen)](https://your-username.github.io/CC-Word_Read/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0-orange.svg)](CHANGELOG.md)

## 🌟 项目特色

### 完美伪装
- ✨ **1:1还原Word 2022界面** - Ribbon功能区、标题栏、状态栏完全复刻
- 🎭 **按键伪装技术** - 任意按键输出小说内容（而非真实字符）
- 🖱️ **真实编辑体验** - 保留光标、选择、滚动等所有交互

### 强大功能
- 📚 支持TXT/DOCX/MD格式小说导入
- 💾 自动保存阅读进度
- ⌨️ 中文输入法完美兼容
- 🎛️ 可调节输出速度（模拟真实打字速度）
- 🔄 一键重置进度

### 技术栈
- 🌐 **前端**: HTML5 + CSS3 + JavaScript (ES2024+)
- 🖼️ **UI框架**: Bootstrap 5.3 + Font Awesome 6.5
- 📄 **文档解析**: Mammoth.js (DOCX支持)
- 🚀 **桌面框架**: Tauri 2.0 (Rust + WebView2)
- 💾 **存储方案**: LocalStorage + IndexedDB

## 🚀 快速开始

### 在线体验
访问GitHub Pages演示站：[立即体验](https://your-username.github.io/CC-Word_Read/)

### 本地运行

#### 方法1：直接打开HTML
```bash
# 克隆仓库
git clone https://github.com/your-username/CC-Word_Read.git
cd CC-Word_Read

# 用浏览器打开 index.html
start index.html
```

#### 方法2：本地服务器
```bash
# 使用Python
python -m http.server 8080

# 或使用Node.js
npx http-server -p 8080

# 访问 http://localhost:8080
```

## 📖 使用指南

### 第一步：导入小说
1. 点击界面顶部"文件" → "打开"
2. 选择你的小说文件（TXT/DOCX/MD）
3. 等待加载完成

### 第二步：开始"工作"
1. 点击编辑区聚焦光标
2. 按任意键盘按键
3. 小说内容自动输出（看起来像在打字）

### 快捷键
| 功能 | 快捷键 |
|------|--------|
| 导入小说 | `Ctrl+O` |
| 保存进度 | `Ctrl+S` |
| 新建文档 | `Ctrl+N` |
| 增加速度 | `Ctrl++` |
| 减少速度 | `Ctrl+-` |

## 🎨 界面预览

### Word 2022风格
- **标题栏**: 蓝色背景 + Word图标 + 窗口控制按钮
- **Ribbon区**: 文件、开始、插入、设计等标签页
- **编辑区**: A4纸张样式 + 真实阴影效果
- **状态栏**: 页码、字数统计、缩放比例

## 🔧 高级功能

### 自定义配置
```javascript
// 调整输出速度（字符/按键）
设置 → 输出速度: 1-10

// 自动保存间隔
设置 → 自动保存: 5秒

// 主题选择
设置 → 主题: 经典白色 / 深色模式
```

### 中文输入法支持
- 完美支持拼音/五笔等输入法
- 输入拼音时会输出对应字符数的小说内容
- 无需切换即可自然使用

## 🚀 Tauri桌面版（v2.0 已搭建完成！）

### ✨ Windows专用桌面版
- ✅ 真正的Windows桌面应用
- ✅ 体积仅3-5MB
- ✅ 更好的性能和安全性
- ✅ 完美集成Windows 10/11
- ✅ 使用原生WebView2引擎

### 📦 系统要求
- Windows 10 (1809+) 或 Windows 11
- Node.js 18+
- Rust 1.75+
- Visual Studio Build Tools
- WebView2运行时（系统自带）

### 🚀 快速开始

#### 方法1：一键初始化（推荐）
```powershell
# 克隆项目
git clone https://github.com/your-username/CC-Word_Read.git
cd CC-Word_Read

# 运行初始化脚本
.\setup.ps1

# 启动开发模式
npm run dev
```

#### 方法2：手动安装
```powershell
# 安装依赖
npm install

# 开发模式（首次运行需5-10分钟编译）
npm run dev

# 构建Windows安装包
npm run build
```

### 📖 详细文档
- 🚀 **快速开始**: [README_TAURI.md](README_TAURI.md)
- 📚 **完整搭建说明**: [TAURI_SETUP.md](TAURI_SETUP.md)
- 🔧 **开发文档**: [开发文档.md](开发文档.md)

## 📚 完整文档

查看 [开发文档.md](开发文档.md) 获取：
- 📐 Word 2022 UI设计规范
- ⚙️ 核心功能实现详解
- 🚀 Tauri迁移完整指南
- 📦 部署与发布流程
- 🎯 开发路线图

## 🤝 贡献

欢迎贡献代码和提出建议！

### 如何贡献
1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 问题反馈
- [提交Issue](https://github.com/your-username/CC-Word_Read/issues)
- [讨论区](https://github.com/your-username/CC-Word_Read/discussions)

## 📋 待办事项

### v1.x (网页版)
- [x] Word界面还原
- [x] 按键伪装功能
- [x] 多格式文件支持
- [x] 进度保存
- [ ] 更多主题选择
- [ ] 书签功能

### v2.x (Tauri Windows桌面版)
- [ ] Tauri框架集成
- [ ] 自定义窗口控制
- [ ] Windows安装包（MSI/NSIS）
- [ ] 代码签名
- [ ] 自动更新功能
- [ ] 云端进度同步

## ⚠️ 免责声明

本项目仅供学习交流使用，请在工作时间合理安排，避免影响工作效率。使用本软件产生的任何后果由使用者自行承担。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🌟 致谢

- Microsoft Office UI设计团队
- [Tauri](https://tauri.app/) - 优秀的桌面框架
- [Bootstrap](https://getbootstrap.com/) - UI框架
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - DOCX解析库

---

**如果觉得有用，请给个⭐Star支持一下！**

[![Star History](https://img.shields.io/github/stars/your-username/CC-Word_Read?style=social)](https://github.com/your-username/CC-Word_Read)

