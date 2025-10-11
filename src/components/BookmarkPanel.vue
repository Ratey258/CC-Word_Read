<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useBookmarkStore } from '@/stores/bookmark'
import { useNovelStore } from '@/stores/novel'
import { useHistoryStore } from '@/stores/history'
import { useHistory } from '@/composables/useHistory'
import type { Bookmark } from '@/types/bookmark'

const bookmarkStore = useBookmarkStore()
const novelStore = useNovelStore()
const historyStore = useHistoryStore()
const { loadFromHistory } = useHistory()

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// 视图模式：current（当前文件）或 all（所有书签）
const viewMode = ref<'current' | 'all'>('current')

// 标签 refs
const currentTabRef = ref<HTMLElement>()
const allTabRef = ref<HTMLElement>()
const indicatorStyle = ref({
  width: '0px',
  transform: 'translateX(0px)'
})

// 对话框和内容区域的 ref
const modalRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()

// 更新指示器位置
const updateIndicator = () => {
  nextTick(() => {
    const activeTab = viewMode.value === 'current' ? currentTabRef.value : allTabRef.value
    if (activeTab) {
      const tabsContainer = activeTab.parentElement
      if (tabsContainer) {
        const containerRect = tabsContainer.getBoundingClientRect()
        const tabRect = activeTab.getBoundingClientRect()
        const offsetLeft = tabRect.left - containerRect.left
        
        indicatorStyle.value = {
          width: `${tabRect.width}px`,
          transform: `translateX(${offsetLeft}px)`
        }
      }
    }
  })
}

// 更新对话框高度 - 实现一镜到底效果
const updateModalHeight = () => {
  nextTick(() => {
    if (modalRef.value) {
      // 获取当前高度
      const currentHeight = modalRef.value.offsetHeight
      
      // 临时设置为 auto 以获取目标高度
      modalRef.value.style.height = 'auto'
      
      // 强制重排，确保获取到内容完全渲染后的高度
      void modalRef.value.offsetHeight
      const targetHeight = modalRef.value.offsetHeight
      
      // 如果高度有明显变化（避免微小抖动）
      if (Math.abs(currentHeight - targetHeight) > 2) {
        // 立即设置回当前高度（此时还没有过渡效果）
        modalRef.value.style.height = `${currentHeight}px`
        
        // 强制重排以确保浏览器应用了当前高度
        void modalRef.value.offsetHeight
        
        // 下一帧开始平滑过渡到目标高度
        window.requestAnimationFrame(() => {
          if (modalRef.value) {
            modalRef.value.style.height = `${targetHeight}px`
          }
        })
      } else {
        // 高度差异很小，直接设置
        modalRef.value.style.height = `${targetHeight}px`
      }
    }
  })
}

// 监听 viewMode 变化
watch(viewMode, () => {
  updateIndicator()
  // 高度更新交给 Transition 钩子处理，确保时机正确
})

// 窗口大小变化处理函数
const handleResize = () => {
  updateIndicator()
  updateModalHeight()
}

