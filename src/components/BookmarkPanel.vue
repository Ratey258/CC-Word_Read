<script setup lang="ts">
import { computed } from 'vue'
import { useBookmarkStore } from '@/stores/bookmark'
import { useNovelStore } from '@/stores/novel'
import type { Bookmark } from '@/types/bookmark'

const bookmarkStore = useBookmarkStore()
const novelStore = useNovelStore()

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// 获取当前小说的书签
const bookmarks = computed(() => {
  if (!novelStore.currentNovel) return []
  return bookmarkStore.getBookmarksByNovel(novelStore.currentNovel.id)
})

const hasBookmarks = computed(() => bookmarks.value.length > 0)

function handleClose(): void {
  emit('close')
}

function handleOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

function handleJumpToBookmark(bookmark: Bookmark): void {
  novelStore.jumpTo(bookmark.position)
  handleClose()
}

function handleDeleteBookmark(bookmarkId: string): void {
  if (confirm('确定要删除此书签吗？')) {
    bookmarkStore.removeBookmark(bookmarkId)
  }
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}

function getProgressPercent(position: number): number {
  if (!novelStore.content) return 0
  return Math.round((position / novelStore.content.length) * 100)
}
</script>

<template>
  <Transition name="modal">
    <div 
      v-if="show"
      class="bookmark-modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="bookmark-modal">
        <div class="bookmark-header">
          <h2 class="bookmark-title">
            书签
          </h2>
          <button 
            class="bookmark-close"
            aria-label="关闭"
            @click="handleClose"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M8 7.293l3.646-3.647a.5.5 0 0 1 .708.708L8.707 8l3.647 3.646a.5.5 0 0 1-.708.708L8 8.707l-3.646 3.647a.5.5 0 0 1-.708-.708L7.293 8 3.646 4.354a.5.5 0 1 1 .708-.708L8 7.293z"
              />
            </svg>
          </button>
        </div>

        <div class="bookmark-content">
          <div
            v-if="!hasBookmarks"
            class="bookmark-empty"
          >
            <div class="bookmark-empty__icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
              >
                <path
                  fill="currentColor"
                  opacity="0.3"
                  d="M32 8L24 8C22.9 8 22 8.9 22 10L22 56L32 48L42 56L42 10C42 8.9 41.1 8 40 8L32 8Z"
                />
              </svg>
            </div>
            <p class="bookmark-empty__text">
              暂无书签<br>
              <span class="bookmark-empty__hint">按 Ctrl+D 添加书签</span>
            </p>
          </div>

          <div
            v-else
            class="bookmark-list"
          >
            <div
              v-for="bookmark in bookmarks"
              :key="bookmark.id"
              class="bookmark-item"
            >
              <div
                class="bookmark-item__content"
                @click="handleJumpToBookmark(bookmark)"
              >
                <div class="bookmark-item__header">
                  <h3 class="bookmark-item__title">
                    {{ bookmark.title || '未命名书签' }}
                  </h3>
                  <span class="bookmark-item__progress">{{ getProgressPercent(bookmark.position) }}%</span>
                </div>
                <p
                  v-if="bookmark.note"
                  class="bookmark-item__note"
                >
                  {{ bookmark.note }}
                </p>
                <div class="bookmark-item__meta">
                  <span class="bookmark-item__date">{{ formatDate(bookmark.createdAt) }}</span>
                  <span class="bookmark-item__position">位置: {{ bookmark.position.toLocaleString() }}</span>
                </div>
              </div>
              <button
                class="bookmark-item__delete"
                aria-label="删除书签"
                @click="handleDeleteBookmark(bookmark.id)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="currentColor"
                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
                  />
                  <path
                    fill="currentColor"
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="bookmark-footer">
          <div class="bookmark-stats">
            <span class="bookmark-stats__count">{{ bookmarks.length }} 个书签</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Modal Overlay */
.bookmark-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

/* Modal */
.bookmark-modal {
  background: var(--word-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.bookmark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--word-gray-border);
}

.bookmark-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0;
}

.bookmark-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--word-text-secondary);
  transition: all 0.15s;
}

.bookmark-close:hover {
  background: var(--word-gray-hover);
  color: var(--word-text-primary);
}

/* Content */
.bookmark-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Empty State */
.bookmark-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--word-text-secondary);
}

.bookmark-empty__icon {
  margin-bottom: 16px;
}

.bookmark-empty__text {
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.bookmark-empty__hint {
  font-size: 12px;
  color: var(--word-text-tertiary);
}

/* Bookmark List */
.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookmark-item {
  display: flex;
  align-items: stretch;
  background: var(--word-gray-light);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all 0.15s;
}

.bookmark-item:hover {
  background: var(--word-gray-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bookmark-item__content {
  flex: 1;
  padding: 16px;
  cursor: pointer;
}

.bookmark-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bookmark-item__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--word-text-primary);
  margin: 0;
}

.bookmark-item__progress {
  font-size: 12px;
  font-weight: 600;
  color: var(--word-accent);
  background: rgba(0, 120, 212, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.bookmark-item__note {
  font-size: 13px;
  color: var(--word-text-secondary);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.bookmark-item__meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--word-text-tertiary);
}

.bookmark-item__delete {
  width: 48px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--word-text-tertiary);
  transition: all 0.15s;
}

.bookmark-item__delete:hover {
  background: rgba(232, 17, 35, 0.1);
  color: #e81123;
}

/* Footer */
.bookmark-footer {
  padding: 12px 24px;
  border-top: 1px solid var(--word-gray-border);
  background: var(--word-gray-light);
}

.bookmark-stats {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-stats__count {
  font-size: 12px;
  color: var(--word-text-secondary);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .bookmark-modal,
.modal-leave-active .bookmark-modal {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bookmark-modal,
.modal-leave-to .bookmark-modal {
  transform: scale(0.95);
}
</style>

