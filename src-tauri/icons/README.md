# 应用图标

## 需要的图标文件

为了构建Windows应用，需要以下图标文件：

- `32x32.png` - 32x32像素的PNG图标
- `128x128.png` - 128x128像素的PNG图标
- `128x128@2x.png` - 256x256像素的PNG图标（高DPI）
- `icon.ico` - Windows ICO格式图标（包含多个尺寸）

## 生成图标的方法

### 方法1：使用Tauri CLI自动生成
```bash
npm install -g @tauri-apps/cli
tauri icon path/to/your/icon.png
```

这会自动生成所有需要的图标文件。

### 方法2：手动创建
使用图标编辑器（如GIMP、Photoshop、Figma）创建：
1. 创建一个至少512x512的PNG图标
2. 使用在线工具转换为ICO格式（推荐：https://icoconvert.com/）
3. 调整大小生成各个尺寸的PNG文件

### 方法3：使用现有Word图标（临时）
可以从系统提取Word图标作为临时占位符：
- 位置：`C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE`
- 使用ResourceHacker等工具提取

## 推荐设计

建议使用蓝色背景 + 白色 "W" 字母的设计，与Microsoft Word保持一致：
- 背景色：#2b579a
- 字母颜色：#ffffff
- 字体：Segoe UI Bold

## 临时方案

在开发阶段，可以使用简单的纯色图标，等正式发布时再替换为精美设计。

