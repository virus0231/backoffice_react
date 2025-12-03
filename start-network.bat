@echo off
echo ========================================
echo Starting Backoffice on Local Network
echo ========================================
echo.
echo Your local network IP: 192.168.200.134
echo.
echo React Frontend will be available at:
echo   http://192.168.200.134:5173
echo   http://localhost:5173
echo.
echo Laravel API will be available at:
echo   http://192.168.200.134:8000/api/v1
echo   http://localhost:8000/api/v1
echo.
echo ========================================
echo.

cd /d "%~dp0laravel-api"
start "Laravel API Server" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"

timeout /t 3 /nobreak > nul

cd /d "%~dp0"
start "React Dev Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Press any key to stop all servers...
pause > nul

taskkill /FI "WindowTitle eq Laravel API Server*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq React Dev Server*" /T /F > nul 2>&1

echo Servers stopped.
