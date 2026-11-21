// ============================================================
// gerador-relatorio: Apps Script do Gerador de Relatório Psicossocial
// ============================================================

// ------------------------------------------------------------
// 1. DADOS FIXOS (o protocolo)
// ------------------------------------------------------------
// Cada item: número, bloco, polaridade (R = risco, P = proteção)
// e, quando for o caso, se é um item sensível (assédio, violência, trauma).
const PROTOCOLO = [
  { id: 1, bloco: 1, pol: 'R' }, { id: 2, bloco: 1, pol: 'R' }, { id: 3, bloco: 1, pol: 'P' },
  { id: 4, bloco: 1, pol: 'R' }, { id: 5, bloco: 1, pol: 'R' },
  { id: 6, bloco: 2, pol: 'P' }, { id: 7, bloco: 2, pol: 'P' }, { id: 8, bloco: 2, pol: 'R' },
  { id: 9, bloco: 2, pol: 'P' },
  { id: 10, bloco: 3, pol: 'P' }, { id: 11, bloco: 3, pol: 'P' }, { id: 12, bloco: 3, pol: 'P' },
  { id: 13, bloco: 3, pol: 'R' },
  { id: 14, bloco: 4, pol: 'R', sensivel: true }, { id: 15, bloco: 4, pol: 'R', sensivel: true },
  { id: 16, bloco: 4, pol: 'R', sensivel: true }, { id: 17, bloco: 4, pol: 'R', sensivel: true },
  { id: 18, bloco: 4, pol: 'P' }, { id: 19, bloco: 4, pol: 'P' }, { id: 20, bloco: 4, pol: 'R' },
  { id: 21, bloco: 5, pol: 'R' }, { id: 22, bloco: 5, pol: 'R' }
];

// ------------------------------------------------------------
// 2. FUNÇÕES AUXILIARES (pequenas, fazem uma coisa só)
// ------------------------------------------------------------

// Converte o texto da célula ("5. Sempre") em número de 1 a 5.
// Devolve null quando o item não foi respondido ou o valor é inválido.
function converterNota(texto) {
  // 1. Se o texto estiver vazio (ou nulo/undefined), devolva null (item não respondido)
  if (texto === null || texto === undefined || String(texto).trim() === '') {
    return null;
  }

  // 2. Senão, pegue o número do começo: "5. Sempre" vira 5
  const nota = parseInt(String(texto).trim(), 10);

  // 3. Se o resultado não for um número entre 1 e 5, devolva null
  if (Number.isNaN(nota) || nota < 1 || nota > 5) {
    return null;
  }

  return nota;
}

// Combina polaridade e nota no status do item:
// 'critico', 'alerta', 'adequado', 'protetor' ou 'NR' (não respondido).
function statusItem(pol, nota) {
  // 1. Item não respondido
  if (nota === null || nota === undefined) {
    return 'NR';
  }

  // 2. Nota inválida: melhor parar com erro claro do que gerar relatório errado
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw new Error('Nota inválida em statusItem: ' + nota);
  }

  // 3. Polaridade 'R' (risco): 4 ou 5 -> 'critico', 3 -> 'alerta', 1 ou 2 -> 'adequado'
  if (pol === 'R') {
    if (nota >= 4) {
      return 'critico';
    }
    if (nota === 3) {
      return 'alerta';
    }
    return 'adequado';
  }

  // 4. Polaridade 'P' (proteção): 4 ou 5 -> 'protetor', 3 -> 'alerta', 1 ou 2 -> 'critico'
  if (pol === 'P') {
    if (nota >= 4) {
      return 'protetor';
    }
    if (nota === 3) {
      return 'alerta';
    }
    return 'critico';
  }

  // 5. Polaridade desconhecida: erro explícito
  throw new Error('Polaridade inválida em statusItem: ' + pol);
}

// ------------------------------------------------------------
// 3. FUNÇÕES PRINCIPAIS
// ------------------------------------------------------------

// Lê uma resposta da planilha (a última, se nenhum número de linha for informado)
// e devolve os dados organizados:
// { contexto: {...}, itens: [ { id, bloco, pol, nota }, ... ] }
function montarAvaliacao(numeroLinha) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const linhaLida = numeroLinha || aba.getLastRow();

  // A linha 1 é o cabeçalho; linhas além do fim da planilha não existem
  if (linhaLida < 2 || linhaLida > aba.getLastRow()) {
    throw new Error('Linha inválida em montarAvaliacao: ' + linhaLida);
  }

  const linha = aba.getRange(linhaLida, 1, 1, aba.getLastColumn()).getValues()[0];

  // Colunas A a E: carimbo, ID, setor, cargo, turno
  const contexto = {
    id: String(linha[1]).trim(),
    setor: linha[2],
    cargo: linha[3],
    turno: linha[4],
    data: linha[0]
  };

  // Colunas F em diante: os 22 itens, na ordem do protocolo
  const itens = PROTOCOLO.map(item => {
    const bruto = linha[4 + item.id];
    return {
      ...item,
      nota: converterNota(bruto)
    };
  });

  return { contexto, itens };
}

