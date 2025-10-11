<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title?: string
  message?: string
  confirmText?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

// 动画状态
const showIcon = ref(false)
const showContent = ref(false)

watch(() => props.show, (show) => {
  if (show) {
    // 重置状态
    showIcon.value = false
    showContent.value = false
    
    // 立即显示所有内容（使用透明度动画），避免布局变化
    // 使用 nextTick 确保 DOM 更新
    setTimeout(() => {
      showIcon.value = true
      showContent.value = true
    }, 50)
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

function handleConfirm(): void {
  emit('confirm')
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
      <div class="success-dialog">
        <!-- 成功图标 -->
        <Transition name="icon">
          <div v-if="showIcon" class="success-icon">
            <div class="success-icon__circle">
              <span class="success-icon__emoji">🔖</span>
            </div>
            <div class="success-icon__ring"></div>
          </div>
        </Transition>

        <!-- 内容 -->
        <Transition name="content">
          <div v-if="showContent" class="success-content">
            <h2 class="success-title">
              {{ title || '操作成功' }}
            </h2>
            <p v-if="message" class="success-message">
              {{ message }}
            </p>
          </div>
        </Transition>

        <!-- 按钮 -->
        <Transition name="content">
          <div v-if="showContent" class="success-footer">
            <button 
              class="success-button"
              @click="handleConfirm"
            >
              {{ confirmText || '确定' }}
            </button>
          </div>
        </Transition>
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
  z-index: 10002;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* Success Dialog */
.success-dialog {
  background: var(--word-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  width: 100%;
  padding: 48px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  /* 固定最小高度，避免内容出现时的布局跳动 */
  min-height: 320px;
  /* 使用 will-change 优化动画性能 */
  will-change: transform, opacity;
}

/* Success Icon */
.success-icon {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon__circle {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0078d4 0%, #0063b1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(0, 120, 212, 0.3);
}

.success-icon__emoji {
  font-size: 40px;
  line-height: 1;
}

.success-icon__ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border: 3px solid var(--word-accent);
  border-radius: 50%;
  opacity: 0.3;
  z-index: 1;
}

/* Success Content */
.success-content {
  text-align: center;
  will-change: transform, opacity;
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0 0 8px;
}

.success-message {
  font-size: 14px;
  color: var(--word-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Success Footer */
.success-footer {
  width: 100%;
  padding-top: 8px;
}

.success-button {
  width: 100%;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family-ui);
  background: var(--word-accent);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.success-button:hover {
  background: var(--word-accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
}

.success-button:active {
  transform: translateY(0);
}

/* Dialog Transition */
.dialog-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.dialog-enter-active .success-dialog {
  transition: 
    transform 0.4s cubic-bezier(0.05, 0.7, 0.1, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-leave-active .success-dialog {
  transition: 
    transform 0.25s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .success-dialog {
  opacity: 0;
  transform: scale(0.8) translateY(-30px);
}

.dialog-leave-to .success-dialog {
  opacity: 0;
  transform: scale(0.9);
}

/* Icon Transition */
.icon-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-enter-from {
  opacity: 0;
  transform: scale(0);
}

.icon-enter-active .success-icon__circle {
  animation: iconPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-enter-active .success-icon__ring {
  animation: ringExpand 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-enter-active .success-icon__emoji {
  animation: emojiPop 0.4s cubic-bezier(0.65, 0, 0.35, 1) 0.2s both;
}

@keyframes iconPulse {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes ringExpand {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: scale(1.3);
    opacity: 0.3;
  }
}

@keyframes emojiPop {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Content Transition */
.content-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>

