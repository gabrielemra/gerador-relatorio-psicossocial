# Diário de bordo

## Fase 0: Preparação (16/11/2026)

Hoje iniciei o projeto de automação com IA para geração de relatório de avaliação psicossocial com base na NR-1. Criei uma pasta no Google Drive para a execução do projeto. No Google AI Studio, criei uma API Key que será usada no projeto e coletei informações sobre os modelos de IA disponíveis. O critério de escolha foi a possibilidade de uso gratuito e o número de requisições permitidas. Após a escolha, realizei um teste de prompt.

### Erros encontrados

1. **O modelo inventou uma interpretação.** Meu prompt de teste não definia a escala das notas (não dizia se 5 era bom ou ruim), e o modelo preencheu essa lacuna com uma suposição, chegando a acrescentar um detalhe que não estava nos dados. Em um relatório psicossocial, isso pode gerar inverdades. Na Fase 5, o prompt terá a escala explícita e a proibição de afirmar qualquer coisa além dos dados da avaliação.
2. **O Grounding with Google Search estava ativado.** Esse recurso permite que o modelo consulte a web, e o relatório deve se basear apenas nas respostas da avaliação. Desativei a opção. Erro técnico a observar: o Grounding deve ficar sempre desligado.

### O que aprendi

- Métricas de limite de taxa das APIs de IA, usadas para controlar o tráfego e o uso dos modelos:
  - **RPM:** requisições por minuto
  - **TPM:** tokens por minuto
  - **RPD:** requisições por dia
- Conhecer essas métricas é essencial para o projeto: escolher um modelo errado pode gerar gargalos, como mais tempo, menor precisão durante os testes e poucas possibilidades de teste por falta de limite de requisições e tokens.

### Decisões

- **Gemini 3.5 Flash Lite:** será usado no desenvolvimento e nos testes. Permite 500 requisições por dia, o que dá folga para errar e ajustar o prompt.
- **Gemini 3.8 Flash:** permite apenas 20 requisições por dia, então fica reservado para o teste final e para as demonstrações.

## Fase 1: Protocolo fictício e estrutura do relatório (17/11/2026)

Defini o protocolo fictício de levantamento de fatores psicossociais (22 itens, 5 blocos) e a estrutura do relatório. Minha primeira versão foi revisada com uma análise crítica feita no Gemini, e eu pesquisei as normas citadas antes de aceitar as mudanças.

### Erros encontrados

1. **Mistura de sintoma e fator de risco.** O bloco de bem-estar (sono, cansaço) estava tratado como fator de risco, mas a NR-1 foca na organização do trabalho. Ele virou um indicador de repercussão percebida (Bloco 5).
2. **Faltavam dimensões importantes:** assédio e violência, justiça organizacional, reconhecimento, eventos traumáticos e comunicação difícil.
3. **Regra de dados em branco inconsistente.** Substituí "2 ou mais itens em branco" por "50% ou mais dos itens do bloco", porque os blocos têm tamanhos diferentes.
4. **Citações que eu não podia aceitar sem conferir.** A análise externa citava resoluções e itens de norma. Pesquisei: os itens 1.5.3.2.1 e 1.5.4.4.5.3 são da NR-1, e a atuação de psicólogas(os) na avaliação de riscos psicossociais é regulada pela Resolução CFP nº 14/2023. Uma resolução citada não pôde ser confirmada e ficou fora.

### O que aprendi

- A NR-1 trata de fatores de risco da **organização do trabalho**, e não do estado clínico individual.
- A Resolução CFP nº 14/2023 exige evidências de validade e confiabilidade nos instrumentos psicológicos. Por isso meu protocolo é tratado como **protótipo fictício**, e o README não afirma conformidade com a NR-1.
- Conferi os 13 fatores de risco psicossocial do Guia do MTE e confirmei que o protocolo cobre todos, com o trabalho remoto e isolado coberto só em parte. Isso está registrado no anexo do protocolo.
- Verificar fontes importa: uma análise bem escrita pode conter erros ou citações que eu não consigo confirmar. Um questionário, por melhor que seja, é só um complemento ao levantamento e à análise do profissional.

### Decisões

