# Starts the project's PostgreSQL server (port 5432, this computer only).
# Run from anywhere:  .\Database\start.ps1
$root = $PSScriptRoot
$pgCtl = Join-Path $root "postgresql\bin\pg_ctl.exe"
$data = Join-Path $root "data"

& $pgCtl -D $data status *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL is already running."
    exit 0
}

& $pgCtl -D $data -l (Join-Path $root "postgres.log") -w start
if ($LASTEXITCODE -ne 0) {
    Write-Host "PostgreSQL did not start. See Database\postgres.log for the reason." -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL is running on localhost:5432." -ForegroundColor Green
