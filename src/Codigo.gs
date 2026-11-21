// ============================================================
// gerador-relatorio: Apps Script do Gerador de Relatório Psicossocial
// ============================================================

// ------------------------------------------------------------
// 1. DADOS FIXOS (o protocolo, o prompt e as configurações)
// ------------------------------------------------------------

// Modelo de IA usado nas chamadas. Para trocar de modelo, mude só aqui.
const MODELO = 'gemini-3.5-flash-lite';

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

const NOMES_BLOCOS = {
  1: 'Demandas de trabalho',
  2: 'Controle, clareza de papel e mudanças',
  3: 'Apoio e relações',
  4: 'Violência, assédio, justiça e reconhecimento',
  5: 'Repercussão percebida'
};

const FREQUENCIAS = {
  1: 'Nunca', 2: 'Raramente', 3: 'Às vezes', 4: 'Frequentemente', 5: 'Sempre'
};

const TEXTOS_ITENS = {
  1: 'Preciso trabalhar em ritmo muito acelerado para cumprir metas ou prazos.',
  2: 'Minha jornada ultrapassa o horário combinado ou invade meu descanso.',
  3: 'Tenho tempo e recursos adequados para fazer meu trabalho com segurança e qualidade.',
  4: 'Meu trabalho exige lidar com situações emocionalmente desgastantes sem suporte adequado.',
  5: 'Minhas tarefas são tão monótonas ou abaixo da minha capacidade que me desmotivam.',
  6: 'Tenho clareza sobre minhas responsabilidades e o que se espera de mim.',
  7: 'Tenho autonomia para organizar a ordem e o ritmo das minhas atividades.',
  8: 'Recebo ordens ou demandas contraditórias de pessoas ou setores diferentes.',
  9: 'Sou informado(a) ou consultado(a) com antecedência sobre mudanças que afetam meu trabalho.',
  10: 'Recebo apoio da minha liderança direta quando enfrento dificuldades.',
  11: 'Há cooperação e respeito entre os membros da minha equipe.',
  12: 'Sinto segurança para relatar erros ou problemas sem medo de retaliação.',
  13: 'Tenho dificuldade de comunicação com colegas ou chefia (isolamento, distância, ambiente que atrapalha).',
  14: 'Sofro ou presencio humilhação, gritos, ameaças ou desrespeito de chefias ou colegas.',
  15: 'Sofro ou presencio assédio sexual ou discriminação no trabalho.',
  16: 'Sofro agressões, ameaças ou hostilidade de clientes, usuários ou público externo.',
  17: 'Vivi ou presenciei no trabalho um acidente grave, violência ou situação traumática.',
  18: 'Percebo que regras, avaliações e oportunidades são aplicadas de forma justa e transparente.',
  19: 'Sinto que meu esforço é reconhecido (retorno, valorização, oportunidades).',
  20: 'Sinto insegurança constante quanto ao meu emprego ou medo de punições arbitrárias.',
  21: 'Sinto exaustão intensa ao fim da jornada, com dificuldade de me recuperar para o dia seguinte.',
  22: 'Meu sono ou meu bem-estar emocional foram prejudicados pelas condições atuais do meu trabalho.'
};

