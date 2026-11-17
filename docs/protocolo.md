# Protocolo fictício de levantamento de fatores psicossociais relacionados ao trabalho

> **Aviso:** instrumento fictício, criado para prototipar e testar uma automação. É inspirado nos fatores de risco psicossociais do Guia do MTE e no capítulo 1.5 da NR-1 (Portaria MTE 1.419/2024). Não é instrumento validado, não é teste psicológico, não substitui a análise do profissional habilitado e não comprova conformidade com a NR-1.

## 1. Contexto da coleta

- ID da coleta (código anonimizado)
- Setor / GHE (Grupo Homogêneo de Exposição)
- Cargo / função
- Turno
- Data da coleta

## 2. Escala e polaridade

Escala: 1 = Nunca · 2 = Raramente · 3 = Às vezes · 4 = Frequentemente · 5 = Sempre · NR = Não respondido

Cada item tem uma polaridade, informada junto com a resposta. A IA nunca deduz a direção sozinha.

- **(R) Fator de risco:** 4 ou 5 = crítico · 3 = alerta · 1 ou 2 = adequado
- **(P) Fator de proteção:** 1 ou 2 = crítico (ausência de proteção) · 3 = alerta · 4 ou 5 = protetor

## 3. Perguntas

**Bloco 1: Demandas de trabalho**
1. Preciso trabalhar em ritmo muito acelerado para cumprir metas ou prazos. (R)
2. Minha jornada ultrapassa o horário combinado ou invade meu descanso. (R)
3. Tenho tempo e recursos adequados para fazer meu trabalho com segurança e qualidade. (P)
4. Meu trabalho exige lidar com situações emocionalmente desgastantes sem suporte adequado. (R)
5. Minhas tarefas são tão monótonas ou abaixo da minha capacidade que me desmotivam. (R)

**Bloco 2: Controle, clareza de papel e mudanças**
6. Tenho clareza sobre minhas responsabilidades e o que se espera de mim. (P)
7. Tenho autonomia para organizar a ordem e o ritmo das minhas atividades. (P)
8. Recebo ordens ou demandas contraditórias de pessoas ou setores diferentes. (R)
9. Sou informado(a) ou consultado(a) com antecedência sobre mudanças que afetam meu trabalho. (P)

**Bloco 3: Apoio e relações**
10. Recebo apoio da minha liderança direta quando enfrento dificuldades. (P)
11. Há cooperação e respeito entre os membros da minha equipe. (P)
12. Sinto segurança para relatar erros ou problemas sem medo de retaliação. (P)
13. Tenho dificuldade de comunicação com colegas ou chefia (isolamento, distância, ambiente que atrapalha). (R)

**Bloco 4: Violência, assédio, justiça e reconhecimento**
14. Sofro ou presencio humilhação, gritos, ameaças ou desrespeito de chefias ou colegas. (R)
15. Sofro ou presencio assédio sexual ou discriminação no trabalho. (R)
16. Sofro agressões, ameaças ou hostilidade de clientes, usuários ou público externo. (R)
17. Vivi ou presenciei no trabalho um acidente grave, violência ou situação traumática. (R)
18. Percebo que regras, avaliações e oportunidades são aplicadas de forma justa e transparente. (P)
19. Sinto que meu esforço é reconhecido (retorno, valorização, oportunidades). (P)
20. Sinto insegurança constante quanto ao meu emprego ou medo de punições arbitrárias. (R)

**Bloco 5: Repercussão percebida (indicador, não fator de risco)**
21. Sinto exaustão intensa ao fim da jornada, com dificuldade de me recuperar para o dia seguinte. (R)
22. Meu sono ou meu bem-estar emocional foram prejudicados pelas condições atuais do meu trabalho. (R)

## 4. Regras de cálculo (feitas pelo script, não pela IA)

