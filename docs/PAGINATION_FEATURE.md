# 上下分页功能设计文档

## 📋 概述

### 问题描述
当前编辑器采用单页 contenteditable 设计，文本内容过多时会超出显示区域，导致用户体验不佳。需要实现类似 Microsoft Word 的上下分页功能，当内容超过一页时自动创建新页面。

### 解决方案
实现动态分页系统，监测内容高度，当超过页面可容纳高度时自动创建新页面，文本在多页间流动分布。

---

## 🎯 功能目标

### 核心功能
1. **自动分页**: 内容超出当前页面时自动创建新页
2. **内容流动**: 文本在多页间自动重新分布
3. **视觉一致**: 保持 Word A4 纸张外观
4. **性能优化**: 大文本下保持流畅性能

### 用户体验
- ✅ 垂直滚动浏览多页内容
- ✅ 页面间有明显分隔（阴影/间距）
- ✅ 光标在页面边界自然跳转
- ✅ 删除内容时页面自动合并

---

## 🏗️ 技术架构

### 当前实现分析

#### 1. 编辑器结构（`src/components/Editor.vue`）
```vue
<div class="document-container">
  <div class="document-page">
    <div 
      ref="editorRef" 
      class="document-content" 
      contenteditable="true"
    />
  </div>
</div>
```

**当前问题：**
- 单个 `document-page` 容器
- `document-content` 高度无限制（`min-height` 但无 `max-height`）
- 内容超出时页面自动拉伸

#### 2. 样式设计（`src/assets/styles/components/editor.css`）
```css
.document-page {
  width: 21cm;          /* A4 宽度 */
  min-height: 29.7cm;   /* A4 高度 */
  padding: 2.54cm;      /* 默认页边距 */
}

.document-content {
  min-height: 24.62cm;  /* A4高度 - 页边距 */
  overflow: visible;     /* 允许内容溢出 */
}
```

**关键尺寸：**
- A4 纸张：21cm × 29.7cm
- 页边距：2.54cm（上下左右）
- 内容区：15.92cm × 24.62cm

#### 3. 文本插入机制（`src/composables/useNovelReader.ts`）
```typescript
function insertTextToEditor(text: string): void {
  const editor = editorRef.value
  if (!editor) return
  
  // 在末尾追加文本节点
  const textNode = document.createTextNode(text)
  editor.appendChild(textNode)
  
  // 移动光标到末尾
  moveCursorToEnd(editor)
  
  // 滚动到可见
  editor.scrollTop = editor.scrollHeight
}
```

**关键特性：**
- 文本总是追加到末尾
- 使用 DOM TextNode
- 支持中文输入法

---

## 🔧 实现方案

### 方案选择：多页面容器方案

#### 架构设计

```
document-container (滚动容器)
├── document-page (第1页)
│   └── document-content (contenteditable)
├── document-page (第2页)
│   └── document-content (contenteditable)
└── document-page (第N页)
    └── document-content (contenteditable)
```

#### 核心原理

1. **页面高度限制**
   ```css
   .document-page {
     height: 29.7cm;  /* 固定高度，不再使用 min-height */
   }
   
   .document-content {
     height: 24.62cm; /* 固定内容区高度 */
     overflow: hidden; /* 隐藏溢出内容 */
   }
   ```

2. **内容分页算法**
   - 监测最后一页内容高度
   - 超过限制时提取溢出文本
   - 创建新页并移动溢出内容

3. **光标管理**
   - 跟踪光标所在页面
   - 页面边界自动切换页面
   - 保持光标位置连续性

---

## 💻 实现细节

### 1. 组件改造（`src/components/Editor.vue`）

#### 模板结构
```vue
<template>
  <div 
    class="document-container"
    :style="containerStyles"
  >
    <div 
      v-for="(page, index) in pages"
      :key="page.id"
      class="document-page"
      :data-page-number="index + 1"
    >
      <div 
        :ref="el => setPageRef(el, index)"
        class="document-content"
        contenteditable="true"
        spellcheck="false"
        :style="editorStyles"
        @keydown="(e) => handleKeyDown(e, index)"
        @beforeinput="(e) => handleBeforeInput(e, index)"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="(e) => handleCompositionEnd(e, index)"
        @input="() => checkPageOverflow(index)"
      />
      
      <!-- 页码显示（可选） -->
      <div class="page-number">
        {{ index + 1 }}
      </div>
    </div>
  </div>
</template>
```

