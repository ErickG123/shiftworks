# SHIFTWORKS — Game Design Document (GDD)

> **Versão:** 0.1 — concepção e escopo de game jam  
> **Data:** 18 de novembro de 2026  
> **Evento:** GitHub Game Off 2026 — tema **SHIFT**  
> **Prazo de submissão:** 1º de dezembro de 2026, 13h37 PST (18h37, horário de Brasília, sujeito à conferência na página oficial)  
> **Status:** proposta inicial, pronta para orientar um protótipo; decisões ainda podem mudar após playtesting  
> **Nome:** SHIFTWORKS (provisório; verificar disponibilidade antes de publicar)

## 1. Resumo executivo

SHIFTWORKS é um jogo single-player de **automação industrial 3D isométrica**, com construção modular livre dentro de terrenos pequenos, resolução de puzzles de produção e máquinas capazes de **trocar automaticamente de função** conforme o material que recebem.

O jogador monta esteiras e equipamentos, define regras simples do tipo **SE condição, ENTÃO ação** e observa a fábrica trabalhar. Cada fase apresenta um pedido e restrições, mas permite soluções distintas. Um modo Sandbox usa os mesmos componentes sem metas obrigatórias.

**Fantasia central:** “Criei uma fábrica pequena que se reorganiza sozinha para resolver problemas.”

**Promessa da primeira versão:** construir uma linha produtiva para dois produtos usando a mesma máquina, configurar suas regras e vê-la funcionar autonomamente até completar um pedido.

**Princípio de escopo:** o jogo precisa ser *divertido e publicável* em 13 dias, não um simulador industrial abrangente. Não existe backend, multiplayer, economia complexa, física realista nem modelos externos obrigatórios.

## 2. Ficha do projeto

| Item | Definição |
|---|---|
| Gênero | Automation puzzle / miniature factory builder |
| Público | Jogadores que gostam de lógica, construção e otimização |
| Plataforma | Navegador desktop; build HTML5 para itch.io |
| Câmera | Ortográfica, isométrica, rotação da câmera bloqueada no MVP |
| Mundo | Grades pequenas (base: 8×8); grade variável por fase se necessário |
| Sessões | 3–8 minutos por fase; Sandbox sem limite |
| Input | Mouse + teclado |
| Stack | Vite, TypeScript, Three.js, CSS e Web Audio API; GSAP opcional |
| Rede | Offline após carregamento, sem servidor de gameplay |
| Arte | Geometria procedural, materiais planos, sombras leves, emissivos e animações |
| Idiomas | Inglês como idioma de publicação; PT-BR opcional se não comprometer prazo |

## 3. Conexão com o tema SHIFT

A mudança é parte da lógica da fábrica, não apenas uma tecla:

1. **Function Shift:** a mesma máquina muda entre CUT e PRESS ao receber materiais diferentes.
2. **Flow Shift:** desviadores mudam de direção segundo propriedades do item.
3. **Production Shift:** pedidos variam e exigem reaproveitar infraestrutura compartilhada.
4. **Trade-off:** mudar de função custa ciclos, criando decisões de otimização.

A troca precisa ser visível: luzes e partes móveis mudam de posição, com um som curto e indicador de modo.

## 4. Princípios de design

1. **Construir, programar, assistir, melhorar.** Esse é o ciclo essencial.
2. **Regras legíveis.** Nunca exigir escrever código; regras visuais com condições e ações explícitas.
3. **Múltiplas soluções.** Não codificar um layout único por fase.
4. **Poucos sistemas interagindo bem.** Complexidade emergente, não catálogo enorme.
5. **Transparência da simulação.** O jogador sabe por que um item parou, mudou ou foi rejeitado.
6. **Visual sem arte manual.** Formas simples, composição, luz e movimento garantem leitura.

## 5. Loop de gameplay

### Loop por fase

