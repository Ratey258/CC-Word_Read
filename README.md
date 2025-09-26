# Word界面小说阅读器开发文档

## 项目概述

这是一个独特的小说阅读器应用，外观上完全仿造Microsoft Word界面，但实际功能是阅读小说。用户在文档中"打字"时，无论输入什么字符，显示的都是预设小说的内容，营造出"伪装写作"的有趣体验。

**开发日期**: 2025年9月26日  
**技术栈**: React 19 + Tauri + TypeScript  
**项目状态**: 基础环境配置完成，准备开始界面开发

## 项目特性

### 核心功能
- 🎭 **伪装性**: 1:1还原Microsoft Word界面，包括菜单栏、工具栏、状态栏等
- 📚 **阅读体验**: 无论用户输入什么，显示的都是小说内容
- ⚙️ **自定义**: 可配置每次按键显示的小说内容长度
- 🚀 **性能**: 基于Tauri的桌面应用，启动快速、占用内存少
- 📖 **管理**: 支持导入多部小说，切换阅读进度

### 技术亮点
- React 19最新特性支持
- TypeScript类型安全
- Tauri跨平台桌面应用
- 响应式UI设计
- 本地文件存储

## 技术架构

### 前端架构 (React 19 + TypeScript)

```
src/
├── components/           # UI组件
│   ├── WordInterface/   # Word界面相关组件
│   │   ├── MenuBar.tsx         # 菜单栏
│   │   ├── ToolBar.tsx         # 工具栏
│   │   ├── StatusBar.tsx       # 状态栏
│   │   ├── DocumentArea.tsx    # 文档编辑区
│   │   └── Ribbon.tsx          # 功能区
│   ├── NovelReader/     # 小说阅读器组件
│   │   ├── NovelEngine.tsx     # 阅读引擎
│   │   ├── NovelManager.tsx    # 小说管理
│   │   └── SettingsPanel.tsx   # 设置面板
│   └── Common/          # 通用组件
│       ├── Modal.tsx
│       └── FileUpload.tsx
├── hooks/               # 自定义Hook
│   ├── useNovelReader.ts       # 小说阅读逻辑
│   ├── useSettings.ts          # 设置管理
│   └── useKeyboardHandler.ts   # 键盘事件处理
├── types/               # TypeScript类型定义
│   ├── novel.ts
│   ├── settings.ts
│   └── word.ts
├── utils/               # 工具函数
│   ├── novelParser.ts          # 小说解析
│   ├── textProcessor.ts        # 文本处理
│   └── storage.ts              # 本地存储
├── styles/              # 样式文件
│   ├── word-theme.css          # Word主题
│   ├── components.css          # 组件样式
│   └── global.css              # 全局样式
└── App.tsx             # 主应用组件
```

### 后端架构 (Tauri)

```
src-tauri/
├── src/
│   ├── main.rs          # 主程序入口
│   ├── commands.rs      # Tauri命令
│   ├── file_handler.rs  # 文件处理
│   └── storage.rs       # 数据存储
├── tauri.conf.json      # Tauri配置
└── Cargo.toml           # Rust依赖
```

## 功能模块设计

### 1. Word界面模拟模块

#### 菜单栏 (MenuBar)
- **文件**: 新建、打开、保存、另存为、最近使用的文件
- **主页**: 字体、段落、样式
- **插入**: 表格、图片、链接
- **布局**: 页面设置、分栏
- **审阅**: 拼写检查、批注
- **视图**: 显示比例、窗格

#### 工具栏 (ToolBar)
- 快速访问工具栏
- 功能区切换
- 搜索框

#### 状态栏 (StatusBar)
- 页码信息
- 字数统计
- 语言设置
- 视图按钮

#### 文档区域 (DocumentArea)
- 仿真页面布局
- 光标显示
- 选中效果
- 滚动条

### 2. 小说阅读引擎模块

#### 核心逻辑
```typescript
interface NovelEngine {
  // 当前阅读位置
  currentPosition: number;
  
  // 小说内容
  content: string;
  
  // 每次输入显示的字符数
  charsPerInput: number;
  
  // 处理用户输入
  handleInput(input: string): string;
  
  // 获取下一段内容
  getNextContent(): string;
  
  // 跳转到指定位置
  jumpTo(position: number): void;
}
```

#### 输入处理逻辑
1. 监听所有键盘输入
2. 忽略实际输入内容
3. 根据设置返回对应长度的小说内容
4. 更新阅读位置
5. 模拟打字效果