#### 脚本逻辑
```typescript
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Page {
  id: string
  content: string
}

// 页面数据
const pages = ref<Page[]>([
  { id: nanoid(), content: '' }
])

// 页面元素引用
const pageRefs = ref<(HTMLElement | null)[]>([])

// 当前活动页面索引
const activePageIndex = ref(0)

// 设置页面引用
function setPageRef(el: any, index: number) {
  if (el) {
    pageRefs.value[index] = el as HTMLElement
  }
}

// 检查页面溢出
async function checkPageOverflow(pageIndex: number): Promise<void> {
  await nextTick()
  
  const pageEl = pageRefs.value[pageIndex]
  if (!pageEl) return
  
  const maxHeight = 24.62 * 37.7952755906 // cm to px (1cm = 37.7952755906px)
  const currentHeight = pageEl.scrollHeight
  
  if (currentHeight > maxHeight) {
    // 内容溢出，需要分页
    await splitPage(pageIndex)
  }
}

// 分页处理
async function splitPage(pageIndex: number): Promise<void> {
  const pageEl = pageRefs.value[pageIndex]
  if (!pageEl) return
  
  const maxHeight = 24.62 * 37.7952755906
  
  // 二分查找溢出点
  const overflowText = extractOverflowText(pageEl, maxHeight)
  
  if (overflowText) {
    // 从当前页移除溢出文本
    removeOverflowText(pageEl, overflowText)
    
    // 检查是否已有下一页
    if (pageIndex + 1 < pages.value.length) {
      // 追加到下一页开头
      await prependToPage(pageIndex + 1, overflowText)
    } else {
      // 创建新页
      pages.value.push({
        id: nanoid(),
        content: overflowText
      })
      
      await nextTick()
      
      // 设置新页内容
      const newPageEl = pageRefs.value[pageIndex + 1]
      if (newPageEl) {
        newPageEl.textContent = overflowText
      }
    }
    
    // 递归检查新页是否也溢出
    await checkPageOverflow(pageIndex + 1)
  }
}

// 提取溢出文本（使用 Range API）
function extractOverflowText(element: HTMLElement, maxHeight: number): string {
  const range = document.createRange()
  range.selectNodeContents(element)
  
  let start = 0
  let end = element.textContent?.length || 0
  let overflowStart = end
  
  // 二分查找溢出开始位置
  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    
    try {
      range.setStart(element.firstChild || element, 0)
      range.setEnd(element.firstChild || element, mid)
      
      const rect = range.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const relativeHeight = rect.bottom - elementRect.top
      
      if (relativeHeight <= maxHeight) {
        start = mid + 1
        overflowStart = mid
      } else {
        end = mid
      }
    } catch (e) {
      break
    }
  }
  
  const fullText = element.textContent || ''
  return fullText.substring(overflowStart)
}

// 移除溢出文本
function removeOverflowText(element: HTMLElement, overflowText: string): void {
  const fullText = element.textContent || ''
  const keepText = fullText.substring(0, fullText.length - overflowText.length)
  element.textContent = keepText
}

// 在页面开头追加文本
async function prependToPage(pageIndex: number, text: string): Promise<void> {
  const pageEl = pageRefs.value[pageIndex]
  if (!pageEl) return
  
  pageEl.textContent = text + (pageEl.textContent || '')
  await checkPageOverflow(pageIndex)
}

// 修改文本插入函数
function insertTextToEditor(text: string): void {
  const lastPageIndex = pages.value.length - 1
  const lastPageEl = pageRefs.value[lastPageIndex]
  
  if (!lastPageEl) return
  
  // 在最后一页末尾追加
  const textNode = document.createTextNode(text)
  lastPageEl.appendChild(textNode)
  
  // 移动光标
  moveCursorToEnd(lastPageEl)
  
  // 检查是否需要分页
  checkPageOverflow(lastPageIndex)
  
  // 滚动到最后一页
  scrollToPage(lastPageIndex)
}

// 滚动到指定页面
function scrollToPage(pageIndex: number): void {
  const container = document.querySelector('.document-container')
  const pageEl = pageRefs.value[pageIndex]
  
  if (container && pageEl) {
    pageEl.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'end' 
    })
  }
}

// 页面合并（删除内容时）
async function mergePages(pageIndex: number): Promise<void> {
  if (pageIndex <= 0) return
  
  const currentPageEl = pageRefs.value[pageIndex]
  const prevPageEl = pageRefs.value[pageIndex - 1]
  
  if (!currentPageEl || !prevPageEl) return
  
  const currentContent = currentPageEl.textContent || ''
  const prevContent = prevPageEl.textContent || ''
  
  // 合并到前一页
  prevPageEl.textContent = prevContent + currentContent
  
  // 删除当前页
  pages.value.splice(pageIndex, 1)
  
  await nextTick()
  
  // 检查前一页是否溢出
  await checkPageOverflow(pageIndex - 1)
}

// 监听删除操作
function handleBackspace(pageIndex: number): void {
  const pageEl = pageRefs.value[pageIndex]
  if (!pageEl) return
  
  const text = pageEl.textContent || ''
  
  if (text.length === 0 && pageIndex > 0) {
    // 当前页为空且不是第一页，删除当前页
    pages.value.splice(pageIndex, 1)
    
    // 聚焦到前一页末尾
    nextTick(() => {
      const prevPageEl = pageRefs.value[pageIndex - 1]
      if (prevPageEl) {
        moveCursorToEnd(prevPageEl)
        prevPageEl.focus()
      }
    })
  } else if (text.length > 0) {
    // 删除最后一个字符
    pageEl.textContent = text.slice(0, -1)
    moveCursorToEnd(pageEl)
  }
}
</script>
```

