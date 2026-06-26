@echo off
setlocal
cd /d "%~dp0"

echo [IHL UX Walkthrough] Setting up mockups junction...
node setup-mockups-link.mjs
if errorlevel 1 (
  echo Setup failed. Is Node.js installed? Does ..\mockups\ exist?
  pause
  exit /b 1
)

echo.
echo [IHL UX Walkthrough] Starting server...
echo.
echo   Open in browser:  http://localhost:3000
echo   Stop server:      Ctrl+C
echo.
npx --yes serve . -l 3000
