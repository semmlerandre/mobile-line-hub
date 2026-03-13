@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  Deploy Script - Sistema de Controle de Linhas Moveis
REM  Compativel com Windows
REM ============================================================

set REPO_URL=https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
set PROJECT_DIR=controle-linhas-moveis
set PORT_RANGE_START=3000
set PORT_RANGE_END=9000

REM ---- Pre-flight checks ----
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker nao encontrado. Instale o Docker Desktop.
    exit /b 1
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Git nao encontrado. Instale o Git.
    exit /b 1
)

docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker Compose nao encontrado.
    exit /b 1
)

echo [OK] Docker e Git verificados com sucesso

REM ---- Clone or update ----
if exist "%PROJECT_DIR%" (
    echo [!] Projeto ja existe. Atualizando...
    cd "%PROJECT_DIR%"
    git pull --ff-only || (git fetch origin && git reset --hard origin/main)
) else (
    echo [OK] Clonando repositorio...
    git clone %REPO_URL% %PROJECT_DIR%
    cd "%PROJECT_DIR%"
)

REM ---- Find free port ----
set APP_PORT=0

REM Check existing .env first
if exist .env (
    for /f "tokens=2 delims==" %%a in ('findstr "APP_PORT" .env') do set APP_PORT=%%a
)

if "!APP_PORT!"=="0" (
    for /l %%p in (%PORT_RANGE_START%,1,%PORT_RANGE_END%) do (
        if "!APP_PORT!"=="0" (
            netstat -an | findstr ":%%p " >nul 2>&1
            if !errorlevel! neq 0 (
                set APP_PORT=%%p
            )
        )
    )
)

if "!APP_PORT!"=="0" (
    echo [X] Nenhuma porta livre encontrada
    exit /b 1
)

echo [OK] Porta: !APP_PORT!

REM ---- Generate .env ----
set DB_PASSWORD=senha_segura_gerada

if exist .env (
    for /f "tokens=2 delims==" %%a in ('findstr "DB_PASSWORD" .env') do set DB_PASSWORD=%%a
)

(
echo APP_PORT=!APP_PORT!
echo DB_HOST=db
echo DB_PORT=5432
echo DB_NAME=controle_linhas
echo DB_USER=appuser
echo DB_PASSWORD=!DB_PASSWORD!
) > .env

echo [OK] Arquivo .env criado/atualizado

REM ---- Build and start ----
echo [OK] Construindo e iniciando containers...
docker compose up -d --build

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Sistema instalado com sucesso!
echo ========================================
echo.
echo   Aplicacao rodando em:
echo.
echo   http://localhost:!APP_PORT!
echo.
echo   Porta: !APP_PORT!
echo.
echo ========================================
echo.
echo   Para atualizar: deploy.bat
echo   Para ver logs:  docker compose logs -f
echo   Para parar:     docker compose down
echo.
