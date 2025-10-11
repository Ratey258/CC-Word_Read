<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// 从 package.json 中获取版本号（构建时自动注入）
const version = ref(__APP_VERSION__)
const author = ref('春卷')

const handleClose = () => {
  emit('close')
}

// 阻止点击对话框内容区域时关闭
const handleDialogClick = (event: MouseEvent) => {
  event.stopPropagation()
}
</script>

<template>
  <Transition name="dialog">
    <div
      v-if="show"
      class="dialog-overlay"
      @click="handleClose"
    >
      <div
        class="dialog"
        @click="handleDialogClick"
      >
        <div class="dialog__header">
          <h2 class="dialog__title">
            关于 CC Word Reader
          </h2>
          <button
            class="dialog__close"
            @click="handleClose"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L11 11M1 11L11 1"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <div class="dialog__body">
          <div class="about-content">
            <!-- 应用图标 -->
            <div class="about-content__icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="64"
                  height="64"
                  rx="12"
                  fill="#0078D4"
                />
                <path
                  d="M20 16H44C45.1046 16 46 16.8954 46 18V46C46 47.1046 45.1046 48 44 48H20C18.8954 48 18 47.1046 18 46V18C18 16.8954 18.8954 16 20 16Z"
                  fill="white"
                />
                <path
                  d="M24 24H40M24 30H40M24 36H34"
                  stroke="#0078D4"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <!-- 应用信息 -->
            <div class="about-content__info">
              <h3 class="about-content__app-name">
                CC Word Reader
              </h3>
              <div class="about-content__version">
                版本 {{ version }}
              </div>
              <div class="about-content__author">
                作者：{{ author }}
              </div>
            </div>

            <!-- 描述 -->
            <div class="about-content__description">
              <p>一款上班摸鱼工具，支持 TXT、Word、Markdown 等多种格式。</p>
              <p>采用模拟 Word 界面设计，提供流畅的阅读体验。</p>
            </div>

            <!-- 版权信息 -->
            <div class="about-content__copyright">
              © 2025 春卷. All rights reserved.
            </div>
          </div>
        </div>

        <div class="dialog__footer">
          <button
            class="button button--primary"
            @click="handleClose"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay
{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog
{
  background-color: var(--word-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog__header
{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--word-gray-border);
}

.dialog__title
{
  font-size: 18px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0;
}

.dialog__close
{
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--word-text-secondary);
  transition: all 150ms;
}

.dialog__close:hover
{
  background-color: var(--word-gray-hover);
  color: var(--word-text-primary);
}

.dialog__body
{
  flex: 1;
  overflow-y: auto;
  padding: 32px 24px;
}

.about-content
{
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.about-content__icon
{
  margin-bottom: 24px;
}

.about-content__info
{
  margin-bottom: 24px;
}

.about-content__app-name
{
  font-size: 24px;
  font-weight: 600;
  color: var(--word-text-primary);
  margin: 0 0 8px 0;
}

.about-content__version
{
  font-size: 16px;
  color: var(--word-text-secondary);
  margin-bottom: 4px;
}

.about-content__author
{
  font-size: 14px;
  color: var(--word-text-secondary);
}

.about-content__description
{
  margin-bottom: 24px;
  color: var(--word-text-secondary);
  line-height: 1.6;
}

.about-content__description p
{
  margin: 0 0 8px 0;
}

.about-content__description p:last-child
{
  margin-bottom: 0;
}

.about-content__copyright
{
  font-size: 12px;
  color: var(--word-text-tertiary);
}

.dialog__footer
{
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid var(--word-gray-border);
  gap: 12px;
}

.button
{
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
  border: none;
}

.button--primary
{
  background-color: var(--word-accent);
  color: white;
}

.button--primary:hover
{
  background-color: var(--word-accent-hover);
}

.button--primary:active
{
  background-color: var(--word-accent-active);
}

/* Dialog transition animation */
.dialog-enter-active
{
  transition: opacity var(--duration-slow) var(--easing-decelerate);
}

.dialog-leave-active
{
  transition: opacity var(--duration-normal) var(--easing-accelerate);
}

.dialog-enter-active .dialog
{
  transition: 
    transform var(--duration-slow) var(--easing-emphasized),
    opacity var(--duration-slow) var(--easing-decelerate);
}

.dialog-leave-active .dialog
{
  transition: 
    transform var(--duration-normal) var(--easing-accelerate),
    opacity var(--duration-normal) var(--easing-accelerate);
}

.dialog-enter-from,
.dialog-leave-to
{
  opacity: 0;
}

.dialog-enter-from .dialog
{
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.dialog-leave-to .dialog
{
  opacity: 0;
  transform: scale(0.95);
}
</style>

