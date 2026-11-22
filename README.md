# Gerador de Relatório Psicossocial (NR-1) com IA

Projeto de automação com inteligência artificial que transforma as respostas de um levantamento estruturado de fatores psicossociais, inspirado na NR-1, em um rascunho de relatório. Sou psicóloga e estudante de Engenharia de Software, e este projeto une as duas áreas: automatizar a parte repetitiva do trabalho para que o profissional dedique seu tempo à análise.

## Como funciona

1. As respostas são registradas em um **Google Forms**.
2. Elas chegam em uma **planilha do Google Sheets**.
3. Um script em **Google Apps Script** lê a resposta, converte as notas, classifica cada item (crítico, alerta, adequado, protetor ou não respondido), calcula o nível de atenção preliminar de cada bloco e monta um **pacote de dados** já calculado.
4. O pacote é enviado a uma **API de IA** (Gemini, no plano gratuito), que redige o texto do relatório com base apenas nesses dados. O script confere o texto com um verificador automático e gera um **documento do Google Docs**.
5. O profissional abre o documento, revisa, edita e assina.

## Princípios de design

- **O script calcula, a IA redige.** Notas, status e níveis são calculados por código, que pode ser testado. A IA só escreve o texto a partir dos dados prontos, sem recalcular nem inferir.
- **A IA nunca adivinha a escala.** Cada item chega à IA com a frase da pergunta, a frequência por extenso ("Nunca", "Sempre") e a natureza (fator de risco ou de proteção). Isso evita que o modelo interprete a nota na direção errada, erro que apareceu no meu primeiro teste.
- **Transparência sem distorção.** Quando 50% ou mais dos itens de um bloco ficam sem resposta, o bloco é marcado como "dados insuficientes" e nenhuma conclusão é tirada. Os itens respondidos aparecem isolados, como dado bruto sinalizado. Itens sensíveis (assédio, violência, trauma) sem resposta, ou críticos, são sempre destacados, mesmo em blocos insuficientes e mesmo quando o questionário foi respondido por inteiro.
- **A IA não afirma ausência de riscos.** Um autorrelato sem itens críticos não prova que não há risco: o relatório diz apenas que não foram identificados fatores críticos ou em alerta nos dados informados.
- **Frases fixas onde o texto precisa ser controlado.** Nos testes, as frases exatas do prompt foram reproduzidas em todos os casos, e as instruções abstratas de estilo ("sem alarmismo") foram ignoradas. Por isso o prompt usa frases exatas e listas de termos proibidos.
- **A saída da IA é verificada por código.** O modelo varia entre execuções: a mesma resposta fictícia gerou "não respondido" em uma versão do prompt e a sigla "NR" em outra. Por isso o texto gerado passa por um verificador automático (sigla proibida, termos proibidos, estrutura, frases obrigatórias) e cada versão do prompt é medida com repetições, e não com uma execução isolada. O que o verificador não alcança (direção da escala, fatos inventados, diagnóstico) exige leitura humana.
- **A polaridade fica no código.** A marcação de cada item como risco ou proteção não aparece no formulário, para não influenciar quem responde.
- **Chave fora do código.** A chave da API fica nas Propriedades do script e nunca no repositório. O nome do modelo e a versão do prompt ficam em constantes únicas.
- **O prompt é versionado e testado.** Cada versão fica em `prompts/`, com as mudanças, os casos de teste (incluindo respostas incompletas e casos sensíveis), os erros encontrados e a comparação entre versões.
- **O relatório é um rascunho editável.** A análise, o parecer e a decisão final continuam sendo do profissional.

## Avisos importantes

