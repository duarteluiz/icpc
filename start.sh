#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker não encontrado. Instale Docker Engine e Docker Compose.' >&2
  exit 1
fi
if [ ! -f .env ]; then
  if command -v python3 >/dev/null 2>&1; then
    password=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
  else
    echo 'python3 não encontrado: copie .env.example para .env e altere a palavra-passe.' >&2
    exit 1
  fi
  sed "s/CHANGE_ME_BEFORE_ANY_PUBLIC_USE/${password}/g" .env.example > .env
  chmod 600 .env
  echo 'Criado .env local com palavra-passe de demonstração aleatória.'
fi
docker compose up --build -d
port=$(sed -n 's/^WEB_PORT=//p' .env | tail -1)
port=${port:-18089}
echo "\nMock ICPC disponível em http://localhost:${port}"
echo 'Esta é uma demonstração local, não um site de produção.'
