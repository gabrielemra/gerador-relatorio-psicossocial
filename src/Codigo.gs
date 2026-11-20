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
// 3. FUNÇÃO PRINCIPAL DESTA ETAPA
// ------------------------------------------------------------

// Lê a última resposta da planilha e devolve os dados organizados:
// { contexto: {...}, itens: [ { id, bloco, pol, nota }, ... ] }
function montarAvaliacao() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const linha = aba.getRange(aba.getLastRow(), 1, 1, aba.getLastColumn()).getValues()[0];

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
