# Opens an SQL shell (psql) on the language_tutor database.
# The password is read from Mobile_Backend\.env, so you never type it.
# Run from anywhere:  .\Database\psql.ps1        Quit psql with:  \q
$root = $PSScriptRoot
$envFile = Join-Path $root "..\Mobile_Backend\.env"

$line = Get-Content $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if ($line -notmatch '://([^:]+):([^@]+)@([^:/]+):(\d+)/(.+)$') {
    Write-Host "Could not read DATABASE_URL from Mobile_Backend\.env" -ForegroundColor Red
    exit 1
}

$env:PGPASSWORD = [Uri]::UnescapeDataString($Matches[2])
try {
    # Extra arguments are passed on, e.g.:  .\Database\psql.ps1 -c "SELECT count(*) FROM users;"
    & (Join-Path $root "postgresql\bin\psql.exe") -h $Matches[3] -p $Matches[4] -U $Matches[1] -d $Matches[5] @args
} finally {
    Remove-Item Env:PGPASSWORD
}