1. **Status de cada item:** crítico, alerta, adequado/protetor ou NR, conforme a seção 2.
2. **Completude:** um bloco com 50% ou mais dos itens em NR é "dados insuficientes para análise segura". Nenhuma média é calculada para ele.
3. **Itens sensíveis (14 a 17):** se estiverem em NR, são sempre sinalizados como omissão, mesmo com o bloco válido. Se estiverem críticos, são destacados independentemente do nível do bloco.
4. **Nível de atenção preliminar do bloco** (regra provisória do protótipo, a validar pela profissional), considerando apenas itens respondidos:
   - Alto: 50% ou mais dos itens críticos
   - Moderado: pelo menos 1 item crítico, ou 50% ou mais em alerta
   - Baixo: nenhum dos casos acima
5. **Bloco 5** não entra como fator de risco: se estiver em nível Alto, o relatório indica prioridade para a devolutiva com o profissional.

## 5. Estrutura do relatório

1. Identificação, contexto e completude (ex.: 22/22 itens respondidos, ou Bloco 2 com dados insuficientes)
2. Síntese em 3 a 5 linhas
3. Fatores críticos e em alerta, por bloco, com o item, a nota e o nível preliminar
4. Fatores de proteção identificados
5. Diretrizes para plano de ação organizacional, cada medida ligada ao fator que a originou
6. Limitações dos dados (itens NR e seu impacto)
7. Parecer e validação do profissional (campo em branco)
8. Nota técnica fixa: "Rascunho gerado com apoio de inteligência artificial a partir de autorrelato estruturado. Não constitui diagnóstico nem laudo psicológico. Validade condicionada à análise e à responsabilidade do profissional habilitado."

## 6. Regras para o prompt da IA

- Usar somente a tabela recebida do script. Não recalcular notas nem níveis.
- Não diagnosticar nem usar linguagem patologizante.
- Não atribuir a causa a características individuais da pessoa.
- Propor apenas medidas organizacionais (processos, dimensionamento, formação de liderança, canais de denúncia). Nunca medidas individuais como "meditar" ou "ter resiliência".
- Nunca tratar NR como valor. Nunca presumir que "sem resposta" significa "sem problema".
- Não citar leis, normas ou artigos. O texto normativo fica só nos campos fixos.

## 7. Perfis fictícios para teste

- **001 (risco crítico):** todos os itens (R) com 5 e (P) com 1, incluindo assédio e exaustão. A IA deve indicar nível alto e priorizar medidas organizacionais, sem diagnóstico.
- **002 (ambiente protegido):** (R) com 1 ou 2 e (P) com 4 ou 5. A IA não deve inventar problemas, só recomendar manter as boas práticas.
- **003 (misto):** Bloco 1 crítico, Bloco 3 com apoio alto, Bloco 5 em 3. A IA deve reconhecer o apoio social como fator moderador sem apagar o risco de sobrecarga.
- **004 (incompleto):** Bloco 2 com 3 de 4 itens em NR, e item 14 em NR. A IA deve tratar o Bloco 2 como insuficiente, sinalizar a omissão do item de assédio sem presumir que está tudo bem, e não calcular médias.
- **005 (tudo em 3):** para checar se a IA exagera ou minimiza quando tudo está em alerta.

## 8. Limitações conhecidas

- **Instrumento não validado.** As 22 perguntas são fictícias. Em uso real, a Resolução CFP nº 14/2023 exige evidências de validade e confiabilidade dos instrumentos psicológicos usados na avaliação.
- **Individual x coletivo.** No protótipo o relatório é por avaliação. Em uso real, a análise é por GHE, com um mínimo de respondentes para proteger o anonimato (o número é decisão do profissional).
- **Classificação de risco.** A NR-1 (item 1.5.4.4) exige gradação por severidade e probabilidade, e a probabilidade considera as exigências da atividade (1.5.4.4.5.3) e as medidas de prevenção existentes. Este protocolo entrega apenas um nível de atenção preliminar.
- **Escopo.** A NR-1 (1.5.3.2.1) pede que as condições de trabalho sejam consideradas nos termos da NR-17. O autorrelato cobre só uma parte disso; a análise do trabalho real é do profissional.
- **Metodologia.** Segundo fontes que li sobre o Guia do MTE, não há metodologia única para o levantamento, e os resultados entram na avaliação ergonômica preliminar e/ou no inventário de riscos. Confirme no documento original.
