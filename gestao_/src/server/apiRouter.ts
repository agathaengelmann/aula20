import { Router, Request, Response } from 'express';
import { funcionarioService } from './funcionarioService.ts';
import { validarCPFDetalhado, gerarCPFValido, formatarCPF } from '../utils/cpfValidator.ts';

export const apiRouter = Router();

// Rota de Login para Funcionário (CPF como nickname e senha 1234)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { cpf, senha } = req.body;

    if (!senha || senha.trim() !== '1234') {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Senha incorreta. A senha de acesso é 1234.'
      });
    }

    if (!cpf || typeof cpf !== 'string') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Por favor, informe o CPF do funcionário.'
      });
    }

    const detalhesCpf = validarCPFDetalhado(cpf);
    const cpfLimpo = detalhesCpf.cpfLimpo;

    if (!detalhesCpf.valido) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `CPF inválido: ${detalhesCpf.mensagem}`
      });
    }

    // Busca o funcionário correspondente ao CPF no banco
    let funcionario = funcionarioService.obterPorCpf(cpfLimpo);

    // Se o funcionário não existir mas o CPF for válido, cria um perfil de sessão para acesso imediato
    if (!funcionario) {
      const todos = funcionarioService.listar();
      funcionario = {
        id: 'func_session_' + Date.now().toString(36),
        nome: 'Funcionário ' + formatarCPF(cpfLimpo).slice(-6),
        cpf: cpfLimpo,
        cargo: 'Acesso Geral',
        criadoEm: new Date().toISOString()
      };
    }

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      dados: {
        funcionario,
        token: 'token_sessao_' + Date.now().toString(36)
      }
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro durante autenticação.' });
  }
});

// Lista funcionários disponíveis para preenchimento rápido no login
apiRouter.get('/auth/demo-users', (_req: Request, res: Response) => {
  try {
    const funcionarios = funcionarioService.listar().slice(0, 4).map(f => ({
      id: f.id,
      nome: f.nome,
      cpf: f.cpf,
      cargo: f.cargo
    }));
    res.json({ sucesso: true, dados: funcionarios });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao carregar usuários.' });
  }
});


// Listar funcionários (com suporte a busca por nome, cargo ou CPF)
apiRouter.get('/funcionarios', (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;
    const funcionarios = funcionarioService.listar(q);
    res.json({
      sucesso: true,
      dados: funcionarios,
      total: funcionarios.length
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao listar funcionários.' });
  }
});

// Obter funcionário por ID
apiRouter.get('/funcionarios/:id', (req: Request, res: Response) => {
  try {
    const funcionario = funcionarioService.obterPorId(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado.' });
    }
    res.json({ sucesso: true, dados: funcionario });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao buscar funcionário.' });
  }
});

// Criar funcionário (com validação estrita de CPF e unicidade)
apiRouter.post('/funcionarios', (req: Request, res: Response) => {
  try {
    const { nome, cpf, cargo, email, telefone } = req.body;
    const resultado = funcionarioService.criar({ nome, cpf, cargo, email, telefone });

    if (resultado.erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: resultado.erro
      });
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Funcionário cadastrado com sucesso!',
      dados: resultado.funcionario
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao cadastrar funcionário.' });
  }
});

// Atualizar funcionário
apiRouter.put('/funcionarios/:id', (req: Request, res: Response) => {
  try {
    const { nome, cpf, cargo, email, telefone } = req.body;
    const resultado = funcionarioService.atualizar(req.params.id, { nome, cpf, cargo, email, telefone });

    if (resultado.erro) {
      const status = resultado.erro.includes('não encontrado') ? 404 : 400;
      return res.status(status).json({
        sucesso: false,
        mensagem: resultado.erro
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Funcionário atualizado com sucesso!',
      dados: resultado.funcionario
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao atualizar funcionário.' });
  }
});

// Excluir funcionário
apiRouter.delete('/funcionarios/:id', (req: Request, res: Response) => {
  try {
    const removido = funcionarioService.remover(req.params.id);
    if (!removido) {
      return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado.' });
    }
    res.json({
      sucesso: true,
      mensagem: 'Funcionário removido com sucesso!'
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao excluir funcionário.' });
  }
});

// Endpoint exclusivo de validação de CPF (para testes do usuário ou integrações)
apiRouter.post('/validar-cpf', (req: Request, res: Response) => {
  try {
    const { cpf } = req.body;
    const detalhes = validarCPFDetalhado(cpf);
    res.json({
      sucesso: true,
      dados: {
        valido: detalhes.valido,
        mensagem: detalhes.mensagem,
        cpfFormatado: formatarCPF(detalhes.cpfLimpo),
        cpfLimpo: detalhes.cpfLimpo,
        digito1Esperado: detalhes.digito1Esperado,
        digito1Informado: detalhes.digito1Informado,
        digito2Esperado: detalhes.digito2Esperado,
        digito2Informado: detalhes.digito2Informado
      }
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao validar CPF.' });
  }
});

// Endpoint para gerar CPF válido de teste
apiRouter.get('/gerar-cpf', (_req: Request, res: Response) => {
  const cpfFormatado = gerarCPFValido(true);
  const cpfLimpo = cpfFormatado.replace(/\D/g, '');
  res.json({
    sucesso: true,
    cpfFormatado,
    cpfLimpo
  });
});

// Restaurar dados de exemplo
apiRouter.post('/funcionarios/seed', (_req: Request, res: Response) => {
  try {
    const dados = funcionarioService.resetarPadrao();
    res.json({
      sucesso: true,
      mensagem: 'Base de dados restaurada para dados iniciais de demonstração.',
      dados
    });
  } catch (error: any) {
    res.status(500).json({ sucesso: false, mensagem: error.message || 'Erro ao reiniciar dados.' });
  }
});
