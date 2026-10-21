/**
 * Utilitário de validação e formatação de CPF (Cadastro de Pessoas Físicas)
 * Atende aos requisitos oficiais da Receita Federal do Brasil (Cálculo Módulo 11)
 */

/**
 * Valida se um CPF é válido.
 * Aceita CPF formatado (ex: "123.456.789-09") ou apenas numérico (ex: "12345678909").
 * 
 * @param cpf String contendo o CPF a ser validado
 * @returns true se o formato e os dígitos verificadores forem válidos, false caso contrário
 */
export function validarCPF(cpf: string | null | undefined): boolean {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove todos os caracteres que não sejam dígitos numéricos (0-9)
  const clean = cpf.replace(/\D/g, '');

  // A estrutura básica do CPF deve ter exatamente 11 dígitos numéricos
  if (clean.length !== 11) {
    return false;
  }

  // Elimina CPFs conhecidos inválidos formados por todos os dígitos iguais
  // Ex: "00000000000", "11111111111", ..., "99999999999"
  // Esses valores passariam no cálculo matemático simples mas são inválidos na Receita Federal
  if (/^(\d)\1{10}$/.test(clean)) {
    return false;
  }

  // --- Validação Avançada: Primeiro Dígito Verificador (10º dígito) ---
  // Pesos decrescentes de 10 a 2 para os primeiros 9 dígitos
  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += parseInt(clean.charAt(i), 10) * (10 - i);
  }

  let digito1 = (soma1 * 10) % 11;
  if (digito1 === 10 || digito1 === 11) {
    digito1 = 0;
  }

  // Verifica se o 10º dígito calculado confere com o 10º dígito informado
  if (digito1 !== parseInt(clean.charAt(9), 10)) {
    return false;
  }

  // --- Validação Avançada: Segundo Dígito Verificador (11º dígito) ---
  // Pesos decrescentes de 11 a 2 para os primeiros 10 dígitos (incluindo o primeiro dígito verificador)
  let soma2 = 0;
  for (let i = 0; i < 10; i++) {
    soma2 += parseInt(clean.charAt(i), 10) * (11 - i);
  }

  let digito2 = (soma2 * 10) % 11;
  if (digito2 === 10 || digito2 === 11) {
    digito2 = 0;
  }

  // Verifica se o 11º dígito calculado confere com o 11º dígito informado
  if (digito2 !== parseInt(clean.charAt(10), 10)) {
    return false;
  }

  return true;
}

/**
 * Remove formatação e caracteres não numéricos
 */
export function limparCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

/**
 * Formata um CPF para a máscara padrão: 000.000.000-00
 */
export function formatarCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  const clean = limparCPF(cpf).slice(0, 11);
  
  if (clean.length <= 3) {
    return clean;
  }
  if (clean.length <= 6) {
    return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  }
  if (clean.length <= 9) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  }
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

export interface DetalhesValidacaoCPF {
  valido: boolean;
  mensagem: string;
  cpfLimpo: string;
  digito1Esperado?: number;
  digito1Informado?: number;
  digito2Esperado?: number;
  digito2Informado?: number;
  soma1?: number;
  soma2?: number;
}

/**
 * Validação detalhada para fornecer feedback passo a passo na UI
 */
export function validarCPFDetalhado(cpf: string): DetalhesValidacaoCPF {
  if (!cpf || typeof cpf !== 'string') {
    return { valido: false, mensagem: 'CPF não informado.', cpfLimpo: '' };
  }

  const clean = cpf.replace(/\D/g, '');

  if (clean.length === 0) {
    return { valido: false, mensagem: 'Digite os números do CPF.', cpfLimpo: '' };
  }

  if (clean.length < 11) {
    return {
      valido: false,
      mensagem: `CPF incompleto (${clean.length}/11 dígitos informados).`,
      cpfLimpo: clean
    };
  }

  if (clean.length > 11) {
    return {
      valido: false,
      mensagem: `CPF possui excesso de dígitos (${clean.length} dígitos encontrados).`,
      cpfLimpo: clean
    };
  }

  if (/^(\d)\1{10}$/.test(clean)) {
    return {
      valido: false,
      mensagem: 'Inválido: Todos os 11 dígitos são repetidos (ex: 111.111.111-11).',
      cpfLimpo: clean
    };
  }

  // 1º Dígito Verificador
  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let digito1 = (soma1 * 10) % 11;
  if (digito1 === 10 || digito1 === 11) digito1 = 0;

  const d1Informado = parseInt(clean.charAt(9), 10);
  if (digito1 !== d1Informado) {
    return {
      valido: false,
      mensagem: `1º dígito verificador incorreto. Esperado: ${digito1}, Informado: ${d1Informado}.`,
      cpfLimpo: clean,
      digito1Esperado: digito1,
      digito1Informado: d1Informado,
      soma1
    };
  }

  // 2º Dígito Verificador
  let soma2 = 0;
  for (let i = 0; i < 10; i++) {
    soma2 += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  let digito2 = (soma2 * 10) % 11;
  if (digito2 === 10 || digito2 === 11) digito2 = 0;

  const d2Informado = parseInt(clean.charAt(10), 10);
  if (digito2 !== d2Informado) {
    return {
      valido: false,
      mensagem: `2º dígito verificador incorreto. Esperado: ${digito2}, Informado: ${d2Informado}.`,
      cpfLimpo: clean,
      digito1Esperado: digito1,
      digito1Informado: d1Informado,
      digito2Esperado: digito2,
      digito2Informado: d2Informado,
      soma1,
      soma2
    };
  }

  return {
    valido: true,
    mensagem: 'CPF válido com dígitos verificadores corretos.',
    cpfLimpo: clean,
    digito1Esperado: digito1,
    digito1Informado: d1Informado,
    digito2Esperado: digito2,
    digito2Informado: d2Informado,
    soma1,
    soma2
  };
}

/**
 * Gera um CPF matematicamente válido para propósitos de teste
 */
export function gerarCPFValido(formatado = true): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));

  // 1º dígito
  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += base[i] * (10 - i);
  }
  let d1 = (soma1 * 10) % 11;
  if (d1 === 10 || d1 === 11) d1 = 0;
  base.push(d1);

  // 2º dígito
  let soma2 = 0;
  for (let i = 0; i < 10; i++) {
    soma2 += base[i] * (11 - i);
  }
  let d2 = (soma2 * 10) % 11;
  if (d2 === 10 || d2 === 11) d2 = 0;
  base.push(d2);

  const raw = base.join('');
  return formatado ? formatarCPF(raw) : raw;
}
