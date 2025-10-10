<script setup lang="ts">
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { getShortcutHelp } = useKeyboardShortcuts()
const shortcuts = getShortcutHelp()

// 按类别分组快捷键
const shortcutsByCategory = {
  '文件操作': shortcuts.filter(s => 
    ['Ctrl+O', 'Ctrl+S'].includes(s.combination)
  ),
  '阅读控制': shortcuts.filter(s => 
    ['Ctrl+P', 'Ctrl+Enter'].includes(s.combination)
  ),
  '导航': shortcuts.filter(s => 
    ['Ctrl+G', 'Ctrl+Home', 'Ctrl+End'].includes(s.combination)
  ),
  '书签': shortcuts.filter(s => 
    ['Ctrl+D', 'Ctrl+B'].includes(s.combination)
  ),
  '编辑器': shortcuts.filter(s => 
    ['Ctrl+L'].includes(s.combination)
  ),
  '其他': shortcuts.filter(s => 
    ['Ctrl+,'].includes(s.combination)
  )
}

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose(): void 
{
  emit('close')
}

function handleOverlayClick(event: MouseEvent): void 
{
  if (event.target === event.currentTarget) 
{
    handleClose()
  }
}
</script>

<template>
  <Transition name="modal">
    <div 
      v-if="show"
      class="shortcuts-modal-overlay"
      @click="handleOverlayClick"
    >
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h2 class="shortcuts-title">
            键盘快捷键
          </h2>
          <button 
            class="shortcuts-close"
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

        <div class="shortcuts-content">
          <div
            v-for="(items, category) in shortcutsByCategory"
            :key="category"
            class="shortcuts-category"
          >
            <h3 class="shortcuts-category-title">
              {{ category }}
            </h3>
            <div class="shortcuts-list">
              <div
                v-for="shortcut in items"
                :key="shortcut.combination"
                class="shortcuts-item"
              >
                <span class="shortcuts-description">{{ shortcut.description }}</span>
                <kbd class="shortcuts-keys">{{ shortcut.combination }}</kbd>
              </div>
            </div>
          </div>
        </div>

        <div class="shortcuts-footer">
          <p class="shortcuts-tip">
            按 <kbd>?</kbd> 可随时打开此帮助面板
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Modal Overlay */
.shortcuts-modal-overlay {
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
.shortcuts-modal {
  background: var(--word-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.shortcuts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--word-gray-border);
}

.shortcuts-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0;
}

.shortcuts-close {
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

.shortcuts-close:hover {
  background: var(--word-gray-hover);
  color: var(--word-text-primary);
}

/* Content */
.shortcuts-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.shortcuts-category {
  margin-bottom: 32px;
}

.shortcuts-category:last-child {
  margin-bottom: 0;
}

.shortcuts-category-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--word-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcuts-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--word-gray-light);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.15s;
}

.shortcuts-item:hover {
  background: var(--word-gray-hover);
}

.shortcuts-description {
  font-size: 14px;
  color: var(--word-text-primary);
}

.shortcuts-keys {
  display: inline-block;
  padding: 4px 8px;
  background: var(--word-white);
  border: 1px solid var(--word-gray-border);
  border-radius: 4px;
  font-family: var(--font-family-mono);
  font-size: 12px;
  color: var(--word-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 60px;
  text-align: center;
}

/* Footer */
.shortcuts-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--word-gray-border);
  background: var(--word-gray-light);
}

.shortcuts-tip {
  margin: 0;
  font-size: 13px;
  color: var(--word-text-secondary);
  text-align: center;
}

.shortcuts-tip kbd {
  display: inline-block;
  padding: 2px 6px;
  background: var(--word-white);
  border: 1px solid var(--word-gray-border);
  border-radius: 3px;
  font-family: var(--font-family-mono);
  font-size: 12px;
  margin: 0 2px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .shortcuts-modal,
.modal-leave-active .shortcuts-modal {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .shortcuts-modal,
.modal-leave-to .shortcuts-modal {
  transform: scale(0.95);
}
</style>

