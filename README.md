# Gerador de Relatório Psicossocial (NR-1) com IA

Projeto de automação com inteligência artificial que transforma as respostas de uma entrevista estruturada, baseada na NR-1, em um rascunho de relatório de avaliação psicossocial. Sou psicóloga e estudante de Engenharia de Software, e este projeto une as duas áreas: automatizar a parte repetitiva do trabalho para que o profissional dedique seu tempo à análise.

## Como funciona

1. As respostas da avaliação são registradas em um **Google Forms**.
2. Elas chegam em uma **planilha do Google Sheets**.
3. Um script em **Google Apps Script** organiza os dados e envia para uma **API de IA** (Gemini, no plano gratuito).
4. A IA devolve um rascunho estruturado, que o script transforma em um **documento do Google Docs**.
5. O profissional abre o documento, revisa, edita e assina.

## Avisos importantes

- Este projeto usa **apenas dados fictícios**. Nenhuma resposta de pessoa real é usada em testes, prints ou neste repositório.
- O relatório gerado é um **rascunho**. A IA não faz diagnóstico, não emite parecer e não decide aptidão. A análise e a responsabilidade técnica continuam sendo do profissional.
- O modelo deve se basear **somente nas respostas da avaliação**, sem inferir além dos dados.

## Ferramentas

- Google Forms, Google Sheets, Google Docs e Google Apps Script
- Google AI Studio (API do Gemini, plano gratuito)
- Claude, da Anthropic, como ferramenta de apoio ao desenvolvimento: usei para aprender e construir o projeto passo a passo, escrevendo e entendendo cada parte do código

## Status

Em desenvolvimento. Fase atual: **Fase 1** (definição do protocolo fictício e da estrutura do relatório).

## Documentação do processo

Registro cada etapa, os erros encontrados e o que aprendi em [docs/diario-de-bordo.md](docs/diario-de-bordo.md).

## Autora

**Gabriele Moreira Pereira**
[LinkedIn](https://linkedin.com/in/gabrielemoreirapereira) · [GitHub](https://github.com/gabrielemra)
