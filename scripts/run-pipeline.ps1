# IHL Phase 1 serial pipeline — ingest → thumbnail → embedding → manifest
param(
    [Parameter(Mandatory = $true)][string]$InputManifest,
    [Parameter(Mandatory = $true)][string]$SourceImage,
    [Parameter(Mandatory = $true)][string]$OutputBase,
    [Parameter(Mandatory = $true)][string]$RunId,
    [string]$Config = "configs/dev.yaml"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$ingestOut = Join-Path $OutputBase "ingest"
$thumbOut = Join-Path $OutputBase "thumbnail"
$embOut = Join-Path $OutputBase "embedding"
$manifestOut = Join-Path $OutputBase "manifest"
$buildManifest = Join-Path $OutputBase "build_manifest.json"

New-Item -ItemType Directory -Force -Path $ingestOut, $thumbOut, $embOut, $manifestOut | Out-Null

Write-Host "== ingest_normalize =="
python -m components.ingest_normalize.run `
    --input-manifest $InputManifest `
    --output-dir $ingestOut `
    --run-id $RunId `
    --config $Config
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$parquet = Join-Path $ingestOut "captures_$RunId.parquet"

Write-Host "== thumbnail_builder =="
python -m components.thumbnail_builder.run `
    --input-manifest $InputManifest `
    --output-dir $thumbOut `
    --run-id $RunId `
    --source-image $SourceImage
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$thumbManifest = Join-Path $thumbOut "thumbnail_manifest.json"

Write-Host "== embedding_builder =="
python -m components.embedding_builder.run `
    --input-manifest $InputManifest `
    --image-path $SourceImage `
    --output-dir $embOut `
    --run-id $RunId
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$embManifest = Join-Path $embOut "embedding_manifest.json"

@{
    normalized_parquet = $parquet
    thumbnail_manifest = $thumbManifest
    embedding_manifest = $embManifest
} | ConvertTo-Json | Set-Content -Path $buildManifest -Encoding UTF8

Write-Host "== manifest_builder =="
python -m components.manifest_builder.run `
    --build-manifest $buildManifest `
    --output-dir $manifestOut `
    --run-id $RunId `
    --config $Config
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$searchable = Join-Path $manifestOut "searchable_capture_set_$RunId.parquet"
Write-Host "Pipeline complete: $searchable"
