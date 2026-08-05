@echo off
cd /d "%~dp0"
echo === Installing dependencies ===
call npm install
echo.
echo === Build check ===
call npx tsc --noEmit 2>&1
echo.
echo === Done ===
pause
