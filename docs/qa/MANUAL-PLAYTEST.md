# QA-003 — Protocolo de playtest (2 pessoas)

## Preparação

Usar release candidate no navegador com gravação de observações; explicar apenas controles mínimos, **não ensinar soluções**. Pedir consentimento antes de gravar. Não coletar dados pessoais desnecessários.

## Roteiro de observação

1. Mostrar Home e pedir para iniciar L01. Observar tempo até primeira peça.
2. Pedir para transportar 3 itens. Registrar confusões de direção/conexão.
3. L02: pedir para produzir dois materiais usando mesma máquina; observar se encontra painel de regras.
4. L03: pedir para separar outputs A/B, sem dicas. Registrar pontos de bloqueio.
5. Pedir explicação espontânea: "O que significa SHIFT neste jogo?"
6. Pedir para melhorar layout ou tentar novamente; observar desejo de otimizar.

## Formulário de registro

| Campo | Preencher após sessão |
|---|---|
| Tester anônimo | P1/P2 |
| Data/build/browser | |
| L01 concluiu sozinho? | SIM/NÃO |
| L02 concluiu sozinho? | SIM/NÃO |
| L03 concluiu sozinho? | SIM/NÃO |
| Tempo até primeira entrega correta | |
| Entendeu por que processador mudou? | |
| Pontos de confusão (com reprodução) | |
| Maior frustração | |
| O que foi divertido? | |
| Bugs e severidade | |
| Alterações propostas | |

## Decisão de balanceamento

Corrigir primeiro problemas de legibilidade, interação e regras; depois custos de shift e limites de estrelas. Fazer regressão automatizada para mudanças mecânicas. Se playtests não forem possíveis, reportar como NOT_RUN, não inventar avaliações.

## Registro da Fase 14

- Sessão P1: NOT_RUN — não houve participante humano disponível nesta execução; sem consentimento/sessão, não há observações a registrar.
- Sessão P2: NOT_RUN — não houve participante humano disponível nesta execução; sem consentimento/sessão, não há observações a registrar.
- Balanceamento: sem mudança. As soluções técnicas de referência continuam em L01 30 ticks, L02 65 e L03 70; esses dados de engine não substituem observação de jogadores.
- Próxima execução: usar o roteiro acima em um build jogável no browser e preencher os campos por sessão, removendo qualquer dado pessoal desnecessário.