- O **script calcula** (notas, status, níveis) e a **IA só redige** o texto com base nos dados prontos, para ela não inventar nem recalcular nada.
- A **polaridade** de cada item (risco ou proteção) fica no código, não no formulário, para não influenciar quem responde.

## Fase 2: Formulário e planilha (17/11/2026)

Montei o formulário no Google Forms, ligado a uma planilha de respostas.

### Erros encontrados

- Eu tinha feito uma pergunta separada por item e refiz com **grades de múltipla escolha**, uma por bloco, porque a planilha fica com uma coluna por item e o script lê mais fácil.
- Títulos com espaço sobrando (como " ID da coleta") apareceram nos cabeçalhos da planilha e precisaram ser corrigidos.

### O que aprendi

- Em uma grade, deixar a resposta **não obrigatória** faz o item em branco chegar à planilha como célula vazia, e é assim que o NR do protocolo é reconhecido.
- Numerar a escala no texto ("5. Sempre") deixa o script extrair a nota pelo começo do texto.
- Testei com cinco respostas fictícias (risco alto, protegido, misto, incompleto e sensível em bloco insuficiente), incluindo duas incompletas de propósito.

## Fase 3: Apps Script, leitura e cálculo dos dados (18 a 20/11/2026 — concluída)

Escrevi o código que lê uma resposta da planilha, transforma em uma lista de 22 itens (número, bloco, polaridade e nota), classifica cada item e calcula o nível de atenção de cada bloco.

### O que fiz

- Criei a tabela `PROTOCOLO` com bloco, polaridade e marcação de itens sensíveis.
- Escrevi a função `converterNota`, que transforma "5. Sempre" em 5 e devolve `null` quando o item está em branco, o texto é inválido ou a nota fica fora de 1 a 5.
- Montei a função `montarAvaliacao`, que aceita o número da linha da planilha, e testei com a resposta incompleta (TESTE-004): os itens em branco saíram como `null` e os respondidos saíram corretos.
- Escrevi a função `statusItem`, que combina polaridade e nota em crítico, alerta, adequado, protetor ou não respondido.
- Escrevi a função `calcularNivelBloco`, que aplica as regras do protocolo na ordem certa (completude primeiro, depois Alto, Moderado e Baixo) e guarda à parte os itens sensíveis e os itens isolados dos blocos insuficientes.

### Erros encontrados

- Apareceu "Ocorreu um erro desconhecido", sem número de linha. Era uma falha genérica da plataforma, e não do código. Ao rodar de novo, funcionou. Lição: ler a mensagem de erro inteira antes de mexer no código.
- O seletor de funções do editor estava em outra função, e eu quase rodei a errada.

### O que aprendi

- Organizar o código em dados fixos, funções pequenas e funções que juntam as peças facilita testar cada parte sozinha.
- `JSON.stringify` grava datas em horário UTC (o `Z` no final), então a data precisará ser formatada para o horário local no relatório.
- O `parseInt` lê o número do começo do texto e ignora o resto. Decidi que o script confia no formato do formulário.
- **Erro explícito é melhor que resposta silenciosa:** em `statusItem`, uma polaridade ou uma nota inválida lança erro, em vez de devolver "não respondido". Um bloco marcado como insuficiente sem motivo seria um erro difícil de achar.
- Os testes pegaram casos de borda: um bloco com exatamente 50% de itens críticos saiu Alto, e outro com exatamente 50% em alerta saiu Moderado. Os dois estão certos, porque o protocolo diz "50% ou mais".

### Decisões

- Em bloco com dados insuficientes, o relatório mostra o item respondido **isolado, como dado bruto sinalizado, sem conclusão do bloco**. O que o profissional precisa não é de uma conclusão apressada sobre um bloco incompleto, mas de transparência sem distorção.

## Fase 4: Pacote de dados e conexão com a API (21/11/2026 — concluída)

Escrevi a função que monta o pacote de dados enviado à IA e a função que chama a API do Gemini. A chave da API ficou guardada nas Propriedades do script, fora do código.

### O que fiz

