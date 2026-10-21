import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { Funcionario } from '../types/funcionario.ts';
import { formatarCPF } from '../utils/cpfValidator.ts';

interface ConfirmDeleteModalProps {
  funcionario: Funcionario | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  funcionario,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  if (!isOpen || !funcionario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/85 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Funcionário?</h3>
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            Tem certeza de que deseja remover o cadastro de{' '}
            <strong className="text-slate-900 font-semibold">{funcionario.nome}</strong> (CPF:{' '}
            <span className="font-mono text-slate-900">{formatarCPF(funcionario.cpf)}</span>)? Esta ação
            não pode ser desfeita.
          </p>

          <div className="bg-slate-50 rounded-xl p-3 mb-6 border border-slate-200/80 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">ID do Registro:</p>
            <p className="font-mono break-all">{funcionario.id}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-sm transition-colors shadow-sm shadow-rose-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirmar Exclusão
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
