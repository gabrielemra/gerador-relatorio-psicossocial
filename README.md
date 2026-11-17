# Gerador de Relatório Psicossocial (NR-1) com IA

Projeto de automação com inteligência artificial que transforma as respostas de um levantamento estruturado de fatores psicossociais, inspirado na NR-1, em um rascunho de relatório. Sou psicóloga e estudante de Engenharia de Software, e este projeto une as duas áreas: automatizar a parte repetitiva do trabalho para que o profissional dedique seu tempo à análise.

## Como funciona

1. As respostas são registradas em um **Google Forms**.
2. Elas chegam em uma **planilha do Google Sheets**.
3. Um script em **Google Apps Script** valida os dados, calcula os níveis por bloco e envia o resultado para uma **API de IA** (Gemini, no plano gratuito).
4. A IA redige o texto do relatório com base apenas nos dados calculados, e o script gera um **documento do Google Docs**.
5. O profissional abre o documento, revisa, edita e assina.

## Avisos importantes

- Este projeto usa **apenas dados fictícios**. Nenhuma resposta de pessoa real é usada em testes, prints ou neste repositório.
- O protocolo é **fictício e não validado**. Ele é inspirado nos fatores de risco psicossociais do Guia do MTE e no capítulo 1.5 da NR-1, mas **não comprova conformidade** com a norma.
- O relatório é um **rascunho**. A IA não faz diagnóstico, não emite parecer nem laudo. A análise e a responsabilidade técnica são do profissional.
- Os cálculos são feitos pelo script. A IA só redige o texto e deve se basear **somente nos dados recebidos**, sem inferir além deles.

## Referências normativas

- NR-1, capítulo 1.5 (Gerenciamento de Riscos Ocupacionais), conforme a Portaria MTE nº 1.419/2024
- Guia de fatores de riscos psicossociais relacionados ao trabalho, do MTE
- Resolução CFP nº 14/2023, sobre a atuação de psicólogas(os) na avaliação de riscos psicossociais relacionados ao trabalho

As limitações do protocolo estão descritas em [docs/protocolo.md](docs/protocolo.md).

## Ferramentas

- Google Forms, Google Sheets, Google Docs e Google Apps Script
- Google AI Studio (API do Gemini, plano gratuito)
- Claude, da Anthropic, como ferramenta de apoio ao desenvolvimento: usei para aprender e construir o projeto passo a passo, escrevendo e entendendo cada parte do código

## Status

Em desenvolvimento. Fase atual: **Fase 1** (protocolo fictício e estrutura do relatório) concluída; próxima: **Fase 2** (Google Forms e planilha).

## Documentação do processo

Registro cada etapa, os erros encontrados e o que aprendi em [docs/diario-de-bordo.md](docs/diario-de-bordo.md).

## Autora

**Gabriele Moreira Pereira**
[LinkedIn](https://linkedin.com/in/gabrielemoreirapereira) · [GitHub](https://github.com/gabrielemra)
