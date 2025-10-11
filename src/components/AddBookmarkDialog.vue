<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBookmarkStore } from '@/stores/bookmark'
import { useNovelStore } from '@/stores/novel'

const bookmarkStore = useBookmarkStore()
const novelStore = useNovelStore()

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const title = ref('')
const note = ref('')

watch(() => props.show, (show) => {
  if (show) {
    // 重置表单
    title.value = ''
    note.value = ''
    
    // 自动生成标题
    if (novelStore.currentNovel && novelStore.content) {
      const progress = Math.round((novelStore.currentPosition / novelStore.content.length) * 100)
      title.value = `阅读进度 ${progress}%`
    }
  }
})

function handleClose(): void {
  emit('close')
}

function handleOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

function handleSubmit(): void {
  if (!novelStore.currentNovel) return
  
  bookmarkStore.addBookmark({
    novelId: novelStore.currentNovel.id,
    position: novelStore.currentPosition,
    title: title.value.trim() || '未命名书签',
    note: note.value.trim()
  })
  
  handleClose()
}

function handleCancel(): void {
  handleClose()
}
</script>

<template>
  <Transition name="dialog">
    <div 
      v-if="show"
      class="dialog-overlay"
      @click="handleOverlayClick"
    >
      <div class="dialog">
        <div class="dialog-header">
          <h2 class="dialog-title">
            添加书签
          </h2>
        </div>

        <div class="dialog-content">
          <div class="form-group">
            <label
              for="bookmark-title"
              class="form-label"
            >
              标题 <span class="form-required">*</span>
            </label>
            <input
              id="bookmark-title"
              v-model="title"
              type="text"
              class="form-input"
              placeholder="书签标题"
              maxlength="50"
              autofocus
            >
          </div>

          <div class="form-group">
            <label
              for="bookmark-note"
              class="form-label"
            >备注</label>
            <textarea
              id="bookmark-note"
              v-model="note"
              class="form-textarea"
              placeholder="添加备注（可选）"
              rows="3"
              maxlength="200"
            />
          </div>

          <div class="form-info">
            <div class="form-info__item">
              <span class="form-info__label">位置:</span>
              <span class="form-info__value">{{ novelStore.currentPosition.toLocaleString() }}</span>
            </div>
            <div class="form-info__item">
              <span class="form-info__label">进度:</span>
              <span class="form-info__value">{{ novelStore.progressPercent }}%</span>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button
            class="dialog-button dialog-button--secondary"
            @click="handleCancel"
          >
            取消
          </button>
          <button 
            class="dialog-button dialog-button--primary" 
            :disabled="!title.trim()"
            @click="handleSubmit"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dialog Overlay */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
}

/* Dialog */
.dialog {
  background: var(--word-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.dialog-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--word-gray-border);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0;
}

/* Content */
.dialog-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--word-text-primary);
  margin-bottom: 8px;
}

.form-required {
  color: #e81123;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-family: var(--font-family-ui);
  color: var(--word-text-primary);
  background: var(--word-white);
  border: 1px solid var(--word-gray-border);
  border-radius: var(--border-radius-sm);
  transition: all 0.15s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--word-accent);
  box-shadow: 0 0 0 1px var(--word-accent);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-info {
  display: flex;
  gap: 24px;
  padding: 12px;
  background: var(--word-gray-light);
  border-radius: var(--border-radius-sm);
}

.form-info__item {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.form-info__label {
  color: var(--word-text-secondary);
}

.form-info__value {
  font-weight: 500;
  color: var(--word-text-primary);
}

/* Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--word-gray-border);
}

.dialog-button {
  padding: 8px 20px;
  font-size: 14px;
  font-family: var(--font-family-ui);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.dialog-button--secondary {
  background: var(--word-gray-light);
  color: var(--word-text-primary);
}

.dialog-button--secondary:hover {
  background: var(--word-gray-hover);
}

.dialog-button--primary {
  background: var(--word-accent);
  color: white;
}

.dialog-button--primary:hover {
  background: var(--word-accent-dark);
}

.dialog-button--primary:disabled {
  background: var(--word-gray-border);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Dialog transition animation */
.dialog-enter-active {
  transition: opacity var(--duration-slow) var(--easing-decelerate);
}

.dialog-leave-active {
  transition: opacity var(--duration-normal) var(--easing-accelerate);
}

.dialog-enter-active .dialog {
  transition: 
    transform var(--duration-slow) var(--easing-emphasized),
    opacity var(--duration-slow) var(--easing-decelerate);
}

.dialog-leave-active .dialog {
  transition: 
    transform var(--duration-normal) var(--easing-accelerate),
    opacity var(--duration-normal) var(--easing-accelerate);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.dialog-leave-to .dialog {
  opacity: 0;
  transform: scale(0.95);
}
</style>