// Instrução de sistema enviada à IA (prompt v1.1).
// Histórico e testes: pasta prompts/ do repositório.
const INSTRUCAO_SISTEMA = `
Você é um assistente técnico especializado na redação preliminar de relatórios de triagem de fatores psicossociais no trabalho. Você escreve um rascunho técnico destinado exclusivamente a um(a) profissional habilitado(a) de Psicologia ou Saúde e Segurança do Trabalho (SST), que fará a análise qualitativa, a entrevista devolutiva e a validação final.

REGRAS ABSOLUTAS E INVIOLÁVEIS:
1. FONTE ÚNICA DE VERDADE: Baseie-se estritamente nos dados fornecidos no JSON de entrada. Não recalcule níveis, não reclassifique status, não crie médias e não faça suposições além do que está explicitamente registrado.
2. LEITURA SEMÂNTICA DOS ITENS: Observe sempre os campos "frequencia", "natureza" e "status" de cada item:
   - Quando a natureza for "fator de risco" com status "critico" ou "alerta", a frase indica exposição elevada ou recorrente àquela condição. Exemplo: frequência "Sempre" em "Preciso trabalhar em ritmo muito acelerado..." deve ser redigida como exposição frequente a ritmo acelerado de trabalho.
   - Quando a natureza for "fator de proteção" com status "critico" ou "alerta", a direção é invertida: a baixa frequência descreve a ausência ou fragilidade daquele recurso. Exemplo: frequência "Nunca" em "Tenho autonomia para organizar..." deve ser redigida como ausência de autonomia na organização das tarefas.
3. PROIBIÇÃO DE DIAGNÓSTICO E PATOLOGIZAÇÃO: Nunca formule hipóteses diagnósticas, nunca mencione transtornos mentais, síndromes ou condições clínicas, e nunca atribua os resultados a características, fragilidades ou comportamentos individuais do trabalhador.
4. MEDIDAS ESTRITAMENTE ORGANIZACIONAIS: No plano de ação, sugira exclusivamente intervenções sobre processos, gestão, carga, comunicação, ambiente e organização do trabalho. É estritamente proibido sugerir ações individuais (como técnicas de relaxamento, meditação, autocuidado, resiliência ou terapia individual).
5. TRATAMENTO DE DADOS AUSENTES: Nunca trate item não respondido como nota zero ou como ausência de problema.
6. BLOCOS COM "Dados insuficientes": Quando o nível de um bloco for "Dados insuficientes", não formule nenhuma conclusão, síntese interpretativa ou medida de plano de ação para aquele bloco. Se houver itens na lista "itensIsolados", registre-os apenas como dado bruto pontual (informando o texto do item, a frequência respondida e o status), ressaltando explicitamente que o bloco não permite conclusão por insuficiência de respostas. Esta regra não impede o destaque previsto na regra 7(b).
7. ITENS SENSÍVEIS (assédio, violência, discriminação ou situação traumática):
   (a) Sempre que a lista "sensiveisOmitidos" contiver itens, destaque expressamente na seção de limitações que houve omissão em temas sensíveis e que a ausência de resposta não equivale à ausência de ocorrência, demandando verificação cuidadosa pelo profissional.
   (b) Se qualquer item com "sensivel": true tiver status "critico" (seja em "itensCriticos" ou em "itensIsolados"), destaque-o expressamente na Síntese Geral e na Análise por Bloco como ponto de verificação prioritária pelo profissional, independentemente do nível do bloco. Quando o bloco for "Dados insuficientes", registre apenas a recomendação de verificação prioritária, sem concluir sobre o bloco e sem propor medida de plano de ação.
8. REGRA ESPECÍFICA DO BLOCO 5: Trate o Bloco 5 exclusivamente como indicador de repercussão percebida na saúde e recuperação, nunca como fator de risco organizacional direto. Se o nível do Bloco 5 for "Alto", registre expressamente a recomendação de prioridade na entrevista devolutiva com o profissional habilitado.
9. PROIBIÇÃO DE CITAÇÕES NORMATIVAS: Não cite leis, decretos, artigos jurídicos, resoluções profissionais ou normas regulamentadoras (nem siglas ou números de normas).
10. TOM E ESTILO: Adote linguagem técnica, objetiva, neutra, impessoal e descritiva, sem alarmismo, sem adjetivação excessiva e sem juízo de valor moral.
11. TERMINOLOGIA: O status "NR" que aparece nos dados significa "não respondido". Nunca escreva a sigla "NR" no relatório. Para itens sem resposta, escreva sempre "não respondido".
12. NÃO INVENTE FATOS SOBRE A ORGANIZAÇÃO: Os dados contêm apenas setor, cargo e turno. Não presuma estrutura, processos, equipes ou condições da empresa além do que o JSON registra. Redija as medidas como diretrizes gerais a serem avaliadas pelo profissional (por exemplo: "avaliar a revisão do dimensionamento..."), e nunca como constatações sobre a organização.

FORMATO DE SAÍDA OBRIGATÓRIO:
Responda exclusivamente em português brasileiro, utilizando exatamente os 5 títulos abaixo em Markdown (##), nesta ordem, sem texto introdutório antes do primeiro título e sem conclusões ou assinaturas após o último título:

## 1. Síntese Geral
Escreva um único parágrafo de 3 a 5 linhas resumindo o panorama geral da avaliação (níveis predominantes entre os blocos válidos, presença de fatores críticos/alerta, recursos protetores disponíveis e sinalização de repercussão ou insuficiência de dados, conforme aplicável). Se houver item sensível com status crítico, mencione-o aqui como ponto de verificação prioritária, conforme a regra 7(b).

## 2. Análise por Bloco
Percorra os blocos de 1 a 5 na ordem:
- Para blocos válidos com nível "Baixo" e sem itens críticos ou em alerta: informe em uma linha objetiva que não foram identificados fatores críticos ou em alerta neste bloco.
- Para blocos válidos com itens críticos ou em alerta: indique o nome do bloco, seu nível e descreva objetivamente os fatores críticos e os pontos em alerta (respeitando a natureza de risco ou proteção). Se for o Bloco 5 com nível "Alto", destaque a necessidade de prioridade para a devolutiva profissional.
- Para blocos com nível "Dados insuficientes": informe que o bloco não permite conclusão devido ao número insuficiente de respostas e, caso existam itens em "itensIsolados", liste-os apenas como registro pontual não conclusivo. Se algum desses itens for sensível e crítico, aplique a regra 7(b).

## 3. Fatores de Proteção Identificados
Liste em tópicos objetivos apenas os itens presentes em "itensProtetores" dos blocos válidos, agrupados ou identificados pelo bloco de origem. Caso nenhum fator de proteção tenha sido identificado nos blocos válidos, escreva apenas: "Não foram identificados fatores de proteção consolidados nos blocos com dados suficientes."

## 4. Diretrizes para o Plano de Ação Organizacional
Para cada fator crítico ou em alerta identificado nos blocos 1 a 4 (blocos válidos), apresente um tópico estruturado no formato:
- **[Bloco X - Fator identificado]:** [Medida preventiva ou corretiva estritamente organizacional vinculada diretamente à fonte geradora].
Caso não existam fatores críticos ou em alerta nos blocos 1 a 4 válidos, escreva apenas: "Manter e monitorar periodicamente as práticas atuais de organização e suporte do trabalho." (Não gere medidas de plano de ação a partir de blocos com "Dados insuficientes" nem trate o Bloco 5 como causa organizacional isolada).

## 5. Limitações dos Dados
Informe de forma transparente:
- Se houve blocos com "Dados insuficientes" (indicando proporção de itens respondidos, ex.: 1 de 4 respondidos).
- Se houve itens omitidos em "sensiveisOmitidos" (listando os temas/itens omitidos e reforçando que a omissão não indica ausência de exposição).
- Caso todos os 22 itens tenham sido respondidos e não haja omissões, escreva apenas: "Instrumento respondido integralmente, sem omissões registradas."
`;

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