- Este projeto usa **apenas dados fictícios**. Nenhuma resposta de pessoa real é usada em testes, prints ou neste repositório. No plano gratuito do Gemini, o conteúdo enviado pode ser usado pelo Google para melhorar seus produtos, o que reforça essa regra.
- O protocolo é **fictício e não validado**. Ele é inspirado nos fatores de risco psicossociais do Guia do MTE e no capítulo 1.5 da NR-1, mas **não comprova conformidade** com a norma.
- O relatório é um **rascunho**. A IA não faz diagnóstico, não emite parecer nem laudo. A análise e a responsabilidade técnica são do profissional.
- O relatório é um complemento: **não substitui** a análise do profissional, os protocolos de acolhimento e encaminhamento da organização, nem a atuação imediata diante de relatos de violência.
- Questionário isolado não comprova a gestão de riscos psicossociais. Este projeto automatiza apenas uma etapa de apoio ao levantamento, e os resultados exigem análise técnica do profissional.
- Os cálculos são feitos pelo script. A IA só redige o texto e deve se basear **somente nos dados recebidos**, sem inferir além deles.
- Modelos de linguagem podem errar (por exemplo, uma palavra com final em inglês apareceu em um dos testes). A revisão do profissional é obrigatória.

## Referências normativas

- NR-1, capítulo 1.5 (Gerenciamento de Riscos Ocupacionais), conforme a Portaria MTE nº 1.419/2024, com vigência prevista para 26/05/2026 (Portaria MTE nº 765/2025)
- Guia de informações sobre os fatores de riscos psicossociais relacionados ao trabalho (MTE, 2025)
- Manual de interpretação e aplicação do capítulo 1.5 da NR-1, GRO/PGR (MTE, 2026)
- Resolução CFP nº 14/2023 (versão comentada), sobre a atuação de psicólogas(os) na avaliação de riscos psicossociais relacionados ao trabalho

As limitações do protocolo estão descritas em [docs/protocolo.md](docs/protocolo.md).

## Ferramentas

- Google Forms, Google Sheets, Google Docs e Google Apps Script
- Google AI Studio (API do Gemini, plano gratuito)
- Claude, da Anthropic, como ferramenta de apoio ao desenvolvimento: usei para aprender e construir o projeto passo a passo, escrevendo e entendendo cada parte do código

## Status

Em desenvolvimento.

- Fase 0: preparação (concluída)
- Fase 1: protocolo fictício e estrutura do relatório (concluída)
- Fase 2: formulário e planilha de respostas (concluída)
- Fase 3: leitura, conversão e cálculo dos níveis por bloco com Apps Script (concluída)
- Fase 4: pacote de dados e conexão com a API do Gemini (concluída)
- Fase 5: engenharia do prompt (em andamento: v1.1 e v1.2 testadas nos cinco perfis; v1.3 e verificador automático prontos para teste)
- Próximas: geração do relatório em Google Docs, gatilho automático, testes e publicação

## Testes

O código tem funções de teste que rodam pelo editor do Apps Script. Elas usam respostas fictícias: risco alto, ambiente protegido, perfil misto, uma resposta incompleta e um caso sensível em bloco insuficiente. Os testes conferem a conversão das notas, a classificação dos itens, os casos de borda (50% exatos), os erros para dados inválidos, o pacote enviado à IA, a conexão com a API e o texto gerado em cada perfil. Para o texto da IA, um verificador automático confere as regras que podem ser checadas por código, e uma função de repetição executa o mesmo perfil várias vezes para medir a taxa de problemas de cada versão do prompt. Os resultados estão registrados em `prompts/`.

## Estrutura do repositório

- `docs/protocolo.md`: protocolo fictício, regras de cálculo, estrutura do relatório e limitações
- `docs/diario-de-bordo.md`: registro de cada fase, dos erros encontrados e do que aprendi
- `src/Codigo.gs`: código do Apps Script (sem chaves ou dados reais)
- `prompts/`: versões do prompt enviado à IA (`v1.md`, `v1.1.md`, `v1.2.md`, `v1.3.md`), com mudanças, testes, taxa de problemas e comparação entre versões

## Documentação do processo

Registro cada etapa, os erros encontrados e o que aprendi em [docs/diario-de-bordo.md](docs/diario-de-bordo.md).

## Autora

**Gabriele Moreira Pereira**
[LinkedIn](https://linkedin.com/in/gabrielemoreirapereira) · [GitHub](https://github.com/gabrielemra)
