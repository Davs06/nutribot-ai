#!/bin/bash
# Script de Deploy em Produção
# NutriBot AI com Docker + Traefik

set -e

echo "============================================"
echo "  🚀 Deploy do NutriBot AI"
echo "============================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    exit 1
fi
print_message "Docker instalado: $(docker --version)"

# Verificar se Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi
print_message "Docker Compose instalado: $(docker compose version)"

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    print_warning "Arquivo .env não encontrado!"
    print_message "Copiando .env.example para .env..."
    cp .env.example .env
    print_error "Edite o arquivo .env com suas chaves de API antes de continuar!"
    exit 1
fi
print_message "Arquivo .env encontrado"

# Verificar se as chaves de API estão configuradas
if grep -q "sua_chave_gemini_aqui" .env; then
    print_error "Configure sua GEMINI_API_KEY no arquivo .env!"
    exit 1
fi
print_message "Chaves de API configuradas"

# Criar rede Docker se não existir
print_message "Verificando rede Docker..."
docker network inspect nutribot-network &> /dev/null || \
    docker network create nutribot-network
print_message "Rede nutribot-network pronta"

# Criar diretórios necessários
print_message "Criando diretórios..."
mkdir -p traefik/certs
mkdir -p backend/uploads
mkdir -p backend/data

# Parar containers existentes
print_message "Parando containers existentes..."
docker compose down --remove-orphans

# Build das imagens
print_message "Build das imagens Docker..."
docker compose build

# Iniciar serviços
print_message "Iniciando serviços..."
docker compose up -d

# Aguardar serviços
print_message "Aguardando inicialização dos serviços..."
sleep 10

# Verificar saúde dos serviços
print_message "Verificando saúde dos serviços..."
docker compose ps

# Logs
echo ""
print_message "============================================"
print_message "  🎉 Deploy concluído!"
print_message "============================================"
echo ""
print_message "Acesse: https://nutribot.local"
print_message "Dashboard Traefik: http://traefik.nutribot.local:8080"
echo ""
print_warning "Para ver logs: docker compose logs -f"
print_warning "Para parar: docker compose down"
echo ""
