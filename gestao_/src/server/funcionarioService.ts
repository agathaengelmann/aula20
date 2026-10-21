import { Funcionario, CriarFuncionarioDTO, AtualizarFuncionarioDTO } from '../types/funcionario.ts';
import { validarCPF, limparCPF, formatarCPF, validarCPFDetalhado } from '../utils/cpfValidator.ts';
import * as fs from 'fs';
import * as path from 'path';

// Arquivo local para persistência de dados em desenvolvimento
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'funcionarios.json');

// Dados iniciais com CPFs matematicamente válidos
const FUNCIONARIOS_INICIAIS: Funcionario[] = [
  {
    id: 'f101-uuid-001',
    nome: 'Carlos Alberto da Silva',
    cpf: '52998224725',
    cargo: 'Desenvolvedor Full Stack Sênior',
    email: 'carlos.silva@empresa.com.br',
    telefone: '(11) 98765-4321',
    criadoEm: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'f102-uuid-002',
    nome: 'Mariana Souza Santos',
    cpf: '42598317804',
    cargo: 'Analista de Recursos Humanos',
    email: 'mariana.santos@empresa.com.br',
    telefone: '(21) 97654-3210',
    criadoEm: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'f103-uuid-003',
    nome: 'Lucas Ferreira Lima',
    cpf: '84029415890',
    cargo: 'Gerente de Produtos',
    email: 'lucas.lima@empresa.com.br',
    telefone: '(31) 99123-4567',
    criadoEm: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'f104-uuid-004',
    nome: 'Beatriz Mendes de Oliveira',
    cpf: '29871032890',
    cargo: 'Engenheira de DevOps',
    email: 'beatriz.oliveira@empresa.com.br',
    telefone: '(41) 98877-6655',
    criadoEm: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

class FuncionarioService {
  private funcionarios: Funcionario[] = [];

  constructor() {
    this.carregarDados();
  }

  private carregarDados() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const conteudo = fs.readFileSync(DATA_FILE, 'utf-8');
        this.funcionarios = JSON.parse(conteudo);
      } else {
        this.funcionarios = [...FUNCIONARIOS_INICIAIS];
        this.salvarDados();
      }
    } catch (e) {
      console.warn('Usando armazenamento em memória para funcionários:', e);
      this.funcionarios = [...FUNCIONARIOS_INICIAIS];
    }
  }

  private salvarDados() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.funcionarios, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Não foi possível persistir em arquivo local, mantendo em memória:', e);
    }
  }

  public listar(busca?: string): Funcionario[] {
    let lista = [...this.funcionarios];
    if (busca && busca.trim()) {
      const termo = busca.trim().toLowerCase();
      const termoDigitos = busca.replace(/\D/g, '');
      lista = lista.filter(f => {
        const matchNome = f.nome.toLowerCase().includes(termo);
        const matchCargo = f.cargo?.toLowerCase().includes(termo) ?? false;
        const matchEmail = f.email?.toLowerCase().includes(termo) ?? false;
        const matchCpf = termoDigitos ? f.cpf.includes(termoDigitos) : f.cpf.includes(termo);
        return matchNome || matchCargo || matchEmail || matchCpf;
      });
    }
    // Ordenar pelos mais recentes primeiro
    return lista.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  }

  public obterPorId(id: string): Funcionario | undefined {
    return this.funcionarios.find(f => f.id === id);
  }

  public obterPorCpf(cpf: string): Funcionario | undefined {
    const cpfLimpo = limparCPF(cpf);
    return this.funcionarios.find(f => limparCPF(f.cpf) === cpfLimpo);
  }

  public criar(dados: CriarFuncionarioDTO): { funcionario?: Funcionario; erro?: string } {
    if (!dados.nome || dados.nome.trim().length < 2) {
      return { erro: 'O nome do funcionário é obrigatório e deve ter no mínimo 2 caracteres.' };
    }

    if (!dados.cpf || !dados.cpf.trim()) {
      return { erro: 'O CPF é obrigatório.' };
    }

    const validacao = validarCPFDetalhado(dados.cpf);
    if (!validacao.valido) {
      return { erro: `CPF inválido: ${validacao.mensagem}` };
    }

    const cpfLimpo = validacao.cpfLimpo;

    // Verificar unicidade de CPF
    const jaExiste = this.obterPorCpf(cpfLimpo);
    if (jaExiste) {
      return { erro: `Já existe um funcionário cadastrado com este CPF (${formatarCPF(cpfLimpo)}): ${jaExiste.nome}.` };
    }

    const novoFuncionario: Funcionario = {
      id: 'func_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
      nome: dados.nome.trim(),
      cpf: cpfLimpo,
      cargo: dados.cargo?.trim() || undefined,
      email: dados.email?.trim() || undefined,
      telefone: dados.telefone?.trim() || undefined,
      criadoEm: new Date().toISOString()
    };

    this.funcionarios.unshift(novoFuncionario);
    this.salvarDados();

    return { funcionario: novoFuncionario };
  }

  public atualizar(id: string, dados: AtualizarFuncionarioDTO): { funcionario?: Funcionario; erro?: string } {
    const index = this.funcionarios.findIndex(f => f.id === id);
    if (index === -1) {
      return { erro: 'Funcionário não encontrado.' };
    }

    const funcionarioAtual = this.funcionarios[index];

    if (dados.nome !== undefined) {
      if (dados.nome.trim().length < 2) {
        return { erro: 'O nome do funcionário deve ter no mínimo 2 caracteres.' };
      }
    }

    let cpfLimpo = funcionarioAtual.cpf;
    if (dados.cpf !== undefined && dados.cpf.trim() !== '') {
      const validacao = validarCPFDetalhado(dados.cpf);
      if (!validacao.valido) {
        return { erro: `CPF inválido: ${validacao.mensagem}` };
      }
      cpfLimpo = validacao.cpfLimpo;

      // Verificar unicidade do CPF se foi alterado
      const existente = this.obterPorCpf(cpfLimpo);
      if (existente && existente.id !== id) {
        return { erro: `Este CPF (${formatarCPF(cpfLimpo)}) já está em uso por outro funcionário (${existente.nome}).` };
      }
    }

    const funcionarioAtualizado: Funcionario = {
      ...funcionarioAtual,
      nome: dados.nome !== undefined ? dados.nome.trim() : funcionarioAtual.nome,
      cpf: cpfLimpo,
      cargo: dados.cargo !== undefined ? (dados.cargo.trim() || undefined) : funcionarioAtual.cargo,
      email: dados.email !== undefined ? (dados.email.trim() || undefined) : funcionarioAtual.email,
      telefone: dados.telefone !== undefined ? (dados.telefone.trim() || undefined) : funcionarioAtual.telefone,
      atualizadoEm: new Date().toISOString()
    };

    this.funcionarios[index] = funcionarioAtualizado;
    this.salvarDados();

    return { funcionario: funcionarioAtualizado };
  }

  public remover(id: string): boolean {
    const index = this.funcionarios.findIndex(f => f.id === id);
    if (index === -1) return false;

    this.funcionarios.splice(index, 1);
    this.salvarDados();
    return true;
  }

  public resetarPadrao(): Funcionario[] {
    this.funcionarios = [...FUNCIONARIOS_INICIAIS];
    this.salvarDados();
    return this.funcionarios;
  }
}

export const funcionarioService = new FuncionarioService();
