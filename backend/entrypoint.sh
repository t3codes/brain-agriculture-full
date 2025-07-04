#!/bin/sh

set -e

echo "⏳ Aguardando o banco de dados ficar disponível..."

# Aguarda o banco estar pronto (ajuste o host se necessário)
until nc -z postgres 5432; do
  echo "⌛ Banco ainda não disponível, tentando novamente em 2s..."
  sleep 2
done

echo "✅ Banco disponível, executando migrações..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação NestJS..."
exec npm run start
