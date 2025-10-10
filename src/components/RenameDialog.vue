<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="rename-dialog-overlay"
      @click.self="handleCancel"
    >
      <div class="rename-dialog">
        <div class="rename-dialog__header">
          <span class="rename-dialog__title">修改显示文件名</span>
          <button
            class="rename-dialog__close"
            @click="handleCancel"
          >
            ×
          </button>
        </div>
        
        <div class="rename-dialog__body">
          <div class="rename-dialog__info">
            <p class="info-label">
              实际文件名：
            </p>
            <p class="info-value">
              {{ realFileName }}
            </p>
          </div>
          
          <div class="rename-dialog__input-group">
            <label for="display-name">显示文件名：</label>
            <input
              id="display-name"
              v-model="newDisplayName"
              type="text"
              class="rename-dialog__input"
              placeholder="请输入要显示的文件名"
              @keyup.enter="handleConfirm"
              @keyup.esc="handleCancel"
            >
          </div>
          
          <div class="rename-dialog__hint">
            <p>提示：修改显示文件名不会影响实际文件，只会改变在标题栏中显示的名称。</p>
          </div>
        </div>
        
        <div class="rename-dialog__footer">
          <button
            class="rename-dialog__btn rename-dialog__btn--cancel"
            @click="handleCancel"
          >
            取消
          </button>
          <button
            class="rename-dialog__btn rename-dialog__btn--confirm"
            :disabled="!newDisplayName.trim()"
            @click="handleConfirm"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useNovelStore } from '@/stores/novel'
import { storeToRefs } from 'pinia'

// Props
interface Props
{
  show: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits
{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', name: string): void
}

const emit = defineEmits<Emits>()

// Store
const novelStore = useNovelStore()
const { currentNovel, displayName } = storeToRefs(novelStore)

// State
const newDisplayName = ref('')

// Computed
const realFileName = computed(() => currentNovel.value?.metadata.title || '未命名文档')

// Watch
watch(() => props.show, (show) => {
  if (show) {
    // 对话框打开时，使用当前的 displayName
    newDisplayName.value = displayName.value
  }
})

// Methods
function handleConfirm(): void {
  const trimmedName = newDisplayName.value.trim()
  if (!trimmedName) return
  
  emit('confirm', trimmedName)
  emit('update:show', false)
}

function handleCancel(): void {
  emit('update:show', false)
}
</script>

<style scoped>
.rename-dialog-overlay
{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.rename-dialog
{
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90vw;
  overflow: hidden;
}

.rename-dialog__header
{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(to bottom, #f9f9f9, #f0f0f0);
}

.rename-dialog__title
{
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.rename-dialog__close
{
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s;
}

.rename-dialog__close:hover
{
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.rename-dialog__body
{
  padding: 20px;
}

.rename-dialog__info
{
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #2b579a;
}

.info-label
{
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 0;
}

.info-value
{
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin: 0;
  word-break: break-all;
}

.rename-dialog__input-group
{
  margin-bottom: 16px;
}

.rename-dialog__input-group label
{
  display: block;
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.rename-dialog__input
{
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.rename-dialog__input:focus
{
  border-color: #2b579a;
}

.rename-dialog__hint
{
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.rename-dialog__hint p
{
  margin: 0;
}

.rename-dialog__footer
{
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background: #f9f9f9;
}

.rename-dialog__btn
{
  padding: 6px 20px;
  font-size: 13px;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.rename-dialog__btn--cancel
{
  background: white;
  color: #333;
}

.rename-dialog__btn--cancel:hover
{
  background: #f5f5f5;
  border-color: #b0b0b0;
}

.rename-dialog__btn--confirm
{
  background: #2b579a;
  color: white;
  border-color: #2b579a;
}

.rename-dialog__btn--confirm:hover:not(:disabled)
{
  background: #1f4278;
  border-color: #1f4278;
}

.rename-dialog__btn--confirm:disabled
{
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>

