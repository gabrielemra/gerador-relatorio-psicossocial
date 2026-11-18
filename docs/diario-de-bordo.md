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
- Verificar fontes importa: uma análise bem escrita pode conter erros ou citações que eu não consigo confirmar.

### Decisões

- O **script calcula** (notas, status, níveis) e a **IA só redige** o texto com base nos dados prontos, para ela não inventar nem recalcular nada.
- A polaridade de cada item (risco ou proteção) fica no código, não no formulário, para não influenciar quem responde.

## Fase 2: Formulário e planilha (17/11/2026)

Montei o formulário no Google Forms, ligado a uma planilha de respostas.

### Erros encontrados

- Eu tinha feito uma pergunta separada por item e refiz com **grades de múltipla escolha**, uma por bloco, porque a planilha fica com uma coluna por item e o script lê mais fácil.
- Títulos com espaço sobrando (como " ID da coleta") apareceram nos cabeçalhos da planilha e precisaram ser corrigidos.

### O que aprendi

- Em uma grade, deixar a resposta **não obrigatória** faz o item em branco chegar à planilha como célula vazia, e é assim que o NR do protocolo é reconhecido.
- Numerar a escala no texto ("5. Sempre") deixa o script extrair a nota pelo começo do texto.
- Testei com quatro respostas fictícias, incluindo uma incompleta de propósito.

## Fase 3: Apps Script, leitura e organização dos dados (18/11/2026 — em andamento)

Escrevi o código que lê a última resposta da planilha e a transforma em uma lista de 22 itens, cada um com número, bloco, polaridade e nota.

### O que fiz

- Criei a tabela `PROTOCOLO` com bloco, polaridade e marcação de itens sensíveis.
- Escrevi a função `converterNota`, que transforma "5. Sempre" em 5 e devolve `null` quando o item está em branco, o texto é inválido ou a nota fica fora de 1 a 5.
- Montei a função `montarAvaliacao` e testei com a resposta incompleta (TESTE-004): os itens em branco saíram como `null` e os respondidos saíram corretos.

### Erros encontrados

- Apareceu "Ocorreu um erro desconhecido", sem número de linha. Era uma falha genérica da plataforma, e não do código. Ao rodar de novo, funcionou. Lição: ler a mensagem de erro inteira antes de mexer no código.
- O seletor de funções do editor estava em outra função, e eu quase rodei a errada.

### O que aprendi

- Organizar o código em dados fixos, funções pequenas e funções que juntam as peças facilita testar cada parte sozinha.
- `JSON.stringify` grava datas em horário UTC (o `Z` no final), então a data precisará ser formatada para o horário local no relatório.
- O `parseInt` lê o número do começo do texto e ignora o resto. Decidi que o script confia no formato do formulário.

### Próximo passo

- Escrever a função `statusItem`, que combina polaridade e nota em crítico, alerta, adequado, protetor ou NR, e depois calcular o nível de cada bloco.
