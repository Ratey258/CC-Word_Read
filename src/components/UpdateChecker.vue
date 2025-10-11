<template>
  <Transition name="dialog">
    <div v-if="showUpdateDialog" class="update-overlay" @click.self="closeDialog">
      <div class="update-dialog">
        <div class="update-header">
          <h3>{{ updateTitle }}</h3>
          <button class="close-btn" @click="closeDialog" v-if="!isUpdating">×</button>
        </div>
        
        <div class="update-content">
          <div v-if="updateStatus === 'checking'" class="update-status">
            <div class="spinner"></div>
            <p>正在检查更新...</p>
          </div>
          
          <div v-else-if="updateStatus === 'available'" class="update-available">
            <div class="update-icon">✨</div>
            <h4 v-if="updateInfo" class="version-info">
              {{ updateInfo.current_version }} → {{ updateInfo.version }}
            </h4>
            <p v-if="updateInfo?.date" class="update-date">
              发布时间: {{ formatDate(updateInfo.date) }}
            </p>
            <div v-if="updateInfo?.notes" class="update-notes">
              <div class="notes-label">更新内容：</div>
              <div class="notes-content">{{ updateInfo.notes }}</div>
            </div>
            <div class="update-actions">
              <button class="btn-primary" @click="installUpdate">立即更新</button>
              <button class="btn-secondary" @click="closeDialog">稍后提醒</button>
            </div>
          </div>
          
          <div v-else-if="updateStatus === 'downloading'" class="update-downloading">
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: downloadProgress + '%' }"></div>
            </div>
            <p>正在下载更新... {{ downloadProgress }}%</p>
          </div>
          
          <div v-else-if="updateStatus === 'installing'" class="update-installing">
            <div class="spinner"></div>
            <p>正在安装更新，请稍候...</p>
          </div>
          
          <div v-else-if="updateStatus === 'success'" class="update-success">
            <div class="update-icon">🎉</div>
            <p>更新安装成功！</p>
            <p class="update-hint">应用将自动重启以完成更新</p>
          </div>
          
          <div v-else-if="updateStatus === 'latest'" class="update-latest">
            <div class="update-icon">✅</div>
            <p>您已使用最新版本</p>
            <button class="btn-secondary" @click="closeDialog">确定</button>
          </div>
          
          <div v-else-if="updateStatus === 'error'" class="update-error">
            <div class="update-icon">❌</div>
            <p>{{ errorMessage }}</p>
            <button class="btn-secondary" @click="closeDialog">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// 更新状态
type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'installing' | 'success' | 'latest' | 'error'

// 更新信息接口
interface UpdateInfo {
  version: string
  date: string | null
  notes: string | null
  current_version: string
}

const showUpdateDialog = ref(false)
const updateStatus = ref<UpdateStatus>('idle')
const downloadProgress = ref(0)
const errorMessage = ref('')
const updateInfo = ref<UpdateInfo | null>(null)

const updateTitle = computed(() => {
  switch (updateStatus.value) {
    case 'checking': return '检查更新'
    case 'available': return '发现新版本'
    case 'downloading': return '下载更新'
    case 'installing': return '安装更新'
    case 'success': return '更新成功'
    case 'latest': return '已是最新版本'
    case 'error': return '更新失败'
    default: return '检查更新'
  }
})

const isUpdating = computed(() => {
  return ['downloading', 'installing'].includes(updateStatus.value)
})

// 格式化日期
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// 检查更新
const checkForUpdates = async (manual = false) => {
  if (manual) {
    showUpdateDialog.value = true
  }
  
  updateStatus.value = 'checking'
  
  try {
    const result = await invoke<UpdateInfo | null>('check_for_updates')
    
    if (result) {
      // 发现新版本
      updateInfo.value = result
      updateStatus.value = 'available'
      showUpdateDialog.value = true
      console.log('发现新版本:', result)
    } else {
      // 已是最新版本
      updateStatus.value = 'latest'
      updateInfo.value = null
      if (manual) {
        showUpdateDialog.value = true
      } else {
        showUpdateDialog.value = false
      }
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    errorMessage.value = String(error)
    updateStatus.value = 'error'
    if (manual) {
      showUpdateDialog.value = true
    }
  }
}

// 安装更新
const installUpdate = async () => {
  updateStatus.value = 'downloading'
  downloadProgress.value = 0
  
  // 模拟下载进度（实际下载由后端处理）
  const progressInterval = setInterval(() => {
    if (downloadProgress.value < 90) {
      downloadProgress.value += 10
    }
  }, 500)
  
  try {
    // 调用后端下载和安装
    await invoke('download_and_install_update')
    
    clearInterval(progressInterval)
    downloadProgress.value = 100
    updateStatus.value = 'success'
    
    // 显示成功消息后应用将自动重启
    setTimeout(() => {
      showUpdateDialog.value = false
    }, 3000)
  } catch (error) {
    clearInterval(progressInterval)
    console.error('安装更新失败:', error)
    errorMessage.value = String(error)
    updateStatus.value = 'error'
  }
}

// 关闭对话框
const closeDialog = () => {
  if (!isUpdating.value) {
    showUpdateDialog.value = false
    updateStatus.value = 'idle'
    downloadProgress.value = 0
    errorMessage.value = ''
    updateInfo.value = null
  }
}

// 暴露方法给父组件调用
defineExpose({
  checkForUpdates
})

// 组件挂载时自动检查更新（静默检查）
onMounted(() => {
  // 延迟5秒后检查更新，避免影响启动体验
  setTimeout(() => {
    checkForUpdates(false)
  }, 5000)
})
</script>

<style scoped>
.update-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.update-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e1e1e1;
  background: #f8f8f8;
}

.update-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
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
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.update-content {
  padding: 24px 20px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.update-status,
.update-available,
.update-downloading,
.update-installing,
.update-success,
.update-latest,
.update-error {
  text-align: center;
  width: 100%;
}

.update-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0078d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.update-content p {
  margin: 8px 0;
  color: #333;
  font-size: 14px;
}

.update-hint {
  font-size: 12px;
  color: #666;
}

.update-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

button.btn-primary,
button.btn-secondary {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
}

button.btn-primary {
  background: #0078d4;
  color: white;
}

button.btn-primary:hover {
  background: #106ebe;
}

button.btn-secondary {
  background: #f3f3f3;
  color: #333;
  border: 1px solid #d1d1d1;
}

button.btn-secondary:hover {
  background: #e1e1e1;
}

.progress-container {
  width: 100%;
  height: 8px;
  background: #f3f3f3;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0078d4, #00bcf2);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* 版本信息样式 */
.version-info {
  margin: 12px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #0078d4;
}

.update-date {
  font-size: 13px;
  color: #666;
  margin: 4px 0 12px;
}

.update-notes {
  margin: 16px 0;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 6px;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
}

.notes-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.notes-content {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 自定义滚动条 */
.update-notes::-webkit-scrollbar {
  width: 6px;
}

.update-notes::-webkit-scrollbar-track {
  background: #e1e1e1;
  border-radius: 3px;
}

.update-notes::-webkit-scrollbar-thumb {
  background: #999;
  border-radius: 3px;
}

.update-notes::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Dialog transition animation */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity var(--duration-normal) var(--easing-standard);
}

.dialog-enter-active .update-dialog,
.dialog-leave-active .update-dialog {
  transition: 
    transform var(--duration-normal) var(--easing-emphasized),
    opacity var(--duration-normal) var(--easing-standard);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .update-dialog,
.dialog-leave-to .update-dialog {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>

