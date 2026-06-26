# IHL keyboard-test dev stack - Windows PowerShell
# Starts API (:8000) + Web (:3000) for observation v2 / CSV import manual testing.
#
# Usage (from IHL root or via repo-root scripts/dev-up.ps1):
#   .\scripts\dev-up.ps1                    # hybrid: Docker API + local Next.js (hot reload)
#   .\scripts\dev-up.ps1 -OpenBrowser         # hybrid + open http://localhost:3000
#   .\scripts\dev-up.ps1 -Mode docker         # all-in-docker (API + Web)
#   .\scripts\dev-up.ps1 -Mode docker -Build  # rebuild images before start (docker mode only)

param(
    [ValidateSet("hybrid", "docker")]
    [string]$Mode = "hybrid",
    [switch]$Build,
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$WebDir = Join-Path $Root "apps\web"
$ComposeFile = Join-Path $Root "docker-compose.yml"
$DevWebPort = 3000
$script:BrowserJob = $null
$script:ShouldComposeDownOnExit = $false

function Write-DevUrls {
    Write-Host ""
    Write-Host "=== IHL dev URLs (keyboard test) ===" -ForegroundColor Cyan
    Write-Host "  Web (Next.js):  http://localhost:3000"
    Write-Host "  API (FastAPI):  http://localhost:8000"
    Write-Host "  API health:     http://localhost:8000/health"
    Write-Host ""
    Write-Host "Observation v2:   http://localhost:3000/observation/input"
    Write-Host "CSV import:       http://localhost:3000/settings/devices"
    Write-Host ""
    Write-Host "Stop: Ctrl+C - API containers started by this script are stopped automatically (hybrid mode)."
    Write-Host ""
}

function Test-DockerDesktop {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Warning "Docker not found on PATH. Install Docker Desktop or use local Python + Node per IMPLEMENTATION.md."
        return $false
    }
    $null = & docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Docker Desktop does not appear to be running."
        Write-Warning "Start Docker Desktop, wait until it is ready, then re-run this script."
        return $false
    }
    return $true
}

function Test-ApiHealthQuick {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
        return ($r.StatusCode -eq 200)
    } catch {
        return $false
    }
}

function Get-ListenPidsOnPort {
    param([int]$Port)
    $pids = @()
    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
    } else {
        $lines = netstat -ano | Select-String ":$Port\s"
        foreach ($line in $lines) {
            if ($line -match '\s+(\d+)\s*$') {
                $pids += [int]$Matches[1]
            }
        }
        $pids = $pids | Select-Object -Unique
    }
    return @($pids | Where-Object { $_ -gt 0 })
}

function Test-IsStaleIhlNextProcess {
    param([int]$ProcessId)
    $wmi = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
    if (-not $wmi -or -not $wmi.CommandLine) { return $false }
    $cmd = $wmi.CommandLine
    if ($cmd -notmatch 'node(\.exe)?') { return $false }
    return (
        ($cmd -match 'next\\dist\\server\\lib\\start-server') -or
        ($cmd -match 'next\\dist\\bin\\next') -or
        ($cmd -match 'apps\\web') -or
        ($cmd -match '\bnext\s+dev\b')
    )
}

function Resolve-IhlDevWebPort {
    param([int]$Port = $DevWebPort)

    $deadline = (Get-Date).AddSeconds(15)
    while ((Get-Date) -lt $deadline) {
        $pids = Get-ListenPidsOnPort -Port $Port
        if (-not $pids -or $pids.Count -eq 0) { return $true }

        foreach ($procId in $pids) {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            $name = if ($proc) { $proc.ProcessName } else { "PID $procId" }

            if (Test-IsStaleIhlNextProcess -ProcessId $procId) {
                Write-Host "Port $Port is in use by a previous IHL Next.js dev server (PID $procId). Stopping it..." -ForegroundColor Yellow
                Write-Host "  (dev-up owns port $Port for local Next.js.)" -ForegroundColor DarkYellow
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Start-Sleep -Seconds 1
                continue
            }

            $wmi = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
            $cmdHint = if ($wmi -and $wmi.CommandLine) { $wmi.CommandLine } else { "(command line unavailable)" }
            Write-Host ""
            Write-Host "Port $Port is already in use by $name (PID $procId)." -ForegroundColor Red
            Write-Host "  $cmdHint" -ForegroundColor DarkGray
            Write-Host "  dev-up needs port $Port for the IHL Next.js dev server." -ForegroundColor Yellow
            $reply = Read-Host "Stop this process and continue? [y/N]"
            if ($reply -match '^(y|yes)$') {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Start-Sleep -Seconds 1
            } else {
                return $false
            }
        }
    }

    $remaining = Get-ListenPidsOnPort -Port $Port
    return (-not $remaining -or $remaining.Count -eq 0)
}