1. Ler o pedido e as restrições.
2. Posicionar fonte(s), esteiras, processador SHIFT, desviador e saída(s) permitidos.
3. Abrir a configuração dos dispositivos e escolher regras visuais.
4. Iniciar a simulação; observar o fluxo e indicadores.
5. Detectar erros (engarrafamento, produto errado, máquina em modo inadequado).
6. Voltar ao modo de edição, corrigir e reiniciar a simulação.
7. Completar o pedido; receber resultado e tentar uma solução mais eficiente.

### Repetição voluntária

A fase é vencida ao entregar as quantidades corretas. O jogador pode jogar novamente para obter menos ciclos, menos componentes e zero rejeições.

### Modo Sandbox

Mesmo motor de simulação e editor, mas sem pedido obrigatório, inventário de peças livre e terreno 10×10 (ou 8×8 se houver pressão de prazo). No MVP final: um único mapa de Sandbox e sem criação de mapas personalizados.

## 6. Componentes da fábrica

| Componente | Papel | Configuração MVP | Regra de ocupação |
|---|---|---|---|
| Source | Emite material bruto, conforme sequência predefinida da fase | Não editável no desafio; duas opções no Sandbox | 1 célula, fixa |
| Conveyor | Move itens para a célula seguinte | Orientação N/E/S/W | 1 célula |
| SHIFT Processor | Transforma matéria-prima em produto conforme modo | `blue → CUT`; `amber → PRESS` configurável em duas linhas visuais | 1 célula |
| Smart Diverter | Encaminha produtos a duas saídas possíveis | `plate → A`; `block → B` | 1 célula |
| Output A/B | Conta entregas de produto correto | Destino da fase, não editável | 1 célula, fixo |
| Inspector / Sensor | No MVP é um indicador integrado à entrada da máquina; sensor independente é pós-jam | Mostra leitura e causa da decisão | Não ocupa célula independente |

**Observação de escopo:** sensor remoto, cabos de sinal, braços robóticos, splitters com buffers complexos e múltiplas receitas em cadeia ficam fora da versão da jam. O visual da máquina terá sensores, mas a lógica inicialmente se baseia no item que está entrando nela, eliminando disputas por sinais.

### Ícones e formas

- Source: silo/cubo alto com seta de saída.
- Conveyor: segmento metálico com roletes e seta direcional.
- Processor: base cúbica com cabeçote móvel; emissivo azul = CUT, laranja = PRESS.
- Diverter: placa em Y com pivô animado.
- Output: plataformas com pictogramas de produto.
- Itens: blocos azuis e âmbar, identificados também por forma, não apenas cor.

## 7. Itens e receitas do MVP

| Entrada | Operação | Saída | Duração base de processamento |
|---|---|---|---|
| Blue Blank (bloco azul) | CUT | Cut Plate (placa) | 3 ticks |
| Amber Blank (bloco âmbar) | PRESS | Pressed Block (bloco compacto) | 3 ticks |

- **Troca de modo:** 2 ticks, apenas quando o modo necessário difere do modo atual.
- **Tick de lógica:** 250 ms em velocidade 1×.
- **Conveyor:** tenta transferir 1 item para o próximo componente a cada tick; 1 item máximo por célula.
- **Source:** tenta emitir 1 item a cada 5 ticks, respeitando ocupação.
- **Processor:** aceita no máximo 1 item em processamento; ao receber um item, aplica sua regra, troca de modo se necessário e depois processa; o item fica retido até saída livre.
- **Diverter:** decide a saída na chegada do item, com base no `productType`. Não muda a rota de um item já em trânsito.
- **Outputs:** só validam produtos correspondentes; produto incorreto conta como rejeição e não preenche objetivo.

Esses tempos são valores iniciais de balanceamento e podem ser ajustados depois de testes. A animação visual interpola estados entre ticks; não define a regra de negócio.

### Regras condicionais

No MVP, cada processador e desviador terá **até duas regras**, num editor de linhas:

