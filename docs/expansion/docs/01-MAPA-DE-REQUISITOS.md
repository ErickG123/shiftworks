# Matriz de requisitos — 15 ideias + sistemas transversais

| ID | Ideia | Prompt principal | Critério observável resumido |
|---|---|---|---|
| SW-101 | Construção de esteiras por arrasto | 02 | Arrastar cria caminho válido orientado, uma única ação desfeita por Undo |
| SW-102 | Overlay de fluxo | 03 | Setas e conexões mostram rota real/obstruções sem interferir no estado |
| SW-103 | Inspetor de máquinas | 04 | Mostra modos, portas, erro, receita, tempo e feedback no mesh |
| SW-104 | Sensores programáveis | 14 | Condições determinísticas por material/contagem acionam alvo válido |
| SW-105 | Múltiplas receitas | 15 | Transformações encadeadas corretas com validação de entradas/saídas |
| SW-106 | Pedidos dinâmicos | 17 | Pedido muda durante execução sem intervenção manual e é vencível |
| SW-107 | Buffers de materiais | 16 | FIFO e bloqueio não causam duplicação nem perda |
| SW-108 | Passo a passo por tick | 05 | Pausado → +1 tick exato; renderização reflete o snapshot |
| SW-109 | Diagnóstico de gargalos | 06 | Avisos identificam motivo e célula sem falsos positivos graves |
| SW-110 | Painel de eficiência | 07 | Métricas reproduzíveis, cálculos testados e explicados |
| SW-111 | Campanha por setores | 12 | Setores, conteúdo e sequências coerentes com desbloqueios |
| SW-112 | Desafios opcionais | 13 | Missões secundárias não bloqueiam caminho principal |
| SW-113 | Blueprints | 18 | Salvar, aplicar, validar e migrar sem corromper layouts |
| SW-114 | Sandbox expandido | 19 | Grade maior/configurável com níveis preservados |
| SW-115 | Desafios de eficiência | 20 | Cenários otimizáveis com solução de referência, ranking local e replay |
| SW-201 | Catálogo e descrição de equipamentos | 08 | PT/EN completos e dados coerentes com motor |
| SW-202 | Tooltip contextual | 08 | Aparece no hover/foco, útil e acessível, sem tapar canvas |
| SW-203 | Card flutuante com modelo 3D animado | 09 | Preview real Three.js, isolado, pausável e sem leaks |
| SW-204 | Tutoriais guiados | 10 | T00/T01 e lições avançadas orientam ações verificáveis |
| SW-205 | Desbloqueios/conquistas/progresso | 11 | Regras persistentes, versionadas, testadas, com feedback correto |
| SW-206 | Polimento do HUD/gameplay | 21 | Canvas útil, atalhos, explicações e resultados consistentes |
| SW-207 | Testes e qualidade transversal | 22 | Suíte por requisito, estabilidade e desempenho com evidências |

## Prioridades e dependências

- **Baseline obrigatório:** 00, 01. Corrigir bugs de `R`, pausa→editar, esteiras L02 e enquadramento se ainda existirem, antes de introduzir novos comportamentos.
- **Núcleo de UX P0/P1:** 02 a 11 e 21; manter recortes incrementais e release seguro. A ordem numérica é a ordem preferencial de execução.
- **Expansão P2/pós-jam:** 12 a 20, com gates e flags quando necessário. Não vender conteúdo incompleto como jogável.
- **Validação final:** 22 e 23.
- A fase 12 preserva L01–L03 e acrescenta setores sem quebrar IDs; as fases 14–17 devem ser implementadas depois da base do motor e dos testes.

## Garantias sistêmicas

- Nenhum ID interno aparece cru como copy de UI; nenhum idioma invalida progresso ou câmeras.
- Nenhuma conquista é obtida por abrir modal ou visitar tela; apenas por evento validado e estado real.
- Não existe `setTimeout` influenciando resultado de ticks. `requestAnimationFrame` serve somente à apresentação.
- Selecionar equipamento, hover e preview não inserem peça nem consomem inventário.
- Playtest externo verifica se o jogador entende peças e fluxo sem instrução verbal.
