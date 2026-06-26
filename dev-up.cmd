@echo off
REM One-click IHL dev stack — double-click in Explorer (IHL root)
setlocal
cd /d "%~dp0"
powershell.exe -NoExit -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\dev-up.ps1" -OpenBrowser %*
if errorlevel 1 (
    echo.
    echo dev-up failed. See messages above.
    pause
)
