#!/bin/bash
# Script para gerar senha bcrypt para o dashboard do Traefik

echo "=== Gerador de senha para Dashboard do Traefik ==="
echo ""

if [ -z "$1" ]; then
    echo "Uso: ./generate-password.sh <senha>"
    echo ""
    echo "Exemplo: ./generate-password.sh minhassenhaforte"
    exit 1
fi

# Verifica se htpasswd está disponível
if command -v htpasswd &> /dev/null; then
    htpasswd -nb admin "$1" | sed -e s/\\$/\\$\\$/g
else
    echo "htpasswd não encontrado. Instalando apache2-utils..."
    apt-get update && apt-get install -y apache2-utils
    htpasswd -nb admin "$1" | sed -e s/\\$/\\$\\$/g
fi

echo ""
echo "Copie a linha acima e cole no arquivo dynamic.yml"