### 3. 设置管理模块

#### 设置项
```typescript
interface Settings {
  // 每次输入显示字符数
  charsPerInput: number;
  
  // 当前阅读的小说
  currentNovelId: string;
  
  // 阅读进度
  readingProgress: number;
  
  // 主题设置
  theme: 'light' | 'dark';
  
  // 字体设置
  fontSize: number;
  fontFamily: string;
  
  // 是否显示真实输入（调试用）
  showActualInput: boolean;
}
```

## 项目进展记录

### 已完成工作 (2025年9月26日)

#### 🔧 开发环境配置
- ✅ **项目初始化**: 创建了基础的 Tauri + React + TypeScript 项目结构
- ✅ **依赖管理**: 更新所有依赖到最新稳定版本
  - React 升级到 19.1.1 (最新版本)
  - Tauri 升级到 2.8.0
  - TypeScript 升级到 5.9.2
  - Vite 升级到 6.3.6
- ✅ **代码规范**: 配置了完整的代码质量工具链
  - ESLint 9.x 扁平化配置
  - Prettier 代码格式化
  - TypeScript 严格模式检查
  - 预配置的路径映射 (@/ 别名)

#### 📁 项目结构
- ✅ **配置文件**: 完成所有核心配置文件
- ✅ **开发脚本**: 配置了完整的 npm scripts
- ✅ **类型安全**: TypeScript 严格模式和路径映射配置

#### 🧪 测试验证
- ✅ **构建测试**: 验证 TypeScript 编译正常
- ✅ **代码检查**: ESLint 配置测试通过
- ✅ **格式化**: Prettier 自动格式化正常工作

### 当前状态
- 📦 **基础环境**: 完全配置完成，可以开始开发
- 🎯 **下一步**: 开始创建 React 组件和 Word 界面还原

### 技术选型说明

#### 为什么选择这些版本？
1. **React 19**: 
   - 最新稳定版本，提供更好的性能和新特性
   - 改进的并发渲染和状态管理
   - 更好的 TypeScript 支持

2. **Tauri 2.x**:
   - 更小的包体积和更好的性能
   - 改进的安全性和权限管理
   - 更好的跨平台支持

3. **ESLint 9.x**:
   - 扁平化配置，更简洁的规则管理
   - 更好的 TypeScript 集成
   - 性能优化

## 开发计划

### 第一阶段：基础框架搭建 ✅
- [x] 项目文档编写
- [x] 创建Tauri + React项目
- [x] 配置TypeScript和开发环境
- [x] 配置ESLint和Prettier代码规范
- [x] 更新依赖到最新稳定版本
- [ ] 搭建基础组件结构

### 第二阶段：Word界面还原
- [ ] 实现菜单栏组件
- [ ] 实现工具栏组件
- [ ] 实现状态栏组件
- [ ] 实现文档编辑区域
- [ ] CSS样式完美还原Word外观

### 第三阶段：阅读引擎开发
- [ ] 开发小说解析器
- [ ] 实现输入拦截逻辑
- [ ] 开发阅读进度管理
- [ ] 实现设置系统

### 第四阶段：功能完善
- [ ] 小说文件导入功能
- [ ] 多小说管理
- [ ] 快捷键支持
- [ ] 搜索功能

### 第五阶段：优化和发布
- [ ] 性能优化
- [ ] 错误处理
- [ ] 用户体验优化
- [ ] 打包发布

## 安装和运行

### 环境要求
- Node.js 18+ (推荐 20+)
- Rust 1.70+ (推荐 1.75+)
- 支持的操作系统：Windows、macOS、Linux

### 依赖版本 (2025年9月26日更新)
**主要依赖:**
- React: 19.1.1
- React DOM: 19.1.1
- Tauri API: 2.8.0
- TypeScript: 5.9.2
- Vite: 6.3.6

**开发工具:**
- ESLint: 9.36.0
- Prettier: 3.6.2
- @typescript-eslint: 8.44.1

### 安装步骤
```bash
# 克隆项目
git clone <项目地址>
cd CC-Word_Read

# 安装前端依赖
npm install

# 安装Tauri CLI
npm install -g @tauri-apps/cli

# 开发模式运行
npm run tauri dev

# 构建应用
npm run tauri build
```