// Monta o pacote de dados que será enviado à IA, já calculado.
function montarPacote(avaliacao) {
  const blocos = [1, 2, 3, 4, 5].map(numero => {
    const resumo = calcularNivelBloco(avaliacao.itens, numero);
    const insuficiente = resumo.nivel === 'Dados insuficientes';

    // Todos os itens do bloco, com texto, frequência por extenso e natureza
    const itensDoBloco = avaliacao.itens
      .filter(item => item.bloco === numero)
      .map(item => ({
        id: item.id,
        texto: TEXTOS_ITENS[item.id],
        nota: item.nota,
        frequencia: item.nota === null ? null : FREQUENCIAS[item.nota],
        natureza: item.pol === 'R' ? 'fator de risco' : 'fator de proteção',
        status: statusItem(item.pol, item.nota),
        sensivel: item.sensivel === true
      }));

    // Em bloco insuficiente, nenhuma lista de conclusão é preenchida
    const itensCriticos = insuficiente
      ? []
      : itensDoBloco.filter(item => item.status === 'critico');

    const itensAlerta = insuficiente
      ? []
      : itensDoBloco.filter(item => item.status === 'alerta');

    const itensProtetores = insuficiente
      ? []
      : itensDoBloco.filter(item => item.status === 'protetor');

    // Itens sensíveis sem resposta são sempre destacados, mesmo em bloco insuficiente
    const sensiveisOmitidos = itensDoBloco
      .filter(item => item.sensivel && item.status === 'NR');

    // Bloco insuficiente: só dado bruto isolado, sem conclusão
    const itensIsolados = insuficiente
      ? itensDoBloco.filter(item => item.status !== 'NR')
      : [];

    return {
      numero,
      nome: NOMES_BLOCOS[numero],
      tipo: numero === 5 ? 'indicador de repercussão' : 'fatores de risco e proteção',
      nivel: resumo.nivel,
      respondidos: resumo.respondidos,
      total: resumo.total,
      itensCriticos,
      itensAlerta,
      itensProtetores,
      sensiveisOmitidos,
      itensIsolados
    };
  });

  return {
    contexto: {
      codigo: avaliacao.contexto.id,
      setor: avaliacao.contexto.setor,
      cargo: avaliacao.contexto.cargo,
      turno: avaliacao.contexto.turno
    },
    blocos
  };
}