- `IF incoming.type == BLUE_BLANK THEN mode = CUT`
- `IF incoming.type == AMBER_BLANK THEN mode = PRESS`
- `IF incoming.productType == CUT_PLATE THEN route = A`
- `IF incoming.productType == PRESSED_BLOCK THEN route = B`

As regras são avaliadas na chegada do item. Se nenhuma corresponde, o dispositivo pausa o item e mostra erro de configuração. Duas regras com mesma condição são inválidas, evitando ambiguidade. As decisões ficam associadas ao item enquanto ele ocupa o dispositivo, não são sobrescritas por itens seguintes.

## 8. Modelo de simulação determinístico

### Estados

`EDITING` → `RUNNING` ↔ `PAUSED` → `RESULT`.  
A ação **Edit** durante ou após a execução interrompe e reinicia a simulação, preservando layout e regras. Deve informar claramente que o progresso da tentativa será zerado.

### Ordem de atualização de cada tick

1. Ler comandos pendentes permitidos para o modo atual (pausar/velocidade).
2. Finalizar processamentos e mudanças de modo cujo contador chegou a zero.
3. Planejar transferências de itens com base em um snapshot do tabuleiro.
4. Resolver reservas de destino de forma determinística e sem sobreposição.
5. Aplicar movimentos e avaliar entrada de máquinas/desviadores.
6. Tentar emissão das fontes, respeitando ocupação e período.
7. Atualizar contagem dos outputs e condições de vitória/erro.
8. Emitir eventos imutáveis para renderização, áudio e HUD.

**Invariantes:**

- Um item ocupa, no máximo, uma posição lógica.
- Uma célula ou equipamento admite capacidade explícita; nenhuma dupla ocupação.
- Item sem rota válida aguarda; não atravessa máquinas.
- Mover componentes só é permitido em `EDITING`.
- Reiniciar com mesmo layout, configuração e sequência de fonte produz o mesmo resultado.
- A câmera, FPS e GSAP nunca alteram decisões de simulação.
- Transferências simultâneas respeitam uma prioridade fixa e documentada (por exemplo, ordem de coordenadas e ID) e reservas de destino, evitando duplicação.

### Bloqueios e diagnóstico

Se não houver movimentação, processamento nem emissão possível por um número configurável de ticks e o objetivo estiver incompleto, mostrar aviso de *possível deadlock*. Não terminar a fase automaticamente: jogador pode pausar e editar.

## 9. Construção e controles

### Modelo de construção

- Grade inicial 8×8, terreno plano.
- Source e outputs são elementos fixos do puzzle; peças colocáveis respeitam um limite por tipo quando a fase exigir.
- Selecionar uma ferramenta na barra, pré-visualizar peça fantasma e clicar na célula válida para posicionar.
- Rotacionar em incrementos de 90°.
- Direção de entrada/saída sempre visível na peça selecionada.
- Não permitir sobreposição, construção fora da grade nem conexão para fora dos limites sem endpoint.
- Um componente removido devolve a peça ao orçamento da fase.
- **Conexões não são cabos manuais:** duas peças se conectam quando adjacentes e com entrada/saída compatíveis.

### Comandos desktop

| Ação | Entrada |
|---|---|
| Colocar / selecionar | Clique esquerdo |
| Remover | Clique direito no modo de edição |
| Rotacionar peça selecionada | R |
| Iniciar / pausar | Espaço, quando foco não estiver em input |
| Cancelar ferramenta | Esc |
| Zoom | Roda do mouse |
| Alternar ferramenta | Clique na toolbar |
| Reiniciar tentativa | Botão Reiniciar |

Câmera ortográfica em 45° de azimute e inclinação aproximada de 35°; pan opcional por botão do meio, com direções intuitivas e sem inversão; clamp de zoom. Rotação livre da câmera não é essencial e fica fora do MVP.

### UX necessária

