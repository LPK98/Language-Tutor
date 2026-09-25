# Shows whether the project's PostgreSQL server is running.
# Run from anywhere:  .\Database\status.ps1
$root = $PSScriptRoot
& (Join-Path $root "postgresql\bin\pg_ctl.exe") -D (Join-Path $root "data") status
