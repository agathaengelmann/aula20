import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2,
  KeyRound
} from 'lucide-react';
import { formatarCPF, limparCPF, validarCPFDetalhado, gerarCPFValido } from '../utils/cpfValidator.ts';
import { Funcionario } from '../types/funcionario.ts';

interface LoginPageProps {
  onLoginSuccess: (funcionario: Funcionario, token: string) => void;
}

interface DemoUser {
  id: string;
  nome: string;
  cpf: string;
  cargo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [cpf, setCpf] = useState('529.982.247-25');
  const [senha, setSenha] = useState('1234');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  // Carregar funcionários disponíveis para o preenchimento rápido
  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso && Array.isArray(data.dados)) {
          setDemoUsers(data.dados);
        }
      })
      .catch(() => {});
  }, []);

  const validacaoCpf = cpf.trim() ? validarCPFDetalhado(cpf) : null;
  const cpfValido = validacaoCpf ? validacaoCpf.valido : false;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatarCPF(e.target.value));
    setErro(null);
  };

  const preencherUsuario = (userCpf: string) => {
    setCpf(formatarCPF(userCpf));
    setSenha('1234');
    setErro(null);
  };

  const handleGerarCpfValido = () => {
    const novo = gerarCPFValido(true);
    setCpf(novo);
    setSenha('1234');
    setErro(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!cpf.trim()) {
      setErro('Por favor, informe o CPF como nickname.');
      return;
    }

    if (!cpfValido) {
      setErro(validacaoCpf?.mensagem || 'O CPF informado não possui formato ou dígitos verificadores válidos.');
      return;
    }

    if (senha.trim() !== '1234') {
      setErro('Senha incorreta. Utilize a senha padrão do sistema: 1234');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: limparCPF(cpf),
          senha: senha.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        throw new Error(data.mensagem || 'Falha ao autenticar.');
      }

      onLoginSuccess(data.dados.funcionario, data.dados.token);
    } catch (err: any) {
      setErro(err.message || 'Erro de conexão ou autenticação.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-iridescent-metallic relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Orbes de luz furta-cor metálicos flutuantes no fundo */}
      <div className="absolute top-12 left-10 w-96 h-96 rounded-full orb-iridescent-1 animate-float pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full orb-iridescent-2 animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full orb-iridescent-3 pointer-events-none" />

      {/* Cartão Central Glassmorphism Elevado */}
      <div className="relative z-10 w-full max-w-md bg-glass-card-elevated rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300">
        
        {/* Insígnia Furta-cor e Título */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 rounded-2xl bg-white/80 shadow-md shadow-indigo-100/60 border border-white/90 mb-3 relative group">
            <div className="w-12 h-12 rounded-xl btn-metallic-iridescent flex items-center justify-center text-white shadow-inner">
              <Building2 className="w-6 h-6 drop-shadow-sm" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Portal do Funcionário
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Acesso ao sistema com autenticação por CPF
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/70 text-slate-700 border border-white/90 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Validação Criptográfica Módulo 11</span>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{erro}</div>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo CPF (Nickname) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                CPF (Nickname)
              </label>
              
              <button
                type="button"
                onClick={handleGerarCpfValido}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 hover:underline transition-all"
                title="Gera um CPF matematicamente válido para testes rápidos"
              >
                <Sparkles className="w-3 h-3 text-pink-500" />
                Gerar CPF
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={14}
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className={`w-full pl-4 pr-10 py-3 rounded-2xl bg-glass-input font-mono text-sm outline-none transition-all ${
                  cpf.trim().length === 0
                    ? 'border border-white/80 focus:ring-2 focus:ring-indigo-300/50'
                    : cpfValido
                    ? 'border-emerald-500/80 bg-emerald-50/30 text-slate-900 focus:ring-2 focus:ring-emerald-200'
                    : 'border-rose-400 bg-rose-50/30 text-slate-900 focus:ring-2 focus:ring-rose-200'
                }`}
              />
              {cpf.trim().length > 0 && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {cpfValido ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              )}
            </div>

            {validacaoCpf && cpf.trim().length > 0 && (
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className={validacaoCpf.valido ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                  {validacaoCpf.valido ? '✓ Formato e dígitos verificadores válidos' : `✗ ${validacaoCpf.mensagem}`}
                </span>
              </div>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Senha de Acesso
              </label>

              <span className="text-[11px] font-semibold text-slate-500 bg-white/70 px-2 py-0.5 rounded-md border border-white/80">
                Padrão: <strong className="text-indigo-600 font-mono">1234</strong>
              </span>
            </div>

            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro(null);
                }}
                placeholder="Digite 1234"
                className="w-full pl-4 pr-11 py-3 rounded-2xl bg-glass-input border border-white/80 font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-300/50 transition-all text-slate-800"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botão de Entrar com Estilo Furta-cor Metálico */}
          <button
            type="submit"
            disabled={carregando || !cpfValido}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 group ${
              carregando || !cpfValido
                ? 'bg-slate-300 cursor-not-allowed opacity-75'
                : 'btn-metallic-iridescent hover:opacity-95 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {carregando ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Separador e Usuários de Demonstração / Preenchimento com 1 Clique */}
        <div className="mt-6 pt-5 border-t border-white/70">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3 h-3 text-indigo-500" />
            Entrada Rápida com Funcionários Cadastrados:
          </p>

          <div className="grid grid-cols-1 gap-1.5">
            {demoUsers.length > 0 ? (
              demoUsers.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => preencherUsuario(u.cpf)}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 text-left transition-all hover:scale-[1.01] group text-xs"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-600 block truncate">
                      {u.nome}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {u.cargo || 'Funcionário'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100/70 shrink-0 ml-2">
                    {formatarCPF(u.cpf)}
                  </span>
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => preencherUsuario('52998224725')}
                className="p-2 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 text-xs text-left transition-all"
              >
                <span className="font-semibold text-slate-800">Carlos Alberto da Silva</span>
                <span className="font-mono text-[10px] text-indigo-600 block">529.982.247-25</span>
              </button>
            )}
          </div>
        </div>

        {/* Rodapé do Card */}
        <div className="mt-5 text-center">
          <span className="text-[11px] text-slate-500">
            Ambiente seguro • PostgreSQL & Node.js
          </span>
        </div>
      </div>
    </div>
  );
};