// Envia uma instrução e um texto ao Gemini e devolve o texto da resposta.
function chamarGemini(instrucaoSistema, textoUsuario) {
  const chave = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!chave) {
    throw new Error('GEMINI_API_KEY não encontrada nas propriedades do script.');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              MODELO + ':generateContent';

  const payload = {
    system_instruction: { parts: [{ text: instrucaoSistema }] },
    contents: [{ parts: [{ text: textoUsuario }] }]
  };

  const opcoes = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': chave },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true  // para ler a mensagem de erro em vez de o script quebrar
  };

  const resposta = UrlFetchApp.fetch(url, opcoes);
  const codigo = resposta.getResponseCode();
  const corpo = resposta.getContentText();

  // 1. Se o código não for 200, lança um erro com o código e o começo do corpo
  if (codigo !== 200) {
    throw new Error('Erro na API Gemini (HTTP ' + codigo + '): ' + corpo.substring(0, 300));
  }

  // 2. Transforma o corpo em objeto
  const dados = JSON.parse(corpo);

  // 3. Extrai o texto; se não houver, lança um erro claro
  const texto = dados &&
                dados.candidates &&
                dados.candidates[0] &&
                dados.candidates[0].content &&
                dados.candidates[0].content.parts &&
                dados.candidates[0].content.parts[0] &&
                dados.candidates[0].content.parts[0].text;

  if (!texto) {
    throw new Error('Resposta da API Gemini sem texto válido em candidates.');
  }

  return texto;
}

// Gera o texto do relatório para uma linha da planilha (a última, se não informada).
function gerarTextoRelatorio(numeroLinha) {
  const pacote = montarPacote(montarAvaliacao(numeroLinha));
  const entrada = 'Dados da avaliação (JSON):\n' + JSON.stringify(pacote);
  return chamarGemini(INSTRUCAO_SISTEMA, entrada);
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

// Mostra o pacote de dados que seria enviado à IA para uma linha da planilha.
// Linha 5 = TESTE-004 (resposta incompleta), se a ordem se manteve.
function testarPacote() {
  const avaliacao = montarAvaliacao(5);
  Logger.log(JSON.stringify(montarPacote(avaliacao), null, 2));
}

// Lista só os NOMES das propriedades do script (nunca os valores).
function listarPropriedades() {
  const nomes = Object.keys(PropertiesService.getScriptProperties().getProperties());
  Logger.log('Propriedades encontradas: ' + JSON.stringify(nomes));
}

// Confere se a chave da API está guardada, sem mostrá-la.
function testarChave() {
  const chave = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  Logger.log(chave ? 'Chave encontrada (' + chave.length + ' caracteres)' : 'Chave NÃO encontrada');
}

// Teste de conexão com o Gemini, só com texto inventado (nenhum dado do projeto).
function testarGemini() {
  const resposta = chamarGemini(
    'Você responde em português, em uma frase curta.',
    'Diga olá e avise que este é um teste de conexão.'
  );
  Logger.log(resposta);
}

// Gera o relatório de UMA resposta (dados fictícios) e imprime o texto.
// Troque o número para testar cada perfil: 2 = TESTE-001, 3 = TESTE-002,
// 4 = TESTE-003, 5 = TESTE-004, 6 = TESTE-005 (se existir).
function testarRelatorio() {
  const numeroLinha = 5;
  Logger.log(gerarTextoRelatorio(numeroLinha));
}
