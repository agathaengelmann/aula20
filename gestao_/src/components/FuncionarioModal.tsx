import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, User, FileText, Briefcase, Mail, Phone } from 'lucide-react';
import { Funcionario, CriarFuncionarioDTO } from '../types/funcionario.ts';
import { formatarCPF, limparCPF, validarCPFDetalhado, gerarCPFValido } from '../utils/cpfValidator.ts';

interface FuncionarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: CriarFuncionarioDTO, id?: string) => Promise<boolean>;
  funcionarioParaEditar?: Funcionario | null;
}

export const FuncionarioModal: React.FC<FuncionarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  funcionarioParaEditar
}) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const isEditando = !!funcionarioParaEditar;

  useEffect(() => {
    if (funcionarioParaEditar) {
      setNome(funcionarioParaEditar.nome || '');
      setCpf(formatarCPF(funcionarioParaEditar.cpf || ''));
      setCargo(funcionarioParaEditar.cargo || '');
      setEmail(funcionarioParaEditar.email || '');
      setTelefone(funcionarioParaEditar.telefone || '');
    } else {
      setNome('');
      setCpf('');
      setCargo('');
      setEmail('');
      setTelefone('');
    }
    setErroGeral(null);
  }, [funcionarioParaEditar, isOpen]);

  if (!isOpen) return null;

  // Análise em tempo real do CPF digitado
  const validacaoCpf = cpf.trim() ? validarCPFDetalhado(cpf) : null;
  const cpfValido = validacaoCpf ? validacaoCpf.valido : false;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCPF(e.target.value);
    setCpf(formatado);
    setErroGeral(null);
  };

  const preencherCpfValido = () => {
    const novoCpf = gerarCPFValido(true);
    setCpf(novoCpf);
    setErroGeral(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral(null);

    if (!nome.trim() || nome.trim().length < 2) {
      setErroGeral('Por favor, informe o nome completo do funcionário (mínimo 2 letras).');
      return;
    }

    if (!cpf.trim()) {
      setErroGeral('O campo CPF é obrigatório.');
      return;
    }

    if (!cpfValido) {
      setErroGeral(validacaoCpf?.mensagem || 'O CPF informado não é válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sucesso = await onSave(
        {
          nome: nome.trim(),
          cpf: limparCPF(cpf),
          cargo: cargo.trim() || undefined,
          email: email.trim() || undefined,
          telefone: telefone.trim() || undefined
        },
        funcionarioParaEditar?.id
      );

      if (sucesso) {
        onClose();
      }
    } catch (err: any) {
      setErroGeral(err.message || 'Erro ao salvar os dados do funcionário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/85 backdrop-blur-2xl rounded-3xl max-w-lg w-full shadow-2xl border border-white/85 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho do Modal Furta-cor Metálico */}
        <div className="px-6 py-5 btn-metallic-iridescent text-white flex items-center justify-between shadow-xs">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight drop-shadow-xs">
              {isEditando ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h3>
            <p className="text-xs text-white/90 mt-0.5">
              {isEditando ? 'Atualize as informações do funcionário cadastrado' : 'Preencha os dados e valide o CPF do funcionário'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erroGeral && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{erroGeral}</div>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ana Maria dos Santos"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          {/* CPF com validação em tempo real e gerador rápido */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                CPF (11 Dígitos) *
              </label>
              <button
                type="button"
                onClick={preencherCpfValido}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                title="Gera um CPF válido para testes rápidos"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Gerar CPF válido para teste
              </button>
            </div>
            
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                maxLength={14}
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border font-mono text-sm outline-none transition-all ${
                  cpf.trim().length === 0
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    : cpfValido
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 focus:ring-2 focus:ring-emerald-100'
                    : 'border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-2 focus:ring-rose-100'
                }`}
              />
              {cpf.trim().length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {cpfValido ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              )}
            </div>

            {/* Feedback explicativo da validação do CPF */}
            {validacaoCpf && cpf.trim().length > 0 && (
              <div
                className={`mt-1.5 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                  validacaoCpf.valido
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span className="font-semibold">{validacaoCpf.valido ? '✓ Válido:' : '✗ Atenção:'}</span>
                <span>{validacaoCpf.mensagem}</span>
              </div>
            )}
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cargo / Função
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Desenvolvedor, Analista Financeiro, etc."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          {/* Linha dupla: Email e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail (opcional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="funcionario@email.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Telefone (opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Rodapé com botões de ação */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !cpfValido}
              className={`px-6 py-2.5 rounded-2xl font-bold text-sm text-white transition-all shadow-sm flex items-center gap-2 ${
                isSubmitting || !cpfValido
                  ? 'bg-slate-300 cursor-not-allowed opacity-80'
                  : 'btn-metallic-iridescent hover:opacity-95 active:scale-95 shadow-indigo-200 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gravando...
                </>
              ) : isEditando ? (
                'Salvar Alterações'
              ) : (
                'Cadastrar Funcionário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