### 2. 样式调整（`src/assets/styles/components/editor.css`）

```css
/* ========== 文档页面（固定高度） ========== */

.document-page {
  width: 21cm;
  height: 29.7cm; /* 改为固定高度 */
  background-color: var(--word-white);
  padding: 2.54cm;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden; /* 隐藏溢出 */
}

/* ========== 文档内容（固定高度） ========== */

.document-content {
  width: 100%;
  height: 24.62cm; /* 固定内容区高度 */
  font-family: var(--font-family-document);
  font-size: 14pt;
  line-height: 1.6;
  color: var(--word-text-primary);
  outline: none;
  border: none;
  overflow: hidden; /* 隐藏溢出，由 JS 处理分页 */
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* ========== 页码显示 ========== */

.page-number {
  position: absolute;
  bottom: 1cm;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10pt;
  color: var(--word-text-disabled);
  user-select: none;
  pointer-events: none;
}

/* ========== 打印优化 ========== */

@media print {
  .document-page {
    margin: 0;
    box-shadow: none;
    page-break-after: always;
  }
  
  .document-page:last-child {
    page-break-after: auto;
  }
  
  .page-number {
    display: none; /* 打印时隐藏页码 */
  }
}
```

### 3. 性能优化策略

#### 虚拟滚动（可选，用于超长文档）
```typescript
// 仅渲染可见页面及周边页面
const visiblePages = computed(() => {
  const scrollTop = containerScrollTop.value
  const viewportHeight = containerHeight.value
  
  const startPage = Math.floor(scrollTop / PAGE_HEIGHT) - 1
  const endPage = Math.ceil((scrollTop + viewportHeight) / PAGE_HEIGHT) + 1
  
  return pages.value.slice(
    Math.max(0, startPage), 
    Math.min(pages.value.length, endPage)
  )
})
```

#### 防抖优化
```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedCheckOverflow = useDebounceFn(
  (pageIndex: number) => checkPageOverflow(pageIndex),
  100
)
```

#### 批量更新
```typescript
// 使用 requestAnimationFrame 批量处理分页
function schedulePageUpdate(pageIndex: number): void {
  requestAnimationFrame(() => {
    checkPageOverflow(pageIndex)
  })
}
```

---

## 🎨 用户体验优化

### 1. 页面指示器
```vue
<!-- 当前页面高亮指示 -->
<div class="page-indicator">
  第 {{ activePageIndex + 1 }} 页，共 {{ pages.length }} 页
</div>
```

### 2. 平滑滚动
```typescript
function scrollToPage(pageIndex: number, smooth = true): void {
  const pageEl = pageRefs.value[pageIndex]
  if (pageEl) {
    pageEl.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'center'
    })
  }
}
```

### 3. 快捷键支持
```typescript
// Page Up/Down 翻页
function handlePageNavigation(event: KeyboardEvent): void {
  if (event.key === 'PageDown') {
    event.preventDefault()
    navigateToPage(activePageIndex.value + 1)
  } else if (event.key === 'PageUp') {
    event.preventDefault()
    navigateToPage(activePageIndex.value - 1)
  }
}
```