- Célula válida em verde/contorno positivo e inválida em vermelho/contorno negativo (com ícone/forma alternativos).
- Overlay discreto de conexão quando peça está selecionada.
- Item parado exibe tooltip de motivo: `output blocked`, `waiting to shift`, `missing rule`, `wrong destination`.
- Pausar deve congelar **lógica e animações** de simulação de modo coerente.
- Ao completar o pedido, mostrar resumo e botão de próxima fase / tentar novamente.

## 10. Fases e progressão

Três fases fechadas são obrigatórias; quarta e quinta apenas se houver tempo.

| Fase | Nome | Lição | Pedido / restrição |
|---|---|---|---|
| 01 | First Line | Posicionamento e direção de esteiras | Levar 3 Blue Blanks ao destino por rota simples; sem processador (tutorial de transporte) |
| 02 | One Machine, Two Jobs | Programar o SHIFT Processor | Transformar 3 Blue Blanks em Cut Plates e 3 Amber Blanks em Pressed Blocks; fonte alterna tipos; saídas próximas, pré-conectadas para focar na lógica |
| 03 | Smart Routing | Integrar processamento e desviador | Entregar 3 plates em A e 3 blocks em B; terreno 8×8, limite de esteiras e um único processador |
| 04 (extra) | Tight Space | Otimização espacial | Mesmo pedido, obstáculos e orçamento reduzido |
| 05 (extra) | Rush Order | Mudança de demanda | Quantidades desiguais e objetivo adicional de ciclos |

**Atenção de consistência:** a Fase 01 usa um `Receiving Dock` que aceita matéria-prima bruta. As Fases 02–05 usam outputs para produtos processados. O motor trata ambos como `Output` configurado por tipo permitido.

### Critérios de vitória

- Todas as quantidades exigidas entregues ao destino correto.
- Sem exigir desmontagem da fábrica ou cliques em momentos específicos durante a execução.
- Em fase com rejeições, pedidos ainda podem ser completados; rejeições afetam a pontuação.

### Pontuação

- 1 estrela: atender o pedido.
- 2 estrelas: atender o pedido abaixo do limite de ciclos definido na fase.
- 3 estrelas: atender o pedido abaixo do limite de ciclos **e** dentro do orçamento de componentes, sem rejeições.

Limites são calibrados depois de criar uma solução de referência para cada fase. Não publicar metas numéricas arbitrárias antes do playtest. Exibir métricas: ciclos, componentes usados, itens corretos, rejeições e trocas de modo.

## 11. Sandbox

- Mesmo editor e simulação, sem objetivos obrigatórios.
- Fonte configurável para emitir azul, âmbar ou sequência alternada.
- Permitir todos os tipos de componentes do MVP sem orçamento.
- Outputs exibem contadores independentes.
- Um layout padrão demonstrativo aparece na primeira abertura.
- Botões `Limpar`, `Carregar exemplo`, `Iniciar`, `Pausar`, `Reiniciar`.
- Persistência em `localStorage` por JSON versionado, se não ameaçar a conclusão das três fases. Export/import JSON é pós-jam.

## 12. Interface e HUD

### Tela principal

- **Topo esquerdo:** logo SHIFTWORKS e nome da fase.
- **Topo central:** objetivo `Plate 1/3`, `Block 2/3`.
- **Topo direito:** ciclos, velocidade e opções de áudio.
- **Esquerda:** toolbar de colocação (conveyor, processor, diverter, remove).
- **Centro:** tabuleiro 3D e objetos animados.
- **Direita contextual:** painel do componente selecionado, orientação e regras.
- **Rodapé:** controles de simulação, mensagens de diagnóstico e instruções de teclado.

A janela mínima alvo é 1280×720. Em janelas menores, a barra lateral pode recolher; não priorizar toque no MVP. Botões grandes, rótulos visíveis e estados de foco acessíveis.

### Fluxos de tela

`Menu inicial → Seleção de fase/Sandbox → Editor → Simulação → Resultado → Próxima fase ou Replay`.

Tutorial progressivo por mensagens curtas e realce do elemento relevante, não texto longo bloqueando a tela.

## 13. Direção visual

