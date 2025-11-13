<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const { notifications } = storeToRefs(uiStore)

function handleClose(id: string): void {
  uiStore.removeNotification(id)
}
</script>

<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        @click="handleClose(notification.id)"
      >
        <div class="notification__content">
          <div class="notification__message">
            {{ notification.message }}
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  align-items: center;
}

.notification {
  background: rgba(60, 60, 67, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 12px 20px;
  min-width: 200px;
  max-width: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.notification:hover {
  background: rgba(60, 60, 67, 0.9);
  transform: scale(1.02);
}

.notification:active {
  transform: scale(0.98);
}

.notification__content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.notification__message {
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  word-break: break-word;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* iOS风格动画效果 */
.notification-enter-active {
  transition: all 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.notification-move {
  transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .notification {
    min-width: 160px;
    max-width: 280px;
    padding: 10px 16px;
  }
  
  .notification__message {
    font-size: 13px;
  }
}
</style>
