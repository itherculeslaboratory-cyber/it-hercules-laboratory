# IHL Docker dev helper — Windows PowerShell
# Usage: .\scripts\docker-dev.ps1 [build|up|down|test|logs|shell]

param(
    [Parameter(Position = 0)]
    [ValidateSet("build", "up", "down", "test", "logs", "shell")]
    [string]$Action = "up"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location $Root

try {
    switch ($Action) {
        "build" { docker compose build }
        "up"    { docker compose up search }
        "down"  { docker compose down }
        "test"  { docker compose --profile test run --rm test }
        "logs"  { docker compose logs -f search }
        "shell" { docker compose run --rm search bash }
    }
}
finally {
    Pop-Location
}
