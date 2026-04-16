# ChatFlow - démarrage sans Docker (hors DB)
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host "==> Démarrage des bases de données (PostgreSQL + MongoDB via Docker)..." -ForegroundColor Cyan
docker compose -f docker-compose.db.yml up -d

Write-Host "==> Attente que PostgreSQL soit prêt..." -ForegroundColor Cyan
while ($true) {
    docker exec chatflow-postgres pg_isready -U devuser -d devdb 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
}
Write-Host "    PostgreSQL prêt." -ForegroundColor Green

Write-Host "==> Installation des dépendances (si besoin)..." -ForegroundColor Cyan
if (-not (Test-Path "back/node_modules")) { Push-Location back; npm install; Pop-Location }
if (-not (Test-Path "front/node_modules")) { Push-Location front; npm install; Pop-Location }
if (-not (Test-Path "node_modules")) { npm install }

Write-Host "==> Lancement du backend + frontend..." -ForegroundColor Cyan
npm run dev
