# Gerador de Relatório Psicossocial (NR-1) com IA

Projeto de automação com inteligência artificial que transforma as respostas de um levantamento estruturado de fatores psicossociais, inspirado na NR-1, em um rascunho de relatório em Google Docs, para revisão de um profissional. Sou psicóloga e estudante de Engenharia de Software, e este projeto une as duas áreas: automatizar a parte repetitiva do trabalho para que o profissional dedique seu tempo à análise.

## O que este projeto é e o que não é

| É | Não é |
|---|---|
| Um **apoio técnico de triagem preliminar** e organização de dados para profissionais habilitados de Psicologia e SST | Um instrumento psicológico validado, nem um substituto de testes psicométricos, entrevistas ou avaliação psicossocial formal |
| Um **gerador de rascunhos estruturados**, com cálculos determinísticos (polaridade de risco e proteção, completude, itens sensíveis) e texto redigido pela IA a partir de dados prontos | Um emissor de laudos, pareceres conclusivos ou diagnósticos |
| Uma ferramenta com **revisão humana obrigatória**: o documento tem campo de parecer em branco e só se completa com a análise do profissional | Um sistema de decisão automática sobre trabalhadores, cargos ou aptidão laboral, nem de atribuição de causa individual |
| Uma triagem **individual**, de apoio à entrevista devolutiva | Uma análise coletiva: planos de ação sobre a organização do trabalho devem considerar a análise por grupo homogêneo de exposição |

## Como funciona

1. As respostas são registradas em um **Google Forms**.
2. Elas chegam em uma **planilha do Google Sheets**.
3. Um script em **Google Apps Script** confere a planilha, lê a resposta, converte as notas, classifica cada item (crítico, alerta, adequado, protetor ou não respondido), calcula o nível de atenção preliminar de cada bloco e monta um **pacote de dados** já calculado.
4. O pacote é enviado a uma **API de IA** (Gemini, no plano gratuito), que redige o texto do relatório com base apenas nesses dados.
5. O script **verifica o texto** gerado, corrige o que é seguro corrigir, gera de novo se necessário e cria um **documento do Google Docs** na pasta de relatórios, com aviso de rascunho, tabela de identificação, as cinco seções, campo de parecer em branco, nota técnica e rodapé de rastreabilidade.
6. O profissional abre o documento, revisa, edita e assina.

Um gatilho opcional faz esse caminho rodar sozinho a cada envio do formulário.

## Princípios de design

- **O script calcula, a IA redige.** Notas, status e níveis são calculados por código, que pode ser testado. A IA só escreve o texto a partir dos dados prontos, sem recalcular nem inferir.
- **A IA nunca adivinha a escala.** Cada item chega à IA com a frase da pergunta, a frequência por extenso ("Nunca", "Sempre") e a natureza (fator de risco ou de proteção). Isso evita que o modelo interprete a nota na direção errada, erro que apareceu no meu primeiro teste.
- **Transparência sem distorção.** Quando 50% ou mais dos itens de um bloco ficam sem resposta, o bloco é marcado como "dados insuficientes" e nenhuma conclusão é tirada. Os itens respondidos aparecem isolados, como dado bruto sinalizado. Itens sensíveis (assédio, violência, trauma) sem resposta, ou críticos, são sempre destacados, mesmo em blocos insuficientes e mesmo quando o questionário foi respondido por inteiro.
- **A IA não afirma ausência de riscos.** Um autorrelato sem itens críticos não prova que não há risco: o relatório diz apenas que não foram identificados fatores críticos ou em alerta nos dados informados.
- **Frases fixas onde o texto precisa ser controlado.** Nos testes, as frases exatas do prompt foram reproduzidas em todos os casos, e as instruções abstratas de estilo ("sem alarmismo") foram ignoradas. Por isso o prompt usa frases exatas e listas de termos proibidos.
- **A saída da IA é verificada por código.** O modelo varia entre execuções: a mesma resposta fictícia gerou "não respondido" em uma execução e a sigla "NR" em outra. Por isso o texto passa por um verificador automático (sigla e termos proibidos, estrutura, frases obrigatórias), o que é seguro corrigir é corrigido por código e registrado no rodapé do documento, e cada versão do prompt é medida com repetições, e não com uma execução isolada. O que o verificador não alcança (direção da escala, fatos inventados, diagnóstico, patologização) exige leitura humana.
- **Desconfiar primeiro do instrumento de medição.** As primeiras taxas de erro estavam infladas por dois defeitos do meu próprio código (a resposta da API era lida só em parte, e o verificador contava a numeração dos tópicos como erro). O registro completo está em `prompts/` e no diário de bordo.
- **Falha da API não é falha do prompt.** A API pode ficar indisponível por alta demanda. O código tenta de novo com espera crescente, e a medição separa erro da API de erro do prompt.
- **A polaridade fica no código.** A marcação de cada item como risco ou proteção não aparece no formulário, para não influenciar quem responde.
- **O código para quando algo está fora do lugar.** Uma validação confere se as 22 colunas da planilha estão onde o script espera, e erros de nota ou de polaridade interrompem o processo em vez de gerar um relatório errado.
- **Chave fora do código.** A chave da API fica nas Propriedades do script e nunca no repositório. O nome do modelo e a versão do prompt ficam em constantes únicas.
- **O prompt é versionado e testado.** Cada versão fica em `prompts/`, com as mudanças, os casos de teste (incluindo respostas incompletas e casos sensíveis), os erros encontrados e a comparação entre versões.
- **O relatório é um rascunho editável.** A análise, o parecer e a decisão final continuam sendo do profissional.

