# Tauri 桌面版快速开始 🚀

## 📦 一键初始化

```powershell
# 运行初始化脚本
.\setup.ps1
```

这个脚本会：
1. ✅ 检查必需的环境（Node.js + Rust）
2. ✅ 安装所有依赖
3. ✅ 显示下一步操作提示

## 🎯 立即开始

### 开发模式（推荐先运行）
```powershell
npm run dev
```

**首次运行说明：**
- ⏱️ 首次编译需要 5-10 分钟（下载Rust依赖）
- 🔄 后续启动只需 10-30 秒（增量编译）
- 🌐 会打开一个类似Word的窗口
- 🔧 支持热重载（修改HTML自动刷新）

### 构建安装包
```powershell
npm run build
```

**输出位置：**
- 📦 MSI安装包：`src-tauri\target\release\bundle\msi\`
- 📦 NSIS安装包：`src-tauri\target\release\bundle\nsis\`
- 💻 单文件EXE：`src-tauri\target\release\cc-word-read.exe`

## ⚠️ 重要提示

### 图标问题
当前使用占位图标。要使用自定义图标：

```powershell
# 方法1：使用Tauri CLI生成
npm install -g @tauri-apps/cli
tauri icon your-icon.png

# 方法2：手动放置
# 将以下文件放入 src-tauri\icons\：
# - 32x32.png
# - 128x128.png  
# - 128x128@2x.png
# - icon.ico
```

### 首次运行慢？
**正常现象！** Tauri首次编译需要：
1. 下载 ~200MB Rust依赖包
2. 编译 Tauri核心库
3. 编译应用程序

**后续运行会快很多（<1分钟）**

## 🔧 环境检查

确保已安装：
- ✅ Node.js 18+ （`node --version`）
- ✅ Rust 1.75+ （`rustc --version`）
- ✅ Visual Studio Build Tools 2022
- ✅ WebView2 Runtime（Win10/11自带）

### 如果缺少Rust
```powershell
# 安装Rust
winget install Rustlang.Rustup

# 或访问：https://rustup.rs/
```

### 如果缺少VS Build Tools
```powershell
# 安装Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# 需要选择"使用C++的桌面开发"工作负载
```

## 📖 项目结构

```
CC-Word_Read/
├── src/                 ← 前端代码（HTML/CSS/JS）
│   └── index.html      ← 主界面（已集成Tauri）
├── src-tauri/          ← 后端代码（Rust）
│   ├── src/main.rs     ← Rust入口
│   ├── Cargo.toml      ← Rust依赖
│   └── tauri.conf.json ← Tauri配置
└── package.json        ← Node.js配置
```

## 🐛 常见问题

### Q: 编译错误 "linker not found"
A: 安装 Visual Studio Build Tools

### Q: 窗口控制按钮不工作
A: 在浏览器打开HTML不会工作，必须用 `npm run dev` 运行Tauri应用

### Q: WebView2错误
A: Windows 10/11自带，如缺失从微软官网下载

### Q: 想要更小的体积
A: Release构建已优化，最终约3-5MB

## 📚 更多资源

- 📖 **完整开发文档**: `开发文档.md`
- 🚀 **Tauri搭建说明**: `TAURI_SETUP.md`
- 🌐 **Tauri官方文档**: https://tauri.app/v2/guides/

## 🎉 成功标志

运行 `npm run dev` 后，你应该看到：
1. ✅ 终端显示 "Compiling..."
2. ✅ 编译进度条
3. ✅ 弹出一个Word风格的窗口
4. ✅ 可以导入小说并阅读

**恭喜！你已成功运行Tauri桌面应用！** 🎊

---

**遇到问题？** 查看 `TAURI_SETUP.md` 或提交 Issue