- Escrevi a `montarPacote`, que organiza cada bloco com os itens críticos, em alerta e protetores, os itens sensíveis não respondidos e os itens isolados dos blocos insuficientes.
- Cada item chega à IA com a frase da pergunta, a **frequência por extenso** ("Nunca", "Sempre") e a **natureza** (fator de risco ou de proteção). Isso resolve o erro do meu primeiro teste no AI Studio, em que o modelo adivinhou a direção da escala.
- Escrevi a `chamarGemini` (requisição POST com a chave no cabeçalho, tratamento do código de status e extração do texto). O nome do modelo ficou em uma única constante.
- O `testarGemini` usa só texto inventado, sem nenhum dado do projeto.

### Erros encontrados

- A chave "não foi encontrada": eu tinha rodado a função errada no seletor do editor, e a propriedade ainda não estava salva. Criei uma função que lista só os **nomes** das propriedades (nunca os valores) para diagnosticar sem expor a chave.
- Ao copiar código de outra ferramenta, veio um trecho de lixo (`[cite: 14]`) que quebrava o código. Lição: copiar código exige revisão linha a linha.

### O que aprendi

- O que é uma API: endereço, chave, corpo da requisição e código de status (200 sucesso, 400 pedido mal formado, 403 chave, 429 limite).
- Com `muteHttpExceptions`, o erro vem como resposta e eu decido o que fazer com ele.
- Segredos ficam fora do código e do GitHub.

## Fase 5: Engenharia do prompt (21/11/2026 — em andamento)

Escrevi o prompt, revisei contra o protocolo e testei nos cinco perfis fictícios. O registro completo de cada versão está na pasta `prompts/`.

### O que fiz

- **v1:** o prompt original. Antes de rodar, revisei-o contra o protocolo e achei quatro problemas (veja `prompts/v1.md`). O mais importante: um item sensível crítico em bloco com dados insuficientes seria tratado como dado bruto comum.
- **v1.1:** os quatro ajustes. Testei nos cinco perfis: risco alto, protegido, misto, incompleto e sensível em bloco insuficiente.
- **v1.2:** ajustes motivados pelos testes (pronta para teste).

### Erros encontrados

- **Tom alarmista** nos perfis de risco alto ("altamente crítico", "prioridade absoluta"), apesar de o prompt dizer "sem alarmismo".
- **Plano de ação com 18 tópicos**, vários em imperativo (e não como diretriz a avaliar), e os colchetes do modelo apareceram literalmente no texto.
- **Conclusão mais forte que os dados:** "ausência de riscos" num perfil sem itens críticos, o que um autorrelato não permite afirmar.
- **Erro meu na checklist:** esperei o Bloco 1 em uma linha na TESTE-003, mas os dados tinham dois itens em alerta, e a IA acertou ao descrevê-los.

### O que aprendi

- **Frases fixas funcionam; instruções abstratas de estilo não.** As frases exatas do prompt foram reproduzidas em todos os testes, e "sem alarmismo" foi ignorado. Onde o texto precisa ser controlado, uso frase exata ou lista de termos proibidos.
- Um prompt bom não é só bem escrito: é testado contra casos que tentam quebrá-lo, incluindo respostas incompletas.
- Testar contra uma checklist exige que a checklist esteja certa.
- O pacote com frequência por extenso e natureza de cada item resolveu o erro de escala do primeiro teste, que não se repetiu em nenhum dos cinco perfis.

### Decisões

- **Plano de ação agrupado por bloco**, no máximo 4 tópicos. Um plano com 18 tópicos soltos fragmenta o raciocínio e dificulta a leitura técnica e a discussão com a gestão, e os fatores de um mesmo bloco costumam apontar para dinâmicas correlatas.
- **Seção de limitações com itens sensíveis críticos:** mesmo com o questionário 100% respondido, manter a frase fixa de completude e acrescentar a sinalização dos itens sensíveis críticos como ponto de verificação prioritária, sem criar alarme e sem concluir além dos dados.
- **A IA não afirma ausência de riscos.** Um autorrelato sem itens críticos só permite dizer que não foram identificados fatores críticos ou em alerta nos dados informados.
- O relatório é um **complemento**: não substitui a análise do profissional nem os protocolos de acolhimento e encaminhamento da organização. Isso entrou como limitação e como nota técnica fixa.

### Próximo passo

- Rodar os mesmos cinco perfis na v1.2 e comparar com a v1.1, procurando melhorias e também regressões.
