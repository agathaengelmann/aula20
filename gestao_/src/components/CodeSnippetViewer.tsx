import React, { useState } from 'react';
import { Copy, Check, Code, Database, Server, Box, Layers, Terminal } from 'lucide-react';

export const CodeSnippetViewer: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'js' | 'dockerfile' | 'compose' | 'docker_sh' | 'sql' | 'backend'>('dockerfile');
  const [copiado, setCopiado] = useState(false);

  const codigoJS = `/**
 * Validação de CPF em JavaScript com cálculo dos dígitos verificadores (Módulo 11)
 * Atende às normas oficiais da Receita Federal do Brasil.
 * 
 * @param {string} cpf - O CPF a ser validado (ex: "123.456.789-09" ou "12345678909")
 * @returns {boolean} - true se o CPF for válido, false caso contrário
 */
function validarCPF(cpf) {
  // 1. Verifica se foi fornecido um valor válido do tipo string
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // 2. Remove pontuações e qualquer caractere não numérico
  const clean = cpf.replace(/\\D/g, '');

  // 3. O CPF deve possuir exatamente 11 dígitos numéricos
  if (clean.length !== 11) {
    return false;
  }

  // 4. Elimina CPFs conhecidos com todos os dígitos iguais (ex: "11111111111", "00000000000")
  if (/^(\\d)\\1{10}$/.test(clean)) {
    return false;
  }

  // 5. Cálculo do 1º Dígito Verificador (pesos de 10 a 2)
  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += parseInt(clean.charAt(i), 10) * (10 - i);
  }

  let digito1 = (soma1 * 10) % 11;
  if (digito1 === 10 || digito1 === 11) {
    digito1 = 0;
  }

  // Valida o primeiro dígito
  if (digito1 !== parseInt(clean.charAt(9), 10)) {
    return false;
  }

  // 6. Cálculo do 2º Dígito Verificador (pesos de 11 a 2)
  let soma2 = 0;
  for (let i = 0; i < 10; i++) {
    soma2 += parseInt(clean.charAt(i), 10) * (11 - i);
  }

  let digito2 = (soma2 * 10) % 11;
  if (digito2 === 10 || digito2 === 11) {
    digito2 = 0;
  }

  // Valida o segundo dígito
  if (digito2 !== parseInt(clean.charAt(10), 10)) {
    return false;
  }

  // CPF 100% válido
  return true;
}

// Exemplos de uso:
console.log(validarCPF("529.982.247-25")); // true (Válido)
console.log(validarCPF("52998224725"));     // true (Válido)
console.log(validarCPF("111.111.111-11")); // false (Dígitos repetidos)
console.log(validarCPF("529.982.247-00")); // false (Dígito verificador incorreto)
console.log(validarCPF("123.456"));        // false (Tamanho incorreto)`;

  const codigoDockerfile = `# ==============================================================================
# Dockerfile Multi-Stage para CRUD de Funcionários (Node.js 20 & Vite)
# ==============================================================================

# Estágio 1: Build do Frontend e Assets
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Imagem Final de Execução em Produção
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \\
    PORT=3000

# Diretório para persistência de dados
RUN mkdir -p /app/.data && chown -R node:node /app

COPY package.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copia arquivos compilados e arquivos do servidor
COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY src/server ./src/server
COPY src/utils ./src/utils
COPY src/types ./src/types
COPY database ./database

USER node
EXPOSE 3000

CMD ["npm", "start"]`;

  const codigoDockerCompose = `version: '3.8'

services:
  # Container do Banco de Dados PostgreSQL 16
  postgres:
    image: postgres:16-alpine
    container_name: funcionarios_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: funcionarios_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      # Executa automaticamente o script de criação de tabelas e seeds
      - ./database/schema.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d funcionarios_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - funcionarios_network

  # Container da Aplicação (Frontend React + Backend Express)
  meu-servico:
    build:
      context: ./pasta-do-servico
      dockerfile: Dockerfile
    container_name: meu_servico_app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      SQL_HOST: postgres
      SQL_PORT: 5432
      SQL_DB_NAME: funcionarios_db
      SQL_USER: postgres
      SQL_PASSWORD: postgrespassword
    volumes:
      - app_data:/app/.data
    networks:
      - funcionarios_network

volumes:
  postgres_data:
    driver: local
  app_data:
    driver: local

networks:
  funcionarios_network:
    driver: bridge`;

  const codigoDockerSh = `#!/usr/bin/env bash
# ==============================================================================
# Funções de Gerenciamento Docker (scripts/docker.sh)
# Permite subir, parar e monitorar a stack com 1 único comando
# ==============================================================================

set -e

# Função para iniciar todos os containers (Postgres + App)
docker_up() {
  echo "[+] Subindo PostgreSQL e Aplicação..."
  docker compose up -d --build
  echo "[✓] App online em: http://localhost:3000"
  echo "[✓] PostgreSQL online na porta: 5432"
}

# Função para parar os containers
docker_down() {
  echo "[-] Encerrando containers..."
  docker compose down
}

# Função para ver logs em tempo real
docker_logs() {
  docker compose logs -f
}

# Função para abrir o terminal SQL interativo no PostgreSQL
docker_psql() {
  docker compose exec -it postgres psql -U postgres -d funcionarios_db
}

# Função para verificar o status
docker_status() {
  docker compose ps
}

# Execução conforme argumento informado:
case "$1" in
  up) docker_up ;;
  down) docker_down ;;
  logs) docker_logs ;;
  psql) docker_psql ;;
  status) docker_status ;;
  *)
    echo "Uso: ./scripts/docker.sh {up|down|logs|psql|status}"
    ;;
esac`;

  const codigoSQL = `-- DDL PostgreSQL para o CRUD de Funcionários
-- Garante integridade referencial e unicidade do CPF

CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  cargo VARCHAR(120),
  email VARCHAR(255),
  telefone VARCHAR(25),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice único para busca instantânea e garantia de não-duplicação de CPF
CREATE UNIQUE INDEX IF NOT EXISTS idx_funcionarios_cpf ON funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_funcionarios_nome ON funcionarios(nome);

-- Trigger para manter atualizado_em sempre com a data/hora da última alteração
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_timestamp ON funcionarios;
CREATE TRIGGER trigger_atualizar_timestamp
BEFORE UPDATE ON funcionarios
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();`;

  const codigoBackend = `// Exemplo de Controller Express / Node.js
import express from 'express';
import { validarCPF } from './cpfValidator.js';

const app = express();
app.use(express.json());

// POST /api/funcionarios - Cria funcionário com validação prévia de CPF
app.post('/api/funcionarios', async (req, res) => {
  const { nome, cpf, cargo, email, telefone } = req.body;

  // 1. Validação básica de campos
  if (!nome || nome.trim().length < 2) {
    return res.status(400).json({ erro: 'Nome obrigatório (mínimo 2 caracteres).' });
  }

  // 2. Validação matemática do CPF
  if (!validarCPF(cpf)) {
    return res.status(400).json({ erro: 'CPF inválido no formato ou dígitos verificadores.' });
  }

  const cpfLimpo = cpf.replace(/\\D/g, '');

  try {
    // 3. Execução no PostgreSQL: INSERT com proteção contra duplicação
    const query = \`
      INSERT INTO funcionarios (nome, cpf, cargo, email, telefone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    \`;
    const values = [nome.trim(), cpfLimpo, cargo, email, telefone];
    const { rows } = await db.query(query, values);

    return res.status(201).json({ sucesso: true, dados: rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Erro de unicidade no Postgres (unique_violation)
      return res.status(409).json({ erro: 'Já existe um funcionário com este CPF.' });
    }
    return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados.' });
  }
});`;

  let textoParaCopiar = codigoDockerfile;
  if (abaAtiva === 'js') textoParaCopiar = codigoJS;
  else if (abaAtiva === 'compose') textoParaCopiar = codigoDockerCompose;
  else if (abaAtiva === 'docker_sh') textoParaCopiar = codigoDockerSh;
  else if (abaAtiva === 'sql') textoParaCopiar = codigoSQL;
  else if (abaAtiva === 'backend') textoParaCopiar = codigoBackend;

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoParaCopiar);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="bg-glass-card-elevated rounded-3xl border border-white/85 shadow-lg overflow-hidden">
      {/* Abas Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-2.5 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setAbaAtiva('dockerfile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'dockerfile'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            Dockerfile
          </button>

          <button
            onClick={() => setAbaAtiva('compose')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'compose'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            docker-compose.yml
          </button>

          <button
            onClick={() => setAbaAtiva('docker_sh')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'docker_sh'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Função Docker (docker.sh)
          </button>

          <button
            onClick={() => setAbaAtiva('js')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'js'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Função validarCPF (JS)
          </button>

          <button
            onClick={() => setAbaAtiva('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'sql'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            PostgreSQL (schema.sql)
          </button>

          <button
            onClick={() => setAbaAtiva('backend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              abaAtiva === 'backend'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Express Backend
          </button>
        </div>

        <button
          onClick={handleCopiar}
          className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
        >
          {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copiado ? 'Copiado!' : 'Copiar Código'}
        </button>
      </div>

      {/* Comandos Rápidos para Docker */}
      {(abaAtiva === 'dockerfile' || abaAtiva === 'compose' || abaAtiva === 'docker_sh') && (
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400">Comandos Docker prontos:</span>
            <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono text-[11px]">
              docker compose up -d
            </code>
            <span className="text-slate-500">•</span>
            <code className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono text-[11px]">
              npm run docker:up
            </code>
          </div>
          <span className="text-[11px] text-slate-400">
            PostgreSQL (5432) + App Node/React (3000)
          </span>
        </div>
      )}

      {/* Editor / Visualizador de Código */}
      <div className="bg-slate-950 p-5 overflow-x-auto max-h-[500px]">
        <pre className="font-mono text-xs text-slate-300 leading-relaxed">
          <code>{textoParaCopiar}</code>
        </pre>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span>
          {abaAtiva === 'dockerfile' && 'Dockerfile Multi-stage com otimização Alpine, Vite build e Node.js runtime.'}
          {abaAtiva === 'compose' && 'docker-compose.yml pronto com healthcheck do PostgreSQL e rede dedicada.'}
          {abaAtiva === 'docker_sh' && 'Funções shell com comandos up, down, logs, status e psql.'}
          {abaAtiva === 'js' && 'Validação pura compatível com Node.js e navegadores (ES6+).'}
          {abaAtiva === 'sql' && 'Script pronto para execução em instâncias PostgreSQL / Cloud SQL.'}
          {abaAtiva === 'backend' && 'Tratamento de status HTTP 201, 400 (validação) e 409 (duplicidade).'}
        </span>
        <span className="font-mono text-[11px] text-slate-500">UTF-8 • Docker & Shell</span>
      </div>
    </div>
  );
};
