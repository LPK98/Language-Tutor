# Stops the project's PostgreSQL server. Your data is kept.
# Run from anywhere:  .\Database\stop.ps1
$root = $PSScriptRoot
& (Join-Path $root "postgresql\bin\pg_ctl.exe") -D (Join-Path $root "data") -m fast stop
