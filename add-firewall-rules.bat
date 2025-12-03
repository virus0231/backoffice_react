@echo off
echo ========================================
echo Adding Firewall Rules for Local Network Access
echo ========================================
echo.
echo This script will add Windows Firewall rules to allow:
echo - Port 8000 (Laravel API)
echo - Port 5173 (React Dev Server)
echo.
echo NOTE: You must run this as Administrator!
echo.
pause

echo Adding rule for Laravel API (Port 8000)...
netsh advfirewall firewall add rule name="Laravel API - Port 8000" dir=in action=allow protocol=TCP localport=8000

echo Adding rule for React Dev Server (Port 5173)...
netsh advfirewall firewall add rule name="React Dev Server - Port 5173" dir=in action=allow protocol=TCP localport=5173

echo.
echo ========================================
echo Firewall rules added successfully!
echo ========================================
echo.
echo You can now access your app from other devices on your network:
echo   React: http://192.168.200.134:5173
echo   API:   http://192.168.200.134:8000
echo.
pause