### 4. 页面转场动画
```css
.document-page {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.document-page.entering {
  animation: pageEnter 0.3s ease;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🧪 测试用例

### 1. 功能测试
- [ ] 单页内容正常显示
- [ ] 内容超出时自动创建新页
- [ ] 删除内容时页面自动合并
- [ ] 光标在页面边界正常跳转
- [ ] 中文输入法正常工作
- [ ] 退格删除正确处理分页

### 2. 性能测试
- [ ] 1万字文档分页流畅
- [ ] 10万字文档响应正常
- [ ] 快速输入不卡顿
- [ ] 内存占用合理

### 3. 边界测试
- [ ] 空页面处理
- [ ] 单字符页面
- [ ] 长单词/URL 处理
- [ ] 特殊字符处理

---

## 📊 数据结构

### Page 接口
```typescript
interface Page {
  id: string          // 唯一标识
  content: string     // 页面内容
  height?: number     // 实际高度（缓存）
}
```

### Pagination State
```typescript
interface PaginationState {
  pages: Page[]                // 所有页面
  activePageIndex: number      // 当前活动页索引
  maxPageHeight: number        // 最大页面高度（px）
  pageRefs: HTMLElement[]      // 页面元素引用
}
```

---

## 🔄 与现有功能集成

### 1. 阅读进度保存
```typescript
// 保存时记录当前页码和页内位置
interface ReadingProgress {
  position: number      // 全文位置
  pageIndex: number     // 页码
  pageOffset: number    // 页内偏移
}
```

### 2. 书签功能
```typescript
// 书签记录页码信息
interface Bookmark {
  id: string
  position: number
  pageIndex: number    // 所在页码
  preview: string
}
```

### 3. 跳转功能
```typescript
function jumpToPosition(position: number): void {
  // 计算目标页码
  const pageIndex = calculatePageIndex(position)
  
  // 跳转到目标页
  navigateToPage(pageIndex)
  
  // 定位到页内位置
  setPageCursor(pageIndex, position)
}
```

---

## 🚀 实施计划

### 第一阶段：基础分页（1-2天）
- [x] 多页面结构搭建
- [x] 固定页面高度
- [x] 基础溢出检测
- [x] 简单文本分页

### 第二阶段：交互优化（2-3天）
- [ ] 光标跨页管理
- [ ] 退格删除优化
- [ ] 中文输入法适配
- [ ] 页面合并逻辑

### 第三阶段：性能优化（1-2天）
- [ ] 防抖节流
- [ ] 虚拟滚动（可选）
- [ ] 内存优化
- [ ] 大文档测试

### 第四阶段：功能集成（1-2天）
- [ ] 阅读进度适配
- [ ] 书签功能适配
- [ ] 跳转功能适配
- [ ] 导出功能适配

---

## 📝 注意事项

### 1. contenteditable 限制
- 每个页面独立 contenteditable
- 需要手动管理跨页光标
- 复制粘贴需特殊处理

### 2. 性能考虑
- 大量页面时考虑虚拟滚动
- 分页算法使用二分查找优化
- DOM 操作批量处理

### 3. 兼容性
- Range API 浏览器兼容性
- CSS 单位转换精度
- 打印功能测试

### 4. 用户体验
- 分页过程应该无感知
- 保持阅读连续性
- 避免页面抖动

---

## 🔗 相关资源

### 技术参考
- [contenteditable API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/contentEditable)
- [Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range)
- [Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection)

### 类似实现
- Google Docs 分页机制
- Microsoft Word Online
- Notion 文档编辑器

---

## ✅ 验收标准

1. **功能完整性**
   - 自动分页正常工作
   - 页面合并正确执行
   - 光标跨页流畅

2. **性能指标**
   - 1万字文档 < 100ms 分页
   - 10万字文档 < 500ms 加载
   - 输入响应 < 16ms

3. **用户体验**
   - 分页过程无卡顿
   - 视觉效果流畅
   - 快捷键完善

4. **兼容性**
   - Chrome/Edge 完美支持
   - Firefox 正常工作
   - 打印功能正常

---

## 📌 后续优化方向

1. **高级功能**
   - 页眉页脚
   - 页面水印
   - 双栏布局

2. **智能分页**
   - 段落不拆分
   - 标题保持完整
   - 图片分页处理

3. **协作功能**
   - 多用户光标显示
   - 实时协作分页
   - 版本对比

---

**文档版本**: v1.0  
**创建日期**: 2025-10-10  
**作者**: Claude & User  
**状态**: 设计阶段

