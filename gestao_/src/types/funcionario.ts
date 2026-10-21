export interface Funcionario {
  id: string;
  nome: string;
  cpf: string; // formato limpo ou formatado (exibido com máscara)
  cargo?: string;
  email?: string;
  telefone?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface CriarFuncionarioDTO {
  nome: string;
  cpf: string;
  cargo?: string;
  email?: string;
  telefone?: string;
}

export interface AtualizarFuncionarioDTO {
  nome?: string;
  cpf?: string;
  cargo?: string;
  email?: string;
  telefone?: string;
}

export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erros?: string[];
}
