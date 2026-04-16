#!/usr/bin/env bash
# ChatFlow - démarrage sans Docker (hors DB)
set -e

cd "$(dirname "$0")"

echo "==> Démarrage des bases de données (PostgreSQL + MongoDB via Docker)..."
docker compose -f docker-compose.db.yml up -d

echo "==> Attente que PostgreSQL soit prêt..."
until docker exec chatflow-postgres pg_isready -U devuser -d devdb > /dev/null 2>&1; do
  sleep 1
done
echo "    PostgreSQL prêt."

echo "==> Installation des dépendances (si besoin)..."
[ -d "back/node_modules" ] || (cd back && npm install)
[ -d "front/node_modules" ] || (cd front && npm install)
[ -d "node_modules" ] || npm install

echo "==> Lancement du backend + frontend..."
npm run dev