// Resume um bloco: contagens e nível de atenção preliminar.
// Em bloco com dados insuficientes, devolve os itens respondidos como
// dado bruto isolado (itensIsolados), sem conclusão sobre o bloco.
function calcularNivelBloco(itens, numeroBloco) {
  const doBloco = itens.filter(item => item.bloco === numeroBloco);
  const comStatus = doBloco.map(item => ({
    ...item,
    status: statusItem(item.pol, item.nota)
  }));

  const total = comStatus.length;
  const nr = comStatus.filter(item => item.status === 'NR').length;
  const respondidos = total - nr;
  const criticos = comStatus.filter(item => item.status === 'critico').length;
  const alertas = comStatus.filter(item => item.status === 'alerta').length;

  // Itens sensíveis: quais ficaram sem resposta e quais ficaram críticos
  const sensiveisOmitidos = comStatus
    .filter(item => item.sensivel && item.status === 'NR')
    .map(item => item.id);
  const sensiveisCriticos = comStatus
    .filter(item => item.sensivel && item.status === 'critico')
    .map(item => item.id);

  // Decisão do nível, seguindo rigorosamente a ordem das regras:
  let nivel = '';
  if (total === 0 || (nr / total) >= 0.5) {
    nivel = 'Dados insuficientes';
  } else if (respondidos > 0 && (criticos / respondidos) >= 0.5) {
    nivel = 'Alto';
  } else if (criticos >= 1 || (respondidos > 0 && (alertas / respondidos) >= 0.5)) {
    nivel = 'Moderado';
  } else {
    nivel = 'Baixo';
  }

  const itensIsolados = nivel === 'Dados insuficientes'
    ? comStatus
        .filter(item => item.status !== 'NR')
        .map(item => ({
          id: item.id,
          nota: item.nota,
          status: item.status
        }))
    : [];

  return {
    bloco: numeroBloco, total, respondidos, nr, criticos, alertas,
    nivel, sensiveisOmitidos, sensiveisCriticos, itensIsolados
  };
}

// ------------------------------------------------------------
// 4. DIAGNÓSTICO E TESTES (rodar manualmente, pelo botão Executar)
// ------------------------------------------------------------

// Imprime cabeçalho -> valor de cada coluna da última resposta.
function lerUltimaResposta() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheets()[0];
  const ultimaLinha = aba.getLastRow();
  const totalColunas = aba.getLastColumn();

  const cabecalhos = aba.getRange(1, 1, 1, totalColunas).getValues()[0];
  const valores = aba.getRange(ultimaLinha, 1, 1, totalColunas).getValues()[0];

  cabecalhos.forEach((cabecalho, i) => {
    Logger.log(cabecalho + ' -> ' + valores[i]);
  });
}

function testarConverterNota() {
  Logger.log(converterNota('5. Sempre'));              // esperado: 5
  Logger.log(converterNota(''));                       // esperado: null
  Logger.log(converterNota('3. Às vezes'));            // esperado: 3
  Logger.log(converterNota('9. Teste'));               // esperado: null
  Logger.log(converterNota(undefined));                // esperado: null
  Logger.log(converterNota('  4. Frequentemente'));    // esperado: 4
}

function testarStatusItem() {
  Logger.log(statusItem('R', 5));      // esperado: critico
  Logger.log(statusItem('R', 3));      // esperado: alerta
  Logger.log(statusItem('R', 1));      // esperado: adequado
  Logger.log(statusItem('P', 1));      // esperado: critico
  Logger.log(statusItem('P', 3));      // esperado: alerta
  Logger.log(statusItem('P', 5));      // esperado: protetor
  Logger.log(statusItem('R', null));   // esperado: NR

  // Casos que devem gerar erro (o try/catch evita parar o teste)
  try {
    statusItem('X', 3);
  } catch (e) {
    Logger.log('erro esperado: ' + e.message);
  }
  try {
    statusItem('R', 9);
  } catch (e) {
    Logger.log('erro esperado: ' + e.message);
  }
}

function testarMontagem() {
  Logger.log(JSON.stringify(montarAvaliacao(), null, 2));
}

// Mostra, item a item, a nota e o status da última resposta.
function testarStatusDaUltimaResposta() {
  const avaliacao = montarAvaliacao();
  Logger.log('Avaliação: ' + avaliacao.contexto.id);
  avaliacao.itens.forEach(item => {
    Logger.log('Item ' + item.id + ' (' + item.pol + ') nota ' + item.nota +
               ' -> ' + statusItem(item.pol, item.nota));
  });
}

// Detalha as contagens e o nível dos 5 blocos da última resposta.
function testarNiveis() {
  const avaliacao = montarAvaliacao();
  [1, 2, 3, 4, 5].forEach(n => {
    Logger.log(JSON.stringify(calcularNivelBloco(avaliacao.itens, n)));
  });
}

// Detalha as contagens e o nível dos 5 blocos de UMA linha da planilha.
// Troque o número abaixo para escolher a resposta (linha 2 = primeira resposta).
function testarNiveisDaLinha() {
  const numeroLinha = 4;
  const avaliacao = montarAvaliacao(numeroLinha);
  Logger.log('Avaliação: ' + avaliacao.contexto.id);
  avaliacao.itens.forEach(item => {
    Logger.log('Item ' + item.id + ' (' + item.pol + ') nota ' + item.nota +
               ' -> ' + statusItem(item.pol, item.nota));
  });
  [1, 2, 3, 4, 5].forEach(n => {
    Logger.log(JSON.stringify(calcularNivelBloco(avaliacao.itens, n)));
  });
}

// Uma linha por resposta da planilha, com o nível dos 5 blocos.
function testarNiveisDeTodas() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  for (let linha = 2; linha <= aba.getLastRow(); linha++) {
    const avaliacao = montarAvaliacao(linha);
    const resumo = [1, 2, 3, 4, 5].map(n =>
      'B' + n + ': ' + calcularNivelBloco(avaliacao.itens, n).nivel
    );
    Logger.log(avaliacao.contexto.id + ' | ' + resumo.join(' | '));
  }
}
