# IHL UX Walkthrough — one-command local server (port 3000)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "[IHL UX Walkthrough] Setting up mockups junction..."
node setup-mockups-link.mjs

Write-Host ""
Write-Host "[IHL UX Walkthrough] Starting server..."
Write-Host ""
Write-Host "  Open in browser:  http://localhost:3000"
Write-Host "  Stop server:      Ctrl+C"
Write-Host ""
npx --yes serve . -l 3000