**Estilo:** fábrica em miniatura, low-poly limpo, quase diorama. Chão escuro, equipamentos em tons metálicos suaves, fluxo de itens coloridos e luzes indicadoras. Evitar acabamento de protótipo genérico: cada tipo de máquina tem silhueta própria.

**Recursos criados via código:** BoxGeometry, CylinderGeometry, ExtrudeGeometry simples, materiais MeshStandardMaterial, bordas destacadas, sombras leves, pequenas partículas e animação de roletes/cabeçotes.

**Contraste:** usar padrões ou pictogramas além de azul/âmbar; o jogador não pode depender só de cor para diferenciar insumos. Evitar excesso de bloom que prejudique leitura.

**Animações obrigatórias:** deslocamento visual dos itens entre células, comutação mecânica CUT ↔ PRESS, rotação do desviador, feedback de entrega e indicador de erro.

**Áudio:** sons sintéticos originais discretos por Web Audio API (colocação, mudança de modo, processamento, entrega, vitória), opção de silenciar, volume controlável. Música é opcional. Não depender de bibliotecas de arquivos de áudio externos.

## 14. Arquitetura técnica

### Decisão principal

**Vite + TypeScript + Three.js**, sem backend e sem Angular no MVP. Angular pode entrar em um produto posterior se houver demanda real por interfaces maiores; para a jam, separação modular em TypeScript reduz dependências e esforço de integração.

**GSAP:** opcional apenas para animações visuais; nenhuma lógica da simulação pode depender dele. **Rapier:** não necessário (movimentação por grade determinística). **Vitest:** testes do motor e validação de fases.

### Organização sugerida

```text
shiftworks/
├── docs/
│   ├── GDD.md
│   ├── requirements.md
│   ├── decisions/
│   │   └── ADR-001-deterministic-grid-simulation.md
│   └── reports/
├── public/
├── src/
│   ├── game/
│   │   ├── domain/             # modelos .model.ts, receitas e componentes
│   │   ├── simulation/         # ticks, movimentação, máquinas, validações
│   │   ├── levels/             # definições de fases por dados
│   │   ├── rendering/          # Three.js, câmeras, meshes, efeitos
│   │   └── interaction/        # raycasting, seleção e construção
│   ├── ui/                     # menus, toolbar, HUD e painéis
│   ├── styles/
│   └── main.ts
├── tests/
├── package.json
└── index.html
```

### Contratos principais

```ts
type ItemType = 'BLUE_BLANK' | 'AMBER_BLANK' | 'CUT_PLATE' | 'PRESSED_BLOCK';
type MachineMode = 'CUT' | 'PRESS';
type Direction = 'N' | 'E' | 'S' | 'W';
type GameMode = 'EDITING' | 'RUNNING' | 'PAUSED' | 'RESULT';

interface GridPosition { x: number; y: number; }
interface ItemModel { id: string; type: ItemType; }
interface ComponentModel {
  id: string;
  type: 'SOURCE' | 'CONVEYOR' | 'PROCESSOR' | 'DIVERTER' | 'OUTPUT';
  position: GridPosition;
  direction: Direction;
  config: Record<string, unknown>;
}
interface LevelModel {
  id: string;
  width: number;
  height: number;
  fixedComponents: ComponentModel[];
  availableComponents: Partial<Record<ComponentModel['type'], number>>;
  goals: Array<{ outputId: string; itemType: ItemType; quantity: number }>;
}
```

**Nota:** contrato preliminar, não substitui tipagem discriminada por componente na implementação. Evoluir para `ComponentModel` como union discriminada, sem `Record<string, unknown>` genérico no código final.

### Persistência

- Progresso de fases e preferências em localStorage.
- Layout do Sandbox em JSON versionado se entrar no escopo.
- Falha de persistência não impede jogar.

### Testes essenciais

