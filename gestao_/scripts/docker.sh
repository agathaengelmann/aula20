#!/usr/bin/env bash

# ==============================================================================
# Funções de Gerenciamento Docker para o CRUD de Funcionários e PostgreSQL
# ==============================================================================

set -e

# Cores para feedback no terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function show_help() {
  echo -e "${BLUE}=== Gestor Docker - CRUD de Funcionários & PostgreSQL ===${NC}"
  echo "Uso: ./scripts/docker.sh [comando]"
  echo ""
  echo "Comandos disponíveis:"
  echo "  up        - Constrói as imagens e inicia os containers (App + PostgreSQL) em segundo plano"
  echo "  down      - Para e remove todos os containers da aplicação"
  echo "  build     - Reconstrói a imagem Docker da aplicação sem iniciar"
  echo "  logs      - Exibe os logs em tempo real dos containers"
  echo "  status    - Exibe o status e consumo dos containers em execução"
  echo "  psql      - Conecta ao terminal interativo psql do PostgreSQL dentro do container"
  echo "  restart   - Reinicia os containers"
  echo "  clean     - Remove containers, imagens e volumes associados"
  echo ""
}

function docker_up() {
  echo -e "${GREEN}[+] Iniciando containers (PostgreSQL + App)...${NC}"
  docker compose up -d --build
  echo -e "${GREEN}[✓] Aplicação disponível em: http://localhost:3000${NC}"
  echo -e "${GREEN}[✓] Banco PostgreSQL disponível na porta: 5432${NC}"
}

function docker_down() {
  echo -e "${YELLOW}[-] Parando containers...${NC}"
  docker compose down
  echo -e "${GREEN}[✓] Containers finalizados com sucesso.${NC}"
}

function docker_build() {
  echo -e "${BLUE}[*] Construindo imagem Docker da aplicação...${NC}"
  docker compose build
  echo -e "${GREEN}[✓] Build concluído!${NC}"
}

function docker_logs() {
  echo -e "${BLUE}[*] Exibindo logs (Pressione Ctrl+C para sair)...${NC}"
  docker compose logs -f
}

function docker_status() {
  echo -e "${BLUE}=== Status dos Containers ===${NC}"
  docker compose ps
}

function docker_psql() {
  echo -e "${BLUE}[*] Conectando ao PostgreSQL (banco: funcionarios_db)...${NC}"
  docker compose exec -it postgres psql -U postgres -d funcionarios_db
}

function docker_restart() {
  echo -e "${YELLOW}[*] Reiniciando containers...${NC}"
  docker compose restart
  echo -e "${GREEN}[✓] Containers reiniciados.${NC}"
}

function docker_clean() {
  echo -e "${RED}[!] Atenção: Isso removerá todos os dados do banco de dados e imagens.${NC}"
  read -p "Deseja continuar? (s/N): " confirm
  if [[ "$confirm" =~ ^[sS]$ ]]; then
    docker compose down -v --rmi all --remove-orphans
    echo -e "${GREEN}[✓] Limpeza completa executada.${NC}"
  else
    echo "Operação cancelada."
  fi
}

# Roteador de comandos
case "$1" in
  up)
    docker_up
    ;;
  down)
    docker_down
    ;;
  build)
    docker_build
    ;;
  logs)
    docker_logs
    ;;
  status)
    docker_status
    ;;
  psql)
    docker_psql
    ;;
  restart)
    docker_restart
    ;;
  clean)
    docker_clean
    ;;
  *)
    show_help
    ;;
esac