### 开发命令
```bash
# 启动开发服务器
npm run dev

# 启动Tauri开发环境
npm run tauri dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 运行测试
npm run test

# 构建生产版本
npm run build

# 构建Tauri应用
npm run tauri build
```

## 文件结构说明

### 配置文件
- `package.json`: 项目依赖和脚本配置
- `tsconfig.json`: TypeScript配置 (支持路径映射)
- `tsconfig.node.json`: Node.js环境的TypeScript配置
- `vite.config.ts`: Vite构建配置
- `eslint.config.js`: ESLint 9.x 扁平化配置
- `.prettierrc`: Prettier代码格式化配置
- `tauri.conf.json`: Tauri应用配置 (待创建)

### 关键文件
- `src/App.tsx`: 主应用入口
- `src/components/WordInterface/`: Word界面组件
- `src/hooks/useNovelReader.ts`: 核心阅读逻辑
- `src-tauri/src/main.rs`: Tauri后端入口

## 技术难点和解决方案

### 1. Word界面高度还原
**难点**: 复现Microsoft Word复杂的UI布局和交互
**解决方案**: 
- 使用CSS Grid和Flexbox精确布局
- 参考Word 2019界面设计规范
- 使用CSS变量管理主题色彩

### 2. 输入拦截和替换
**难点**: 拦截所有用户输入并替换为小说内容
**解决方案**:
- 使用contentEditable的input事件
- preventDefault阻止默认输入
- 手动控制光标位置和内容插入

### 3. 阅读体验优化
**难点**: 保持流畅的阅读体验和真实的打字感觉
**解决方案**:
- 实现打字动画效果
- 智能断句和分页
- 可配置的阅读速度

### 4. 性能优化
**难点**: 大文件处理和内存管理
**解决方案**:
- 虚拟滚动技术
- 内容分块加载
- 使用Tauri的Rust后端处理大文件

## 用户体验设计

### 隐蔽性设计
- 完全仿真的Word界面，从外观上无法区分
- 真实的菜单功能（部分可用）
- 状态栏显示合理的文档信息

### 阅读体验
- 平滑的文字显示动画
- 自然的阅读节奏控制
- 支持快进和回退

### 设置便利性
- 隐藏的设置入口（如特殊快捷键组合）
- 快速切换小说功能
- 阅读进度保存和恢复

## 扩展功能规划

### 近期扩展
- 支持epub、txt等格式
- 书签功能
- 夜间模式
- 字体设置

### 远期扩展
- 在线小说库
- 阅读统计
- 云同步功能
- 多语言支持

## 安全和隐私

### 数据存储
- 所有数据本地存储
- 不收集用户信息
- 可选的数据加密

### 文件安全
- 沙盒环境运行
- 文件访问权限控制
- 安全的文件导入机制

---

## 详细配置说明

### TypeScript 配置亮点

#### `tsconfig.json` 关键配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/styles/*": ["src/styles/*"]
    }
  }
}
```

**优势:**
- 🎯 路径映射简化导入语句
- 🔒 严格模式提供最强类型检查
- ⚡ Bundler 模式优化构建性能

### ESLint 9.x 扁平化配置

#### 配置特点
- 📝 使用新的扁平化配置格式
- 🔧 分别配置源码和配置文件的规则
- ⚡ 优化的解析性能
- 🎨 集成 React Hooks 和 TypeScript 规则

#### 核心规则
```javascript
rules: {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'warn',
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
}
```

### 开发工作流

#### 推荐的开发流程
1. **启动开发服务器**: `npm run dev`
2. **代码检查**: `npm run lint`
3. **格式化代码**: `npm run format`
4. **类型检查**: `npm run type-check`
5. **启动 Tauri**: `npm run tauri:dev`

#### Git 工作流建议
```bash
# 开发前
npm run lint && npm run type-check

# 提交前
npm run format
npm run lint:fix
```

### 性能优化配置

#### Vite 配置优化
- ⚡ React 插件支持 Fast Refresh
- 📦 优化的依赖预构建
- 🔄 支持热模块替换 (HMR)

#### TypeScript 编译优化
- 🚀 `isolatedModules` 启用并行编译
- 📊 `skipLibCheck` 跳过库文件检查
- 🎯 `noEmit` 仅做类型检查

---

**项目状态**: 基础配置完成，准备开始界面开发  
**最后更新**: 2025年9月26日  
**版本**: v1.0.0-dev  
**环境状态**: ✅ 所有开发工具配置完成并测试通过
