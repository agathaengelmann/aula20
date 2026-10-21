import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Calculator, 
  Code2, 
  Database, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2,
  Calendar,
  Mail,
  Phone,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Funcionario, CriarFuncionarioDTO } from './types/funcionario.ts';
import { formatarCPF } from './utils/cpfValidator.ts';
import { FuncionarioModal } from './components/FuncionarioModal.tsx';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal.tsx';
import { CpfTester } from './components/CpfTester.tsx';
import { CodeSnippetViewer } from './components/CodeSnippetViewer.tsx';
import { NotificationToast, ToastMessage } from './components/NotificationToast.tsx';
import { LoginPage } from './components/LoginPage.tsx';

export default function App() {
  // Controle de Sessão do Funcionário
  const [usuarioLogado, setUsuarioLogado] = useState<Funcionario | null>(() => {
    try {
      const salvo = sessionStorage.getItem('funcionario_sessao');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'lista' | 'validador' | 'codigo'>('lista');

  // Modais
  const [modalFuncionarioAberto, setModalFuncionarioAberto] = useState(false);
  const [funcionarioParaEditar, setFuncionarioParaEditar] = useState<Funcionario | null>(null);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<Funcionario | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);

  // Notificações Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [cpfCopiadoId, setCpfCopiadoId] = useState<string | null>(null);

  const adicionarToast = (tipo: ToastMessage['tipo'], texto: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, tipo, texto }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removerToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (funcionario: Funcionario, token: string) => {
    sessionStorage.setItem('funcionario_sessao', JSON.stringify(funcionario));
    sessionStorage.setItem('auth_token', token);
    setUsuarioLogado(funcionario);
    adicionarToast('sucesso', `Acesso liberado! Bem-vindo(a), ${funcionario.nome}.`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('funcionario_sessao');
    sessionStorage.removeItem('auth_token');
    setUsuarioLogado(null);
    adicionarToast('info', 'Sessão encerrada com sucesso.');
  };

  // Carregar lista de funcionários do backend
  const carregarFuncionarios = async (termoBusca?: string) => {
    try {
      setIsLoading(true);
      const url = termoBusca ? `/api/funcionarios?q=${encodeURIComponent(termoBusca)}` : '/api/funcionarios';
      const res = await fetch(url);
      const data = await res.json();
      if (data.sucesso && Array.isArray(data.dados)) {
        setFuncionarios(data.dados);
      } else {
        adicionarToast('erro', data.mensagem || 'Falha ao carregar funcionários.');
      }
    } catch (err: any) {
      console.error('Erro na requisição:', err);
      adicionarToast('erro', 'Erro de conexão com o servidor da API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioLogado) {
      const delayDebounceFn = setTimeout(() => {
        carregarFuncionarios(busca);
      }, 250);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [busca, usuarioLogado]);

  // Salvar (Criar ou Atualizar)
  const handleSalvarFuncionario = async (dados: CriarFuncionarioDTO, id?: string): Promise<boolean> => {
    try {
      const url = id ? `/api/funcionarios/${id}` : '/api/funcionarios';
      const metodo = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const json = await res.json();

      if (!res.ok || !json.sucesso) {
        throw new Error(json.mensagem || 'Não foi possível salvar o funcionário.');
      }

      adicionarToast('sucesso', json.mensagem || (id ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!'));
      await carregarFuncionarios(busca);
      return true;
    } catch (error: any) {
      adicionarToast('erro', error.message || 'Erro ao processar requisição.');
      return false;
    }
  };

  // Excluir funcionário
  const handleConfirmarExclusao = async () => {
    if (!funcionarioParaExcluir) return;

    try {
      setIsExcluindo(true);
      const res = await fetch(`/api/funcionarios/${funcionarioParaExcluir.id}`, {
        method: 'DELETE'
      });
      const json = await res.json();

      if (!res.ok || !json.sucesso) {
        throw new Error(json.mensagem || 'Falha ao excluir funcionário.');
      }

      adicionarToast('sucesso', `Funcionário ${funcionarioParaExcluir.nome} removido.`);
      setModalExcluirAberto(false);
      setFuncionarioParaExcluir(null);
      await carregarFuncionarios(busca);
    } catch (error: any) {
      adicionarToast('erro', error.message || 'Erro ao excluir funcionário.');
    } finally {
      setIsExcluindo(false);
    }
  };

  // Restaurar dados padrão de exemplo
  const handleRestaurarPadrao = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/funcionarios/seed', { method: 'POST' });
      const json = await res.json();
      if (json.sucesso) {
        adicionarToast('info', 'Banco restaurado com exemplos e CPFs válidos.');
        setBusca('');
        setFuncionarios(json.dados || []);
      }
    } catch (e: any) {
      adicionarToast('erro', 'Erro ao resetar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopiarCpf = (cpf: string, id: string) => {
    navigator.clipboard.writeText(formatarCPF(cpf));
    setCpfCopiadoId(id);
    setTimeout(() => setCpfCopiadoId(null), 2000);
  };

  const abrirModalCriar = () => {
    setFuncionarioParaEditar(null);
    setModalFuncionarioAberto(true);
  };

  const abrirModalEditar = (func: Funcionario) => {
    setFuncionarioParaEditar(func);
    setModalFuncionarioAberto(true);
  };

  const abrirModalExcluir = (func: Funcionario) => {
    setFuncionarioParaExcluir(func);
    setModalExcluirAberto(true);
  };

  // Se o usuário ainda não estiver logado, exibe a página de login com efeito de glass e furta-cor
  if (!usuarioLogado) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <NotificationToast toasts={toasts} onRemove={removerToast} />
      </>
    );
  }

  const iniciaisIniciaisLogado = usuarioLogado.nome
    ? usuarioLogado.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'FN';

  return (
    <div className="min-h-screen bg-iridescent-metallic text-slate-900 flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Orbes de luz ambiente furta-cor para harmonia visual */}
      <div className="fixed -top-24 -left-24 w-96 h-96 rounded-full orb-iridescent-1 pointer-events-none" />
      <div className="fixed top-1/2 -right-24 w-96 h-96 rounded-full orb-iridescent-2 pointer-events-none" />
      <div className="fixed -bottom-24 left-1/3 w-96 h-96 rounded-full orb-iridescent-3 pointer-events-none" />

      {/* Barra de Navegação Superior Glassmorphism */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo / Título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl btn-metallic-iridescent flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-slate-800 text-base sm:text-lg leading-tight tracking-tight">
                    Gestão de Funcionários
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-indigo-700 border border-white/90 shadow-2xs">
                    PostgreSQL Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  CRUD de Funcionários (Nome & CPF) • Validação Módulo 11
                </p>
              </div>
            </div>

            {/* Perfil do Funcionário Autenticado & Ações */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Badge do Usuário Logado */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/75 border border-white/90 shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  {iniciaisIniciaisLogado}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                    {usuarioLogado.nome}
                  </div>
                  <div className="text-[10px] font-mono text-indigo-600 font-semibold leading-tight mt-0.5">
                    {formatarCPF(usuarioLogado.cpf)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleRestaurarPadrao}
                className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-white/80 rounded-xl transition-all border border-white/60 flex items-center gap-1.5"
                title="Restaurar funcionários de demonstração"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Restaurar Exemplos</span>
              </button>

              <button
                onClick={abrirModalCriar}
                className="px-4 py-2 btn-metallic-iridescent text-white font-bold text-xs sm:text-sm rounded-xl transition-all hover:opacity-95 active:scale-95 shadow-sm flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Funcionário</span>
              </button>

              {/* Botão de Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors border border-white/60"
                title="Sair do sistema (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="flex items-center gap-1 border-t border-white/60 pt-1 -mb-px overflow-x-auto">
            <button
              onClick={() => setAbaAtiva('lista')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                abaAtiva === 'lista'
                  ? 'border-indigo-600 text-indigo-700 bg-white/70 rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Funcionários</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono font-bold">
                {funcionarios.length}
              </span>
            </button>

            <button
              onClick={() => setAbaAtiva('validador')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                abaAtiva === 'validador'
                  ? 'border-indigo-600 text-indigo-700 bg-white/70 rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Laboratório & Módulo 11</span>
            </button>

            <button
              onClick={() => setAbaAtiva('codigo')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                abaAtiva === 'codigo'
                  ? 'border-indigo-600 text-indigo-700 bg-white/70 rounded-t-xl shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Docker, Código & SQL</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6 relative z-10">
        {/* Banner Glassmorphism com reflexo furta-cor suave */}
        <div className="bg-glass-card-elevated rounded-3xl p-5 shadow-lg border border-white/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-100/80 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                  Validação Oficial de CPF & Backend Conectado
                </h2>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Cada cadastro passa pela validação estrita da Receita Federal: verificação de 11 dígitos numéricos,
                rejeição de sequências repetidas e cálculo dos 2 dígitos verificadores via Módulo 11.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-white/80 px-3 py-1.5 rounded-2xl border border-white/90 text-xs flex items-center gap-2 shadow-2xs">
                <Database className="w-4 h-4 text-indigo-500" />
                <span className="font-mono text-[11px] text-slate-700 font-semibold">database/schema.sql</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualização da Lista de Funcionários */}
        {abaAtiva === 'lista' && (
          <div className="space-y-4">
            {/* Barra de Busca e Filtros em Vidro */}
            <div className="bg-glass-card p-4 rounded-3xl border border-white/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por nome, cargo ou CPF..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-2xl bg-glass-input border border-white/90 focus:ring-2 focus:ring-indigo-300/50 outline-none transition-all text-slate-800 placeholder-slate-400"
                />
                {busca && (
                  <button
                    onClick={() => setBusca('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-600 font-medium">
                <span>
                  Exibindo <strong className="text-slate-900">{funcionarios.length}</strong> funcionário{funcionarios.length === 1 ? '' : 's'}
                </span>
                {busca && (
                  <button
                    onClick={() => setBusca('')}
                    className="text-indigo-600 hover:underline ml-2 font-semibold"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
            </div>

            {/* Tabela de Funcionários com Efeito Glassmorphism */}
            <div className="bg-glass-card-elevated rounded-3xl border border-white/80 shadow-md overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium">Carregando dados dos funcionários...</p>
                </div>
              ) : funcionarios.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-slate-400 mx-auto shadow-xs border border-white/80">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Nenhum funcionário encontrado</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {busca
                      ? `Não foram encontrados registros para o termo "${busca}". Tente outra busca.`
                      : 'Nenhum funcionário cadastrado no momento. Cadastre o primeiro ou restaure os dados de exemplo.'}
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    {busca ? (
                      <button
                        onClick={() => setBusca('')}
                        className="px-4 py-2 bg-white/80 hover:bg-white rounded-xl text-xs font-bold text-slate-700 transition-colors border border-white/90"
                      >
                        Limpar Busca
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={abrirModalCriar}
                          className="px-4 py-2 btn-metallic-iridescent text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Cadastrar Funcionário
                        </button>
                        <button
                          onClick={handleRestaurarPadrao}
                          className="px-4 py-2 bg-white/80 hover:bg-white rounded-xl text-xs font-bold text-slate-700 transition-colors border border-white/90"
                        >
                          Restaurar Exemplos
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/60 border-b border-white/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-4 px-4 sm:px-6">Funcionário</th>
                        <th className="py-4 px-4">CPF (Validado)</th>
                        <th className="py-4 px-4 hidden md:table-cell">Cargo</th>
                        <th className="py-4 px-4 hidden lg:table-cell">Contatos</th>
                        <th className="py-4 px-4 hidden sm:table-cell">Cadastro</th>
                        <th className="py-4 px-4 sm:px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/60 text-sm">
                      {funcionarios.map((func) => {
                        const iniciais = func.nome
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        const isEuMesmo = usuarioLogado?.cpf && formatarCPF(usuarioLogado.cpf) === formatarCPF(func.cpf);

                        return (
                          <tr
                            key={func.id}
                            className={`hover:bg-white/60 transition-colors group ${
                              isEuMesmo ? 'bg-indigo-50/40' : ''
                            }`}
                          >
                            {/* Nome + Avatar */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500/90 to-pink-500/90 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {iniciais}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    <span>{func.nome}</span>
                                    {isEuMesmo && (
                                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-semibold border border-indigo-200">
                                        Você
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 md:hidden mt-0.5">
                                    {func.cargo || 'Cargo não informado'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* CPF com máscara e cópia */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-slate-800 bg-white/80 px-2.5 py-1 rounded-xl border border-white/90 shadow-2xs">
                                  {formatarCPF(func.cpf)}
                                </span>
                                <button
                                  onClick={() => handleCopiarCpf(func.cpf, func.id)}
                                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-white/80 transition-colors"
                                  title="Copiar CPF"
                                >
                                  {cpfCopiadoId === func.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Cargo */}
                            <td className="py-3.5 px-4 hidden md:table-cell">
                              {func.cargo ? (
                                <span className="text-xs font-semibold text-slate-700">
                                  {func.cargo}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Não informado
                                </span>
                              )}
                            </td>

                            {/* Contatos */}
                            <td className="py-3.5 px-4 hidden lg:table-cell">
                              <div className="space-y-0.5 text-xs">
                                {func.email && (
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{func.email}</span>
                                  </div>
                                )}
                                {func.telefone && (
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{func.telefone}</span>
                                  </div>
                                )}
                                {!func.email && !func.telefone && (
                                  <span className="text-slate-400 italic">Sem contato</span>
                                )}
                              </div>
                            </td>

                            {/* Data de Cadastro */}
                            <td className="py-3.5 px-4 hidden sm:table-cell">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {new Date(func.criadoEm).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </td>

                            {/* Ações */}
                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => abrirModalEditar(func)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white/90 transition-colors"
                                  title="Editar dados"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => abrirModalExcluir(func)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Excluir funcionário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba de Validador Interativo */}
        {abaAtiva === 'validador' && <CpfTester />}

        {/* Aba de Código Fonte e SQL */}
        {abaAtiva === 'codigo' && <CodeSnippetViewer />}
      </main>

      {/* Rodapé Glassmorphism */}
      <footer className="mt-auto bg-white/60 backdrop-blur-md border-t border-white/80 py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>CRUD de Funcionários • Node.js, Express, React e PostgreSQL</div>
          <div className="font-mono text-[11px] text-slate-400">
            Design Metalizado Furta-cor • Módulo 11 da Receita Federal
          </div>
        </div>
      </footer>

      {/* Modais */}
      <FuncionarioModal
        isOpen={modalFuncionarioAberto}
        onClose={() => setModalFuncionarioAberto(false)}
        onSave={handleSalvarFuncionario}
        funcionarioParaEditar={funcionarioParaEditar}
      />

      <ConfirmDeleteModal
        isOpen={modalExcluirAberto}
        funcionario={funcionarioParaExcluir}
        onClose={() => {
          setModalExcluirAberto(false);
          setFuncionarioParaExcluir(null);
        }}
        onConfirm={handleConfirmarExclusao}
        isLoading={isExcluindo}
      />

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onRemove={removerToast} />
    </div>
  );
}
