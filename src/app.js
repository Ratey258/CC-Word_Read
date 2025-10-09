// ========================================
// Word 小说阅读器 - 主应用逻辑
// ========================================

// 核心变量
let novelContent = '';
let currentPosition = 0;
let isNovelMode = false;
let isComposing = false;
let savedContent = '';

// 设置
let settings = {
    charsPerOutput: 5,
    outputInterval: 200
};

// DOM 元素
const documentContent = document.getElementById('documentContent');
const wordCountEl = document.getElementById('wordCount');

// ========================================
// 小说加载功能
// ========================================
async function loadNovel(input) {
    const file = input.files[0];
    if (!file) return;

    const allowedTypes = ['.txt', '.md', '.docx'];
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(fileExtension)) {
        showNotification('请选择文本文件（.txt、.md、.docx）', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('文件过大！请选择小于10MB的文件', 'error');
        return;
    }

    try {
        if (fileExtension === '.docx') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            novelContent = result.value || '';
        } else {
            novelContent = await file.text();
        }

        if (!novelContent || novelContent.trim().length === 0) {
            showNotification('文件内容为空！', 'error');
            return;
        }

        // 清理内容
        novelContent = novelContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        novelContent = novelContent.replace(/\n{3,}/g, '\n\n');
        
        currentPosition = 0;
        saveProgress();
        
        showNotification(`小说"${file.name}"导入成功！`);
        
        // 自动开启小说模式
        if (!isNovelMode) {
            setTimeout(() => toggleNovelMode(), 500);
        }
    } catch (error) {
        showNotification('文件读取失败：' + error.message, 'error');
        console.error('文件读取错误:', error);
    }
}

// ========================================
// 小说模式控制
// ========================================
function toggleNovelMode() {
    if (!novelContent) {
        showNotification('请先导入小说文件', 'error');
        return;
    }

    isNovelMode = !isNovelMode;
    
    if (isNovelMode) {
        documentContent.focus();
        setCursorToEnd();
        console.log('小说模式已启动');
    } else {
        console.log('小说模式已停止');
    }
}

// ========================================
// 键盘输入处理
// ========================================
documentContent.addEventListener('keydown', function(e) {
    if (!isNovelMode || !novelContent || isComposing) {
        return;
    }

    e.preventDefault();
    
    if (e.key === 'Backspace') {
        handleBackspace();
    } else if (e.key === 'Enter') {
        outputMultipleChars();
    } else if (!isModifierKey(e.key)) {
        outputMultipleChars();
    }

    updateWordCount();
    updateProgress();
});

// 判断是否是修饰键
function isModifierKey(key) {
    const modifiers = ['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape', 
                      'CapsLock', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 
                      'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
    return modifiers.includes(key) || key.startsWith('Arrow');
}

// 处理退格
function handleBackspace() {
    const content = documentContent.textContent;
    if (content.length > 0) {
        const newText = content.slice(0, -1);
        documentContent.innerHTML = newText.replace(/\n/g, '<br>');
        currentPosition = Math.max(0, currentPosition - 1);
        savedContent = documentContent.innerHTML;
        setCursorToEnd();
    }
}

// 输出多个字符
function outputMultipleChars() {
    if (!isNovelMode || !novelContent || currentPosition >= novelContent.length) {
        return;
    }
    
    const charsToOutput = Math.min(settings.charsPerOutput, novelContent.length - currentPosition);
    const newChars = novelContent.substring(currentPosition, currentPosition + charsToOutput);
    
    const formattedChars = newChars.replace(/\n/g, '<br>');
    documentContent.innerHTML += formattedChars;
    currentPosition += charsToOutput;
    savedContent = documentContent.innerHTML;
    
    saveProgress();
    setCursorToEnd();
    
    // 检查是否读完
    if (currentPosition >= novelContent.length) {
        showNotification('小说已读完！', 'success');
    }
}

// ========================================
// 中文输入法处理
// ========================================
documentContent.addEventListener('compositionstart', function(e) {
    if (isNovelMode) {
        isComposing = true;
        savedContent = documentContent.innerHTML;
    }
});

documentContent.addEventListener('compositionend', function(e) {
    if (isNovelMode) {
        isComposing = false;
        documentContent.innerHTML = savedContent;
        outputMultipleChars();
    }
});

documentContent.addEventListener('input', function(e) {
    if (isNovelMode && !isComposing) {
        if (savedContent !== undefined) {
            documentContent.innerHTML = savedContent;
            setCursorToEnd();
        }
    }
});

// 防止粘贴
documentContent.addEventListener('paste', function(e) {
    if (isNovelMode) {
        e.preventDefault();
    }
});

// ========================================
// 光标控制
// ========================================
function setCursorToEnd() {
    setTimeout(() => {
        try {
            const range = document.createRange();
            const selection = window.getSelection();
            
            if (documentContent.childNodes.length > 0) {
                const lastNode = documentContent.childNodes[documentContent.childNodes.length - 1];
                if (lastNode.nodeType === Node.TEXT_NODE) {
                    range.setStart(lastNode, lastNode.textContent.length);
                } else {
                    range.setStartAfter(lastNode);
                }
            } else {
                range.setStart(documentContent, 0);
            }
            
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            console.warn('设置光标位置失败:', error);
        }
    }, 10);
}

// ========================================
// 进度保存和加载
// ========================================
function saveProgress() {
    if (!novelContent) return;
    
    try {
        const progressData = {
            content: novelContent,
            currentPosition: currentPosition,
            displayedContent: documentContent.innerHTML,
            timestamp: Date.now()
        };
        localStorage.setItem('novelReaderData', JSON.stringify(progressData));
    } catch (error) {
        console.error('保存进度失败:', error);
    }
}

function loadProgress() {
    try {
        const data = localStorage.getItem('novelReaderData');
        if (data) {
            const progressData = JSON.parse(data);
            novelContent = progressData.content || '';
            currentPosition = progressData.currentPosition || 0;
            
            if (progressData.displayedContent) {
                documentContent.innerHTML = progressData.displayedContent;
                savedContent = progressData.displayedContent;
            }
            
            if (novelContent) {
                showNotification('已恢复上次阅读进度');
                updateWordCount();
                return true;
            }
        }
    } catch (error) {
        console.warn('加载进度失败:', error);
    }
    return false;
}

// ========================================
// UI 更新
// ========================================
function updateWordCount() {
    const text = documentContent.textContent || '';
    const count = text.length;
    wordCountEl.textContent = count;
}

function updateProgress() {
    // 可以在这里添加进度条更新逻辑
}

// ========================================
// 通知系统
// ========================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background: ${type === 'success' ? '#107c10' : '#d13438'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========================================
// 键盘快捷键
// ========================================
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveProgress();
                showNotification('进度已保存');
                break;
            case 'o':
                e.preventDefault();
                document.getElementById('novelFile').click();
                break;
            case 'p':
                e.preventDefault();
                toggleNovelMode();
                showNotification(isNovelMode ? '小说模式已开启' : '小说模式已关闭');
                break;
        }
    }
});

// ========================================
// 页面加载完成
// ========================================
window.addEventListener('load', function() {
    documentContent.focus();
    loadProgress();
    updateWordCount();
    console.log('Word小说阅读器已加载完成');
});

// ========================================
// 导出功能（供外部调用）
// ========================================
window.WordNovelReader = {
    loadNovel,
    toggleNovelMode,
    saveProgress,
    loadProgress,
    updateWordCount
};