## Segurança e privacidade

- Este protótipo usa **apenas dados fictícios**. Nenhuma resposta de pessoa real é usada em testes, prints ou neste repositório.
- **Minimização:** para a IA saem somente o código da coleta, o setor, o cargo, o turno e as respostas dos itens. Nome, e-mail, documentos e data não saem da planilha.
- **Plano gratuito do Gemini:** o conteúdo enviado pode ser usado pelo Google para melhorar seus produtos, o que reforça a regra de usar só dados fictícios.
- **Em uso real**, seriam necessários: acesso restrito da planilha e da pasta de relatórios ao profissional responsável, sem envio automático a gestores sem revisão; consentimento e finalidade informados antes da primeira pergunta do formulário; uso não punitivo dos dados; e um estudo de segurança e proteção de dados (LGPD).
- **Gatilho automático:** enquanto estiver ativo, cada resposta do formulário é enviada à IA e vira um documento. Em demonstração, o link do formulário não deve ser compartilhado.

## Avisos importantes

- O protocolo é **fictício e não validado**. Ele é inspirado nos fatores de risco psicossociais do Guia do MTE e no capítulo 1.5 da NR-1, mas **não comprova conformidade** com a norma.
- O relatório é um **rascunho**. A IA não faz diagnóstico, não emite parecer nem laudo. A análise e a responsabilidade técnica são do profissional.
- O relatório é um complemento: **não substitui** a análise do profissional, os protocolos de acolhimento e encaminhamento da organização, nem a atuação imediata diante de relatos de violência.
- Questionário isolado não comprova a gestão de riscos psicossociais. Este projeto automatiza apenas uma etapa de apoio ao levantamento, e os resultados exigem análise técnica do profissional.
- Modelos de linguagem podem errar (por exemplo, uma palavra com final em inglês apareceu em um dos testes). A revisão do profissional é obrigatória.

## Referências normativas

- NR-1, capítulo 1.5 (Gerenciamento de Riscos Ocupacionais), conforme a Portaria MTE nº 1.419/2024, com vigência prevista para 26/05/2026 (Portaria MTE nº 765/2025)
- Guia de informações sobre os fatores de riscos psicossociais relacionados ao trabalho (MTE, 2025)
- Manual de interpretação e aplicação do capítulo 1.5 da NR-1, GRO/PGR (MTE, 2026)
- Resolução CFP nº 14/2023 (versão comentada), sobre a atuação de psicólogas(os) na avaliação de riscos psicossociais relacionados ao trabalho

