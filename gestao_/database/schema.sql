-- ==============================================================================
-- Schema SQL para PostgreSQL - Sistema de Gestão de Funcionários
-- ==============================================================================

-- Criação da tabela de funcionários com restrição UNIQUE no CPF
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

-- Índices para otimização de consultas
CREATE UNIQUE INDEX IF NOT EXISTS idx_funcionarios_cpf ON funcionarios(cpf);
CREATE INDEX IF NOT EXISTS idx_funcionarios_nome ON funcionarios(nome);

-- Função e Trigger para atualização automática da coluna atualizado_em
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
EXECUTE FUNCTION atualizar_timestamp();

-- Exemplos de inserção inicial com CPFs válidos
INSERT INTO funcionarios (nome, cpf, cargo, email, telefone)
VALUES 
  ('Carlos Alberto da Silva', '52998224725', 'Desenvolvedor Full Stack', 'carlos.silva@empresa.com.br', '(11) 98765-4321'),
  ('Mariana Souza Santos', '42598317804', 'Analista de Recursos Humanos', 'mariana.santos@empresa.com.br', '(21) 97654-3210'),
  ('Lucas Ferreira Lima', '84029415890', 'Gerente de Projetos', 'lucas.lima@empresa.com.br', '(31) 99123-4567')
ON CONFLICT (cpf) DO NOTHING;