- Conversão de matérias-primas segue receita/mode corretos.
- Mudança de modo custa exatamente os ticks configurados.
- Item não duplica/desaparece sob bloqueio de esteira.
- Um componente não aceita dois itens além de sua capacidade.
- Saída errada não conta no objetivo correto.
- Regras repetidas/conflitantes são rejeitadas com feedback.
- Mesmo cenário e mesma sequência produzem o mesmo resultado.
- Todos os três níveis podem ser vencidos com solução de referência validada automaticamente.
- Travar/destravar a visualização ou mudar FPS não altera a lógica.
- Build estático inicia e responde a interação de mouse/teclado.

## 15. Escopo e prioridades

### P0 — demo vertical slice (não negociar)

- Terreno 8×8, câmera ortográfica e interação por clique.
- Source, Conveyor, SHIFT Processor, Diverter, Output.
- Construir/remover/rotacionar peças.
- Dois materiais, duas receitas, mudança automática de modo com custo visível.
- Fluxo por ticks determinístico com backpressure.
- Editor visual de duas regras por máquina/desviador.
- Uma fase que usa os dois produtos e termina automaticamente quando pedido é completado.
- HUD com objetivo, ciclos, mensagens de erro, Start/Pause/Reset.
- Build jogável em navegador.

### P1 — submissão desejada

- Três fases progressivas e seleção de fases.
- Modo Sandbox com layout de demonstração.
- Pontuação/estrelas e resumo de tentativa.
- Animação e feedback audiovisual adequados.
- Tutorial curto e ajuda de controles.
- Persistência simples de progresso.
- README, repositório público e página itch.io com instruções.

### P2 — somente se P0/P1 estiverem sólidos

- Fases 04 e 05, replay de execução, velocidade 2×, exportar/importar layout, seleção múltipla, undo/redo, novos materiais/receitas, sistemas de sinal remoto, economia e upgrades, editor de níveis.

### Fora do escopo da jam

Multiplayer, contas, servidor, terreno infinito, robôs com pathfinding, física por corpo rígido, power grid, rede de pesquisa, construção vertical em múltiplos pisos, comércio, mercado e geração procedural de fases complexas.

## 16. Critérios de aceite do protótipo

Protótipo aprovado quando um jogador sem instrução verbal consegue:

1. Entrar na fase e entender o pedido.
2. Posicionar esteiras e pelo menos um processador em células válidas.
3. Rotacionar peças e identificar entradas/saídas.
4. Configurar `blue → CUT` e `amber → PRESS` no painel visual.
5. Configurar o desviador para separar plates e blocks.
6. Iniciar produção e assistir aos dois tipos serem fabricados sem clicar nas máquinas durante a execução.
7. Pausar, inspecionar problema e reiniciar a tentativa após editar.
8. Completar 3 plates e 3 blocks e ver a tela de vitória.
9. Executar em navegador desktop sem erros críticos no console.

**Validação de diversão:** testar com pelo menos duas pessoas, observar se entendem a ideia de mudar automaticamente a função da máquina e registrar travamentos ou dúvidas sem explicar antes. Meta qualitativa: chegar ao primeiro item correto em poucos minutos.

## 17. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Simulação com bugs de colisão e duplicação | Crítico | Motor separado, ticks determinísticos, testes automatizados |
| Visual bonito, mas mecânica não divertida | Alto | Primeira fase jogável antes de polimento |
| Editor de regras complexo demais | Alto | Somente duas regras e seletores pré-definidos |
| 3D difícil de selecionar | Alto | Câmera fixa, raycasting por célula, ghost e highlights |
| Escopo de Sandbox crescendo | Alto | Reusar motor e cenário, nenhuma ferramenta exclusiva |
| Efeitos consumindo FPS | Médio | Instancing se necessário, poucas luzes e sombras controladas |
| Publicação atrasada | Crítico | Build testado no itch.io antes do último dia |
| Uso de conteúdo externo com licença inadequada | Médio | Geometria procedural e áudio original; registrar licenças |

## 18. Cronograma de 18 a 30 de novembro

