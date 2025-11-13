<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useNovelStore } from '@/stores/novel'
import { getChapterSummary } from '@/utils/chapterParser'
import type { Chapter } from '@/types/novel'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'select', chapterIndex: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const novelStore = useNovelStore()
const { chapters, content, currentChapter, hasChapters } = storeToRefs(novelStore)

// State
const searchQuery = ref('')
const selectedIndex = ref(-1)
const dialogRef = ref<HTMLElement>()

// Computed
const filteredChapters = computed(() => {
  if (!searchQuery.value.trim()) {
    return chapters.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return chapters.value.filter(chapter => 
    chapter.title.toLowerCase().includes(query) ||
    chapter.index.toString().includes(query)
  )
})

const currentChapterIndex = computed(() => {
  if (!currentChapter.value) return -1
  return chapters.value.findIndex(chapter => chapter.id === currentChapter.value?.id)
})

// Methods
function handleClose(): void {
  emit('close')
  // 重置状态
  searchQuery.value = ''
  selectedIndex.value = -1
}

function handleChapterSelect(chapterIndex: number): void {
  emit('select', chapterIndex)
  handleClose()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.show) return
  
  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (selectedIndex.value < filteredChapters.value.length - 1) {
        selectedIndex.value++
      }
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        const originalIndex = chapters.value.findIndex(
          chapter => chapter.id === filteredChapters.value[selectedIndex.value].id
        )
        handleChapterSelect(originalIndex)
      }
      break
  }
}

function getChapterProgress(chapter: Chapter): number {
  if (!content.value) return 0
  return Math.round((chapter.startPosition / content.value.length) * 100)
}

function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${Math.round(count / 10000 * 10) / 10}万字`
  }
  return `${count}字`
}

// Watch for dialog visibility
watch(() => props.show, async (show) => {
  if (show) {
    selectedIndex.value = currentChapterIndex.value
    await nextTick()
    // 聚焦到搜索框
    const searchInput = dialogRef.value?.querySelector('input')
    searchInput?.focus()
  }
})

// 监听键盘事件
watch(() => props.show, (show) => {
  if (show) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div
    v-if="show"
    class="chapter-dialog-overlay"
    @click.self="handleClose"
  >
    <div
      ref="dialogRef"
      class="chapter-dialog"
      @click.stop
    >
      <!-- 对话框标题 -->
      <div class="chapter-dialog__header">
        <h2 class="chapter-dialog__title">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="chapter-dialog__title-icon"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          章节目录
        </h2>
        <button
          class="chapter-dialog__close"
          @click="handleClose"
          title="关闭"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="chapter-dialog__search">
        <div class="chapter-dialog__search-wrapper">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="chapter-dialog__search-icon"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="chapter-dialog__search-input"
            placeholder="搜索章节标题..."
          />
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="chapter-dialog__content">
        <div
          v-if="!hasChapters"
          class="chapter-dialog__empty"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="chapter-dialog__empty-icon"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              points="14,2 14,8 20,8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h3 class="chapter-dialog__empty-title">未检测到章节</h3>
          <p class="chapter-dialog__empty-description">
            当前文档没有明确的章节结构，或章节格式不被识别。
          </p>
        </div>

        <div
          v-else-if="filteredChapters.length === 0"
          class="chapter-dialog__empty"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="chapter-dialog__empty-icon"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h3 class="chapter-dialog__empty-title">未找到匹配章节</h3>
          <p class="chapter-dialog__empty-description">
            没有找到包含 "{{ searchQuery }}" 的章节。
          </p>
        </div>

        <div
          v-else
          class="chapter-dialog__list"
        >
          <button
            v-for="(chapter, index) in filteredChapters"
            :key="chapter.id"
            class="chapter-dialog__item"
            :class="{
              'chapter-dialog__item--current': currentChapter?.id === chapter.id,
              'chapter-dialog__item--selected': selectedIndex === index
            }"
            @click="handleChapterSelect(chapters.findIndex(c => c.id === chapter.id))"
            @mouseenter="selectedIndex = index"
          >
            <div class="chapter-dialog__item-header">
              <div class="chapter-dialog__item-title">
                <span class="chapter-dialog__item-number">{{ chapter.index }}.</span>
                {{ chapter.title }}
              </div>
              <div class="chapter-dialog__item-progress">
                {{ getChapterProgress(chapter) }}%
              </div>
            </div>
            <div class="chapter-dialog__item-meta">
              <span class="chapter-dialog__item-wordcount">
                {{ formatWordCount(chapter.wordCount) }}
              </span>
              <span
                v-if="content"
                class="chapter-dialog__item-summary"
              >
                {{ getChapterSummary(content, chapter) }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="chapter-dialog__footer">
        <div class="chapter-dialog__stats">
          <span v-if="hasChapters">
            共 {{ chapters.length }} 章节
          </span>
          <span v-if="filteredChapters.length !== chapters.length">
            • 显示 {{ filteredChapters.length }} 项
          </span>
          <span class="chapter-dialog__shortcuts">
            • 快捷键：Ctrl+← 上一章，Ctrl+→ 下一章
          </span>
        </div>
        <div class="chapter-dialog__actions">
          <button
            class="chapter-dialog__button chapter-dialog__button--secondary"
            @click="handleClose"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 150ms ease-out;
}

.chapter-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 200ms ease-out;
}

.chapter-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.chapter-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-dialog__title-icon {
  color: #0078d4;
}

.chapter-dialog__close {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 150ms ease;
}

.chapter-dialog__close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.chapter-dialog__search {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.chapter-dialog__search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.chapter-dialog__search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.chapter-dialog__search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 150ms ease;
}

.chapter-dialog__search-input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.chapter-dialog__content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chapter-dialog__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.chapter-dialog__empty-icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.chapter-dialog__empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

.chapter-dialog__empty-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  max-width: 300px;
}

.chapter-dialog__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.chapter-dialog__item {
  width: 100%;
  padding: 12px 24px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 150ms ease;
  border-left: 3px solid transparent;
}

.chapter-dialog__item:hover,
.chapter-dialog__item--selected {
  background-color: #f8fafc;
}

.chapter-dialog__item--current {
  background-color: #eff6ff;
  border-left-color: #0078d4;
}

.chapter-dialog__item--current.chapter-dialog__item--selected {
  background-color: #dbeafe;
}

.chapter-dialog__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chapter-dialog__item-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-dialog__item-number {
  color: #0078d4;
  font-weight: 600;
  min-width: 24px;
}

.chapter-dialog__item-progress {
  font-size: 12px;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
}

.chapter-dialog__item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.chapter-dialog__item-wordcount {
  font-weight: 500;
}

.chapter-dialog__item-summary {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.chapter-dialog__stats {
  font-size: 12px;
  color: #6b7280;
}

.chapter-dialog__shortcuts {
  color: #9ca3af;
  font-style: italic;
}

.chapter-dialog__actions {
  display: flex;
  gap: 8px;
}

.chapter-dialog__button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  border: 1px solid transparent;
}

.chapter-dialog__button--secondary {
  background-color: white;
  color: #374151;
  border-color: #d1d5db;
}

.chapter-dialog__button--secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* 滚动条样式 */
.chapter-dialog__list::-webkit-scrollbar {
  width: 8px;
}

.chapter-dialog__list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.chapter-dialog__list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.chapter-dialog__list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
