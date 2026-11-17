# Diário de bordo

## Fase 0: Preparação (15/11/2026)

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

### Próximo passo

- Fase 1: definir o protocolo fictício e a estrutura do relatório.