// 组件挂载后初始化
onMounted(() => {
  updateIndicator()
  updateModalHeight()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 获取当前小说的书签
const currentBookmarks = computed(() => {
  if (!novelStore.currentNovel) return []
  return bookmarkStore.getBookmarksByNovel(novelStore.currentNovel.id)
})

// 获取所有书签，按文件分组
const allBookmarks = computed(() => {
  return bookmarkStore.bookmarks
})

// 根据模式显示的书签
const bookmarks = computed(() => {
  return viewMode.value === 'current' ? currentBookmarks.value : allBookmarks.value
})

const hasBookmarks = computed(() => bookmarks.value.length > 0)

// 监听书签数量变化，也需要更新高度
watch(bookmarks, () => {
  updateModalHeight()
}, { deep: true })

// 获取书签关联的文件信息
function getBookmarkFileInfo(bookmark: Bookmark) {
  const historyItem = historyStore.historyItems.find(item => item.id === bookmark.novelId)
  return historyItem || null
}

function handleClose(): void {
  emit('close')
}

function handleOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

// 跳转到书签
async function handleJumpToBookmark(bookmark: Bookmark): Promise<void> {
  // 检查是否是当前文件的书签
  if (novelStore.currentNovel?.id === bookmark.novelId) {
    // 当前文件，直接跳转
    novelStore.jumpTo(bookmark.position)
    handleClose()
  } else {
    // 不是当前文件，需要先加载文件
    const fileInfo = getBookmarkFileInfo(bookmark)
    if (fileInfo) {
      try {
        // 加载历史记录
        await loadFromHistory(fileInfo)
        // 加载完成后跳转到书签位置
        novelStore.jumpTo(bookmark.position)
        handleClose()
      } catch (error) {
        console.error('加载文件失败:', error)
        alert('加载文件失败，请重新打开文件')
      }
    } else {
      alert('找不到书签对应的文件，可能已被删除')
    }
  }
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
      <div 
        ref="modalRef"
        class="bookmark-modal"
      >
        <div class="bookmark-header">
          <div class="bookmark-header__left">
            <h2 class="bookmark-title">
              书签
            </h2>
            <div class="bookmark-tabs">
              <button
                ref="currentTabRef"
                class="bookmark-tab"
                :class="{ 'bookmark-tab--active': viewMode === 'current' }"
                @click="viewMode = 'current'"
              >
                当前文件
              </button>
              <button
                ref="allTabRef"
                class="bookmark-tab"
                :class="{ 'bookmark-tab--active': viewMode === 'all' }"
                @click="viewMode = 'all'"
              >
                所有书签
              </button>
              <div
                class="bookmark-tab-indicator"
                :style="indicatorStyle"
              />
            </div>
          </div>
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

        <div 
          ref="contentRef"
          class="bookmark-content"
        >
          <Transition
            name="fade"
            mode="out-in"
            @enter="updateModalHeight"
            @after-enter="updateModalHeight"
          >
            <div
              v-if="!hasBookmarks"
              :key="'empty'"
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
                暂无书签
              </p>
            </div>

            <div
              v-else
              :key="viewMode"
              class="bookmark-list"
            >
              <TransitionGroup
                name="list"
                tag="div"
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
                
                    <!-- 显示文件信息（在全部书签模式下） -->
                    <div
                      v-if="viewMode === 'all'"
                      class="bookmark-item__file"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        class="bookmark-item__file-icon"
                      >
                        <path
                          fill="currentColor"
                          d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0H4zm0 1h5v3a1 1 0 0 0 1 1h3v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
                        />
                      </svg>
                      <span class="bookmark-item__file-name">
                        {{ getBookmarkFileInfo(bookmark)?.title || '未知文件' }}
                      </span>
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
              </TransitionGroup>
            </div>
          </Transition>
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
  /* 一镜到底：对话框大小变化的过渡 - 使用更丝滑的缓动曲线 */
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: height;
  overflow: hidden;
}

/* Header */
.bookmark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
  border-bottom: 1px solid var(--word-gray-border);
}

.bookmark-header__left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bookmark-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0;
}

.bookmark-tabs {
  display: flex;
  gap: 4px;
  position: relative;
}

.bookmark-tab {
  padding: 6px 16px;
  font-size: 13px;
  font-family: var(--font-family-ui);
  font-weight: 500;
  color: var(--word-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.bookmark-tab:hover {
  color: var(--word-text-primary);
  background: var(--word-gray-light);
  border-radius: var(--border-radius-sm);
}

.bookmark-tab--active {
  color: var(--word-accent);
}

.bookmark-tab--active:hover {
  background: transparent;
}

.bookmark-tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--word-accent);
  transition: width 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
              transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
  border-radius: 2px 2px 0 0;
  will-change: width, transform;
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
  overflow-x: hidden;
  padding: 16px;
  /* 确保内容区域与对话框高度变化同步 */
  transition: min-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  /* 防止内容抖动 */
  min-height: 0;
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

.bookmark-item__file {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(0, 120, 212, 0.08);
  border-radius: 4px;
  width: fit-content;
}

.bookmark-item__file-icon {
  color: var(--word-accent);
  flex-shrink: 0;
}

.bookmark-item__file-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--word-accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
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

/* 内容切换动画 - 一镜到底效果 */
.fade-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.15s; /* 等待旧内容退出和高度开始变化 */
}

.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1),
              transform 0.2s cubic-bezier(0.4, 0, 1, 1);
  position: absolute; /* 绝对定位让新旧内容叠加 */
  top: 0;
  left: 16px; /* 对应 padding */
  right: 16px;
  pointer-events: none; /* 防止点击事件 */
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

/* 列表项动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>

