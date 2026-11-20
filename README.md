# Gerador de Relatório Psicossocial (NR-1) com IA

Projeto de automação com inteligência artificial que transforma as respostas de um levantamento estruturado de fatores psicossociais, inspirado na NR-1, em um rascunho de relatório. Sou psicóloga e estudante de Engenharia de Software, e este projeto une as duas áreas: automatizar a parte repetitiva do trabalho para que o profissional dedique seu tempo à análise.

## Como funciona

1. As respostas são registradas em um **Google Forms**.
2. Elas chegam em uma **planilha do Google Sheets**.
3. Um script em **Google Apps Script** lê a resposta, converte as notas, aplica as regras do protocolo (completude e polaridade dos itens) e envia o resultado já calculado para uma **API de IA** (Gemini, no plano gratuito).
4. A IA redige o texto do relatório com base apenas nos dados calculados, e o script gera um **documento do Google Docs**.
5. O profissional abre o documento, revisa, edita e assina.

## Avisos importantes

- Este projeto usa **apenas dados fictícios**. Nenhuma resposta de pessoa real é usada em testes, prints ou neste repositório.
- O protocolo é **fictício e não validado**. Ele é inspirado nos fatores de risco psicossociais do Guia do MTE e no capítulo 1.5 da NR-1, mas **não comprova conformidade** com a norma.
- O relatório é um **rascunho**. A IA não faz diagnóstico, não emite parecer nem laudo. A análise e a responsabilidade técnica são do profissional.
- Os cálculos são feitos pelo script. A IA só redige o texto e deve se basear **somente nos dados recebidos**, sem inferir além deles.
- Questionário isolado não comprova a gestão de riscos psicossociais. Este projeto automatiza apenas uma etapa de apoio ao levantamento, e os resultados exigem análise técnica do profissional.

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
- Fase 3: leitura e organização dos dados com Apps Script (em andamento)
- Próximas: cálculo dos níveis por bloco, chamada à IA, geração do relatório em Google Docs, testes e publicação

## Estrutura do repositório

- `docs/protocolo.md`: protocolo fictício, regras de cálculo, estrutura do relatório e limitações
- `docs/diario-de-bordo.md`: registro de cada fase, dos erros encontrados e do que aprendi
- `src/Codigo.gs`: código do Apps Script (sem chaves ou dados reais)

## Documentação do processo

Registro cada etapa, os erros encontrados e o que aprendi em [docs/diario-de-bordo.md](docs/diario-de-bordo.md).

## Autora

**Gabriele Moreira Pereira**
[LinkedIn](https://linkedin.com/in/gabrielemoreirapereira) · [GitHub](https://github.com/gabrielemra)
