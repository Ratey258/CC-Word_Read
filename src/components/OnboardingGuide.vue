<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  complete: []
}>()

const settingsStore = useSettingsStore()

// 动画状态
const showOverlay = ref(false)
const showPointer = ref(false)
const showContent = ref(false)

// 左上角文件按钮的位置（需要动态计算）
interface ButtonRect {
  top: number
  left: number
  width: number
  height: number
}
const fileButtonRect = ref<ButtonRect | null>(null)

watch(() => props.show, (show) => {
  if (show) {
    // 重置状态
    showOverlay.value = false
    showPointer.value = false
    showContent.value = false
    
    // 逐步显示动画
    setTimeout(() => {
      showOverlay.value = true
    }, 50)
    
    setTimeout(() => {
      // 查找文件按钮位置
      calculateFileButtonPosition()
      showPointer.value = true
    }, 300)
    
    setTimeout(() => {
      showContent.value = true
    }, 600)
  }
})

function calculateFileButtonPosition(): void {
  // 查找文件按钮（Ribbon 中的文件标签按钮）
  const fileButton = document.querySelector('.ribbon__tab--file') as HTMLElement
  if (fileButton) {
    const rect = fileButton.getBoundingClientRect()
    fileButtonRect.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    // 如果找不到按钮，使用默认位置（左上角附近）
    fileButtonRect.value = {
      top: 65,
      left: 50,
      width: 60,
      height: 30
    }
  }
}

function handleSkip(): void {
  // 标记已完成引导
  settingsStore.completeOnboarding()
  emit('complete')
  emit('close')
}

function handleStart(): void {
  // 标记已完成引导
  settingsStore.completeOnboarding()
  emit('complete')
  emit('close')
}

onMounted(() => {
  if (props.show) {
    calculateFileButtonPosition()
  }
})
</script>

<template>
  <Transition name="onboarding">
    <div 
      v-if="show && showOverlay"
      class="onboarding-overlay"
    >
      <!-- 背景遮罩 -->
      <div class="onboarding-backdrop"></div>

      <!-- 指向文件按钮的动画指针 -->
      <Transition name="pointer">
        <div
          v-if="showPointer && fileButtonRect"
          class="onboarding-pointer"
          :style="{
            top: `${fileButtonRect.top + fileButtonRect.height / 2}px`,
            left: `${fileButtonRect.left + fileButtonRect.width / 2}px`
          }"
        >
          <!-- 脉冲光圈 -->
          <div class="pointer-pulse"></div>
          <div class="pointer-pulse pointer-pulse--delayed"></div>
          
          <!-- 箭头 -->
          <div class="pointer-arrow">
            <svg 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z"
                fill="currentColor"
              />
            </svg>
          </div>
          
          <!-- 手指图标 -->
          <div class="pointer-hand">
            👆
          </div>
        </div>
      </Transition>

      <!-- 引导内容卡片 -->
      <Transition name="content">
        <div 
          v-if="showContent"
          class="onboarding-content"
        >
          <div class="onboarding-card">
            <!-- 图标 -->
            <div class="onboarding-icon">
              <div class="icon-circle">
                <span class="icon-emoji">📖</span>
              </div>
            </div>

            <!-- 标题和描述 -->
            <h2 class="onboarding-title">
              欢迎使用 CC-Word
            </h2>
            <p class="onboarding-description">
              让我们快速了解如何开始使用
            </p>

            <!-- 步骤说明 -->
            <div class="onboarding-steps">
              <div class="step-item">
                <div class="step-number">
                  1
                </div>
                <div class="step-content">
                  <h3 class="step-title">
                    点击左上角文件菜单
                  </h3>
                  <p class="step-text">
                    找到应用左上角的"文件"按钮
                  </p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">
                  2
                </div>
                <div class="step-content">
                  <h3 class="step-title">
                    导入文件
                  </h3>
                  <p class="step-text">
                    支持 TXT、Word (docx)、Markdown 等格式
                  </p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">
                  3
                </div>
                <div class="step-content">
                  <h3 class="step-title">
                    开始阅读
                  </h3>
                  <p class="step-text">
                    输入任意字符会自动显示文件内容
                  </p>
                </div>
              </div>
            </div>

            <!-- 按钮 -->
            <div class="onboarding-footer">
              <button 
                class="onboarding-button onboarding-button--secondary"
                @click="handleSkip"
              >
                跳过
              </button>
              <button 
                class="onboarding-button onboarding-button--primary"
                @click="handleStart"
              >
                开始使用
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Onboarding Overlay */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10003;
  overflow: hidden;
}

.onboarding-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
}

/* Pointer Animation */
.onboarding-pointer {
  position: fixed;
  z-index: 10005;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.pointer-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 3px solid #0078d4;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.pointer-pulse--delayed {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.pointer-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  color: #0078d4;
  animation: bounceHorizontal 1.5s ease-in-out infinite;
}

@keyframes bounceHorizontal {
  0%, 100% {
    transform: translate(-50%, -50%) translateX(0);
  }
  50% {
    transform: translate(-50%, -50%) translateX(-10px);
  }
}

.pointer-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateY(40px);
  font-size: 32px;
  animation: tap 1s ease-in-out infinite;
}

@keyframes tap {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(40px) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) translateY(35px) scale(0.95);
  }
}

/* Onboarding Content */
.onboarding-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10004;
  max-width: 500px;
  width: 90%;
  padding: 0 20px;
}

.onboarding-card {
  background: var(--word-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px 32px 32px;
  text-align: center;
}

/* Icon */
.onboarding-icon {
  margin-bottom: 24px;
}

.icon-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0078d4 0%, #0063b1 100%);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 120, 212, 0.3);
}

.icon-emoji {
  font-size: 40px;
  line-height: 1;
}

/* Title & Description */
.onboarding-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0 0 8px;
}

.onboarding-description {
  font-size: 14px;
  color: var(--word-text-secondary);
  margin: 0 0 32px;
}

/* Steps */
.onboarding-steps {
  text-align: left;
  margin-bottom: 32px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--word-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0 0 4px;
}

.step-text {
  font-size: 13px;
  color: var(--word-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Footer */
.onboarding-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.onboarding-button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-family-ui);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.onboarding-button--secondary {
  background: var(--word-gray-200);
  color: var(--word-text-primary);
}

.onboarding-button--secondary:hover {
  background: var(--word-gray-300);
}

.onboarding-button--primary {
  background: var(--word-accent);
  color: white;
}

.onboarding-button--primary:hover {
  background: var(--word-accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
}

.onboarding-button:active {
  transform: translateY(0);
}

/* Transitions */
.onboarding-enter-active {
  transition: opacity 0.3s ease-out;
}

.onboarding-leave-active {
  transition: opacity 0.2s ease-in;
}

.onboarding-enter-from,
.onboarding-leave-to {
  opacity: 0;
}

.pointer-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pointer-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

.content-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.content-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8) translateY(-30px);
}
</style>

