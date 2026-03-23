@echo off
REM Script de Deploy em Produção - Windows
REM NutriBot AI com Docker + Traefik

echo ============================================
echo   Deploy do NutriBot AI
echo ============================================
echo.

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker não está instalado!
    exit /b 1
)
echo [OK] Docker instalado

REM Verificar se Docker Compose está instalado
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker Compose não está instalado!
    exit /b 1
)
echo [OK] Docker Compose instalado

REM Verificar se arquivo .env existe
if not exist .env (
    echo [AVISO] Arquivo .env não encontrado!
    echo [INFO] Copiando .env.example para .env...
    copy .env.example .env
    echo [ERRO] Edite o arquivo .env com suas chaves de API antes de continuar!
    exit /b 1
)
echo [OK] Arquivo .env encontrado

REM Criar diretórios necessários
echo [INFO] Criando diretórios...
if not exist traefik\certs mkdir traefik\certs
if not exist backend\uploads mkdir backend\uploads
if not exist backend\data mkdir backend\data

REM Parar containers existentes
echo [INFO] Parando containers existentes...
docker compose down --remove-orphans

REM Build das imagens
echo [INFO] Build das imagens Docker...
docker compose build

REM Iniciar serviços
echo [INFO] Iniciando serviços...
docker compose up -d

REM Aguardar serviços
echo [INFO] Aguardando inicialização...
timeout /t 10 /nobreak >nul

REM Verificar status
echo [INFO] Status dos serviços:
docker compose ps

echo.
echo ============================================
echo   Deploy concluído!
echo ============================================
echo.
echo Acesse: https://nutribot.local
echo Dashboard Traefik: http://traefik.nutribot.local:8080
echo.
echo Para ver logs: docker compose logs -f
echo Para parar: docker compose down
echo.
