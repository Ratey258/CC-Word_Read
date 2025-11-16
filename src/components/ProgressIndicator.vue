<script setup lang="ts">
import { computed } from 'vue'
import { progressService } from '@/services/progress'

const progressState = progressService.progressState

const progressPercent = computed(() => {
  return `${progressState.value.progress.toFixed(1)}%`
})

const progressText = computed(() => {
  const { current, total } = progressState.value
  if (total > 0) {
    return `${current} / ${total}`
  }
  return ''
})

function handleCancel() {
  progressService.cancel()
}
</script>

<template>
  <Transition name="progress-fade">
    <div v-if="progressState.isLoading" class="progress-indicator">
      <div class="progress-indicator__backdrop" />
      <div class="progress-indicator__content">
        <div class="progress-indicator__message">
          {{ progressState.message }}
        </div>
        
        <div class="progress-indicator__bar">
          <div 
            class="progress-indicator__bar-fill"
            :style="{ width: progressPercent }"
          />
        </div>
        
        <div class="progress-indicator__info">
          <span class="progress-indicator__percent">{{ progressPercent }}</span>
          <span v-if="progressText" class="progress-indicator__text">
            {{ progressText }}
          </span>
        </div>
        
        <button
          v-if="progressState.canCancel"
          class="progress-indicator__cancel"
          @click="handleCancel"
        >
          取消
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.progress-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-indicator__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.progress-indicator__content {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  max-width: 480px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.progress-indicator__message {
  font-size: 14px;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.progress-indicator__bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-indicator__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2b579a 0%, #3b6bb0 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-indicator__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 16px;
}

.progress-indicator__percent {
  font-weight: 600;
  color: #2b579a;
}

.progress-indicator__text {
  color: #999;
}

.progress-indicator__cancel {
  width: 100%;
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.progress-indicator__cancel:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.progress-indicator__cancel:active {
  transform: scale(0.98);
}

/* 过渡动画 */
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.3s ease;
}

.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}

.progress-fade-enter-active .progress-indicator__content {
  animation: progress-scale-in 0.3s ease;
}

.progress-fade-leave-active .progress-indicator__content {
  animation: progress-scale-out 0.3s ease;
}

@keyframes progress-scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes progress-scale-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
