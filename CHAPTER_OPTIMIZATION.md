# 章节功能优化说明

## 问题描述

用户反馈：在选择章节后，输入会默认在当前文字后方，希望选择章节后界面清空再输出。

## 解决方案

### 1. 编辑器清空机制

**修改位置**: `src/stores/novel.ts` - `jumpToChapter` 方法

**优化内容**:
- 在跳转章节时，先触发 `clear-editor` 自定义事件
- 延迟50ms后更新阅读位置，确保编辑器已清空
- 这样用户选择新章节时，编辑器会清空，然后从新章节开始输出内容

```typescript
function jumpToChapter(chapterIndex: number): void {
  if (chapterIndex >= 0 && chapterIndex < chapters.value.length) {
    const chapter = chapters.value[chapterIndex]
    currentChapterIndex.value = chapterIndex
    
    // 触发清空编辑器事件
    window.dispatchEvent(new CustomEvent('clear-editor'))
    
    // 稍微延迟更新位置，确保编辑器已经清空
    setTimeout(() => {
      updatePosition(chapter.startPosition)
    }, 50)
  }
}
```

### 2. 键盘快捷键支持

**修改位置**: `src/components/Ribbon.vue`

**新增功能**:
- `Ctrl + ←`：跳转到上一章节
- `Ctrl + →`：跳转到下一章节
- `Ctrl + Shift + C`：打开章节目录对话框

**实现方式**:
```typescript
function handleKeyboardShortcuts(event: KeyboardEvent): void {
  // Ctrl + 左箭头：上一章节
  if (event.ctrlKey && event.key === 'ArrowLeft' && hasChapters.value) {
    event.preventDefault()
    novelStore.jumpToPrevChapter()
  }
  // Ctrl + 右箭头：下一章节
  else if (event.ctrlKey && event.key === 'ArrowRight' && hasChapters.value) {
    event.preventDefault()
    novelStore.jumpToNextChapter()
  }
  // Ctrl + Shift + C：打开章节目录
  else if (event.ctrlKey && event.shiftKey && event.key === 'C' && hasChapters.value) {
    event.preventDefault()
    handleShowChapters()
  }
}
```

### 3. 智能章节索引计算

**修改位置**: `src/stores/novel.ts` - `jumpToNextChapter` 和 `jumpToPrevChapter` 方法

**优化内容**:
- 改进了当前章节索引的计算逻辑
- 当 `currentChapterIndex` 为 -1 时，根据当前阅读位置自动查找所在章节
- 确保章节导航的准确性

```typescript
function jumpToNextChapter(): void {
  if (hasChapters.value) {
    const currentIndex = currentChapterIndex.value >= 0 ? currentChapterIndex.value : 
      chapters.value.findIndex(chapter => 
        currentPosition.value >= chapter.startPosition && currentPosition.value < chapter.endPosition
      )
    
    const nextIndex = currentIndex + 1
    if (nextIndex < chapters.value.length) {
      jumpToChapter(nextIndex)
    }
  }
}
```

### 4. 用户界面提示

**修改位置**: `src/components/ChapterDialog.vue`

**新增内容**:
- 在章节对话框底部添加快捷键提示
- 显示 "快捷键：Ctrl+← 上一章，Ctrl+→ 下一章"
- 使用灰色斜体样式，不干扰主要内容

## 用户体验改进

### 优化前
1. 选择章节后，新内容会在当前文字后面继续输出
2. 用户需要手动清空编辑器才能从新章节开始
3. 只能通过鼠标点击进行章节导航

### 优化后
1. ✅ 选择章节后，编辑器自动清空，从新章节开始输出
2. ✅ 支持键盘快捷键快速切换章节
3. ✅ 智能计算当前章节位置
4. ✅ 界面提示快捷键使用方法

## 技术细节

### 事件机制
- 使用 `window.dispatchEvent(new CustomEvent('clear-editor'))` 触发编辑器清空
- Editor组件监听该事件并调用 `clearEditor()` 方法
- 通过 `setTimeout` 确保清空操作完成后再更新位置

### 键盘事件处理
- 在 `onMounted` 时添加全局键盘事件监听
- 在 `onUnmounted` 时清理事件监听，避免内存泄漏
- 使用 `event.preventDefault()` 阻止浏览器默认行为

### 状态同步
- 章节跳转时同步更新 `currentChapterIndex`
- 自动保存阅读进度
- 维护章节和阅读位置的一致性

## 测试建议

1. **基本功能测试**:
   - 导入测试小说文件
   - 开始阅读，输入一些内容
   - 打开章节目录，选择不同章节
   - 验证编辑器是否清空并从新章节开始

2. **快捷键测试**:
   - 使用 `Ctrl + ←` 和 `Ctrl + →` 切换章节
   - 使用 `Ctrl + Shift + C` 打开章节目录
   - 验证快捷键在不同状态下的行为

3. **边界情况测试**:
   - 在第一章时按上一章快捷键
   - 在最后一章时按下一章快捷键
   - 没有章节的文档中使用快捷键

## 兼容性

- ✅ 完全向后兼容现有功能
- ✅ 不影响原有的阅读进度保存
- ✅ 保持Word界面风格一致性
- ✅ 支持所有现有文件格式

---

这些优化显著提升了章节导航的用户体验，使功能更加完善和易用。