function Wait-HttpOk {
    param(
        [string]$Uri,
        [int]$TimeoutSec = 120,
        [string]$Label = $Uri
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200) { return }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    throw "${Label} did not respond within ${TimeoutSec}s. Check: docker compose -f `"$ComposeFile`" logs"
}

function Ensure-WebDeps {
    if (-not (Test-Path (Join-Path $WebDir "node_modules"))) {
        Write-Host "Installing apps/web dependencies (first run)..." -ForegroundColor Yellow
        Push-Location $WebDir
        try {
            npm install
            if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
        } finally {
            Pop-Location
        }
    }
}

function Start-BrowserWhenReady {
    if (-not $OpenBrowser) { return }
    Write-Host "Browser will open when http://localhost:3000 is ready..." -ForegroundColor Green
    $script:BrowserJob = Start-Job -ScriptBlock {
        $deadline = (Get-Date).AddSeconds(120)
        while ((Get-Date) -lt $deadline) {
            try {
                $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
                if ($r.StatusCode -eq 200) {
                    Start-Process "http://localhost:3000"
                    return
                }
            } catch {
                Start-Sleep -Seconds 2
            }
        }
    }
}

function Stop-BrowserJob {
    if (-not $script:BrowserJob) { return }
    Stop-Job $script:BrowserJob -ErrorAction SilentlyContinue
    Remove-Job $script:BrowserJob -Force -ErrorAction SilentlyContinue
    $script:BrowserJob = $null
}

function Invoke-DevCleanup {
    Stop-BrowserJob
    if (-not $script:ShouldComposeDownOnExit) {
        Write-Host ""
        Write-Host "Leaving Docker API running at http://localhost:8000 (Next.js did not start or port $DevWebPort was blocked)." -ForegroundColor Cyan
        Write-Host "Free port ${DevWebPort}: Get-NetTCPConnection -LocalPort $DevWebPort | Select OwningProcess; Stop-Process -Id <PID> -Force" -ForegroundColor DarkGray
        return
    }
    Write-Host ""
    Write-Host "Stopping API containers (docker compose down)..." -ForegroundColor Yellow
    Push-Location $Root
    try {
        & docker compose -f $ComposeFile down *> $null
    } catch {
        Write-Warning "docker compose down failed: $_"
    } finally {
        Pop-Location
    }
    $script:ShouldComposeDownOnExit = $false
    Write-Host "Dev stack stopped." -ForegroundColor Cyan
}

Push-Location $Root
try {
    $dockerOk = Test-DockerDesktop
    if (-not $dockerOk) {
        throw "Docker is unavailable. Start Docker Desktop and retry."
    }

    switch ($Mode) {
        "docker" {
            $dockerArgs = @("compose", "-f", $ComposeFile, "--profile", "web", "up", "--remove-orphans")
            if ($Build) { $dockerArgs += "--build" }
            Write-Host "Starting API + Web in Docker (profile: web)..." -ForegroundColor Green
            Write-DevUrls
            Start-BrowserWhenReady
            try {
                & docker @dockerArgs
            } finally {
                Stop-BrowserJob
            }
        }
        default {
            $apiAlreadyHealthy = Test-ApiHealthQuick
            if ($apiAlreadyHealthy) {
                Write-Host "API already healthy on :8000; will not run docker compose down on exit unless this session started the stack." -ForegroundColor DarkCyan
            }

            Write-Host "Starting API in Docker (detached)..." -ForegroundColor Green
            & docker compose -f $ComposeFile up -d --remove-orphans api
            if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

            if (-not $apiAlreadyHealthy) {
                $script:ShouldComposeDownOnExit = $true
            }

            try {
                Write-Host "Waiting for API health..." -ForegroundColor Yellow
                Wait-HttpOk -Uri "http://localhost:8000/health" -Label "API health"

                Ensure-WebDeps

                Write-Host "Checking port $DevWebPort for Next.js..." -ForegroundColor Yellow
                if (-not (Resolve-IhlDevWebPort -Port $DevWebPort)) {
                    $script:ShouldComposeDownOnExit = $false
                    throw "Port $DevWebPort is still in use. Stop the blocking process and re-run dev-up, or run: Stop-Process -Id (Get-NetTCPConnection -LocalPort $DevWebPort -State Listen).OwningProcess -Force"
                }

                Write-DevUrls
                Write-Host "Starting Next.js dev server (foreground)..." -ForegroundColor Green
                Start-BrowserWhenReady
                Push-Location $WebDir
                try {
                    $devSw = [System.Diagnostics.Stopwatch]::StartNew()
                    npm run dev
                    $devExit = $LASTEXITCODE
                    $devSw.Stop()
                    if ($devExit -ne 0 -and $devSw.Elapsed.TotalSeconds -lt 15) {
                        $script:ShouldComposeDownOnExit = $false
                        Write-Warning "Next.js exited quickly (exit $devExit). Leaving API containers running."
                    }
                    if ($devExit -ne 0) { exit $devExit }
                } finally {
                    Pop-Location
                }
            } finally {
                Invoke-DevCleanup
            }
        }
    }
}
finally {
    Pop-Location
}