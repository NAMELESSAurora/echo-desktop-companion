param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$taskProject = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location -LiteralPath $taskProject
try {
    uv run --frozen python -m uvicorn companion.api:create_app --factory --host 127.0.0.1 --port $Port
} finally {
    Pop-Location
}
