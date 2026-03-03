@echo off
echo ========================================
echo    YanZhiTong - Start Services
echo ========================================
echo.

REM Start backend
echo [1/2] Starting backend service...
cd /d "%~dp0backend"
start "YanZhiTong - Backend Service" cmd /k "venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
echo [2/2] Starting frontend service...
cd /d "%~dp0frontend"
start "YanZhiTong - Frontend Service" cmd /k "npm run dev"

echo.
echo ========================================
echo    Services are starting...
echo.
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit...
pause >nul
