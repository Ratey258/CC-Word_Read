<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TitleBar from '@/components/TitleBar.vue'
import Ribbon from '@/components/Ribbon.vue'
import Editor from '@/components/Editor.vue'
import StatusBar from '@/components/StatusBar.vue'
import BookmarkPanel from '@/components/BookmarkPanel.vue'
import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue'
import AboutDialog from '@/components/AboutDialog.vue'
import UpdateChecker from '@/components/UpdateChecker.vue'
import SuccessDialog from '@/components/SuccessDialog.vue'
import OnboardingGuide from '@/components/OnboardingGuide.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import ProgressIndicator from '@/components/ProgressIndicator.vue'
import { useFileImporter } from '@/composables/useFileImporter'
import { useUIStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import { on, off } from '@/services/eventBus'
import { createLogger } from '@/services/logger'

const logger = createLogger('App')

// File import composable
const { isDragging, handleDragEnter, handleDragLeave, handleDrop } = useFileImporter()

// Stores
const uiStore = useUIStore()
const settingsStore = useSettingsStore()

// 书签面板
const showBookmarkPanel = ref(false)
const showAddBookmark = ref(false)
const showAboutDialog = ref(false)

// 更新检查器引用
const updateChecker = ref<InstanceType<typeof UpdateChecker> | null>(null)

function handleShowBookmarks(): void {
  showBookmarkPanel.value = true
}

function handleCloseBookmarks(): void {
  showBookmarkPanel.value = false
}

function handleAddBookmark(): void {
  showAddBookmark.value = true
}

function handleCloseAddBookmark(): void {
  showAddBookmark.value = false
}

function handleShowAbout(): void {
  showAboutDialog.value = true
}

function handleCloseAbout(): void {
  showAboutDialog.value = false
}

function handleCheckUpdates(): void {
  updateChecker.value?.checkForUpdates(true)
}

function handleCompleteOnboarding(): void {
  uiStore.hideOnboardingGuide()
}

onMounted(() => {
  logger.info('应用组件已挂载')
  
  // 使用事件总线监听事件
  on('bookmarks:show', handleShowBookmarks)
  on('bookmarks:add', handleAddBookmark)
  on('dialog:about', handleShowAbout)
  on('update:check', handleCheckUpdates)
  
  // 检查是否首次使用，显示引导
  if (settingsStore.isFirstTime) {
    // 延迟一点显示，让界面先渲染完成
    setTimeout(() => {
      uiStore.showOnboardingGuide()
    }, 500)
  }
})

onUnmounted(() => {
  // 清理事件监听器
  off('bookmarks:show', handleShowBookmarks)
  off('bookmarks:add', handleAddBookmark)
  off('dialog:about', handleShowAbout)
  off('update:check', handleCheckUpdates)
  
  logger.info('应用组件已卸载')
})
</script>

<template>
  <div
    id="app"
    class="app-container"
    :class="{ 'app-container--dragging': isDragging }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <TitleBar />
    <Ribbon />
    <Editor />
    <StatusBar />

    <!-- 书签面板 -->
    <BookmarkPanel :show="showBookmarkPanel" @close="handleCloseBookmarks" />

    <!-- 添加书签对话框 -->
    <AddBookmarkDialog :show="showAddBookmark" @close="handleCloseAddBookmark" />

    <!-- 关于对话框 -->
    <AboutDialog :show="showAboutDialog" @close="handleCloseAbout" />

    <!-- 更新检查器 -->
    <UpdateChecker ref="updateChecker" />

    <!-- 成功对话框 -->
    <SuccessDialog
      :show="uiStore.successDialog.show"
      :title="uiStore.successDialog.title"
      :message="uiStore.successDialog.message"
      :confirm-text="uiStore.successDialog.confirmText"
      @close="uiStore.hideSuccessDialog"
      @confirm="uiStore.hideSuccessDialog"
    />

    <!-- 新手引导 -->
    <OnboardingGuide
      :show="uiStore.showOnboarding"
      @close="uiStore.hideOnboardingGuide"
      @complete="handleCompleteOnboarding"
    />

    <!-- 通知容器 -->
    <NotificationContainer />

    <!-- 进度指示器 -->
    <ProgressIndicator />

    <!-- 拖放遮罩层 -->
    <div v-if="isDragging" class="drop-overlay">
      <div class="drop-overlay__content">
        <div class="drop-overlay__icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M48 8H16c-2.2 0-4 1.8-4 4v40c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4zm0 44H16V12h32v40z"
              fill="currentColor"
            />
            <path
              d="M32 20v16M24 28l8 8 8-8"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h3 class="drop-overlay__title">拖放文件到此处</h3>
        <p class="drop-overlay__description">支持 TXT 文本文件</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container
{
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 拖放遮罩层 */
.drop-overlay
{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 120, 212, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 150ms ease-out;
}

.drop-overlay__content
{
  text-align: center;
  color: white;
  pointer-events: none;
}

.drop-overlay__icon
{
  width: 128px;
  height: 128px;
  margin: 0 auto 24px;
  animation: slideDown 200ms ease-out;
}

.drop-overlay__icon svg
{
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.drop-overlay__title
{
  font-size: 32px;
  font-weight: 400;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.drop-overlay__description
{
  font-size: 18px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn
{
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown
{
  from
  {
    opacity: 0;
    transform: translateY(-20px);
  }
  to
  {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

