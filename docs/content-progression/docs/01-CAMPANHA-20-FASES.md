# Campanha v2 — 20 fases, 5 setores

Este arquivo descreve **propostas para implementação**. L01–L03 são pré-existentes e devem ser preservadas; demais definições precisam ser calibradas e validadas por fixtures reais. IDs são estáveis.

| ID | Setor | Nome PT-BR / EN | Desafio e métrica principal | Introdução | Observação |
|---|---|---|---|---|---|
| L01 | Fundamentos | Primeira Linha / First Line | Mover 3 BLUE_BLANK do Source ao Dock | Conveyor | Preservar fixture e progresso originais |
| L02 | Fundamentos | Uma Máquina, Dois Trabalhos / One Machine, Two Jobs | 3 CUT_PLATE e 3 PRESSED_BLOCK com SHIFT Processor | Processor | Preservar fixture/score atual |
| L03 | Fundamentos | Roteamento Inteligente / Smart Routing | 3 CUT_PLATE em A e 3 PRESSED_BLOCK em B | Diverter | Preservar fixture/score atual |
| L04 | Fundamentos | Linha Integrada / Integrated Line | 3 CUT_PLATE A + 3 PRESSED_BLOCK B com restrições de layout | Integrar | Sintetizar construção/regras |
| L05 | Eficiência | Fila de Espera / Waiting Queue | 4 CUT_PLATE com buffer limitado e retenção observável | Buffer | Ensinar FIFO e backpressure |
| L06 | Eficiência | Ritmos Diferentes / Different Rhythms | 2 fluxos com cadências assimétricas e entrega correta | Buffer | Equilibrar taxa de produção |
| L07 | Eficiência | Uma Máquina Só / One Machine Only | 6 produtos com apenas 1 Processor e trocas otimizáveis | Processor+Buffer | Evidenciar custo de mudança |
| L08 | Eficiência | Espaço Contado / Tight Space | Entregar pedidos com obstáculos/estoque limitado | Layout | Mais de uma solução preferível |
| L09 | Automação Inteligente | Olhos da Linha / Eyes on the Line | Sensor lê item e causa ação automática validável | Sensor | Primeiro sensor configurável |
| L10 | Automação Inteligente | Dividir para Vencer / Divide to Win | Splitter distribui materiais por duas linhas | Splitter | 2 saídas e backpressure |
| L11 | Automação Inteligente | Dois Caminhos, Um Destino / Two Paths One Destination | Merger combina 2 entradas sem colisões | Merger | Política de arbitragem |
| L12 | Automação Inteligente | Fábrica Autônoma / Autonomous Factory | Sensor e roteamento adaptam produção sem intervenção | Sensor+Splitter+Merger | Pipeline de regras |
| L13 | Produção Avançada | Novo Metal / New Metal | COPPER_BLANK CUT → COPPER_STRIP | Copper recipe | Novo material com Processor |
| L14 | Produção Avançada | Primeira Montagem / First Assembly | COPPER_STRIP + INSULATOR → CIRCUIT | Assembler | Primeira receita 2 insumos |
| L15 | Produção Avançada | Duas Linhas / Two Lines | CUT_PLATE + PRESSED_BLOCK → FRAME; circuito em paralelo | Assembler | Duas cadeias, 2 produtos |
| L16 | Produção Avançada | Módulo de Controle / Control Module | FRAME + CIRCUIT → CONTROL_MODULE | Assembler | Encadeamento multicamada |
| L17 | SHIFT Master | Mudança de Turno / Shift Change | Duas ondas de pedidos em tick lógico | Dynamic Orders | Primeira variação de demanda |
| L18 | SHIFT Master | Sem Parar / Without Stopping | Máquinas e rotas reconfiguram sem intervenção durante RUNNING | Auto Config | SHIFT de função e fluxo |
| L19 | SHIFT Master | Linha de Elite / Elite Line | CONTROL_MODULE + PRESSED_BLOCK → AUTOMATION_UNIT | Full chain | Produto final complexo |
| L20 | SHIFT Master | SHIFT Master / SHIFT Master | Múltiplas ondas e produtos com orçamento/eficiência | Todos | Capstone jogável |

## Regras de inclusão

- Quatro fases por setor, IDs L01–L20, desbloqueio sequencial por conclusão real. Setores não são saves alternativos.
- Em cada level: `id`, `sectorId`, `titleKey`, `descriptionKey`, `hintKeys`, `prerequisites`, `board`, `fixedComponents`, `availableComponents`, `sourcePlan`, `objectivePlan`, `scoreThresholds`, `tutorialId`, `referenceFixture` e restrições versionadas.
- L01–L03: preservar os arquivos/objetivos de produção existentes e scores históricos, usando adapters se o schema evoluir.
- L04–L20: nenhum número de esteiras, coordenada, timer ou threshold de estrelas é definitivo até fixture. O Codex deve calcular e explicar o motivo de cada orçamento.
- O uso de equipamento em fase pode ser obrigatório como lição, mas nunca substituir a verificação da produção/entregas reais por flag manual de inventário.
- Todas as fases devem suportar *multiple solutions*, salvo objetivo lógico explicitamente restrito. Não impor caminho único por fixture.
- Fases publicadas devem ter tutorial ou ajuda que ensina seus componentes, preview 3D e objetivos traduzidos, inclusive falha de estoque/portas.
- A campanha deve oferecer repetição, próximas fases, métricas e progresso salvo no modo correto. Sandbox não concede vitória de campanha.
- Resoluções recomendadas: 8×8 nos fundamentos; 10×10 e 12×12 quando a cadeia de produção demandar, sem explodir complexidade/render.
- Divisão de release: publicar apenas níveis com todos os gates, mesmo que isso signifique 8–10 fases no Game Off e restante pós-evento.