As limitações do protocolo estão descritas em [docs/protocolo.md](docs/protocolo.md).

## Ferramentas

- Google Forms, Google Sheets, Google Docs, Google Drive e Google Apps Script
- Google AI Studio (API do Gemini, plano gratuito)
- Claude, da Anthropic, como ferramenta de apoio ao desenvolvimento: usei para aprender e construir o projeto passo a passo, escrevendo e entendendo cada parte do código
- Uma revisão externa do projeto feita com o Gemini, avaliada ponto a ponto (o registro está no diário de bordo)

## Como usar (protótipo, com dados fictícios)

1. Crie um formulário no Google Forms com as 22 perguntas de [docs/protocolo.md](docs/protocolo.md): quatro campos de contexto (código, setor, cargo e turno) e cinco grades de múltipla escolha, uma por bloco, com a escala `1. Nunca` a `5. Sempre`, sem exigir resposta em cada linha. Na descrição, informe que é um protótipo e que só devem ser usados dados fictícios.
2. Vincule o formulário a uma planilha do Google Sheets.
3. Na planilha, abra **Extensões, Apps Script** e cole o conteúdo de `src/Codigo.gs`.
4. Em **Configurações do projeto, Propriedades do script**, crie `GEMINI_API_KEY` com a sua chave do Google AI Studio.
5. Crie uma pasta chamada `Relatórios` no Drive.
6. Rode `validarPlanilha` para conferir as colunas e `testarChave` para conferir a chave.
7. Gere um relatório com `gerarRelatorioPorId('SEU-CODIGO')`, ou rode `instalarGatilho` para gerar a cada envio do formulário (e `removerGatilho` para desligar). Respostas que ficaram sem relatório (por exemplo, por falha da API) são geradas com `gerarRelatoriosPendentes`.

## Status

Em desenvolvimento.

- Fase 0: preparação (concluída)
- Fase 1: protocolo fictício e estrutura do relatório (concluída)
- Fase 2: formulário e planilha de respostas (concluída)
- Fase 3: leitura, conversão e cálculo dos níveis por bloco (concluída)
- Fase 4: pacote de dados e conexão com a API do Gemini (concluída)
- Fase 5: engenharia do prompt, versões v1 a v1.4 (concluída)
- Fase 6: geração do relatório em Google Docs (concluída)
- Fase 7: gatilho automático, resiliência da API e revisão externa (concluída)
- Fase 8: testes finais (em andamento: medição completa da v1.4 e teste do gatilho com envio real)
- Fase 9: vitrine, post e publicação (próxima)

## Testes

O código tem funções de teste que rodam pelo editor do Apps Script. Elas usam respostas fictícias: risco alto, ambiente protegido, perfil misto, uma resposta incompleta e um caso sensível em bloco insuficiente. Os testes conferem a conversão das notas, a classificação dos itens, os casos de borda (50% exatos), os erros para dados inválidos, a validação das colunas, o pacote enviado à IA, a conexão com a API, o verificador e a limpeza do texto, e o documento gerado em cada perfil. Para o texto da IA, uma função de repetição executa o mesmo perfil várias vezes para medir a taxa de problemas de cada versão do prompt, separando erros da API de erros do prompt. Os resultados estão registrados em `prompts/`.

## Estrutura do repositório

- `docs/protocolo.md`: protocolo fictício, regras de cálculo, estrutura do relatório, limitações e princípios de segurança
- `docs/diario-de-bordo.md`: registro de cada fase, dos erros encontrados e do que aprendi
- `src/Codigo.gs`: código do Apps Script (sem chaves ou dados reais)
- `prompts/`: versões do prompt enviado à IA (`v1.md` a `v1.4.md`), com mudanças, testes, taxa de problemas e comparação entre versões

## Documentação do processo

Registro cada etapa, os erros encontrados e o que aprendi em [docs/diario-de-bordo.md](docs/diario-de-bordo.md).

## Autora

**Gabriele Moreira Pereira**
[LinkedIn](https://linkedin.com/in/gabrielemoreirapereira) · [GitHub](https://github.com/gabrielemra)
