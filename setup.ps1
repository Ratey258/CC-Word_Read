# CC-Word_Read Tauri项目初始化脚本
# Windows PowerShell脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CC-Word_Read - Tauri项目初始化" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "[1/4] 检查Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js已安装: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ 未检测到Node.js，请先安装: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 检查Rust
Write-Host "[2/4] 检查Rust..." -ForegroundColor Yellow
if (Get-Command rustc -ErrorAction SilentlyContinue) {
    $rustVersion = rustc --version
    Write-Host "✓ Rust已安装: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "✗ 未检测到Rust，请先安装: https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# 安装Node.js依赖
Write-Host "[3/4] 安装Node.js依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "✗ 依赖安装失败" -ForegroundColor Red
    exit 1
}

# 提示
Write-Host "[4/4] 初始化完成!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步操作:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 添加应用图标（可选）:" -ForegroundColor White
Write-Host "   - 将图标文件放入 src-tauri\icons\" -ForegroundColor Gray
Write-Host "   - 或运行: tauri icon your-icon.png" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 启动开发模式:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "3. 构建Windows安装包:" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor Green
Write-Host ""
Write-Host "详细说明请查看: TAURI_SETUP.md" -ForegroundColor Cyan
Write-Host ""

