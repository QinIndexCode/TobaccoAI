# 烟智通 - 启动服务
Write-Host "========================================" -ForegroundColor Green
Write-Host "   烟智通 - 启动服务" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 启动后端
Write-Host "[1/2] 启动后端服务..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$backendPath'
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"@ -WindowStyle Normal

# 等待后端启动
Start-Sleep -Seconds 2

# 启动前端
Write-Host "[2/2] 启动前端服务..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$frontendPath'
npm run dev
"@ -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   服务启动中..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   后端：http://localhost:8000" -ForegroundColor White
Write-Host "   前端：http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
