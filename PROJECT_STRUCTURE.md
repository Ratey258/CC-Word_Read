# 项目结构说明 📁

## 📂 完整文件树

```
CC-Word_Read/
│
├── 📁 src/                          # 前端源代码
│   ├── index.html                   # 主HTML（已集成Tauri API）
│   └── 📁 assets/                   # 资源文件
│       └── 📁 icons/                # 图标资源
│
├── 📁 src-tauri/                    # Tauri后端（Rust）
│   ├── 📁 src/                      
│   │   ├── main.rs                  # Rust主程序入口
│   │   └── lib.rs                   # 库文件
│   ├── 📁 icons/                    # 应用图标
│   │   ├── README.md                # 图标说明
│   │   └── (需要添加实际图标文件)
│   ├── 📁 capabilities/             # 权限配置
│   │   └── default.json             # 默认权限
│   ├── Cargo.toml                   # Rust依赖配置
│   ├── tauri.conf.json              # Tauri配置文件
│   └── build.rs                     # 构建脚本
│
├── 📁 .github/                      # GitHub配置
│   └── 📁 workflows/
│       └── static.yml               # GitHub Pages部署（已禁用）
│
├── 📄 package.json                  # Node.js项目配置
├── 📄 .gitignore                    # Git忽略文件
│
├── 📖 README.md                     # 主说明文档
├── 📖 README_TAURI.md               # Tauri快速开始
├── 📖 TAURI_SETUP.md                # Tauri完整搭建说明
├── 📖 PROJECT_STRUCTURE.md          # 本文件
├── 📖 开发文档.md                   # 完整开发文档
├── 📖 CHANGELOG.md                  # 更新日志
├── 📖 LICENSE                       # MIT许可证
│
├── 🔧 setup.ps1                     # PowerShell初始化脚本
│
├── 📄 index.html                    # 原网页版HTML（保留）
└── 📄 示例小说.txt                  # 测试用小说文件
```

## 🔑 关键文件说明

### 前端核心
| 文件 | 用途 | 状态 |
|------|------|------|
| `src/index.html` | 主界面HTML，已集成Tauri API | ✅ 完成 |
| `src/assets/` | 静态资源（图片、字体等） | ✅ 就绪 |

### 后端核心
| 文件 | 用途 | 状态 |
|------|------|------|
| `src-tauri/src/main.rs` | Rust主程序 | ✅ 完成 |
| `src-tauri/Cargo.toml` | Rust依赖管理 | ✅ 完成 |
| `src-tauri/tauri.conf.json` | Tauri配置 | ✅ 完成 |
| `src-tauri/capabilities/default.json` | 权限配置 | ✅ 完成 |

### 配置文件
| 文件 | 用途 | 状态 |
|------|------|------|
| `package.json` | Node.js依赖和脚本 | ✅ 完成 |
| `.gitignore` | Git忽略规则 | ✅ 完成 |

### 文档
| 文件 | 内容 | 适合人群 |
|------|------|---------|
| `README.md` | 项目总览 | 所有人 |
| `README_TAURI.md` | Tauri快速开始 | 新手 |
| `TAURI_SETUP.md` | 详细搭建说明 | 开发者 |
| `开发文档.md` | 完整技术文档 | 高级开发者 |
| `PROJECT_STRUCTURE.md` | 项目结构说明 | 维护者 |

## 📊 当前状态

### ✅ 已完成
- [x] 项目结构搭建
- [x] 前端代码迁移
- [x] Tauri配置完成
- [x] 自定义窗口控制
- [x] 权限配置
- [x] 文档完善
- [x] 初始化脚本

### ⚠️ 需要处理
- [ ] 添加实际应用图标（当前为占位）
- [ ] 运行 `npm install` 安装依赖
- [ ] 运行 `npm run dev` 测试开发环境
- [ ] （可选）优化CSP策略
- [ ] （可选）添加更多Tauri命令

### 🎯 下一步
1. **立即可做**: 运行 `.\setup.ps1` 初始化项目
2. **测试**: 运行 `npm run dev` 启动开发模式
3. **图标**: 添加自定义图标到 `src-tauri/icons/`
4. **构建**: 运行 `npm run build` 生成安装包

## 🔧 NPM脚本

| 命令 | 功能 | 用途 |
|------|------|------|
| `npm install` | 安装依赖 | 初始化项目 |
| `npm run dev` | 开发模式 | 日常开发 |
| `npm run build` | 构建发布版 | 生成安装包 |
| `npm run build:debug` | 构建调试版 | 调试问题 |

## 📦 依赖说明

### Node.js依赖
```json
{
  "@tauri-apps/api": "^2.0.2",           // Tauri前端API
  "@tauri-apps/plugin-dialog": "^2.0.1", // 对话框插件
  "@tauri-apps/plugin-fs": "^2.0.1",     // 文件系统插件
  "@tauri-apps/cli": "^2.0.4"            // Tauri CLI工具
}
```

### Rust依赖
```toml
tauri = "2.0"                    # Tauri核心
tauri-plugin-dialog = "2.0"      # 对话框
tauri-plugin-fs = "2.0"          # 文件系统
serde = "1"                      # JSON序列化
serde_json = "1"                 # JSON处理
```

## 🎨 配置亮点

### Windows优化
- ✅ 无边框窗口（decorations: false）
- ✅ 自定义标题栏拖动
- ✅ MSI + NSIS 双安装包
- ✅ 中文语言支持
- ✅ 发布体积优化（LTO + strip）

### 安全配置
- ✅ CSP内容安全策略
- ✅ 最小权限原则
- ✅ 文件访问限制

### 开发体验
- ✅ 热重载支持
- ✅ 增量编译
- ✅ DevTools集成

## 🚀 构建产物

运行 `npm run build` 后的输出：

```
src-tauri/target/release/
├── bundle/
│   ├── msi/
│   │   └── cc-word-read_2.0.0_x64_zh-CN.msi    # MSI安装包
│   └── nsis/
│       └── cc-word-read_2.0.0_x64-setup.exe     # NSIS安装包
└── cc-word-read.exe                              # 单文件可执行程序
```

**体积预估**:
- 单文件EXE: ~3-5 MB
- MSI安装包: ~4-6 MB
- NSIS安装包: ~4-6 MB

## 💡 开发提示

### 修改前端
1. 编辑 `src/index.html`
2. 保存文件
3. 应用自动刷新（热重载）

### 修改后端
1. 编辑 `src-tauri/src/main.rs`
2. 保存文件
3. Tauri自动重新编译（需要几秒钟）

### 修改配置
1. 编辑 `src-tauri/tauri.conf.json`
2. 重启 `npm run dev`

### 调试技巧
- **前端**: 使用浏览器DevTools（开发模式自动开启）
- **后端**: 查看终端Rust输出
- **性能**: 使用 `npm run build:debug` 构建调试版

## 📞 获取帮助

遇到问题？查看：
1. 📖 [README_TAURI.md](README_TAURI.md) - 快速开始
2. 📖 [TAURI_SETUP.md](TAURI_SETUP.md) - 详细说明
3. 🌐 [Tauri官方文档](https://tauri.app/v2/guides/)
4. 💬 GitHub Issues

---

**更新时间**: 2025-10-09  
**项目版本**: 2.0.0  
**Tauri版本**: 2.0.4

