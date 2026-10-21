import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, RefreshCw, Calculator, Copy, Check, Info } from 'lucide-react';
import { validarCPF, formatarCPF, limparCPF, gerarCPFValido, validarCPFDetalhado } from '../utils/cpfValidator.ts';

export const CpfTester: React.FC = () => {
  const [cpfInput, setCpfInput] = useState('529.982.247-25');
  const [copiado, setCopiado] = useState(false);

  const clean = limparCPF(cpfInput);
  const isValid = validarCPF(cpfInput);
  const detalhes = validarCPFDetalhado(cpfInput);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleGenerate = () => {
    const novo = gerarCPFValido(true);
    setCpfInput(novo);
  };

  // Cálculos para demonstrar visualmente o Módulo 11
  const digits = clean.split('').map((d) => parseInt(d, 10));

  // Tabela do 1º dígito verificador (pesos de 10 a 2)
  const weights1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const items1 = weights1.map((w, i) => {
    const digit = digits[i] !== undefined ? digits[i] : 0;
    return { digit, weight: w, mult: digit * w };
  });
  const sum1 = items1.reduce((acc, curr) => acc + curr.mult, 0);
  let calcD1 = (sum1 * 10) % 11;
  if (calcD1 === 10 || calcD1 === 11) calcD1 = 0;

  // Tabela do 2º dígito verificador (pesos de 11 a 2)
  const weights2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const items2 = weights2.map((w, i) => {
    const digit = digits[i] !== undefined ? digits[i] : 0;
    return { digit, weight: w, mult: digit * w };
  });
  const sum2 = items2.reduce((acc, curr) => acc + curr.mult, 0);
  let calcD2 = (sum2 * 10) % 11;
  if (calcD2 === 10 || calcD2 === 11) calcD2 = 0;

  return (
    <div className="bg-glass-card-elevated rounded-3xl border border-white/85 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-white/80 bg-white/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <Calculator className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Laboratório de Validação de CPF (Módulo 11)
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Teste interativamente a função JavaScript com cálculo dos dois dígitos verificadores da Receita Federal.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-xl border border-indigo-200/70 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Gerar CPF Válido Aleatório
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Campo de Teste */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Insira qualquer CPF (com ou sem pontuação):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={cpfInput}
                onChange={(e) => setCpfInput(formatarCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 font-mono text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {cpfInput && (
                <button
                  onClick={() => setCpfInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
                  title="Limpar"
                >
                  Limpar
                </button>
              )}
            </div>

            <button
              onClick={() => handleCopy(cpfInput)}
              className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Botões de cenários de teste rápidos */}
          <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-500 font-medium">Testes rápidos:</span>
            <button
              onClick={() => setCpfInput('529.982.247-25')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Exemplo Válido (529.982.247-25)
            </button>
            <button
              onClick={() => setCpfInput('425.983.178-04')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Exemplo Válido (425.983.178-04)
            </button>
            <button
              onClick={() => setCpfInput('111.111.111-11')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              Inválido: Repetidos (111.111.111-11)
            </button>
            <button
              onClick={() => setCpfInput('529.982.247-00')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              Inválido: Dígito Errado
            </button>
            <button
              onClick={() => setCpfInput('123.456')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
            >
              Inválido: Incompleto
            </button>
          </div>
        </div>

        {/* Card do Resultado da Função */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isValid
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              {isValid ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/70 border border-current">
                  Retorno da Função: {isValid ? 'TRUE' : 'FALSE'}
                </span>
                <span className="text-sm font-semibold">
                  {isValid ? 'CPF Válido' : 'CPF Inválido'}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed font-medium">
                {detalhes.mensagem}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs opacity-90 font-mono">
                <div>Dígitos numéricos: <span className="font-bold">{clean.length}/11</span></div>
                {clean.length === 11 && (
                  <>
                    <div>1º Dígito: <span className="font-bold">{digits[9]}</span> (Calculado: {calcD1})</div>
                    <div>2º Dígito: <span className="font-bold">{digits[10]}</span> (Calculado: {calcD2})</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demonstração Matemática do Módulo 11 */}
        {clean.length === 11 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800">
                Memória de Cálculo: Como a função valida os dígitos verificadores
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cálculo do 1º Dígito */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800">1º Dígito Verificador (Posição 10)</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded-full font-semibold ${
                      calcD1 === digits[9] ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Esperado: {calcD1} | Informado: {digits[9]}
                  </span>
                </div>

                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-center font-mono">
                    <thead>
                      <tr className="text-[10px] text-slate-400 border-b border-slate-200">
                        {items1.map((item, idx) => (
                          <th key={idx} className="pb-1">d{idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-semibold text-slate-700">
                        {items1.map((item, idx) => (
                          <td key={idx} className="py-1">{item.digit}</td>
                        ))}
                      </tr>
                      <tr className="text-slate-400 text-[10px]">
                        {items1.map((item, idx) => (
                          <td key={idx} className="pb-1">×{item.weight}</td>
                        ))}
                      </tr>
                      <tr className="border-t border-slate-200 text-indigo-700 font-medium">
                        {items1.map((item, idx) => (
                          <td key={idx} className="pt-1">{item.mult}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div>• Soma dos produtos: <strong>{sum1}</strong></div>
                  <div>• Módulo 11: ({sum1} × 10) % 11 = <strong>{calcD1}</strong></div>
                  <div className={calcD1 === digits[9] ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    • Resultado: {calcD1 === digits[9] ? '✓ Confere' : '✗ Não confere'}
                  </div>
                </div>
              </div>

              {/* Cálculo do 2º Dígito */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800">2º Dígito Verificador (Posição 11)</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded-full font-semibold ${
                      calcD2 === digits[10] ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Esperado: {calcD2} | Informado: {digits[10]}
                  </span>
                </div>

                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-center font-mono">
                    <thead>
                      <tr className="text-[10px] text-slate-400 border-b border-slate-200">
                        {items2.map((item, idx) => (
                          <th key={idx} className="pb-1">d{idx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-semibold text-slate-700">
                        {items2.map((item, idx) => (
                          <td key={idx} className="py-1">{item.digit}</td>
                        ))}
                      </tr>
                      <tr className="text-slate-400 text-[10px]">
                        {items2.map((item, idx) => (
                          <td key={idx} className="pb-1">×{item.weight}</td>
                        ))}
                      </tr>
                      <tr className="border-t border-slate-200 text-indigo-700 font-medium">
                        {items2.map((item, idx) => (
                          <td key={idx} className="pt-1">{item.mult}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div>• Soma dos produtos: <strong>{sum2}</strong></div>
                  <div>• Módulo 11: ({sum2} × 10) % 11 = <strong>{calcD2}</strong></div>
                  <div className={calcD2 === digits[10] ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    • Resultado: {calcD2 === digits[10] ? '✓ Confere' : '✗ Não confere'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