| Datas | Entregável | Gate de saída |
|---|---|---|
| 18–19/11 | Projeto, grid, câmera, seleção e posicionamento | Construir e rotacionar esteiras é possível |
| 20–22/11 | Movimento determinístico, processor, receita, shift de modo | Produzir plate e block sem intervenção manual |
| 23–25/11 | Diverter, regras, HUD, condições de vitória, 3 fases | Uma pessoa externa consegue completar fase 03 |
| 26–27/11 | Sandbox simples, tutoriais, mensagens e animações | Os dois modos usam o mesmo motor |
| 28–29/11 | Polimento, áudio, equilíbrio e testes de regressão | Jogo estável no navegador e em build de produção |
| 30/11 | Publicação, README, screenshots, playtest e envio | Submissão concluída com margem antes do prazo |

**Cut rule:** se a fase 03 e a publicação estiverem em risco em 26/11, congelar features, eliminar Sandbox se preciso e concentrar no jogo de três níveis. Se o prazo apertar muito, manter fase única completa e pulir fluxo/UX.

## 19. Requisitos mínimos de qualidade

- Sem erros bloqueantes no console em fluxo principal.
- Jogável com mouse e teclado no Chrome/Edge recentes; Firefox se houver tempo.
- UI clara em 1280×720 e 1920×1080.
- Meta de 60 FPS em desktop comum; reduzir efeitos em dispositivos lentos, sem sacrificar determinismo.
- Indicadores não dependem apenas de cor; som desativável.
- UI responsiva a diferentes larguras desktop; sem barras cortadas e sem scroll acidental sobre o tabuleiro.
- Código com domínio separado de renderização; Vitest para regras fundamentais.
- Checkpoints de documentação SDD enxuta: GDD, requisitos/aceites, ADR do motor e relatórios curtos de cada etapa.

## 20. Estratégia de publicação

1. Repositório GitHub público com código, README, instruções de execução e licenças de dependências/terceiros.
2. Build HTML5 estático em itch.io; testar tamanho de viewport e funcionamento sem acesso a APIs do desenvolvedor.
3. Página com trailer GIF ou vídeo curto, 3–5 screenshots, controles, descrição de SHIFT e notas de acessibilidade.
4. Declarar bibliotecas e eventual uso de ferramentas de IA conforme regras atuais do evento.
5. Submeter antes do prazo e validar que o jogo realmente abre na página pública.

**Fonte oficial do evento:** https://itch.io/jam/game-off-2026  
**Anúncio oficial:** https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/

## 21. Decisões fechadas / pendentes

### Fechadas para o protótipo

- Jogo 3D isométrico e procedural, sem pixel art.
- Jogo de construção livre **dentro de fases**, com regras de automação e pontuação.
- A mecânica SHIFT é troca de função/roteamento automática.
- Motor de simulação independente da renderização e sem física realista.
- Desenvolvimento web com Vite + TypeScript + Three.js.
- Primeira demonstração com dois tipos de material e um processador compartilhado.

### Pendentes de playtest

- Duração ideal do shift e do processamento.
- Dimensão ideal das fases 02 e 03 (8×8 por padrão).
- Quantidade e disposição de componentes fixos nas fases.
- Limites de ciclos para 2 e 3 estrelas.
- Necessidade real de velocidade 2×.
- Persistência de layout no Sandbox dentro do prazo.

## 22. Próximo passo imediato

Implementar a **vertical slice** antes de criar telas extras:

> Em um tabuleiro 8×8 com uma fonte alternando Blue Blank e Amber Blank, o jogador posiciona esteiras, um SHIFT Processor e um Smart Diverter; programa `BLUE → CUT`, `AMBER → PRESS`, `PLATE → A`, `BLOCK → B`; inicia a fábrica, observa a mudança automática de modo e completa `3 Cut Plates + 3 Pressed Blocks`.

Este é o menor fluxo que demonstra a proposta central do jogo e serve como teste de viabilidade da ideia.
